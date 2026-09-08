import { type ReadableSearchParams, readEnumParam } from "@/utils/search-params";

import {
  DEFAULT_SELECTIONS,
  defaultLocationFor,
  type HddCddSelections,
  locationOptionsFor,
  METRIC_OPTIONS,
  SPATIAL_AGGREGATION_OPTIONS,
} from "./options";

const PARAM_KEYS = {
  metric: "metric",
  spatialAggregation: "aggregation",
  location: "location",
} as const satisfies Record<keyof HddCddSelections, string>;

export function selectionsFromSearchParams(params: ReadableSearchParams): HddCddSelections {
  const metric = readEnumParam(
    params,
    PARAM_KEYS.metric,
    METRIC_OPTIONS.map((option) => option.value),
    DEFAULT_SELECTIONS.metric
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

  return { metric, spatialAggregation, location };
}

export function selectionsToSearchParams(selections: HddCddSelections): URLSearchParams {
  const params = new URLSearchParams();
  if (selections.metric !== DEFAULT_SELECTIONS.metric) {
    params.set(PARAM_KEYS.metric, selections.metric);
  }
  if (selections.spatialAggregation !== DEFAULT_SELECTIONS.spatialAggregation) {
    params.set(PARAM_KEYS.spatialAggregation, selections.spatialAggregation);
  }
  if (selections.location !== DEFAULT_SELECTIONS.location) {
    params.set(PARAM_KEYS.location, selections.location);
  }
  return params;
}
