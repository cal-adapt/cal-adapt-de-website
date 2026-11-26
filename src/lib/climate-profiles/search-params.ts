import { type ReadableSearchParams, readEnumParam } from "@/utils/search-params";

import {
  type ClimateProfilesSelections,
  COLD_PERCENTILE_OPTIONS,
  DEFAULT_SELECTIONS,
  HOT_PERCENTILE_OPTIONS,
  MODEL_OPTIONS,
  PERIOD_OPTIONS,
  VARIABLE_OPTIONS,
  type VariableId,
  XMY_OPTIONS,
} from "./options";
import { isStationId } from "./stations";

const PARAM_KEYS = {
  station: "station",
  xmy: "compare",
  hotPercentile: "hot",
  coldPercentile: "cold",
  period: "period",
  model: "model",
  variable: "variable",
} as const satisfies Record<keyof ClimateProfilesSelections, string>;

const values = <T extends string>(options: readonly { value: T }[]) => options.map((o) => o.value);

export function selectionsFromSearchParams(
  params: ReadableSearchParams
): ClimateProfilesSelections {
  const rawStation = params.get(PARAM_KEYS.station);
  const read = <T extends string>(
    key: keyof ClimateProfilesSelections,
    options: readonly { value: T }[]
  ) => readEnumParam(params, PARAM_KEYS[key], values(options), DEFAULT_SELECTIONS[key] as T);

  return {
    station: rawStation && isStationId(rawStation) ? rawStation : DEFAULT_SELECTIONS.station,
    xmy: read("xmy", XMY_OPTIONS),
    hotPercentile: read("hotPercentile", HOT_PERCENTILE_OPTIONS),
    coldPercentile: read("coldPercentile", COLD_PERCENTILE_OPTIONS),
    period: read("period", PERIOD_OPTIONS),
    model: read("model", MODEL_OPTIONS),
    variable: read("variable", VARIABLE_OPTIONS as readonly { value: VariableId }[]),
  };
}

/** Only non-default values go in the URL. */
export function selectionsToSearchParams(selections: ClimateProfilesSelections): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of Object.keys(PARAM_KEYS) as (keyof ClimateProfilesSelections)[]) {
    if (selections[key] !== DEFAULT_SELECTIONS[key]) params.set(PARAM_KEYS[key], selections[key]);
  }
  return params;
}
