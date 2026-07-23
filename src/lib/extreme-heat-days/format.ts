import { formatLocalIsoDate } from "@/utils/date";
import { toKebabCase } from "@/utils/string";

import { type ExtremeHeatDaysSelections, THRESHOLD_OPTIONS } from "./options";

/**
 *  Keys match global-warming-level values used in `series.globalWarmingLevels`.
 */
export const COLOR_BY_GLOBAL_WARMING_LEVEL: Readonly<Record<number, string>> = {
  0.8: "#f5e642",
  1.5: "#f5a623",
  2.0: "#f0693a",
  2.5: "#e03c2a",
  3.0: "#b01a1a",
};

/** Safe lookup with a neutral fallback so an unexpected GWL value still
 *  renders without throwing. */
export function colorForGlobalWarmingLevel(value: number): string {
  return COLOR_BY_GLOBAL_WARMING_LEVEL[value] ?? "#acb5bd";
}

export function formatViewTitle(selections: ExtremeHeatDaysSelections): string {
  return `Extreme Heat Frequency by Global Warming Level: ${selections.county} County`;
}

export function formatGlobalWarmingLevel(value: number): string {
  return `${value.toFixed(1)}°C`;
}

const NAME_BY_GLOBAL_WARMING_LEVEL: Readonly<Record<number, string>> = {
  0.8: "Historical",
  1.5: "Near-future",
  2.0: "Mid-century",
  2.5: "Late-century",
  3.0: "End of century",
};

export function formatGlobalWarmingLevelName(value: number): string {
  return NAME_BY_GLOBAL_WARMING_LEVEL[value] ?? "";
}

export function formatDaysPerYear(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return value.toFixed(1);
}

export function formatThresholdLabel(threshold: string): string {
  return THRESHOLD_OPTIONS.find((option) => option.value === threshold)?.label ?? threshold;
}

/**
 * File name used when the user downloads the chart as a PNG. Pattern:
 * `extreme-heat-days_<county-slug>_<YYYY-MM-DD>.png`.
 */
export function formatChartExportFilename(county: string, date: Date = new Date()): string {
  const countySlug = toKebabCase(county) || "unknown";
  const dateSlug = formatLocalIsoDate(date);
  return `extreme-heat-days_${countySlug}_${dateSlug}.png`;
}
