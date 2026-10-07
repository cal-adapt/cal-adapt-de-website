// Domain data for the HDD/CDD tool.

import type { SelectOption } from "@/components/common/form";
import {
  DEFAULT_SPATIAL_AGGREGATION,
  defaultLocationFor,
  isKnownLocation,
  isKnownSpatialAggregation,
} from "@/lib/spatial-aggregations";

/**
 * User-controlled inputs that drive the HDD/CDD tool.
 */
export interface HddCddSelections {
  /** "hdd" or "cdd" — which metric's mean/min/max columns to plot. Does not
   *  affect the STAC/CSV fetch: both metrics live in the same region CSV. */
  climateVariable: string;
  /** STAC `boundary` id, e.g. "ca_counties". */
  spatialAggregation: string;
  location: string;
}

export interface MetricConfig {
  /** `climateVariable` select value + URL `variable` param. */
  value: string;
  label: string;
  /** Dropdown label. */
  dropdownLabel: string;
  /** Chart y-axis label. */
  yAxisLabel: string;
  /** Noun used in accessible chart text and copy, e.g. "heating degree days". */
  accessibleNoun: string;
  /** Full name + threshold, e.g. "Heating Degree Days (65°F)". Used in the chart title. */
  longLabel: string;
  /** Chart line/envelope/legend color for this metric's scenario series. */
  color: string;
}

const HDD_METRIC: MetricConfig = {
  value: "hdd",
  label: "HDD",
  dropdownLabel: "Heating Degree Days",
  yAxisLabel: "Heating Degree Days (65°F)",
  accessibleNoun: "heating degree days",
  longLabel: "Heating Degree Days (65°F)",
  color: "#c0392b",
};

const CDD_METRIC: MetricConfig = {
  value: "cdd",
  label: "CDD",
  dropdownLabel: "Cooling Degree Days",
  yAxisLabel: "Cooling Degree Days (65°F)",
  accessibleNoun: "cooling degree days",
  longLabel: "Cooling Degree Days (65°F)",
  color: "#007dec",
};

/** Metric registry keyed by `climateVariable` value. Order drives dropdown order. */
export const METRICS: Readonly<Record<string, MetricConfig>> = {
  [CDD_METRIC.value]: CDD_METRIC,
  [HDD_METRIC.value]: HDD_METRIC,
};

// CDD is the confirmed default at first page load (per MVP requirements).
const DEFAULT_METRIC = CDD_METRIC;

export function getMetric(climateVariable: string): MetricConfig {
  return METRICS[climateVariable] ?? DEFAULT_METRIC;
}

export const CLIMATE_VARIABLE_OPTIONS: readonly SelectOption[] = Object.values(METRICS).map(
  (metric) => ({
    value: metric.value,
    label: metric.dropdownLabel,
  })
);

/** Scenario metadata for the (currently single) available SSP. */
export interface ScenarioConfig {
  value: string;
  label: string;
}

// Full UI scope includes SSP245/SSP370/SSP585; current data availability is
// SSP370-only, so this is the one scenario the chart renders today.
export const SSP370: ScenarioConfig = {
  value: "ssp370",
  label: "SSP3-7.0",
};

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

export const DEFAULT_SELECTIONS: HddCddSelections = {
  climateVariable: DEFAULT_METRIC.value,
  spatialAggregation: DEFAULT_SPATIAL_AGGREGATION.value,
  location: DEFAULT_SPATIAL_AGGREGATION.defaultLocation,
};

/** Like `selectionsFromSearchParams`, but throws on invalid values instead of falling back. */
export function resolveSelections(overrides: Partial<HddCddSelections>): HddCddSelections {
  const climateVariable = overrides.climateVariable ?? DEFAULT_SELECTIONS.climateVariable;
  if (!Object.hasOwn(METRICS, climateVariable)) {
    throw new Error(`Unknown HDD/CDD climate variable: "${climateVariable}"`);
  }
  const spatialAggregation = overrides.spatialAggregation ?? DEFAULT_SELECTIONS.spatialAggregation;
  if (!isKnownSpatialAggregation(spatialAggregation)) {
    throw new Error(`Unknown spatial aggregation: "${spatialAggregation}"`);
  }
  const location = overrides.location ?? defaultLocationFor(spatialAggregation);
  if (!isKnownLocation(spatialAggregation, location)) {
    throw new Error(`Location "${location}" is not available for "${spatialAggregation}"`);
  }
  return { climateVariable, spatialAggregation, location };
}
