// Pipeline for a single region:
//  1. STAC `/search` filtered by `boundary` → exactly 1 item (unique per boundary
//     in this collection; unlike extreme heat, HDD and CDD share one item/CSV).
//  2. That item's `data` asset href is an S3 *directory prefix*, not a file.
//     Normalize `s3://` → `https://` and append the region's CSV filename.
//  3. Fetch the region CSV (~30 KB; one row per year, 1981-2099, with
//     multi-model mean/min/max HDD and CDD columns).
//  4. Parse into `HddCddSeries`.
//
// NOTE: the source CSVs currently have a known upstream aggregation bug (see
// cal-adapt-data-gen PR "fix: multimodel mean/min/max only reflected one
// model") — hdd_mean/hdd_min/hdd_max/cdd_mean/cdd_min/cdd_max don't yet
// reflect a true multi-model aggregate. This module parses whatever the CSV
// contains; no changes will be needed here once the upstream fix is rerun.

import { csvParse } from "d3";

import {
  calAdaptApi,
  type ItemSearchFilters,
  type StacItem,
  type StacItemCollection,
} from "@/lib/cal-adapt-api";
import { normalizeDownloadUrl } from "@/utils/url";

import { type HddCddSelections, regionLabelFor } from "./options";

/**
 * STAC collection id for the multi-model boundary CSV timeseries. Items are
 * keyed by `boundary`; each item's `data` asset is a directory prefix
 * containing one CSV per region (both HDD and CDD in the same file).
 */
export const HDD_CDD_STAC_COLLECTION_ID = "hdd-cdd-metrics-mm-boundary-csv" as const;

/** The last historical year; SSP years begin the following year (per MVP
 *  Data/Display Conventions: "Historical period in neutral gray through 2014"). */
export const LAST_HISTORICAL_YEAR = 2014;

export interface HddCddYearRow {
  year: number;
  hddMean: number;
  hddMin: number;
  hddMax: number;
  cddMean: number;
  cddMin: number;
  cddMax: number;
}

export interface HddCddSeries {
  /** STAC `boundary` type, e.g. "ca_counties". */
  boundary: string;
  location: string;
  /** Rows sorted ascending by year, spanning the historical + ssp370 period. */
  rows: HddCddYearRow[];
  /** STAC item this series was derived from. */
  sourceItem: StacItem;
  /** https URL of the region CSV that produced this series. */
  sourceCsvUrl: string;
}

/** Rows for the historical segment (year <= LAST_HISTORICAL_YEAR). */
export function historicalRows(rows: HddCddYearRow[]): HddCddYearRow[] {
  return rows.filter((r) => r.year <= LAST_HISTORICAL_YEAR);
}

/** Rows for the SSP3-7.0 projection segment (year > LAST_HISTORICAL_YEAR). */
export function scenarioRows(rows: HddCddYearRow[]): HddCddYearRow[] {
  return rows.filter((r) => r.year > LAST_HISTORICAL_YEAR);
}

function hasFiniteValue(rows: HddCddYearRow[], metric: string): boolean {
  const meanKey: keyof HddCddYearRow = metric === "hdd" ? "hddMean" : "cddMean";
  return rows.some((r) => Number.isFinite(r[meanKey]));
}

/** True when the historical segment has at least one finite value for `metric`. */
export function hasHistoricalData(series: HddCddSeries | null, metric: string): boolean {
  if (!series) return false;
  return hasFiniteValue(historicalRows(series.rows), metric);
}

/** True when the SSP3-7.0 segment has at least one finite value for `metric`. */
export function hasScenarioData(series: HddCddSeries | null, metric: string): boolean {
  if (!series) return false;
  return hasFiniteValue(scenarioRows(series.rows), metric);
}

/**
 * True when `series` has enough data to plot anything: a non-null series and
 * at least one finite value (historical or SSP) for `metric`.
 */
export function hasRenderableSeries(series: HddCddSeries | null, metric: string): boolean {
  if (!series || series.rows.length === 0) return false;
  return hasHistoricalData(series, metric) || hasScenarioData(series, metric);
}

/** Build STAC `/search` filters for the current selections. `boundary` alone
 *  resolves to exactly one item; metric and SSP selection don't affect the
 *  fetch since both metrics and the only available scenario live in one CSV. */
export function buildSearchFilters(selections: HddCddSelections): ItemSearchFilters {
  return {
    collectionFilter: `collection='${HDD_CDD_STAC_COLLECTION_ID}'`,
    boundaryFilter: `boundary='${selections.spatialAggregation}'`,
  };
}

/**
 * Stable cache key over the subset of selections that affect the API call:
 * spatial aggregation and location. Metric and visible-SSP toggles only
 * change what's rendered from already-fetched data.
 */
export function searchFiltersKey(selections: HddCddSelections): string {
  return [selections.spatialAggregation, selections.location].join("|");
}

/** Run the STAC `/search` step in isolation. */
export async function searchHddCddItems(selections: HddCddSelections): Promise<StacItemCollection> {
  return calAdaptApi.stac.searchItems(buildSearchFilters(selections));
}

/**
 * End-to-end fetch: STAC search → region CSV download → parsed series. Throws
 * if any step fails so the calling hook can surface a single error state.
 */
export async function fetchHddCddSeries(selections: HddCddSelections): Promise<HddCddSeries> {
  const items = await searchHddCddItems(selections);
  const item = items.features[0];
  if (!item) {
    throw new Error(
      `No STAC item found for boundary "${selections.spatialAggregation}" (location "${selections.location}")`
    );
  }

  const csvUrl = resolveRegionCsvUrl(item, selections);
  const csvText = await fetchCsvText(csvUrl);

  return parseRegionCsv(csvText, item, csvUrl, selections);
}

/**
 * The `data` asset href is a directory prefix; the per-region CSV lives under
 * it as `{regionLabel}.csv` with spaces replaced by underscores (e.g.
 * `Sacramento_County.csv`).
 */
function resolveRegionCsvUrl(item: StacItem, selections: HddCddSelections): string {
  const rawHref = item.assets.data?.href;
  if (typeof rawHref !== "string" || rawHref.length === 0) {
    throw new Error(`STAC item ${item.id} has no \`data\` asset href`);
  }
  const prefix = normalizeDownloadUrl(rawHref);
  const base = prefix.endsWith("/") ? prefix : `${prefix}/`;
  return `${base}${encodeURIComponent(regionCsvFileName(selections))}`;
}

function regionCsvFileName(selections: HddCddSelections): string {
  const region = regionLabelFor(selections).replace(/\s+/g, "_");
  return `${region}.csv`;
}

async function fetchCsvText(url: string): Promise<string> {
  const response = await fetch(url, { headers: { Accept: "text/csv" } });
  if (!response.ok) {
    throw new Error(`CSV fetch failed (${response.status} ${response.statusText}): ${url}`);
  }
  return response.text();
}

function parseRegionCsv(
  text: string,
  item: StacItem,
  csvUrl: string,
  selections: HddCddSelections
): HddCddSeries {
  const parsed = csvParse(text);

  const rows: HddCddYearRow[] = parsed
    .map((row) => ({
      year: Number(row.year),
      hddMean: toNumber(row.hdd_mean),
      hddMin: toNumber(row.hdd_min),
      hddMax: toNumber(row.hdd_max),
      cddMean: toNumber(row.cdd_mean),
      cddMin: toNumber(row.cdd_min),
      cddMax: toNumber(row.cdd_max),
    }))
    .filter((row) => Number.isFinite(row.year))
    .sort((a, b) => a.year - b.year);

  return {
    boundary: selections.spatialAggregation,
    location: selections.location,
    rows,
    sourceItem: item,
    sourceCsvUrl: csvUrl,
  };
}

/** Parse a CSV cell to a number, treating missing/empty cells as NaN. */
function toNumber(raw: string | undefined): number {
  if (raw == null || raw === "") return NaN;
  return Number(raw);
}
