/**
 * Shared helpers for fetching and reducing point-query data from catile's
 * `/point` endpoint, used by both LocationInspector (single location) and
 * LocationCompare (two locations).
 */

import { RenewableDatasetConfig } from "@/data/renewables-visualizer/dataset-adapter";
import { getPoint } from "@/lib/cal-adapt-api/map-api";

// Response shape from catile's `/point` endpoint for these (gwl, month, year) datasets.
export type PointResponse = {
  dims: string[];
  data: number[][][];
};

export const BASELINE_GWL_INDEX = 0; // 0.8°C historical baseline

export async function fetchPointResponse(
  dataset: RenewableDatasetConfig,
  lng: number,
  lat: number
): Promise<PointResponse> {
  return getPoint<PointResponse>(lng, lat, {
    url: dataset.s3Path,
    variable: dataset.caTileVariable,
  });
}

/** Average a (month, year) slice down to a per-month series across all years. */
export function averageMonthly(monthYearData: number[][]): number[] {
  return monthYearData.map((yearsForMonth) => {
    const valid = yearsForMonth.filter((v) => Number.isFinite(v));
    if (valid.length === 0) return NaN;
    return valid.reduce((sum, v) => sum + v, 0) / valid.length;
  });
}

/** Monthly series for a single GWL slice, falling back to the baseline if missing. */
export function monthlySeriesForGwl(response: PointResponse, gwlIndex: number): number[] {
  return averageMonthly(response.data[gwlIndex] ?? response.data[BASELINE_GWL_INDEX]);
}
