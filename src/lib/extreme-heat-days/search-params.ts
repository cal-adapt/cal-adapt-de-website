import {
  CLIMATE_VARIABLE_OPTIONS,
  COUNTY_OPTIONS,
  DEFAULT_SELECTIONS,
  defaultThresholdFor,
  type ExtremeHeatDaysSelections,
  INDICATOR_OPTIONS,
  thresholdOptionsFor,
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
  county: "county",
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
  // Threshold options are metric-specific, so validate against (and fall back
  // to) the selected climate variable's options.
  const threshold = readField(
    params,
    "threshold",
    thresholdOptionsFor(climateVariable).map((option) => option.value),
    defaultThresholdFor(climateVariable)
  );
  const indicator = readField(
    params,
    "indicator",
    INDICATOR_OPTIONS.map((option) => option.value),
    DEFAULT_SELECTIONS.indicator
  );
  const county = readField(
    params,
    "county",
    COUNTY_OPTIONS.map((option) => option.value),
    DEFAULT_SELECTIONS.county
  );
  return { climateVariable, threshold, indicator, county };
}

export function selectionsToSearchParams(selections: ExtremeHeatDaysSelections): URLSearchParams {
  return toSearchParams(selections, DEFAULT_SELECTIONS, PARAM_KEYS);
}
