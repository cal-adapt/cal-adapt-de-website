// Pipeline for a single region:
//  1. Build the region's CSV URLs from the selections.
//  2. Fetch the boundary CSV (year, mean, min, max, then one column per
//     simulation) and, for WRF, the observed ERA5 CSV (year, value).
//  3. Parse into `AnnualSeries`.
//
// PROTOTYPE: the CSVs are served from `public/prototype-data/` and only cover
// a few counties (WRF only). Once the STAC collections exist
// (`acp-wrf-boundary-csv`, `acp-loca2-boundary-csv`, `acp-era5-boundary-csv`),
// replace `csvUrl` with a STAC search like `src/lib/hdd-cdd/series.ts`. The
// file names and columns already match the planned products.

import { csvParse } from "d3";

import {
  type AnnualClimateProjectionsSelections,
  ENSEMBLES,
  regionLabelFor,
  variableIdFor,
} from "./options";

export const PROTOTYPE_DATA_BASE = "/prototype-data/annual-climate-projections";

/** Summary columns in the boundary CSV; every other column is a simulation. */
const SUMMARY_COLUMNS = ["year", "mean", "min", "max"] as const;

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

/** Region token used in CSV file names, e.g. "Alameda_County". */
function regionToken(selections: AnnualClimateProjectionsSelections): string {
  return regionLabelFor(selections).replace(/\s+/g, "_");
}

/** `{Region}_{variable}_{ssp}.csv` (boundary) or `{Region}_{variable}_era5.csv` (observed). */
export function csvUrl(
  selections: AnnualClimateProjectionsSelections,
  kind: "boundary" | "observed"
): string {
  const suffix = kind === "observed" ? "era5" : selections.scenario;
  const fileName = `${regionToken(selections)}_${variableIdFor(selections)}_${suffix}.csv`;
  return `${PROTOTYPE_DATA_BASE}/${selections.ensemble}/${encodeURIComponent(fileName)}`;
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
  const boundaryUrl = csvUrl(selections, "boundary");
  const wantsObserved = ENSEMBLES[selections.ensemble].hasObserved;

  const [boundaryText, observedText] = await Promise.all([
    fetchCsvText(boundaryUrl, signal),
    wantsObserved ? fetchCsvText(csvUrl(selections, "observed"), signal) : Promise.resolve(null),
  ]);

  return {
    ...parseBoundaryCsv(boundaryText),
    observed: observedText ? parseObservedCsv(observedText) : [],
    sourceCsvUrl: boundaryUrl,
  };
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
      mean: toNumber(row.mean),
      min: toNumber(row.min),
      max: toNumber(row.max),
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
