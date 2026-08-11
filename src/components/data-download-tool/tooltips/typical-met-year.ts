import type { ReactNode } from "react";

export const tooltipByLabel: Partial<Record<string, ReactNode>> = {
  Dataset: undefined,
  "Data format": "EnergyPlus Weather file (industry standard), tabular format (CSV)",
  "Boundary type": "Localized model data at a weather station",
  "Time span": undefined,
  License: undefined,
  DOI: "Digital Object Identifier for citing the source dataset",
  Locations: "Weather stations in California",
  "Data source":
    "The underlying data type used: climate reanalysis data from historical observations, or model projections of the future climate under different global warming levels",
  "Global Warming Levels":
    "Global mean temperature increase relative to the 1850-1900 pre-industrial baseline",
  Models: "Bias-adjusted, dynamically downscaled (WRF) climate simulations",
};
