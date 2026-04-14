/** Human-readable labels for CMIP6 variable ids (`cmip6:variable_id`). */
export const CMIP6_VARIABLE_LABELS: Record<string, string> = {
  pr: "Precipitation",
  tasmax: "Max air temperature",
  tasmin: "Min air temperature",
  huss: "Specific humidity at 2m",
  rsds: "Shortwave flux at the surface",
  wspeed: "Wind speed at 10m",
  hursmax: "Max relative humidity",
  hursmin: "Min relative humidity",
};

/** Human-readable labels for CMIP6 experiment ids (`cmip6:experiment_id`). */
export const CMIP6_SCENARIO_LABELS: Record<string, string> = {
  historical: "Historical",
  ssp245: "SSP2-4.5",
  ssp370: "SSP3-7.0",
  ssp585: "SSP5-8.5",
};

export function labelCmip6Variable(id: string): string {
  return CMIP6_VARIABLE_LABELS[id] ?? id;
}

export function labelCmip6Scenario(id: string): string {
  return CMIP6_SCENARIO_LABELS[id] ?? id;
}
