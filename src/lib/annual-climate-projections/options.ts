// Domain data for the Annual Climate Projections tool.

import type { SelectOption } from "@/components/common/form";
import { DEFAULT_SPATIAL_AGGREGATION, defaultLocationFor } from "@/lib/spatial-aggregations";

/** Dynamical (WRF) or statistical (LOCA2-Hybrid) downscaling. */
export type Ensemble = "wrf" | "loca2";

/**
 * User-controlled inputs that drive the tool. `ensemble` and `scenario` are
 * only shown in the advanced view.
 */
export interface AnnualClimateProjectionsSelections {
  /** Variable key, e.g. "max-temperature". Maps to a per-ensemble variable id. */
  climateVariable: string;
  /** STAC `boundary` id, e.g. "ca_counties". */
  spatialAggregation: string;
  location: string;
  ensemble: Ensemble;
  /** SSP id, e.g. "ssp370". */
  scenario: string;
}

export interface VariableConfig {
  /** `climateVariable` select value + URL `variable` param. */
  value: string;
  /** Dropdown label. */
  label: string;
  /** Start of the chart title, e.g. "Annual average maximum temperature". */
  titleLabel: string;
  /** Chart y-axis label. */
  yAxisLabel: string;
  /** Unit suffix for tooltip values. */
  unit: string;
  /** Data variable id for each ensemble; missing when the ensemble lacks it. */
  variableIds: Partial<Record<Ensemble, string>>;
}

/** Variable registry keyed by `climateVariable` value. Order drives dropdown order. */
export const VARIABLES: Readonly<Record<string, VariableConfig>> = {
  "max-temperature": {
    value: "max-temperature",
    label: "Maximum temperature",
    titleLabel: "Annual average maximum temperature",
    yAxisLabel: "Temperature (°F)",
    unit: "°F",
    variableIds: { wrf: "t2max", loca2: "tasmax" },
  },
  "min-temperature": {
    value: "min-temperature",
    label: "Minimum temperature",
    titleLabel: "Annual average minimum temperature",
    yAxisLabel: "Temperature (°F)",
    unit: "°F",
    variableIds: { wrf: "t2min", loca2: "tasmin" },
  },
  temperature: {
    value: "temperature",
    label: "Air temperature",
    titleLabel: "Annual average air temperature",
    yAxisLabel: "Temperature (°F)",
    unit: "°F",
    variableIds: { wrf: "t2" },
  },
  "dew-point": {
    value: "dew-point",
    label: "Dew point temperature",
    titleLabel: "Annual average dew point temperature",
    yAxisLabel: "Temperature (°F)",
    unit: "°F",
    variableIds: { wrf: "dew_point" },
  },
  precipitation: {
    value: "precipitation",
    label: "Precipitation",
    titleLabel: "Total annual precipitation",
    yAxisLabel: "Precipitation (in)",
    unit: "in",
    variableIds: { wrf: "prec", loca2: "pr" },
  },
};

const DEFAULT_VARIABLE = VARIABLES["max-temperature"];

export function getVariable(climateVariable: string): VariableConfig {
  return VARIABLES[climateVariable] ?? DEFAULT_VARIABLE;
}

/** Variables available for an ensemble, in dropdown order. */
export function variableOptionsFor(ensemble: Ensemble): readonly SelectOption[] {
  return Object.values(VARIABLES)
    .filter((variable) => variable.variableIds[ensemble] != null)
    .map((variable) => ({ value: variable.value, label: variable.label }));
}

/** Data variable id (e.g. "t2max") for the current selections. */
export function variableIdFor(selections: AnnualClimateProjectionsSelections): string {
  const variable = getVariable(selections.climateVariable);
  return variable.variableIds[selections.ensemble] ?? "t2max";
}

export interface ScenarioConfig {
  value: string;
  label: string;
}

const SSP245: ScenarioConfig = { value: "ssp245", label: "SSP2-4.5" };
const SSP370: ScenarioConfig = { value: "ssp370", label: "SSP3-7.0" };
const SSP585: ScenarioConfig = { value: "ssp585", label: "SSP5-8.5" };

export interface EnsembleConfig {
  value: Ensemble;
  label: string;
  /** Dataset name shown under the label in the dropdown. */
  description: string;
  /** Scenarios available for this ensemble. WRF only has SSP3-7.0. */
  scenarios: readonly ScenarioConfig[];
  /** True when an observed (ERA5) series exists for this ensemble. */
  hasObserved: boolean;
}

export const ENSEMBLES: Readonly<Record<Ensemble, EnsembleConfig>> = {
  wrf: {
    value: "wrf",
    label: "Dynamically Downscaled",
    description: "CMIP6 models downscaled using WRF",
    scenarios: [SSP370],
    hasObserved: true,
  },
  loca2: {
    value: "loca2",
    label: "Statistically Downscaled",
    description: "CMIP6 models downscaled using LOCA2-Hybrid",
    scenarios: [SSP245, SSP370, SSP585],
    hasObserved: false,
  },
};

export const ENSEMBLE_OPTIONS: readonly SelectOption[] = Object.values(ENSEMBLES).map(
  (ensemble) => ({
    value: ensemble.value,
    label: ensemble.label,
    description: ensemble.description,
  })
);

export function isEnsemble(value: string): value is Ensemble {
  return Object.hasOwn(ENSEMBLES, value);
}

export function scenarioOptionsFor(ensemble: Ensemble): readonly SelectOption[] {
  return ENSEMBLES[ensemble].scenarios.map((scenario) => ({
    value: scenario.value,
    label: scenario.label,
  }));
}

export function getScenario(ensemble: Ensemble, scenario: string): ScenarioConfig {
  const scenarios = ENSEMBLES[ensemble].scenarios;
  return scenarios.find((s) => s.value === scenario) ?? SSP370;
}

export {
  locationOptionsFor,
  regionLabelFor,
  SPATIAL_AGGREGATION_OPTIONS,
} from "@/lib/spatial-aggregations";

export const DEFAULT_SELECTIONS: AnnualClimateProjectionsSelections = {
  climateVariable: DEFAULT_VARIABLE.value,
  spatialAggregation: DEFAULT_SPATIAL_AGGREGATION.value,
  location: "Alameda",
  ensemble: "wrf",
  scenario: SSP370.value,
};

/** Default location for a boundary type. Counties default to Alameda in this tool. */
export function toolDefaultLocationFor(spatialAggregation: string): string {
  return spatialAggregation === DEFAULT_SELECTIONS.spatialAggregation
    ? DEFAULT_SELECTIONS.location
    : defaultLocationFor(spatialAggregation);
}

/**
 * Selections after switching ensemble: keeps the variable when the new
 * ensemble has it, and falls back to a scenario the new ensemble offers.
 */
export function withEnsemble(
  selections: AnnualClimateProjectionsSelections,
  ensemble: Ensemble
): AnnualClimateProjectionsSelections {
  const variable = getVariable(selections.climateVariable);
  const climateVariable =
    variable.variableIds[ensemble] != null ? variable.value : DEFAULT_VARIABLE.value;
  const scenario = getScenario(ensemble, selections.scenario).value;
  return { ...selections, ensemble, climateVariable, scenario };
}
