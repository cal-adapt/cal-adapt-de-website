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
import { type ExtremeHeatSeason, summarizeFrequentSeason } from "./season";

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
  const threshold = formatThresholdLabel(selections.threshold);
  const thresholdPhrase = selections.threshold.endsWith("pctl") ? `the ${threshold}` : threshold;
  // The heatmap's statistic already names what is measured.
  if (metric.chartKind === "heatmap") return `${metric.statisticLabel} above ${thresholdPhrase}`;
  const noun = metric.usesDuration
    ? `${formatDurationLabel(selections.duration)} ${metric.accessibleNoun}`
    : metric.accessibleNoun;
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

const MONTHS: readonly { name: string; days: number }[] = [
  { name: "Jan", days: 31 },
  { name: "Feb", days: 28 },
  { name: "Mar", days: 31 },
  { name: "Apr", days: 30 },
  { name: "May", days: 31 },
  { name: "Jun", days: 30 },
  { name: "Jul", days: 31 },
  { name: "Aug", days: 31 },
  { name: "Sep", days: 30 },
  { name: "Oct", days: 31 },
  { name: "Nov", days: 30 },
  { name: "Dec", days: 31 },
];

/**
 * Calendar date for a day of year (1-365) on a no-leap calendar, e.g. 60 →
 * "Mar 1". The data drops February 29, so a leap-aware conversion would be a
 * day off after February.
 */
export function formatNoLeapDate(dayOfYear: number): string {
  let remaining = dayOfYear;
  for (const month of MONTHS) {
    if (remaining <= month.days) return `${month.name} ${remaining}`;
    remaining -= month.days;
  }
  return "";
}

/** e.g. 63.33 → "63.3%". */
export function formatFrequencyPercent(value: number): string {
  if (!Number.isFinite(value)) return "No data";
  return `${value.toFixed(1)}%`;
}

/**
 * Text alternative for the Extreme Heat Season heatmap: names the location,
 * statistic, threshold, and warming level range, then the broad seasonal
 * pattern at the lowest and highest warming levels.
 */
export function formatSeasonDescription(
  selections: ExtremeHeatDaysSelections,
  season: ExtremeHeatSeason
): string {
  const levels = season.globalWarmingLevels;
  const endIndexes = levels.length > 1 ? [0, levels.length - 1] : [0];
  const pattern = endIndexes.map((i) => {
    const level = formatGlobalWarmingLevel(levels[i]);
    const frequent = summarizeFrequentSeason(season.frequencyPercent[i]);
    return frequent
      ? `At ${level}, the threshold is exceeded in at least half of years on ${frequent.dayCount} days of the year, between ${formatNoLeapDate(frequent.firstDay)} and ${formatNoLeapDate(frequent.lastDay)}.`
      : `At ${level}, no day of the year exceeds the threshold in at least half of years.`;
  });
  return (
    `Heatmap for ${regionLabelFor(selections)}. ${formatViewSubtitle(selections)}, ` +
    `as the percent of years in each 30-year window, by day of year (1 to 365) and global warming level ` +
    `(${levels.map(formatGlobalWarmingLevel).join(", ")}). ${pattern.join(" ")}`
  );
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
