// Domain data for the Extreme Heat tool.

import type { SelectOption } from "@/components/common/form";
import {
  DEFAULT_SPATIAL_AGGREGATION,
  defaultLocationFor,
  isKnownLocation,
  isKnownSpatialAggregation,
} from "@/lib/spatial-aggregations";

/**
 * User-controlled inputs that drive the Extreme Heat tool.
 */
export interface ExtremeHeatDaysSelections {
  climateVariable: string;
  threshold: string;
  indicator: string;
  /** STAC `boundary` id, e.g. "ca_counties". */
  spatialAggregation: string;
  location: string;
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
  /** Default absolute threshold token for this metric, e.g. "100F". */
  defaultThreshold: string;
  /** Inclusive absolute (°F) slider bounds for this metric. */
  absoluteMinF: number;
  absoluteMaxF: number;
  /** Chart y-axis label. */
  yAxisLabel: string;
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
  defaultThreshold: "100F",
  absoluteMinF: 80,
  absoluteMaxF: 135,
  yAxisLabel: "Number of Extreme Heat Days per Year",
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
  defaultThreshold: "70F",
  absoluteMinF: 65,
  absoluteMaxF: 135,
  yAxisLabel: "Number of Warm Nights per Year",
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

export type ThresholdKind = "absolute" | "relative";

export const THRESHOLD_KIND_OPTIONS: readonly SelectOption[] = [
  { value: "absolute", label: "Absolute" },
  { value: "relative", label: "Relative" },
];

export const RELATIVE_THRESHOLD_MIN_PCTL = 90;
export const RELATIVE_THRESHOLD_MAX_PCTL = 99;

const DEFAULT_RELATIVE_THRESHOLD = "98pctl";

export function thresholdKindFor(threshold: string): ThresholdKind {
  return threshold.endsWith("pctl") ? "relative" : "absolute";
}

export function thresholdRangeFor(
  kind: ThresholdKind,
  climateVariable: string
): { min: number; max: number } {
  switch (kind) {
    case "absolute": {
      const metric = getHeatMetric(climateVariable);
      return { min: metric.absoluteMinF, max: metric.absoluteMaxF };
    }
    case "relative":
      return { min: RELATIVE_THRESHOLD_MIN_PCTL, max: RELATIVE_THRESHOLD_MAX_PCTL };
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

export function parseThresholdNumber(threshold: string): number | null {
  const match = /^(?<n>\d+)(?<unit>F|pctl)$/.exec(threshold);
  if (!match?.groups) return null;
  return Number(match.groups.n);
}

export function thresholdTokenFor(kind: ThresholdKind, value: number): string {
  const rounded = Math.round(value);
  switch (kind) {
    case "absolute":
      return `${rounded}F`;
    case "relative":
      return `${rounded}pctl`;
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

export function isAllowedThreshold(threshold: string, climateVariable: string): boolean {
  const kind: ThresholdKind | null = threshold.endsWith("pctl")
    ? "relative"
    : threshold.endsWith("F")
      ? "absolute"
      : null;
  if (kind == null) return false;
  const n = parseThresholdNumber(threshold);
  if (n == null) return false;
  const { min, max } = thresholdRangeFor(kind, climateVariable);
  if (n < min || n > max) return false;
  return thresholdTokenFor(kind, n) === threshold;
}

export function defaultThresholdFor(climateVariable: string): string {
  return getHeatMetric(climateVariable).defaultThreshold;
}

export function defaultThresholdForKind(climateVariable: string, kind: ThresholdKind): string {
  switch (kind) {
    case "absolute":
      return defaultThresholdFor(climateVariable);
    case "relative":
      return DEFAULT_RELATIVE_THRESHOLD;
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
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

export {
  COUNTY_OPTIONS,
  DEFAULT_SPATIAL_AGGREGATION,
  defaultLocationFor,
  getSpatialAggregation,
  isKnownLocation,
  isKnownSpatialAggregation,
  locationOptionsFor,
  regionLabelFor,
  SPATIAL_AGGREGATION_OPTIONS,
  SPATIAL_AGGREGATIONS,
  type SpatialAggregationConfig,
} from "@/lib/spatial-aggregations";

export const DEFAULT_SELECTIONS: ExtremeHeatDaysSelections = {
  climateVariable: DEFAULT_METRIC.value,
  threshold: DEFAULT_METRIC.defaultThreshold,
  indicator: "frequency",
  spatialAggregation: DEFAULT_SPATIAL_AGGREGATION.value,
  location: DEFAULT_SPATIAL_AGGREGATION.defaultLocation,
};

/**
 * Fill omitted fields from the defaults and reject values the tool doesn't
 * offer. Fixed selections (e.g. a chart embedded in a Climate Story) built with
 * this fail at module load instead of rendering a "no data" chart.
 */
export function resolveSelections(
  overrides: Partial<ExtremeHeatDaysSelections>
): ExtremeHeatDaysSelections {
  const climateVariable = overrides.climateVariable ?? DEFAULT_SELECTIONS.climateVariable;
  if (!Object.hasOwn(HEAT_METRICS, climateVariable)) {
    throw new Error(`Unknown extreme heat climate variable: "${climateVariable}"`);
  }
  const threshold = overrides.threshold ?? defaultThresholdFor(climateVariable);
  if (!isAllowedThreshold(threshold, climateVariable)) {
    throw new Error(`Threshold "${threshold}" is not allowed for "${climateVariable}"`);
  }
  const indicator = overrides.indicator ?? DEFAULT_SELECTIONS.indicator;
  if (!INDICATOR_OPTIONS.some((option) => option.value === indicator)) {
    throw new Error(`Unknown extreme heat indicator: "${indicator}"`);
  }
  const spatialAggregation = overrides.spatialAggregation ?? DEFAULT_SELECTIONS.spatialAggregation;
  if (!isKnownSpatialAggregation(spatialAggregation)) {
    throw new Error(`Unknown spatial aggregation: "${spatialAggregation}"`);
  }
  const location = overrides.location ?? defaultLocationFor(spatialAggregation);
  if (!isKnownLocation(spatialAggregation, location)) {
    throw new Error(`Location "${location}" is not available for "${spatialAggregation}"`);
  }
  return { climateVariable, threshold, indicator, spatialAggregation, location };
}
