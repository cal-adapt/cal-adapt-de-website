import type { ReactNode } from "react";

export const tooltipByLabel: Partial<Record<string, ReactNode>> = {
  Dataset: "TODO",
  "Data format": "EnergyPlus Weather file (industry standard), tabular format (CSV)",
  "Boundary type": "Localized model data at a weather station",
  "Time span": undefined,
  License: undefined,
  DOI: "Digital Object Identifier for citing the source dataset",
  Locations: "Weather stations in California",
  "Global Warming Levels":
    "Global mean temperature increase relative to the 1850-1900 pre-industrial baseline",
  Models: "Bias-adjusted, dynamically downscaled (WRF) climate simulations",
  Percentiles:
    "Indicates where the profile falls within the range of model simulations at each global warming level",
};
