import type { ReactNode } from "react";

export const tooltipByLabel: Partial<Record<string, ReactNode>> = {
  Dataset: undefined,
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
    "How extreme the profile is. At the 90th, each hour is hotter than in 9 of 10 years. At the 10th, colder.",
};
