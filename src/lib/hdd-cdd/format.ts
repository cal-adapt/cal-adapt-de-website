import { formatLocalIsoDate } from "@/utils/date";
import { toKebabCase } from "@/utils/string";

import { getMetric, type HddCddSelections, regionLabelFor } from "./options";

/** Historical segment line/envelope color — neutral gray per MVP conventions. */
export const HISTORICAL_COLOR = "#8a8f98";

export function formatViewTitle(selections: HddCddSelections): string {
  const metric = getMetric(selections.climateVariable);
  return `Annual ${metric.longLabel} Timeseries: ${regionLabelFor(selections)}`;
}

/** Degree-day values are whole numbers in practice; format with no decimals
 *  and an em dash for non-finite values. */
export function formatDegreeDays(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return Math.round(value).toLocaleString("en-US");
}

/**
 * File name used when the user downloads the chart as a PNG. Pattern:
 * `<climateVariable>_<location-slug>_<YYYY-MM-DD>.png` (e.g. `cdd_sacramento-county_2026-09-08.png`).
 */
export function formatChartExportFilename(
  climateVariable: string,
  location: string,
  date: Date = new Date()
): string {
  const locationSlug = toKebabCase(location) || "unknown";
  const dateSlug = formatLocalIsoDate(date);
  return `${climateVariable}_${locationSlug}_${dateSlug}.png`;
}
