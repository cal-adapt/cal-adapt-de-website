// Region names match the S3 CSV filename tokens, with underscores as spaces.

import type { SelectOption } from "@/components/common/form";

export interface RegionSelections {
  /** STAC `boundary` id, e.g. "ca_counties". */
  spatialAggregation: string;
  location: string;
}

/** All 58 California counties in alphabetical order (`ca_counties` boundary). */
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
  /** True for area-weighted boundaries (census tracts, IOU/POUs). The extreme heat
   *  tool's CSVs for them are named `{Region}.csv`, without the threshold and
   *  duration suffix, and a region can be missing when a metric is undefined there. */
  areaWeighted?: boolean;
}

const toLocationOptions = (names: readonly string[]): readonly SelectOption[] =>
  names.map((name) => ({ value: name, label: name }));

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

// Investor-owned and publicly owned electric utilities (IOU/POUs), as named in
// the area-weighted CSVs
const IOU_POU_NAMES: readonly string[] = [
  "Alameda Power & Telecom",
  "Azusa Light & Power",
  "Bear Valley Electric Service",
  "Biggs Municipal Utilities",
  "Burbank Water & Power",
  "City and County of San Francisco - Hetch Hetchy Water and Power",
  "City of Anaheim Public Utilities Department",
  "City of Banning Electric Department",
  "City of Cerritos",
  "City of Corona Department of Water & Power",
  "City of Healdsburg Electric Department",
  "City of Industry",
  "City of Lompoc Electric Division",
  "City of Needles",
  "City of Palo Alto",
  "City of Pittsburg",
  "City of Riverside",
  "City of Shasta Lake",
  "City of Ukiah Electric Utilities Division",
  "City of Vernon Municipal Light Department",
  "Colton Electric Utility Department",
  "Eastside Power Authority",
  "Glendale Water & Power",
  "Gridley Electric Utility",
  "Imperial Irrigation District",
  "Kirkwood Meadows Public Utility District",
  "Lassen Municipal Utility District",
  "Lathrop Irrigation District",
  "Liberty Utilities",
  "Lodi Electric Utility",
  "Los Angeles Department of Water & Power",
  "Merced Irrigation District",
  "Modesto Irrigation District",
  "Moreno Valley Utility",
  "Pacific Gas & Electric Company",
  "PacifiCorp",
  "Pasadena Water & Power",
  "Port of Oakland",
  "Port of Stockton",
  "Power and Water Resource Pooling Authority",
  "Rancho Cucamonga Municipal Utility",
  "Redding Electric Utility",
  "Roseville Electric",
  "Sacramento Municipal Utility District",
  "San Diego Gas & Electric",
  "Shelter Cove Resort Improvement District",
  "Silicon Valley Power",
  "Southern California Edison",
  "Trinity Public Utilities District",
  "Truckee Donner Public Utilities District",
  "Turlock Irrigation District",
  "Victorville Municipal Utilities Services",
];

const IOU_POU_AGGREGATION: SpatialAggregationConfig = {
  value: "ious_pous",
  label: "Electric Utilities",
  description: "Service area of an investor-owned or publicly owned electric utility",
  regionSuffix: "",
  locations: toLocationOptions(IOU_POU_NAMES),
  defaultLocation: "Pacific Gas & Electric Company",
  areaWeighted: true,
};

/** Keyed by STAC `boundary`. Insertion order is the dropdown order. */
export const SPATIAL_AGGREGATIONS: Readonly<Record<string, SpatialAggregationConfig>> = {
  [COUNTY_AGGREGATION.value]: COUNTY_AGGREGATION,
  [WATERSHEDS_AGGREGATION.value]: WATERSHEDS_AGGREGATION,
  [FORECAST_ZONES_AGGREGATION.value]: FORECAST_ZONES_AGGREGATION,
  [ELECTRIC_BALANCING_AGGREGATION.value]: ELECTRIC_BALANCING_AGGREGATION,
  [IOU_POU_AGGREGATION.value]: IOU_POU_AGGREGATION,
};

export const DEFAULT_SPATIAL_AGGREGATION = COUNTY_AGGREGATION;

export function getSpatialAggregation(value: string): SpatialAggregationConfig {
  return SPATIAL_AGGREGATIONS[value] ?? DEFAULT_SPATIAL_AGGREGATION;
}

export function locationOptionsFor(spatialAggregation: string): readonly SelectOption[] {
  return getSpatialAggregation(spatialAggregation).locations;
}

export function defaultLocationFor(spatialAggregation: string): string {
  return getSpatialAggregation(spatialAggregation).defaultLocation;
}

export function isKnownSpatialAggregation(value: string): boolean {
  return Object.hasOwn(SPATIAL_AGGREGATIONS, value);
}

export function isKnownLocation(spatialAggregation: string, location: string): boolean {
  return locationOptionsFor(spatialAggregation).some((option) => option.value === location);
}

/** Region name as it appears in chart titles and CSV filenames, e.g. "Sacramento County". */
export function regionLabelFor(selections: RegionSelections): string {
  return `${selections.location}${getSpatialAggregation(selections.spatialAggregation).regionSuffix}`;
}

export const SPATIAL_AGGREGATION_OPTIONS: readonly SelectOption[] = Object.values(
  SPATIAL_AGGREGATIONS
).map((aggregation) => ({
  value: aggregation.value,
  label: aggregation.label,
  description: aggregation.description,
}));
