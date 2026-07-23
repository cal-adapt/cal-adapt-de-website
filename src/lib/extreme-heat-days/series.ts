// Pipeline for a single county:
//  1. STAC `/search` filtered by `county_name` → 1 item.
//  2. Read that item's `data` asset href, normalize `s3://` → `https://`.
//  3. Fetch the CSV (~250 B, 5 rows × {warming_level + 3 metric columns}).
//  4. Parse into a small `ExtremeHeatSeries` shape that holds values keyed by
//     STAC `variable_id`, so switching threshold/indicator client-side does
//     not require a refetch.

import { csvParse } from "d3";

import {
  calAdaptApi,
  type ItemSearchFilters,
  orFilter,
  type StacItem,
  type StacItemCollection,
} from "@/lib/cal-adapt-api";
import { normalizeDownloadUrl } from "@/utils/url";

import type { ExtremeHeatDaysSelections } from "./options";

/**
 * STAC collection id for the per-county CSV summaries. Each item is one
 * California county and points to a single CSV containing all three heat
 * metrics across five global warming levels.
 */
export const EXTREME_HEAT_STAC_COLLECTION_ID = "wrf-extreme-heat-tool-county-csv" as const;

/** Columns in the per-county CSVs that hold actual chart values, keyed by the
 *  STAC `variable_id` they correspond to. Non-value columns are handled separately. */
const VALUE_COLUMN_VARIABLE_IDS = [
  "t2max_99pctl",
  "t2max_ge100F",
  "t2max_ge105F",
] as const satisfies readonly string[];

export type ValueColumnVariableId = (typeof VALUE_COLUMN_VARIABLE_IDS)[number];

/**
 * Bridge between the UI's threshold values and the STAC `variable_id` /
 * CSV column they correspond to. Keep in sync with `THRESHOLD_OPTIONS` in `./options.ts`.
 */
const STAC_VARIABLE_ID_BY_THRESHOLD: Readonly<Record<string, ValueColumnVariableId>> = {
  "100F": "t2max_ge100F",
  "105F": "t2max_ge105F",
};

export function stacVariableIdForThreshold(threshold: string): ValueColumnVariableId | null {
  return STAC_VARIABLE_ID_BY_THRESHOLD[threshold] ?? null;
}

/** Locate the CSV column matching the current threshold out of a series.
 *  Returns `null` when the threshold has no corresponding STAC variable. */
export function valuesForThreshold(series: ExtremeHeatSeries, threshold: string): number[] | null {
  const variableId = stacVariableIdForThreshold(threshold);
  return variableId ? series.valuesByVariable[variableId] : null;
}

/**
 * True when `series` has enough data to actually plot at `threshold`:
 * non-null series, a matching value column, a non-empty global-warming-level axis,
 * and at least one finite value. shared by `ChartView` and `ExtremeHeatDays`.
 */
export function hasRenderableSeries(series: ExtremeHeatSeries | null, threshold: string): boolean {
  if (!series || series.globalWarmingLevels.length === 0) return false;
  const values = valuesForThreshold(series, threshold);
  if (!values || values.length === 0) return false;
  return values.some((v) => Number.isFinite(v));
}

/**
 * Chart-ready shape for one county. Holds all three heat metrics so threshold
 * switches are zero-network (just a different column lookup).
 */
export interface ExtremeHeatSeries {
  /** Full county name (e.g. "Sacramento"); matches STAC `county_name`. */
  county: string;
  /** FIPS code (e.g. "06067"); matches STAC `county_code`. */
  countyCode: string;
  /** Global warming levels in °C, sorted ascending. */
  globalWarmingLevels: number[];
  /** Metric values keyed by STAC `variable_id`. Each array is index-aligned
   *  with `globalWarmingLevels`. */
  valuesByVariable: Record<ValueColumnVariableId, number[]>;
  /** STAC item this series was derived from — useful for downstream metadata. */
  sourceItem: StacItem;
  /** https URL of the CSV asset that produced this series. */
  sourceCsvUrl: string;
}

/**
 * Build STAC `/search` filters for the current selections.
 *
 * Only `county` affects the search currently; each STAC item bundles all three
 * heat metrics for that county into a single CSV. Threshold + indicator are
 * resolved client-side from `ExtremeHeatSeries.valuesByVariable`.
 */
export function buildSearchFilters(selections: ExtremeHeatDaysSelections): ItemSearchFilters {
  return {
    collectionFilter: `collection='${EXTREME_HEAT_STAC_COLLECTION_ID}'`,
    countyFilter: orFilter("county_name", [selections.county]),
  };
}

/**
 * Stable cache key over the subset of selections that affect the API call.
 * Used as the effect dep in `useExtremeHeatSeries` so unrelated control
 * changes (threshold, indicator) don't trigger an identical refetch.
 */
export function searchFiltersKey(selections: ExtremeHeatDaysSelections): string {
  return selections.county;
}

/** Run the STAC `/search` step in isolation. Used both by the series fetch
 *  and by callers that want the raw STAC `FeatureCollection`. */
export async function searchExtremeHeatItems(
  selections: ExtremeHeatDaysSelections
): Promise<StacItemCollection> {
  return calAdaptApi.stac.searchItems(buildSearchFilters(selections));
}

/**
 * End-to-end fetch: STAC search → CSV download → parsed series. Throws if any
 * step fails so the calling hook can surface a single error state.
 */
export async function fetchExtremeHeatSeries(
  selections: ExtremeHeatDaysSelections
): Promise<ExtremeHeatSeries> {
  const items = await searchExtremeHeatItems(selections);
  const item = items.features[0];
  if (!item) {
    throw new Error(`No STAC item found for county "${selections.county}"`);
  }

  const csvUrl = resolveCsvUrl(item);
  const csvText = await fetchCsvText(csvUrl);

  return parseCountyCsv(csvText, item, csvUrl);
}

function resolveCsvUrl(item: StacItem): string {
  const rawHref = item.assets.data?.href;
  if (typeof rawHref !== "string" || rawHref.length === 0) {
    throw new Error(`STAC item ${item.id} has no \`data\` asset href`);
  }
  return normalizeDownloadUrl(rawHref);
}

async function fetchCsvText(url: string): Promise<string> {
  const response = await fetch(url, { headers: { Accept: "text/csv" } });
  if (!response.ok) {
    throw new Error(`CSV fetch failed (${response.status} ${response.statusText}): ${url}`);
  }
  return response.text();
}

function parseCountyCsv(text: string, item: StacItem, csvUrl: string): ExtremeHeatSeries {
  const rows = csvParse(text);

  const globalWarmingLevels: number[] = [];
  const valuesByVariable: Record<ValueColumnVariableId, number[]> = {
    t2max_99pctl: [],
    t2max_ge100F: [],
    t2max_ge105F: [],
  };

  for (const row of rows) {
    const globalWarmingLevel = Number(row.warming_level);
    if (!Number.isFinite(globalWarmingLevel)) continue;
    globalWarmingLevels.push(globalWarmingLevel);
    for (const variableId of VALUE_COLUMN_VARIABLE_IDS) {
      const raw = row[variableId];
      valuesByVariable[variableId].push(raw == null ? NaN : Number(raw));
    }
  }

  // STAC item ids are FIPS-suffixed (e.g. ...-06067). Pull the code from
  // properties when present, fall back to the id suffix.
  const countyName = stringProp(item, "county_name") ?? "";
  const countyCode = stringProp(item, "county_code") ?? item.id.slice(-5);

  return {
    county: countyName,
    countyCode,
    globalWarmingLevels,
    valuesByVariable,
    sourceItem: item,
    sourceCsvUrl: csvUrl,
  };
}

function stringProp(item: StacItem, key: string): string | undefined {
  const value = item.properties[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}
