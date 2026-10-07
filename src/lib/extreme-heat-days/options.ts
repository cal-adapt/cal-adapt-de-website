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
  /** Minimum heat-wave length in days, e.g. "5". Only used by metrics with
   *  `usesDuration`; ignored (and kept out of the URL) for the others. */
  duration: string;
  /** STAC `boundary` id, e.g. "ca_counties". */
  spatialAggregation: string;
  location: string;
}

/** STAC `variable_id`s of the heat metrics' boundary CSV collections. */
export type HeatVariableId = "eh_days" | "warm_nights" | "heat_wave_count";

/** Column names holding the plotted value and its range in a metric's CSVs. */
export interface HeatCsvColumns {
  median: string;
  p10: string;
  p90: string;
}

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
  /** Dropdown label and chart title, e.g. "Warm Nights". */
  label: string;
  /** One-line summary shown under the label in the climate variable dropdown. */
  description: string;
  /** Temperature statistic used to build the STAC `threshold_name`. */
  tempStat: "t2max" | "t2min";
  /** Default absolute threshold token for this metric, e.g. "100F". */
  defaultThreshold: string;
  /** Inclusive absolute (°F) slider bounds for this metric. */
  absoluteMinF: number;
  absoluteMaxF: number;
  /** Selectable relative (percentile) thresholds, ascending. A contiguous run
   *  renders as a slider; a sparse set (e.g. 95/99) renders as a dropdown. */
  relativePercentiles: readonly number[];
  /** Default relative threshold token for this metric, e.g. "98pctl". */
  defaultRelativeThreshold: string;
  /** STAC collection holding this metric's boundary CSVs. */
  collectionId: string;
  /** CSV columns for the plotted value and range. */
  csvColumns: HeatCsvColumns;
  /** True when items/CSVs are also keyed by a minimum heat-wave duration. */
  usesDuration: boolean;
  /** Chart y-axis label. */
  yAxisLabel: string;
  /** Noun used in accessible chart text, e.g. "warm nights". */
  accessibleNoun: string;
  /** Unit shown on bar tooltips/values, e.g. "nights". */
  valueUnit: string;
  /** Threshold control tooltip (min- vs max-temp phrasing). */
  thresholdTooltip: string;
  /** PNG export filename prefix. */
  exportFilenamePrefix: string;
}

/** STAC collection for the Extreme Heat Days and Warm Nights boundary CSVs. */
export const EH_METRICS_STAC_COLLECTION_ID = "eh-metrics-mm-boundary-csv";

function inclusiveRange(min: number, max: number): number[] {
  return Array.from({ length: max - min + 1 }, (_, i) => min + i);
}

const PERCENTILES_90_TO_99 = inclusiveRange(90, 99);

const EH_METRICS_CSV_COLUMNS: HeatCsvColumns = {
  median: "multimodel_median",
  p10: "multimodel_p10",
  p90: "multimodel_p90",
};

const EXTREME_HEAT_DAYS_METRIC: HeatMetricConfig = {
  value: "extreme-heat-days",
  variableId: "eh_days",
  label: "Extreme Heat Days",
  description: "Days per year above a daytime high temperature threshold",
  tempStat: "t2max",
  defaultThreshold: "100F",
  absoluteMinF: 80,
  absoluteMaxF: 135,
  relativePercentiles: PERCENTILES_90_TO_99,
  defaultRelativeThreshold: "98pctl",
  collectionId: EH_METRICS_STAC_COLLECTION_ID,
  csvColumns: EH_METRICS_CSV_COLUMNS,
  usesDuration: false,
  yAxisLabel: "Number of Extreme Heat Days per Year",
  accessibleNoun: "extreme heat days",
  valueUnit: "days",
  thresholdTooltip: "The maximum temperature threshold used to determine an extreme heat day.",
  exportFilenamePrefix: "extreme-heat-days",
};

const WARM_NIGHTS_METRIC: HeatMetricConfig = {
  value: "warm-nights",
  variableId: "warm_nights",
  label: "Warm Nights",
  description: "Nights per year above an overnight low temperature threshold",
  tempStat: "t2min",
  defaultThreshold: "70F",
  absoluteMinF: 65,
  absoluteMaxF: 135,
  relativePercentiles: PERCENTILES_90_TO_99,
  defaultRelativeThreshold: "98pctl",
  collectionId: EH_METRICS_STAC_COLLECTION_ID,
  csvColumns: EH_METRICS_CSV_COLUMNS,
  usesDuration: false,
  yAxisLabel: "Number of Warm Nights per Year",
  accessibleNoun: "warm nights",
  valueUnit: "nights",
  thresholdTooltip: "The minimum overnight temperature threshold used to determine a warm night.",
  exportFilenamePrefix: "warm-nights",
};

/** STAC collection for the heat wave frequency boundary CSVs. */
export const HWF_METRICS_STAC_COLLECTION_ID = "hwf-metrics-mm-boundary-csv";

const HEAT_WAVE_FREQUENCY_METRIC: HeatMetricConfig = {
  value: "heat-wave-frequency",
  variableId: "heat_wave_count",
  label: "Heat Wave Frequency",
  description: "Heat waves per year lasting at least a set number of days",
  tempStat: "t2max",
  defaultThreshold: "110F",
  absoluteMinF: 85,
  absoluteMaxF: 115,
  relativePercentiles: [95, 99],
  defaultRelativeThreshold: "95pctl",
  collectionId: HWF_METRICS_STAC_COLLECTION_ID,
  csvColumns: { median: "median", p10: "p10", p90: "p90" },
  usesDuration: true,
  yAxisLabel: "Number of Heat Waves per Year",
  accessibleNoun: "heat waves",
  valueUnit: "heat waves",
  thresholdTooltip: "The daily maximum temperature a day must exceed to count toward a heat wave.",
  exportFilenamePrefix: "heat-wave-frequency",
};

/** Metric registry keyed by `climateVariable` value. Order drives dropdown order. */
export const HEAT_METRICS: Readonly<Record<string, HeatMetricConfig>> = {
  [EXTREME_HEAT_DAYS_METRIC.value]: EXTREME_HEAT_DAYS_METRIC,
  [WARM_NIGHTS_METRIC.value]: WARM_NIGHTS_METRIC,
  [HEAT_WAVE_FREQUENCY_METRIC.value]: HEAT_WAVE_FREQUENCY_METRIC,
};

/** A variable listed in the dropdown before it's built; shown disabled. */
interface ComingSoonVariable {
  value: string;
  label: string;
  description: string;
  comingSoon: true;
}

/** Climate variable dropdown entries, in display order: single hot days and
 *  nights first, then multi-day heat waves. Every metric in `HEAT_METRICS`
 *  should appear exactly once. */
export const CLIMATE_VARIABLE_DROPDOWN_ENTRIES: readonly (HeatMetricConfig | ComingSoonVariable)[] =
  [
    EXTREME_HEAT_DAYS_METRIC,
    WARM_NIGHTS_METRIC,
    {
      value: "extreme-heat-season",
      label: "Extreme Heat Season",
      description: "When in the year hot days tend to occur",
      comingSoon: true,
    },
    HEAT_WAVE_FREQUENCY_METRIC,
    {
      value: "heat-wave-length",
      label: "Heat Wave Length",
      description: "How long heat waves typically last",
      comingSoon: true,
    },
  ];

function isComingSoon(entry: HeatMetricConfig | ComingSoonVariable): entry is ComingSoonVariable {
  return "comingSoon" in entry;
}

const COMING_SOON_HINT = "Coming soon";

const DEFAULT_METRIC = EXTREME_HEAT_DAYS_METRIC;

/** Resolve a metric config, falling back to the default metric for unknown values. */
export function getHeatMetric(climateVariable: string): HeatMetricConfig {
  return HEAT_METRICS[climateVariable] ?? DEFAULT_METRIC;
}

export type ThresholdKind = "absolute" | "relative";

export const THRESHOLD_KIND_OPTIONS: readonly SelectOption[] = [
  {
    value: "absolute",
    label: "Absolute",
    description: "A fixed temperature, the same everywhere (e.g. 100°F)",
  },
  {
    value: "relative",
    label: "Relative",
    description: "A local percentile, so the temperature varies by location",
  },
];

export function thresholdKindFor(threshold: string): ThresholdKind {
  return threshold.endsWith("pctl") ? "relative" : "absolute";
}

/** Every selectable threshold number for `kind` on this metric, ascending. */
export function thresholdValuesFor(
  kind: ThresholdKind,
  climateVariable: string
): readonly number[] {
  const metric = getHeatMetric(climateVariable);
  switch (kind) {
    case "absolute":
      return inclusiveRange(metric.absoluteMinF, metric.absoluteMaxF);
    case "relative":
      return metric.relativePercentiles;
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

/** True when the selectable values have no gaps, so a 1-step slider fits. */
export function isContiguous(values: readonly number[]): boolean {
  return values.every((value, i) => i === 0 || value === values[i - 1] + 1);
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
  if (!thresholdValuesFor(kind, climateVariable).includes(n)) return false;
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
      return getHeatMetric(climateVariable).defaultRelativeThreshold;
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

/** Selectable climate variables; used to validate the URL `variable`. */
export const CLIMATE_VARIABLE_OPTIONS: readonly SelectOption[] = Object.values(HEAT_METRICS).map(
  (metric) => ({ value: metric.value, label: metric.label })
);

/** Dropdown options. Variables not built yet stay visible but disabled,
 *  marked "Coming soon". */
export const CLIMATE_VARIABLE_SELECT_OPTIONS: readonly SelectOption[] =
  CLIMATE_VARIABLE_DROPDOWN_ENTRIES.map((entry) => {
    const option = { value: entry.value, label: entry.label, description: entry.description };
    return isComingSoon(entry) ? { ...option, disabled: true, hint: COMING_SOON_HINT } : option;
  });

/** Selectable minimum heat-wave durations, in days. */
const DURATION_DAYS: readonly number[] = inclusiveRange(3, 14);

export const DEFAULT_DURATION = "3";

export const DURATION_OPTIONS: readonly SelectOption[] = DURATION_DAYS.map((days) => ({
  value: String(days),
  label: `${days} days`,
}));

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
  duration: DEFAULT_DURATION,
  spatialAggregation: DEFAULT_SPATIAL_AGGREGATION.value,
  location: DEFAULT_SPATIAL_AGGREGATION.defaultLocation,
};

/** Defaults in the context of a chosen variable and aggregation, whose
 *  threshold and location defaults differ. The URL reader falls back to these
 *  and the writer omits fields equal to them, so the two always agree. */
export function defaultSelectionsFor(
  climateVariable: string,
  spatialAggregation: string
): ExtremeHeatDaysSelections {
  return {
    ...DEFAULT_SELECTIONS,
    threshold: defaultThresholdFor(climateVariable),
    location: defaultLocationFor(spatialAggregation),
  };
}

/** Like `selectionsFromSearchParams`, but throws on invalid values instead of falling back. */
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
  const duration = overrides.duration ?? DEFAULT_SELECTIONS.duration;
  if (!DURATION_OPTIONS.some((option) => option.value === duration)) {
    throw new Error(`Unknown heat wave duration: "${duration}"`);
  }
  const spatialAggregation = overrides.spatialAggregation ?? DEFAULT_SELECTIONS.spatialAggregation;
  if (!isKnownSpatialAggregation(spatialAggregation)) {
    throw new Error(`Unknown spatial aggregation: "${spatialAggregation}"`);
  }
  const location = overrides.location ?? defaultLocationFor(spatialAggregation);
  if (!isKnownLocation(spatialAggregation, location)) {
    throw new Error(`Location "${location}" is not available for "${spatialAggregation}"`);
  }
  return { climateVariable, threshold, duration, spatialAggregation, location };
}
