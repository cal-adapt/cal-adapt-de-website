import type { ReactNode } from "react";

export const tooltipByLabel: Partial<Record<string, ReactNode>> = {
  Dataset:
    "One year of hourly data representing weather conditions at a desired statistical percentile over a climatological period",
  "Data format": "Tabular format (CSV)",
  "Boundary type": "Localized model data at a weather station",
  "Time span": undefined,
  License: undefined,
  DOI: "Digital Object Identifier for citing the source dataset",
  Locations: "Weather stations in California",
  "Computation approach":
    "How the results are computed: via a global warming levels approach or a fixed time period",
  "Global Warming Levels":
    "Global mean temperature increase relative to the 1850-1900 pre-industrial baseline",
  Years: "The 30-year historical or future period used to calculate the standard year",
  Variables: "Climate variables to include in export",
  Percentiles:
    "Indicates where the profile falls within the range of model simulations at each global warming level",
};
