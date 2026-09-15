import { type ReadableSearchParams, readEnumParam } from "@/utils/search-params";

import {
  CLIMATE_VARIABLE_OPTIONS,
  DEFAULT_SELECTIONS,
  defaultLocationFor,
  type HddCddSelections,
  locationOptionsFor,
  SPATIAL_AGGREGATION_OPTIONS,
} from "./options";

const PARAM_KEYS = {
  climateVariable: "variable",
  spatialAggregation: "aggregation",
  location: "location",
} as const satisfies Record<keyof HddCddSelections, string>;

export function selectionsFromSearchParams(params: ReadableSearchParams): HddCddSelections {
  const climateVariable = readEnumParam(
    params,
    PARAM_KEYS.climateVariable,
    CLIMATE_VARIABLE_OPTIONS.map((option) => option.value),
    DEFAULT_SELECTIONS.climateVariable
  );
  const spatialAggregation = readEnumParam(
    params,
    PARAM_KEYS.spatialAggregation,
    SPATIAL_AGGREGATION_OPTIONS.map((option) => option.value),
    DEFAULT_SELECTIONS.spatialAggregation
  );
  const location = readEnumParam(
    params,
    PARAM_KEYS.location,
    locationOptionsFor(spatialAggregation).map((option) => option.value),
    defaultLocationFor(spatialAggregation)
  );

  return { climateVariable, spatialAggregation, location };
}

export function selectionsToSearchParams(selections: HddCddSelections): URLSearchParams {
  const params = new URLSearchParams();
  if (selections.climateVariable !== DEFAULT_SELECTIONS.climateVariable) {
    params.set(PARAM_KEYS.climateVariable, selections.climateVariable);
  }
  if (selections.spatialAggregation !== DEFAULT_SELECTIONS.spatialAggregation) {
    params.set(PARAM_KEYS.spatialAggregation, selections.spatialAggregation);
  }
  if (selections.location !== DEFAULT_SELECTIONS.location) {
    params.set(PARAM_KEYS.location, selections.location);
  }
  return params;
}
