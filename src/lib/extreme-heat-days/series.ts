// Pipeline for a single region (county in MVP 1.1):
//  1. STAC `/search` filtered by `variable_id`, `boundary`, and `threshold_name`
//     → exactly 1 item (the combination is unique in the collection).
//  2. That item's `data` asset href is an S3 *directory prefix*, not a file.
//     Normalize `s3://` → `https://` and append the region's CSV filename.
//  3. Fetch the region CSV (~450 B; `warming_level` + multi-model
//     median/p10/p90 across the five global warming levels).
//  4. Parse into `ExtremeHeatSeries`, collapsing duplicate `warming_level`
//     rows by averaging (the raw CSVs currently repeat each level; see the
//     tolerant-parse note below).

import { csvParse } from "d3";

import {
  calAdaptApi,
  type ItemSearchFilters,
  type StacItem,
  type StacItemCollection,
} from "@/lib/cal-adapt-api";
import { normalizeDownloadUrl } from "@/utils/url";

import { type ExtremeHeatDaysSelections, getHeatMetric, type HeatVariableId } from "./options";

/**
 * STAC collection id for the multi-metric, per-boundary CSV summaries. Items are
 * keyed by (variable_id × boundary × threshold_name); each item's `data` asset
 * is a directory prefix containing one CSV per region.
 */
export const EXTREME_HEAT_STAC_COLLECTION_ID = "eh-metrics-mm-boundary-csv" as const;

/** Boundary type exposed in MVP 1.1. MVP 1.3 generalizes this into a
 *  user-selectable "Spatial Aggregation". */
export const COUNTY_BOUNDARY_ID = "ca_counties" as const;

/**
 * Build the STAC `threshold_name` for the current selection, e.g.
 * `t2max_ge100F` (extreme heat days) or `t2min_ge80F` (warm nights).
 */
export function thresholdNameFor(selections: ExtremeHeatDaysSelections): string {
  const metric = getHeatMetric(selections.climateVariable);
  return `${metric.tempStat}_ge${selections.threshold}`;
}

/**
 * Chart-ready shape for one region + metric + threshold. The threshold is baked
 * into the fetched item, so unlike MVP 1.0 there is a single value series
 * (`median`) rather than a column-per-threshold lookup.
 */
export interface ExtremeHeatSeries {
  variableId: HeatVariableId;
  /** STAC `boundary` type, e.g. "ca_counties". */
  boundary: string;
  /** Region label (county name in MVP 1.1), e.g. "Sacramento". */
  county: string;
  /** STAC `threshold_name`, e.g. "t2max_ge100F". */
  thresholdName: string;
  /** Global warming levels in °C, sorted ascending. */
  globalWarmingLevels: number[];
  /** Multi-model median count per year; the plotted value. Index-aligned with
   *  `globalWarmingLevels`. */
  median: number[];
  /** Multi-model 10th percentile (uncertainty band lower bound). */
  p10: number[];
  /** Multi-model 90th percentile (uncertainty band upper bound). */
  p90: number[];
  /** STAC item this series was derived from. */
  sourceItem: StacItem;
  /** https URL of the region CSV that produced this series. */
  sourceCsvUrl: string;
}

/**
 * True when `series` has enough data to plot: a non-null series, a non-empty
 * global-warming-level axis, and at least one finite median value.
 */
export function hasRenderableSeries(series: ExtremeHeatSeries | null): boolean {
  if (!series || series.globalWarmingLevels.length === 0) return false;
  return series.median.some((v) => Number.isFinite(v));
}

/**
 * Build STAC `/search` filters for the current selections. The tuple
 * (variable_id, boundary, threshold_name) resolves to exactly one item.
 */
export function buildSearchFilters(selections: ExtremeHeatDaysSelections): ItemSearchFilters {
  const metric = getHeatMetric(selections.climateVariable);
  return {
    collectionFilter: `collection='${EXTREME_HEAT_STAC_COLLECTION_ID}'`,
    variableFilter: `variable_id='${metric.variableId}'`,
    boundaryFilter: `boundary='${COUNTY_BOUNDARY_ID}'`,
    thresholdNameFilter: `threshold_name='${thresholdNameFor(selections)}'`,
  };
}

/**
 * Stable cache key over the subset of selections that affect the API call.
 * Unlike MVP 1.0, threshold and climate variable are part of the fetch (they
 * select the STAC item/CSV), so all of them belong in the key.
 */
export function searchFiltersKey(selections: ExtremeHeatDaysSelections): string {
  const metric = getHeatMetric(selections.climateVariable);
  return [
    metric.variableId,
    COUNTY_BOUNDARY_ID,
    thresholdNameFor(selections),
    selections.county,
  ].join("|");
}

/** Run the STAC `/search` step in isolation. */
export async function searchExtremeHeatItems(
  selections: ExtremeHeatDaysSelections
): Promise<StacItemCollection> {
  return calAdaptApi.stac.searchItems(buildSearchFilters(selections));
}

/**
 * End-to-end fetch: STAC search → region CSV download → parsed series. Throws if
 * any step fails so the calling hook can surface a single error state.
 */
export async function fetchExtremeHeatSeries(
  selections: ExtremeHeatDaysSelections
): Promise<ExtremeHeatSeries> {
  const thresholdName = thresholdNameFor(selections);
  const items = await searchExtremeHeatItems(selections);
  const item = items.features[0];
  if (!item) {
    throw new Error(
      `No STAC item found for ${selections.climateVariable} in "${selections.county}" at ${thresholdName}`
    );
  }

  const csvUrl = resolveRegionCsvUrl(item, selections, thresholdName);
  const csvText = await fetchCsvText(csvUrl);

  return parseRegionCsv(csvText, item, csvUrl, selections, thresholdName);
}

/**
 * The `data` asset href is a directory prefix; the per-region CSV lives under it
 * named `{Region} County_{threshold}.csv` with spaces replaced by underscores
 * (e.g. `Sacramento_County_t2max_ge100F.csv`).
 */
function resolveRegionCsvUrl(
  item: StacItem,
  selections: ExtremeHeatDaysSelections,
  thresholdName: string
): string {
  const rawHref = item.assets.data?.href;
  if (typeof rawHref !== "string" || rawHref.length === 0) {
    throw new Error(`STAC item ${item.id} has no \`data\` asset href`);
  }
  const prefix = normalizeDownloadUrl(rawHref);
  const base = prefix.endsWith("/") ? prefix : `${prefix}/`;
  return `${base}${encodeURIComponent(countyCsvFileName(selections.county, thresholdName))}`;
}

/** Region CSV filename for a county boundary. */
function countyCsvFileName(county: string, thresholdName: string): string {
  const region = `${county} County`.replace(/\s+/g, "_");
  return `${region}_${thresholdName}.csv`;
}

async function fetchCsvText(url: string): Promise<string> {
  const response = await fetch(url, { headers: { Accept: "text/csv" } });
  if (!response.ok) {
    throw new Error(`CSV fetch failed (${response.status} ${response.statusText}): ${url}`);
  }
  return response.text();
}

interface LevelAccumulator {
  median: number[];
  p10: number[];
  p90: number[];
}

function parseRegionCsv(
  text: string,
  item: StacItem,
  csvUrl: string,
  selections: ExtremeHeatDaysSelections,
  thresholdName: string
): ExtremeHeatSeries {
  const rows = csvParse(text);

  // NOTE: The current CSVs repeat each warming level across several rows.
  // Group by warming level and average the values so we plot one point per level.
  const byLevel = new Map<number, LevelAccumulator>();
  for (const row of rows) {
    const globalWarmingLevel = Number(row.warming_level);
    if (!Number.isFinite(globalWarmingLevel)) continue;
    const acc = byLevel.get(globalWarmingLevel) ?? { median: [], p10: [], p90: [] };
    acc.median.push(toNumber(row.multimodel_median));
    acc.p10.push(toNumber(row.multimodel_p10));
    acc.p90.push(toNumber(row.multimodel_p90));
    byLevel.set(globalWarmingLevel, acc);
  }

  const globalWarmingLevels = [...byLevel.keys()].sort((a, b) => a - b);
  const median = globalWarmingLevels.map((level) => mean(byLevel.get(level)!.median));
  const p10 = globalWarmingLevels.map((level) => mean(byLevel.get(level)!.p10));
  const p90 = globalWarmingLevels.map((level) => mean(byLevel.get(level)!.p90));

  const metric = getHeatMetric(selections.climateVariable);

  return {
    variableId: metric.variableId,
    boundary: COUNTY_BOUNDARY_ID,
    county: selections.county,
    thresholdName,
    globalWarmingLevels,
    median,
    p10,
    p90,
    sourceItem: item,
    sourceCsvUrl: csvUrl,
  };
}

/** Parse a CSV cell to a number, treating missing/empty cells as NaN. */
function toNumber(raw: string | undefined): number {
  if (raw == null || raw === "") return NaN;
  return Number(raw);
}

/** Mean of the finite values, or NaN when there are none. */
function mean(values: number[]): number {
  const finite = values.filter((v) => Number.isFinite(v));
  if (finite.length === 0) return NaN;
  return finite.reduce((sum, v) => sum + v, 0) / finite.length;
}
