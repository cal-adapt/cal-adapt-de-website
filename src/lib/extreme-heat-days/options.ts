// Domain data for the Extreme Heat tool.

import type { SelectOption } from "@/components/common/form";

/**
 * User-controlled inputs that drive the Extreme Heat tool.
 */
export interface ExtremeHeatDaysSelections {
  climateVariable: string;
  threshold: string;
  indicator: string;
  county: string;
}

/** STAC `variable_id`s supported by the `eh-metrics-mm-boundary-csv` collection. */
export type HeatVariableId = "eh_days" | "warm_nights";

/**
 * Per-metric configuration. The tool hosts multiple structurally-identical
 * climate variables (Extreme Heat Days, Warm Nights) that differ only in the
 * temperature statistic (`t2max` vs `t2min`), threshold set, and copy. Every
 * metric-specific value flows from this registry rather than being branched on
 * `climateVariable` throughout the app.
 */
export interface HeatMetricConfig {
  /** `climateVariable` select value + URL `variable` param. */
  value: string;
  /** STAC `variable_id`. */
  variableId: HeatVariableId;
  /** Dropdown + tool-copy label, e.g. "Warm Nights". */
  label: string;
  /** Temperature statistic used to build the STAC `threshold_name`. */
  tempStat: "t2max" | "t2min";
  /** Curated threshold options. `value` is the UI token (e.g. "100F"), which
   *  combines with `tempStat` into a `threshold_name` (e.g. `t2max_ge100F`). */
  thresholdOptions: readonly SelectOption[];
  /** Default threshold token for this metric. */
  defaultThreshold: string;
  /** Chart y-axis label. */
  yAxisLabel: string;
  /** Fixed y-axis domain max; omit to derive the max from the data. */
  yAxisMax?: number;
  /** Spacing between y-axis gridlines/ticks (in the value unit); omit to let the
   *  chart choose ~5 nice ticks automatically. */
  yAxisTickStep?: number;
  /** Metric label used inside the chart title, e.g. "Warm Nights". */
  titleLabel: string;
  /** Noun used in accessible chart text, e.g. "warm nights". */
  accessibleNoun: string;
  /** Unit shown on bar tooltips/values, e.g. "nights". */
  valueUnit: string;
  /** Threshold control tooltip (min- vs max-temp phrasing). */
  thresholdTooltip: string;
  /** PNG export filename prefix. */
  exportFilenamePrefix: string;
}

const EXTREME_HEAT_DAYS_METRIC: HeatMetricConfig = {
  value: "extreme-heat-days",
  variableId: "eh_days",
  label: "Extreme Heat Days",
  tempStat: "t2max",
  thresholdOptions: [
    { value: "100F", label: "100°F" },
    { value: "105F", label: "105°F" },
  ],
  defaultThreshold: "100F",
  yAxisLabel: "Number of Extreme Heat Days per Year",
  // Worst case ~155 days/yr (Imperial @ 100°F) in the eh-metrics collection; the
  // old source only reached ~58, hence the previous cap of 70.
  yAxisMax: 160,
  yAxisTickStep: 25,
  titleLabel: "Extreme Heat",
  accessibleNoun: "extreme heat days",
  valueUnit: "days",
  thresholdTooltip: "The maximum temperature threshold used to determine an extreme heat day.",
  exportFilenamePrefix: "extreme-heat-days",
};

const WARM_NIGHTS_METRIC: HeatMetricConfig = {
  value: "warm-nights",
  variableId: "warm_nights",
  label: "Warm Nights",
  tempStat: "t2min",
  // Warm nights are defined by overnight *minimum* temperature, so meaningful
  // thresholds are far lower than the daytime-max heat-day thresholds. Live data
  // shows ≥80°F overnight mins are ~never reached in CA; 65–70°F is where the
  // signal (and the standard ~18–20°C "warm night" definition) lives.
  thresholdOptions: [
    { value: "60F", label: "60°F" },
    { value: "65F", label: "65°F" },
    { value: "70F", label: "70°F" },
    { value: "75F", label: "75°F" },
    { value: "80F", label: "80°F" },
  ],
  defaultThreshold: "70F",
  yAxisLabel: "Number of Warm Nights per Year",
  // Worst case ~253 nights/yr (Imperial @ 60°F, the lowest threshold) so the
  // fixed axis never clips.
  yAxisMax: 260,
  // 50s keep the tall 0–260 axis readable; 25s would be too dense.
  yAxisTickStep: 50,
  titleLabel: "Warm Nights",
  accessibleNoun: "warm nights",
  valueUnit: "nights",
  thresholdTooltip: "The minimum overnight temperature threshold used to determine a warm night.",
  exportFilenamePrefix: "warm-nights",
};

/** Metric registry keyed by `climateVariable` value. Order drives dropdown order. */
export const HEAT_METRICS: Readonly<Record<string, HeatMetricConfig>> = {
  [EXTREME_HEAT_DAYS_METRIC.value]: EXTREME_HEAT_DAYS_METRIC,
  [WARM_NIGHTS_METRIC.value]: WARM_NIGHTS_METRIC,
};

const DEFAULT_METRIC = EXTREME_HEAT_DAYS_METRIC;

/** Resolve a metric config, falling back to the default metric for unknown values. */
export function getHeatMetric(climateVariable: string): HeatMetricConfig {
  return HEAT_METRICS[climateVariable] ?? DEFAULT_METRIC;
}

export function thresholdOptionsFor(climateVariable: string): readonly SelectOption[] {
  return getHeatMetric(climateVariable).thresholdOptions;
}

export function defaultThresholdFor(climateVariable: string): string {
  return getHeatMetric(climateVariable).defaultThreshold;
}

export const CLIMATE_VARIABLE_OPTIONS: readonly SelectOption[] = Object.values(HEAT_METRICS).map(
  (metric) => ({ value: metric.value, label: metric.label })
);

export const COMING_SOON_CLIMATE_VARIABLE_OPTIONS: readonly SelectOption[] = [
  { value: "heat-waves", label: "Heat Waves", disabled: true, hint: "Coming soon" },
];

/** All climate-variable options for the dropdown: selectable metrics followed by
 *  coming soon options. */
export const CLIMATE_VARIABLE_SELECT_OPTIONS: readonly SelectOption[] = [
  ...CLIMATE_VARIABLE_OPTIONS,
  ...COMING_SOON_CLIMATE_VARIABLE_OPTIONS,
];

export const INDICATOR_OPTIONS: readonly SelectOption[] = [
  { value: "frequency", label: "Frequency" },
];

/**
 * All 58 California counties in alphabetical order.
 */
const CALIFORNIA_COUNTY_NAMES: readonly string[] = [
  "Alameda",
  "Alpine",
  "Amador",
  "Butte",
  "Calaveras",
  "Colusa",
  "Contra Costa",
  "Del Norte",
  "El Dorado",
  "Fresno",
  "Glenn",
  "Humboldt",
  "Imperial",
  "Inyo",
  "Kern",
  "Kings",
  "Lake",
  "Lassen",
  "Los Angeles",
  "Madera",
  "Marin",
  "Mariposa",
  "Mendocino",
  "Merced",
  "Modoc",
  "Mono",
  "Monterey",
  "Napa",
  "Nevada",
  "Orange",
  "Placer",
  "Plumas",
  "Riverside",
  "Sacramento",
  "San Benito",
  "San Bernardino",
  "San Diego",
  "San Francisco",
  "San Joaquin",
  "San Luis Obispo",
  "San Mateo",
  "Santa Barbara",
  "Santa Clara",
  "Santa Cruz",
  "Shasta",
  "Sierra",
  "Siskiyou",
  "Solano",
  "Sonoma",
  "Stanislaus",
  "Sutter",
  "Tehama",
  "Trinity",
  "Tulare",
  "Tuolumne",
  "Ventura",
  "Yolo",
  "Yuba",
];

export const COUNTY_OPTIONS: readonly SelectOption[] = CALIFORNIA_COUNTY_NAMES.map((name) => ({
  value: name,
  label: name,
}));

export const DEFAULT_SELECTIONS: ExtremeHeatDaysSelections = {
  climateVariable: DEFAULT_METRIC.value,
  threshold: DEFAULT_METRIC.defaultThreshold,
  indicator: "frequency",
  county: "Sacramento",
};
