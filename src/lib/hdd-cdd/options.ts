// Domain data for the HDD/CDD tool.

import type { SelectOption } from "@/components/common/form";

/**
 * User-controlled inputs that drive the HDD/CDD tool.
 */
export interface HddCddSelections {
  /** "hdd" or "cdd" — which metric's mean/min/max columns to plot. Does not
   *  affect the STAC/CSV fetch: both metrics live in the same region CSV. */
  climateVariable: string;
  /** STAC `boundary` id, e.g. "ca_counties". */
  spatialAggregation: string;
  location: string;
}

export interface MetricConfig {
  /** `climateVariable` select value + URL `variable` param. */
  value: string;
  label: string;
  /** Dropdown label. */
  dropdownLabel: string;
  /** Chart y-axis label. */
  yAxisLabel: string;
  /** Noun used in accessible chart text and copy, e.g. "heating degree days". */
  accessibleNoun: string;
  /** Full name + threshold, e.g. "Heating Degree Days (65°F)". Used in the chart title. */
  longLabel: string;
  /** Chart line/envelope/legend color for this metric's scenario series. */
  color: string;
}

const HDD_METRIC: MetricConfig = {
  value: "hdd",
  label: "HDD",
  dropdownLabel: "Heating Degree Days",
  yAxisLabel: "Heating Degree Days (65°F)",
  accessibleNoun: "heating degree days",
  longLabel: "Heating Degree Days (65°F)",
  color: "#c0392b",
};

const CDD_METRIC: MetricConfig = {
  value: "cdd",
  label: "CDD",
  dropdownLabel: "Cooling Degree Days",
  yAxisLabel: "Cooling Degree Days (65°F)",
  accessibleNoun: "cooling degree days",
  longLabel: "Cooling Degree Days (65°F)",
  color: "#007dec",
};

/** Metric registry keyed by `climateVariable` value. Order drives dropdown order. */
export const METRICS: Readonly<Record<string, MetricConfig>> = {
  [CDD_METRIC.value]: CDD_METRIC,
  [HDD_METRIC.value]: HDD_METRIC,
};

// CDD is the confirmed default at first page load (per MVP requirements).
const DEFAULT_METRIC = CDD_METRIC;

export function getMetric(climateVariable: string): MetricConfig {
  return METRICS[climateVariable] ?? DEFAULT_METRIC;
}

export const CLIMATE_VARIABLE_OPTIONS: readonly SelectOption[] = Object.values(METRICS).map(
  (metric) => ({
    value: metric.value,
    label: metric.dropdownLabel,
  })
);

/** Scenario metadata for the (currently single) available SSP. */
export interface ScenarioConfig {
  value: string;
  label: string;
}

// Full UI scope includes SSP245/SSP370/SSP585; current data availability is
// SSP370-only, so this is the one scenario the chart renders today.
export const SSP370: ScenarioConfig = {
  value: "ssp370",
  label: "SSP3-7.0",
};

/**
 * All 58 California counties in alphabetical order.
 * Matches the `ca_counties` boundary mask shared with the extreme heat tool.
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

/** One STAC `boundary` type and its selectable regions. */
export interface SpatialAggregationConfig {
  /** STAC `boundary` id, e.g. "ca_counties". */
  value: string;
  label: string;
  description: string;
  /** Appended to `location` for chart titles and CSV filenames, e.g. " County". */
  regionSuffix: string;
  locations: readonly SelectOption[];
  defaultLocation: string;
}

const toLocationOptions = (names: readonly string[]): readonly SelectOption[] =>
  names.map((name) => ({ value: name, label: name }));

// Names match S3 filename tokens (underscores → spaces). Shared with the
// extreme heat tool's boundary masks (same WRF d03 grid, tool-agnostic).
const FORECAST_ZONE_NAMES: readonly string[] = [
  "Big Creek East",
  "Big Creek West",
  "Burbank Glendale",
  "Central Coast",
  "Central Valley",
  "Eastern",
  "Greater Bay Area",
  "Imperial Irrigation District",
  "LADWP Coastal",
  "LADWP Inland",
  "LA Metro",
  "North Coast",
  "North Valley",
  "Northeast",
  "Rest of BANC Control Area",
  "SDG&E",
  "SMUD Service Territory",
  "Southern Valley",
  "Turlock Irrigation District",
  "Valley Electric",
];

const ELECTRIC_BALANCING_AREA_NAMES: readonly string[] = [
  "BANC",
  "CALISO",
  "IID",
  "LADWP",
  "NV Energy",
  "PacificCorp West",
  "TID",
  "WALC",
];

// California HUC8 units (140 total)
const WATERSHED_NAMES: readonly string[] = [
  "Aliso-San Onofre",
  "Antelope-Fremont Valleys",
  "Applegate",
  "Battle Creek",
  "Big-Navarro-Garcia",
  "Big Chico Creek-Sacramento River",
  "Butte Creek",
  "Butte",
  "Calleguas",
  "Carrizo Creek",
  "Carrizo Plain",
  "Central Coastal",
  "Chetco",
  "Clear Creek-Sacramento River",
  "Cottonwood-Tijuana",
  "Cottonwood Creek",
  "Cow Creek",
  "Coyote-Cuddeback Lakes",
  "Coyote",
  "Crowley Lake",
  "Cuyama",
  "Death Valley-Lower Amargosa",
  "East Branch North Fork Feather",
  "East Walker",
  "Estrella",
  "Eureka-Saline Valleys",
  "Fish Lake-Soda Spring Valleys",
  "Fresno River",
  "Goose Lake",
  "Gualala-Salmon",
  "Havasu-Mohave Lakes",
  "Honcut Headwaters-Lower Feather",
  "Honey-Eagle Lakes",
  "Illinois",
  "Imperial Reservoir",
  "Indian Wells-Searles Valleys",
  "Ivanpah-Pahrump Valleys",
  "Lake Tahoe",
  "Los Angeles",
  "Lost",
  "Lower American",
  "Lower Colorado",
  "Lower Eel",
  "Lower Klamath",
  "Lower Pit",
  "Lower Sacramento",
  "Lower San Joaquin River",
  "Mad-Redwood",
  "Madeline Plains",
  "Massacre Lake",
  "Mattole",
  "McCloud",
  "Middle Fork Eel",
  "Middle Fork Feather",
  "Middle Kern-Upper Tehachapi-Grapevine",
  "Middle San Joaquin-Lower Chowchilla",
  "Mojave",
  "Mono Lake",
  "Monterey Bay",
  "Newport Bay",
  "North Fork American",
  "North Fork Feather",
  "Owens Lake",
  "Pajaro",
  "Panamint Valley",
  "Panoche-San Luis Reservoir",
  "Paynes Creek-Sacramento River",
  "Piute Wash",
  "Rock Creek-French Camp Slough",
  "Russian",
  "Sacramento-Stone Corral",
  "Sacramento Headwaters",
  "Salinas",
  "Salmon",
  "Salton Sea",
  "San Antonio",
  "San Diego",
  "San Felipe Creek",
  "San Francisco Bay",
  "San Francisco Coastal South",
  "San Gabriel",
  "San Jacinto",
  "San Joaquin Delta",
  "San Luis Rey-Escondido",
  "San Pablo Bay",
  "San Pedro Channel Islands",
  "Santa Ana",
  "Santa Barbara Channel Islands",
  "Santa Barbara Coastal",
  "Santa Clara",
  "Santa Margarita",
  "Santa Maria",
  "Santa Monica Bay",
  "Santa Ynez",
  "Scott",
  "Seal Beach",
  "Shasta",
  "Smith",
  "Smoke Creek Desert",
  "South Fork American",
  "South Fork Eel",
  "South Fork Kern",
  "South Fork Trinity",
  "Southern Mojave",
  "Suisun Bay",
  "Surprise Valley",
  "Thomes Creek-Sacramento River",
  "Tomales-Drake Bays",
  "Trinity",
  "Truckee",
  "Tulare Lake Bed",
  "Upper Amargosa",
  "Upper Bear",
  "Upper Cache",
  "Upper Calaveras California",
  "Upper Carson",
  "Upper Coon-Upper Auburn",
  "Upper Cosumnes",
  "Upper Deer-Upper White",
  "Upper Dry",
  "Upper Eel",
  "Upper Kaweah",
  "Upper Kern",
  "Upper King",
  "Upper Klamath",
  "Upper Merced",
  "Upper Mokelumne",
  "Upper Pit",
  "Upper Poso",
  "Upper Putah",
  "Upper San Joaquin",
  "Upper Stanislaus",
  "Upper Stony",
  "Upper Tule",
  "Upper Tuolumne",
  "Upper Yuba",
  "Ventura",
  "Warner Lakes",
  "West Walker",
  "Whitewater River",
];

const COUNTY_AGGREGATION: SpatialAggregationConfig = {
  value: "ca_counties",
  label: "County",
  description: "Local government administrative boundary",
  regionSuffix: " County",
  locations: COUNTY_OPTIONS,
  defaultLocation: "Sacramento",
};

const WATERSHEDS_AGGREGATION: SpatialAggregationConfig = {
  value: "ca_watersheds",
  label: "Watersheds",
  description: "Land area draining to a common water body",
  regionSuffix: "",
  locations: toLocationOptions(WATERSHED_NAMES),
  defaultLocation: "Lower Sacramento",
};

const FORECAST_ZONES_AGGREGATION: SpatialAggregationConfig = {
  value: "forecast_zones",
  label: "Electricity Forecast Zones",
  description: "Region used for electricity demand planning",
  regionSuffix: "",
  locations: toLocationOptions(FORECAST_ZONE_NAMES),
  defaultLocation: "Greater Bay Area",
};

const ELECTRIC_BALANCING_AGGREGATION: SpatialAggregationConfig = {
  value: "electric_balancing_areas",
  label: "Electric Balancing Areas",
  description: "Grid region managed by a single electricity operator",
  regionSuffix: "",
  locations: toLocationOptions(ELECTRIC_BALANCING_AREA_NAMES),
  defaultLocation: "CALISO",
};

/** Keyed by STAC `boundary`. Insertion order is the dropdown order. */
export const SPATIAL_AGGREGATIONS: Readonly<Record<string, SpatialAggregationConfig>> = {
  [COUNTY_AGGREGATION.value]: COUNTY_AGGREGATION,
  [WATERSHEDS_AGGREGATION.value]: WATERSHEDS_AGGREGATION,
  [FORECAST_ZONES_AGGREGATION.value]: FORECAST_ZONES_AGGREGATION,
  [ELECTRIC_BALANCING_AGGREGATION.value]: ELECTRIC_BALANCING_AGGREGATION,
};

const DEFAULT_AGGREGATION = COUNTY_AGGREGATION;

export function getSpatialAggregation(value: string): SpatialAggregationConfig {
  return SPATIAL_AGGREGATIONS[value] ?? DEFAULT_AGGREGATION;
}

export function locationOptionsFor(spatialAggregation: string): readonly SelectOption[] {
  return getSpatialAggregation(spatialAggregation).locations;
}

export function defaultLocationFor(spatialAggregation: string): string {
  return getSpatialAggregation(spatialAggregation).defaultLocation;
}

export function regionLabelFor(selections: HddCddSelections): string {
  return `${selections.location}${getSpatialAggregation(selections.spatialAggregation).regionSuffix}`;
}

export const SPATIAL_AGGREGATION_OPTIONS: readonly SelectOption[] = Object.values(
  SPATIAL_AGGREGATIONS
).map((aggregation) => ({
  value: aggregation.value,
  label: aggregation.label,
  description: aggregation.description,
}));

export const DEFAULT_SELECTIONS: HddCddSelections = {
  climateVariable: DEFAULT_METRIC.value,
  spatialAggregation: DEFAULT_AGGREGATION.value,
  location: DEFAULT_AGGREGATION.defaultLocation,
};
