import type { ReactNode } from "react";

/** Single source of tooltip/hint copy for all Typical Met Year labels. */
export const tooltipByLabel: Partial<Record<string, ReactNode>> = {
  Dataset: undefined,
  "Data format": "EnergyPlus Weather file (industry standard), tabular format (CSV).",
  "Boundary type": "Localized model data at a weather station.",
  "Time span": undefined,
  License: undefined,
  Location: "Weather stations in California.",
  GWLs: "Present day (1.2°C), Near future (1.5°C), Mid-century (2.0°C), Mid-late century (2.5°C).",
  Models: "Bias adjusted dynamically downscaled climate models (WRF).",
};
