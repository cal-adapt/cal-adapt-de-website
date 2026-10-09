// Pipeline for a single region:
//  1. STAC `/search` filtered by `variable_id`, `boundary`, `threshold_name`,
//     and (for metrics that use one) `duration_name` → exactly 1 item (the
//     combination is unique in the metric's collection).
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

import {
  type ExtremeHeatDaysSelections,
  getHeatMetric,
  type HeatVariableId,
  regionLabelFor,
} from "./options";

/**
 * Build the STAC `threshold_name` for the current selection, e.g.
 * `t2max_ge100F` (absolute) or `t2max_ge98pctl` (relative).
 */
export function thresholdNameFor(selections: ExtremeHeatDaysSelections): string {
  const metric = getHeatMetric(selections.climateVariable);
  return `${metric.tempStat}_ge${selections.threshold}`;
}

/** STAC `duration_name` (e.g. `duration_5d`), or null for metrics without a
 *  duration dimension. */
export function durationNameFor(selections: ExtremeHeatDaysSelections): string | null {
  return getHeatMetric(selections.climateVariable).usesDuration
    ? `duration_${selections.duration}d`
    : null;
}

/**
 * Chart-ready shape for one region + metric + threshold (+ duration, for
 * metrics that use one). Each combination is its own STAC item and CSV, so
 * there is a single value series (`median`).
 */
export interface ExtremeHeatSeries {
  variableId: HeatVariableId;
  /** STAC `boundary` type, e.g. "ca_counties". */
  boundary: string;
  location: string;
  /** STAC `threshold_name`, e.g. "t2max_ge100F". */
  thresholdName: string;
  /** Global warming levels in °C, sorted ascending. */
  globalWarmingLevels: number[];
  /** The plotted value: the metric's median annual value (a count per year, or
   *  days for heat wave length). Index-aligned with `globalWarmingLevels`. */
  median: number[];
  /** 10th percentile (uncertainty band lower bound). */
  p10: number[];
  /** 90th percentile (uncertainty band upper bound). */
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

export interface FetchSeriesOptions {
  /** Cancels the STAC search and CSV download (timeout or superseded request). */
  signal?: AbortSignal;
}

/**
 * Build STAC `/search` filters for the current selections. The tuple
 * (variable_id, boundary, threshold_name[, duration_name]) resolves to exactly
 * one item in the metric's collection.
 */
export function buildSearchFilters(selections: ExtremeHeatDaysSelections): ItemSearchFilters {
  const metric = getHeatMetric(selections.climateVariable);
  const durationName = durationNameFor(selections);
  return {
    collectionFilter: `collection='${metric.collectionId}'`,
    variableFilter: `variable_id='${metric.variableId}'`,
    boundaryFilter: `boundary='${selections.spatialAggregation}'`,
    thresholdNameFilter: `threshold_name='${thresholdNameFor(selections)}'`,
    ...(durationName ? { durationNameFilter: `duration_name='${durationName}'` } : {}),
  };
}

/**
 * Stable cache key over the subset of selections that affect the API call.
 * Climate variable, threshold, aggregation, and location each select a
 * different STAC item/CSV, so all of them belong in the key, along with the
 * duration for metrics that use one.
 */
export function searchFiltersKey(selections: ExtremeHeatDaysSelections): string {
  const metric = getHeatMetric(selections.climateVariable);
  const durationName = durationNameFor(selections);
  return [
    metric.variableId,
    selections.spatialAggregation,
    thresholdNameFor(selections),
    ...(durationName ? [durationName] : []),
    selections.location,
  ].join("|");
}

/** Run the STAC `/search` step in isolation. */
export async function searchExtremeHeatItems(
  selections: ExtremeHeatDaysSelections,
  { signal }: FetchSeriesOptions = {}
): Promise<StacItemCollection> {
  return calAdaptApi.stac.searchItems(buildSearchFilters(selections), { signal });
}

/** A region's raw CSV plus the STAC item and URL it was resolved from. */
export interface RegionCsv {
  item: StacItem;
  csvUrl: string;
  csvText: string;
  thresholdName: string;
}

/** Steps 1-3 of the pipeline: STAC search → region CSV download. */
export async function fetchRegionCsv(
  selections: ExtremeHeatDaysSelections,
  { signal }: FetchSeriesOptions = {}
): Promise<RegionCsv> {
  const thresholdName = thresholdNameFor(selections);
  const items = await searchExtremeHeatItems(selections, { signal });
  const item = items.features[0];
  if (!item) {
    throw new Error(
      `No STAC item found for ${selections.climateVariable} in "${selections.location}" at ${thresholdName}`
    );
  }

  const csvUrl = resolveRegionCsvUrl(item, selections, thresholdName);
  const csvText = await fetchCsvText(csvUrl, signal);
  return { item, csvUrl, csvText, thresholdName };
}

/**
 * End-to-end fetch: STAC search → region CSV download → parsed series. Throws if
 * any step fails so the calling hook can surface a single error state.
 */
export async function fetchExtremeHeatSeries(
  selections: ExtremeHeatDaysSelections,
  options: FetchSeriesOptions = {}
): Promise<ExtremeHeatSeries> {
  const { item, csvUrl, csvText, thresholdName } = await fetchRegionCsv(selections, options);
  return parseRegionCsv(csvText, item, csvUrl, selections, thresholdName);
}

/**
 * The `data` asset href is a directory prefix; the per-region CSV lives under it
 * as `{regionLabel}_{threshold}.csv` with spaces replaced by underscores
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
  return `${base}${encodeURIComponent(regionCsvFileName(selections, thresholdName))}`;
}

function regionCsvFileName(selections: ExtremeHeatDaysSelections, thresholdName: string): string {
  const region = regionLabelFor(selections).replace(/\s+/g, "_");
  const durationSuffix = getHeatMetric(selections.climateVariable).usesDuration
    ? `_${selections.duration}d`
    : "";
  return `${region}_${thresholdName}${durationSuffix}.csv`;
}

async function fetchCsvText(url: string, signal?: AbortSignal): Promise<string> {
  const response = await fetch(url, { headers: { Accept: "text/csv" }, signal });
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
  const metric = getHeatMetric(selections.climateVariable);
  if (metric.chartKind !== "bar") {
    throw new Error(`"${metric.value}" is not a per-warming-level series`);
  }
  const columns = metric.csvColumns;

  // NOTE: The current CSVs repeat each warming level across several rows.
  // Group by warming level and average the values so we plot one point per level.
  const byLevel = new Map<number, LevelAccumulator>();
  for (const row of rows) {
    const globalWarmingLevel = Number(row.warming_level);
    if (!Number.isFinite(globalWarmingLevel)) continue;
    const acc = byLevel.get(globalWarmingLevel) ?? { median: [], p10: [], p90: [] };
    acc.median.push(toNumber(row[columns.median]));
    acc.p10.push(toNumber(row[columns.p10]));
    acc.p90.push(toNumber(row[columns.p90]));
    byLevel.set(globalWarmingLevel, acc);
  }

  const globalWarmingLevels = [...byLevel.keys()].sort((a, b) => a - b);
  const median = globalWarmingLevels.map((level) => mean(byLevel.get(level)!.median));
  const p10 = globalWarmingLevels.map((level) => mean(byLevel.get(level)!.p10));
  const p90 = globalWarmingLevels.map((level) => mean(byLevel.get(level)!.p90));

  return {
    variableId: metric.variableId,
    boundary: selections.spatialAggregation,
    location: selections.location,
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
export function toNumber(raw: string | undefined): number {
  if (raw == null || raw === "") return NaN;
  return Number(raw);
}

/** Mean of the finite values, or NaN when there are none. */
function mean(values: number[]): number {
  const finite = values.filter((v) => Number.isFinite(v));
  if (finite.length === 0) return NaN;
  return finite.reduce((sum, v) => sum + v, 0) / finite.length;
}
