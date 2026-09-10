import {
  CLIMATE_VARIABLE_OPTIONS,
  DEFAULT_SELECTIONS,
  defaultLocationFor,
  defaultThresholdFor,
  type ExtremeHeatDaysSelections,
  INDICATOR_OPTIONS,
  isAllowedThreshold,
  locationOptionsFor,
  SPATIAL_AGGREGATION_OPTIONS,
} from "./options";

interface ReadableSearchParams {
  get(key: string): string | null;
}

/**
 * Read a query param and validate it against a set of allowed values, falling
 * back to `fallback` when the param is missing or not in the set.
 */
function readEnumParam<T extends string>(
  params: ReadableSearchParams,
  key: string,
  allowed: readonly T[],
  fallback: T
): T {
  const raw = params.get(key);
  return raw !== null && (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback;
}

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
  indicator: "indicator",
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
    rawThreshold !== null && isAllowedThreshold(rawThreshold)
      ? rawThreshold
      : defaultThresholdFor(climateVariable);
  const indicator = readField(
    params,
    "indicator",
    INDICATOR_OPTIONS.map((option) => option.value),
    DEFAULT_SELECTIONS.indicator
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
  return { climateVariable, threshold, indicator, spatialAggregation, location };
}

export function selectionsToSearchParams(selections: ExtremeHeatDaysSelections): URLSearchParams {
  return toSearchParams(selections, DEFAULT_SELECTIONS, PARAM_KEYS);
}
