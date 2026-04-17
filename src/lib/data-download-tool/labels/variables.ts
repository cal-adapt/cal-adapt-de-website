/**
 * Fallback lookup table for variables used in the app.
 * Prefer API-provided `variable_label` when available.
 */
export const VARIABLE_LABELS: Readonly<Record<string, string>> = {
  // LOCA2 county
  tasmax: "Maximum air temperature at 2m",
  tasmin: "Minimum air temperature at 2m",
  pr: "Precipitation (total)",
  huss: "Specific humidity at 2m",
  rsds: "Shortwave flux at the surface",
  hursmax: "Maximum relative humidity",
  hursmin: "Minimum relative humidity",
  // Standard year
  t2: "Air Temperature at 2m",
  swdnb: "Instantaneous downwelling shortwave flux at bottom",
  noaa_heat_index_derived: "NOAA Heat Index",
  rh_derived: "Relative humidity",
  wind_speed_derived: "Wind speed at 10m",
};

export function labelVariable(id: string): string {
  return VARIABLE_LABELS[id] ?? id;
}
