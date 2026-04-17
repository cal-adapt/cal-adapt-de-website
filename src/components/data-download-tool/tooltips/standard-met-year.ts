import type { ReactNode } from "react";

/** Single source of tooltip/hint copy for all Standard Met Year labels. */
export const tooltipByLabel: Partial<Record<string, ReactNode>> = {
  Dataset:
    "One year of hourly data representing weather conditions at a desired statistical percentile over a climatological period.",
  "Data format": "Tabular format (CSV).",
  "Boundary type": "Localized model data at a weather station.",
  "Time span": undefined,
  License: undefined,
  Location: "Weather stations in California.",
  GWLs: "Present day (1.2°C), Near future (1.5°C), Mid-century (2.0°C), Mid-late century (2.5°C).",
  Variables: "Climate variables to include in export.",
  Percentiles: "Standard Years are available for median and extreme percentiles.",
};
