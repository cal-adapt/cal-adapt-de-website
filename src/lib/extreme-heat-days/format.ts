import { formatLocalIsoDate } from "@/utils/date";
import { toKebabCase } from "@/utils/string";

import { type ExtremeHeatDaysSelections, getHeatMetric, HEAT_METRICS } from "./options";

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
  const metric = getHeatMetric(selections.climateVariable);
  return `${metric.titleLabel} Frequency by Global Warming Level: ${selections.county} County`;
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
  for (const metric of Object.values(HEAT_METRICS)) {
    const option = metric.thresholdOptions.find((o) => o.value === threshold);
    if (option) return option.label;
  }
  return threshold;
}

/**
 * File name used when the user downloads the chart as a PNG. Pattern:
 * `<metric-prefix>_<county-slug>_<YYYY-MM-DD>.png`
 * (e.g. `warm-nights_sacramento_2026-01-15.png`).
 */
export function formatChartExportFilename(
  climateVariable: string,
  county: string,
  date: Date = new Date()
): string {
  const prefix = getHeatMetric(climateVariable).exportFilenamePrefix;
  const countySlug = toKebabCase(county) || "unknown";
  const dateSlug = formatLocalIsoDate(date);
  return `${prefix}_${countySlug}_${dateSlug}.png`;
}
