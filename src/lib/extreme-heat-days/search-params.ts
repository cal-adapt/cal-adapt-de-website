import { type ReadableSearchParams, readEnumParam } from "@/utils/search-params";

import {
  CLIMATE_VARIABLE_OPTIONS,
  DEFAULT_DURATION,
  DEFAULT_SELECTIONS,
  defaultLocationFor,
  defaultThresholdFor,
  DURATION_OPTIONS,
  type ExtremeHeatDaysSelections,
  getHeatMetric,
  isAllowedThreshold,
  locationOptionsFor,
  SPATIAL_AGGREGATION_OPTIONS,
} from "./options";

/**
 * Serialize a record of string-valued fields to query params, omitting any
 * field equal to its default. `paramKeys` maps each field to the query-string
 * key it should be written under.
 */
function toSearchParams<T extends Record<keyof T, string>>(
  values: T,
  defaults: T,
  paramKeys: Record<keyof T, string>
): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of Object.keys(values) as Array<keyof T>) {
    if (values[key] !== defaults[key]) {
      params.set(paramKeys[key], values[key]);
    }
  }
  return params;
}

const PARAM_KEYS = {
  climateVariable: "variable",
  threshold: "threshold",
  duration: "duration",
  spatialAggregation: "aggregation",
  location: "location",
} as const satisfies Record<keyof ExtremeHeatDaysSelections, string>;

function readField(
  params: ReadableSearchParams,
  field: keyof ExtremeHeatDaysSelections,
  allowed: readonly string[],
  fallback: string
): string {
  return readEnumParam(params, PARAM_KEYS[field], allowed, fallback);
}

export function selectionsFromSearchParams(
  params: ReadableSearchParams
): ExtremeHeatDaysSelections {
  const climateVariable = readField(
    params,
    "climateVariable",
    CLIMATE_VARIABLE_OPTIONS.map((option) => option.value),
    DEFAULT_SELECTIONS.climateVariable
  );
  const rawThreshold = params.get(PARAM_KEYS.threshold);
  const threshold =
    rawThreshold !== null && isAllowedThreshold(rawThreshold, climateVariable)
      ? rawThreshold
      : defaultThresholdFor(climateVariable);
  const duration = readField(
    params,
    "duration",
    DURATION_OPTIONS.map((option) => option.value),
    DEFAULT_DURATION
  );
  const spatialAggregation = readField(
    params,
    "spatialAggregation",
    SPATIAL_AGGREGATION_OPTIONS.map((option) => option.value),
    DEFAULT_SELECTIONS.spatialAggregation
  );
  const location = readField(
    params,
    "location",
    locationOptionsFor(spatialAggregation).map((option) => option.value),
    defaultLocationFor(spatialAggregation)
  );
  return { climateVariable, threshold, duration, spatialAggregation, location };
}

export function selectionsToSearchParams(selections: ExtremeHeatDaysSelections): URLSearchParams {
  // Duration only means something for metrics keyed by it; drop it elsewhere
  // so it doesn't linger in the URL after switching variables.
  const values = getHeatMetric(selections.climateVariable).usesDuration
    ? selections
    : { ...selections, duration: DEFAULT_SELECTIONS.duration };
  return toSearchParams(values, DEFAULT_SELECTIONS, PARAM_KEYS);
}
