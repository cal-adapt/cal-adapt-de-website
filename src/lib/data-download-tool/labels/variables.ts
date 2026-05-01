/** Human-readable labels for variables; prefer API-provided `variable_label` when available. */
const VARIABLE_LABELS: Readonly<Record<string, string>> = {
  hursmax: "Maximum relative humidity",
  hursmin: "Minimum relative humidity",
  huss: "Specific humidity at 2m",
  noaa_heat_index_derived: "NOAA Heat Index",
  pr: "Precipitation (total)",
  rh_derived: "Relative humidity",
  rsds: "Shortwave flux at the surface",
  swdnb: "Instantaneous downwelling shortwave flux at bottom",
  t2: "Air Temperature at 2m",
  tasmax: "Maximum air temperature at 2m",
  tasmin: "Minimum air temperature at 2m",
  wind_speed_derived: "Wind speed at 10m",
};

export function labelVariable(id: string): string {
  return VARIABLE_LABELS[id] ?? id;
}
