// Pipeline for a single region:
//  1. STAC `/search` in the `acp-boundary-csv` collection for the projection
//     item (variable + boundary + scenario) and, for WRF, the observed ERA5
//     item (variable + boundary + experiment `reanalysis`). Each search resolves
//     to exactly one item.
//  2. Each item's `data` asset href is an S3 *directory prefix*. Normalize
//     `s3://` -> `https://` and append the region's CSV file name.
//  3. Fetch the boundary CSV (year, ensemble_mean, ensemble_min, ensemble_max, then one column per
//     simulation) and the observed CSV (year, value).
//  4. Parse into `AnnualSeries`.

import { csvParse } from "d3";

import { calAdaptApi, type ItemSearchFilters, type StacItem } from "@/lib/cal-adapt-api";
import { normalizeDownloadUrl } from "@/utils/url";

import {
  type AnnualClimateProjectionsSelections,
  ENSEMBLES,
  regionLabelFor,
  variableIdFor,
} from "./options";

/**
 * STAC collection holding WRF and LOCA2 projections and ERA5 observed CSVs.
 * Variable ids differ between WRF and LOCA2 (`t2max` vs `tasmax`), so variable
 * + experiment + boundary identify one item without filtering on the ensemble.
 */
export const ACP_STAC_COLLECTION_ID = "acp-boundary-csv" as const;

/** `cmip6:experiment_id` of the ERA5 observed items. */
const OBSERVED_EXPERIMENT_ID = "reanalysis";

type CsvKind = "boundary" | "observed";

/** Summary columns in the boundary CSV; every other column is a simulation. */
const SUMMARY_COLUMNS = ["year", "ensemble_mean", "ensemble_min", "ensemble_max"] as const;

export interface AnnualYearRow {
  year: number;
  mean: number;
  min: number;
  max: number;
  /** Value for each simulation, keyed by simulation name. */
  simulations: Record<string, number>;
}

export interface ObservedYearRow {
  year: number;
  value: number;
}

export interface AnnualSeries {
  /** Rows sorted ascending by year. */
  rows: AnnualYearRow[];
  /** Simulation names, in CSV column order. */
  simulationNames: string[];
  /** Observed (ERA5) rows; empty when the ensemble has no observed series. */
  observed: ObservedYearRow[];
  /** URL of the boundary CSV that produced this series. */
  sourceCsvUrl: string;
}

export interface FetchSeriesOptions {
  signal?: AbortSignal;
}

/** STAC `/search` filters resolving to the one item for this CSV kind. */
export function buildSearchFilters(
  selections: AnnualClimateProjectionsSelections,
  kind: CsvKind
): ItemSearchFilters {
  const experiment = kind === "observed" ? OBSERVED_EXPERIMENT_ID : selections.scenario;
  return {
    collectionFilter: `collection='${ACP_STAC_COLLECTION_ID}'`,
    variableFilter: `variable_id='${variableIdFor(selections)}'`,
    boundaryFilter: `boundary='${selections.spatialAggregation}'`,
    scenarioFilter: `cmip6:experiment_id='${experiment}'`,
  };
}

/**
 * Region CSV file name under the item's `data` prefix:
 * `{Region}_{variable}_{ssp}.csv` (boundary) or `{Region}_{variable}_era5.csv` (observed).
 */
export function regionCsvFileName(
  selections: AnnualClimateProjectionsSelections,
  kind: CsvKind
): string {
  const region = regionLabelFor(selections).replace(/\s+/g, "_");
  const suffix = kind === "observed" ? "era5" : selections.scenario;
  return `${region}_${variableIdFor(selections)}_${suffix}.csv`;
}

/**
 * Stable cache key over the selections that change the request. Display-only
 * toggles (advanced view, individual models) don't refetch.
 */
export function searchFiltersKey(selections: AnnualClimateProjectionsSelections): string {
  return [
    selections.ensemble,
    selections.scenario,
    variableIdFor(selections),
    selections.spatialAggregation,
    selections.location,
  ].join("|");
}

export function hasRenderableSeries(series: AnnualSeries | null): boolean {
  return series != null && series.rows.some((row) => Number.isFinite(row.mean));
}

export async function fetchAnnualSeries(
  selections: AnnualClimateProjectionsSelections,
  { signal }: FetchSeriesOptions = {}
): Promise<AnnualSeries> {
  const wantsObserved = ENSEMBLES[selections.ensemble].hasObserved;

  const [boundaryUrl, observedUrl] = await Promise.all([
    resolveCsvUrl(selections, "boundary", signal),
    wantsObserved ? resolveCsvUrl(selections, "observed", signal) : Promise.resolve(null),
  ]);
  const [boundaryText, observedText] = await Promise.all([
    fetchCsvText(boundaryUrl, signal),
    observedUrl ? fetchCsvText(observedUrl, signal) : Promise.resolve(null),
  ]);

  return {
    ...parseBoundaryCsv(boundaryText),
    observed: observedText ? parseObservedCsv(observedText) : [],
    sourceCsvUrl: boundaryUrl,
  };
}

/** STAC search for the CSV kind's item, then the region CSV URL under its `data` prefix. */
async function resolveCsvUrl(
  selections: AnnualClimateProjectionsSelections,
  kind: CsvKind,
  signal?: AbortSignal
): Promise<string> {
  const items = await calAdaptApi.stac.searchItems(buildSearchFilters(selections, kind), {
    signal,
  });
  const item: StacItem | undefined = items.features[0];
  if (!item) {
    throw new Error(`No STAC item found for ${kind} data (${searchFiltersKey(selections)})`);
  }
  const rawHref = item.assets.data?.href;
  if (typeof rawHref !== "string" || rawHref.length === 0) {
    throw new Error(`STAC item ${item.id} has no \`data\` asset href`);
  }
  const prefix = normalizeDownloadUrl(rawHref);
  const base = prefix.endsWith("/") ? prefix : `${prefix}/`;
  return `${base}${encodeURIComponent(regionCsvFileName(selections, kind))}`;
}

async function fetchCsvText(url: string, signal?: AbortSignal): Promise<string> {
  const response = await fetch(url, { headers: { Accept: "text/csv" }, signal });
  if (!response.ok) {
    throw new Error(`CSV fetch failed (${response.status} ${response.statusText}): ${url}`);
  }
  return response.text();
}

export function parseBoundaryCsv(text: string): Pick<AnnualSeries, "rows" | "simulationNames"> {
  const parsed = csvParse(text);
  const simulationNames = parsed.columns.filter(
    (column) => !(SUMMARY_COLUMNS as readonly string[]).includes(column)
  );

  const rows: AnnualYearRow[] = parsed
    .map((row) => ({
      year: Number(row.year),
      mean: toNumber(row.ensemble_mean),
      min: toNumber(row.ensemble_min),
      max: toNumber(row.ensemble_max),
      simulations: Object.fromEntries(simulationNames.map((name) => [name, toNumber(row[name])])),
    }))
    .filter((row) => Number.isFinite(row.year))
    .sort((a, b) => a.year - b.year);

  return { rows, simulationNames };
}

export function parseObservedCsv(text: string): ObservedYearRow[] {
  return csvParse(text)
    .map((row) => ({ year: Number(row.year), value: toNumber(row.value) }))
    .filter((row) => Number.isFinite(row.year))
    .sort((a, b) => a.year - b.year);
}

/** Parse a CSV cell to a number, treating missing/empty cells as NaN. */
function toNumber(raw: string | undefined): number {
  if (raw == null || raw === "") return NaN;
  return Number(raw);
}
