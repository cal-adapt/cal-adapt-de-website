import { toKebabCase } from "@/utils/string";

import {
  type ExtremeHeatDaysSelections,
  getHeatMetric,
  getSpatialAggregation,
  HEAT_METRICS,
  isAllowedThreshold,
  parseThresholdNumber,
  regionLabelFor,
} from "./options";

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
  return `${metric.label} by Global Warming Level: ${regionLabelFor(selections)}`;
}

/** Names the plotted statistic, threshold, and (where used) duration, e.g.
 *  "Median annual count of 5-day heat waves above 110°F". */
export function formatViewSubtitle(selections: ExtremeHeatDaysSelections): string {
  const metric = getHeatMetric(selections.climateVariable);
  const noun = metric.usesDuration
    ? `${formatDurationLabel(selections.duration)} ${metric.accessibleNoun}`
    : metric.accessibleNoun;
  const threshold = formatThresholdLabel(selections.threshold);
  const thresholdPhrase = selections.threshold.endsWith("pctl") ? `the ${threshold}` : threshold;
  return `${metric.statisticLabel} of ${noun} above ${thresholdPhrase}`;
}

/** e.g. "5" → "5-day". */
export function formatDurationLabel(duration: string): string {
  return `${duration}-day`;
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
  const known = Object.values(HEAT_METRICS).some((metric) =>
    isAllowedThreshold(threshold, metric.value)
  );
  if (!known) return threshold;
  const n = parseThresholdNumber(threshold);
  if (n == null) return threshold;
  return threshold.endsWith("pctl") ? `${n}th percentile` : `${n}°F`;
}

/**
 * File name used when the user downloads the chart as a PNG. Names every
 * selection behind the chart so downloads of different views don't collide:
 * `<metric-prefix>_<aggregation>_<location>_<threshold>[_<duration>].png`
 * (e.g. `heat-wave-frequency_county_sacramento_110f_5-day.png`).
 * The duration is only included for metrics that use one.
 */
export function formatChartExportFilename(selections: ExtremeHeatDaysSelections): string {
  const metric = getHeatMetric(selections.climateVariable);
  const parts = [
    metric.exportFilenamePrefix,
    toKebabCase(getSpatialAggregation(selections.spatialAggregation).label),
    toKebabCase(selections.location) || "unknown",
    selections.threshold.toLowerCase(),
    ...(metric.usesDuration ? [formatDurationLabel(selections.duration)] : []),
  ];
  return `${parts.join("_")}.png`;
}
