// Domain data for the Extreme Heat Days tool.

import type { SelectOption } from "@/components/common/form";

/**
 * User-controlled inputs that drive the Extreme Heat Days tool.
 */
export interface ExtremeHeatDaysSelections {
  climateVariable: string;
  threshold: string;
  indicator: string;
  county: string;
}

export const CLIMATE_VARIABLE_OPTIONS: readonly SelectOption[] = [
  { value: "extreme-heat-days", label: "Extreme Heat Days" },
];

/**
 * The data layer maps each threshold value to the corresponding STAC variable id
 * (`t2max_ge100F`, `t2max_ge105F`) when we wire selections to fetches.
 */
export const THRESHOLD_OPTIONS: readonly SelectOption[] = [
  { value: "100F", label: "100°F" },
  { value: "105F", label: "105°F" },
];

export const INDICATOR_OPTIONS: readonly SelectOption[] = [
  { value: "frequency", label: "Frequency" },
];

/**
 * All 58 California counties in alphabetical order.
 */
const CALIFORNIA_COUNTY_NAMES: readonly string[] = [
  "Alameda",
  "Alpine",
  "Amador",
  "Butte",
  "Calaveras",
  "Colusa",
  "Contra Costa",
  "Del Norte",
  "El Dorado",
  "Fresno",
  "Glenn",
  "Humboldt",
  "Imperial",
  "Inyo",
  "Kern",
  "Kings",
  "Lake",
  "Lassen",
  "Los Angeles",
  "Madera",
  "Marin",
  "Mariposa",
  "Mendocino",
  "Merced",
  "Modoc",
  "Mono",
  "Monterey",
  "Napa",
  "Nevada",
  "Orange",
  "Placer",
  "Plumas",
  "Riverside",
  "Sacramento",
  "San Benito",
  "San Bernardino",
  "San Diego",
  "San Francisco",
  "San Joaquin",
  "San Luis Obispo",
  "San Mateo",
  "Santa Barbara",
  "Santa Clara",
  "Santa Cruz",
  "Shasta",
  "Sierra",
  "Siskiyou",
  "Solano",
  "Sonoma",
  "Stanislaus",
  "Sutter",
  "Tehama",
  "Trinity",
  "Tulare",
  "Tuolumne",
  "Ventura",
  "Yolo",
  "Yuba",
];

export const COUNTY_OPTIONS: readonly SelectOption[] = CALIFORNIA_COUNTY_NAMES.map((name) => ({
  value: name,
  label: name,
}));

export const DEFAULT_SELECTIONS: ExtremeHeatDaysSelections = {
  climateVariable: "extreme-heat-days",
  threshold: "100F",
  indicator: "frequency",
  county: "Sacramento",
};
