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
    description: "Time of year when extreme heat tends to occur",
  },
  "heat-wave-frequency": {
    label: "Heat Wave Frequency",
    description: "Heat waves per year lasting at least a set number of days",
  },
  "heat-wave-length": {
    label: "Heat Wave Length",
    description: "Typical length of heat waves",
  },
  "extreme-precipitation": {
    label: "Extreme Precipitation",
    description: "Daily accumulation threshold for highest precipitation days",
  },
  "fire-weather": {
    label: "Fire Weather",
    description: "Annual count of days with fire weather potential",
  },
  "heating-degree-days": {
    label: "Heating Degree Days",
    description: "Heating demand metric measuring occurrence of temperatures below 65°F",
  },
  "cooling-degree-days": {
    label: "Cooling Degree Days",
    description: "Cooling demand metric measuring occurrence of temperatures above 65°F",
  },
  // Groups of variables that share a Data Methods page.
  "extreme-heat-days-and-warm-nights": {
    label: "Extreme Heat Days & Warm Nights",
    description: "Annual frequency of high daytime maximum and overnight low temperatures",
  },
  "heat-waves": {
    label: "Heat Waves",
    description: "Metrics for the frequency and length of heat waves",
  },
  "heating-and-cooling-degree-days": {
    label: "Heating & Cooling Degree Days",
    description: "Metrics that reflect heating and cooling energy demand",
  },
  "solar-and-wind-resource-droughts": {
    label: "Solar & Wind Resource Droughts",
    description: "Days of reduced solar and wind energy generation potential",
  },
} as const satisfies Record<string, ClimateVariable>;

export type ClimateVariableId = keyof typeof climateVariables;
