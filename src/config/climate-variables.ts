interface ClimateVariable {
  /** Display name, e.g. "Warm Nights". */
  label: string;
  /** One-line summary of what the variable measures. */
  description: string;
}

/**
 * Name and description of each climate variable, shared by the tool dropdowns,
 * the Climate Metrics Map, and the Data Methods pages.
 */
export const climateVariables = {
  "extreme-heat-days": {
    label: "Extreme Heat Days",
    description: "Days per year above a daytime high temperature threshold",
  },
  "warm-nights": {
    label: "Warm Nights",
    description: "Nights per year above an overnight low temperature threshold",
  },
  "extreme-heat-season": {
    label: "Extreme Heat Season",
    description: "When in the year hot days tend to occur",
  },
  "heat-wave-frequency": {
    label: "Heat Wave Frequency",
    description: "Heat waves per year lasting at least a set number of days",
  },
  "heat-wave-length": {
    label: "Heat Wave Length",
    description: "How long heat waves typically last",
  },
  "extreme-precipitation": {
    label: "Extreme Precipitation",
    description: "How much rain falls on really heavy rain days",
  },
  "fire-weather": {
    label: "Fire Weather",
    description: "Days per year when the weather is conducive to wildfires",
  },
  "heating-degree-days": {
    label: "Heating Degree Days",
    description: "How much and how long temperatures fall below 65°F, reflecting heating demand",
  },
  "cooling-degree-days": {
    label: "Cooling Degree Days",
    description: "How much and how long temperatures exceed 65°F, reflecting cooling demand",
  },
  // Groups of variables that share a Data Methods page.
  "extreme-heat-days-and-warm-nights": {
    label: "Extreme Heat Days & Warm Nights",
    description:
      "Days per year above a daytime high, or nights per year above an overnight low, temperature threshold",
  },
  "heat-waves": {
    label: "Heat Waves",
    description:
      "Heat wave frequency and heat wave length: how often heat waves occur and how long they last",
  },
  "heating-and-cooling-degree-days": {
    label: "Heating & Cooling Degree Days",
    description:
      "How much and for how long daily average temperatures fall below or exceed 65 °F, reflecting demand for indoor heating and cooling",
  },
  "solar-and-wind-resource-droughts": {
    label: "Solar & Wind Resource Droughts",
    description:
      "Days per month when solar or wind generation potential falls below half of its historical average for that day of the year",
  },
} as const satisfies Record<string, ClimateVariable>;

export type ClimateVariableId = keyof typeof climateVariables;
