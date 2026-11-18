import { type ReadableSearchParams, readEnumParam } from "@/utils/search-params";

import {
  type AnnualClimateProjectionsSelections,
  DEFAULT_SELECTIONS,
  type Ensemble,
  ENSEMBLE_OPTIONS,
  locationOptionsFor,
  scenarioOptionsFor,
  SPATIAL_AGGREGATION_OPTIONS,
  toolDefaultLocationFor,
  variableOptionsFor,
} from "./options";

const PARAM_KEYS = {
  climateVariable: "variable",
  spatialAggregation: "aggregation",
  location: "location",
  ensemble: "ensemble",
  scenario: "scenario",
} as const satisfies Record<keyof AnnualClimateProjectionsSelections, string>;

export function selectionsFromSearchParams(
  params: ReadableSearchParams
): AnnualClimateProjectionsSelections {
  const ensemble = readEnumParam(
    params,
    PARAM_KEYS.ensemble,
    ENSEMBLE_OPTIONS.map((option) => option.value as Ensemble),
    DEFAULT_SELECTIONS.ensemble
  );
  const climateVariable = readEnumParam(
    params,
    PARAM_KEYS.climateVariable,
    variableOptionsFor(ensemble).map((option) => option.value),
    DEFAULT_SELECTIONS.climateVariable
  );
  const scenario = readEnumParam(
    params,
    PARAM_KEYS.scenario,
    scenarioOptionsFor(ensemble).map((option) => option.value),
    DEFAULT_SELECTIONS.scenario
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
    toolDefaultLocationFor(spatialAggregation)
  );

  return { climateVariable, spatialAggregation, location, ensemble, scenario };
}

export function selectionsToSearchParams(
  selections: AnnualClimateProjectionsSelections
): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of Object.keys(PARAM_KEYS) as (keyof AnnualClimateProjectionsSelections)[]) {
    if (selections[key] !== DEFAULT_SELECTIONS[key]) {
      params.set(PARAM_KEYS[key], selections[key]);
    }
  }
  return params;
}
