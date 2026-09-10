// Domain data for the Extreme Heat tool.

import type { SelectOption } from "@/components/common/form";

/**
 * User-controlled inputs that drive the Extreme Heat tool.
 */
export interface ExtremeHeatDaysSelections {
  climateVariable: string;
  threshold: string;
  indicator: string;
  /** STAC `boundary` id, e.g. "ca_counties". */
  spatialAggregation: string;
  location: string;
}

/** STAC `variable_id`s supported by the `eh-metrics-mm-boundary-csv` collection. */
export type HeatVariableId = "eh_days" | "warm_nights";

/**
 * Per-metric configuration. The tool hosts multiple structurally-identical
 * climate variables (Extreme Heat Days, Warm Nights) that differ only in the
 * temperature statistic (`t2max` vs `t2min`), threshold set, and copy. Every
 * metric-specific value flows from this registry rather than being branched on
 * `climateVariable` throughout the app.
 */
export interface HeatMetricConfig {
  /** `climateVariable` select value + URL `variable` param. */
  value: string;
  /** STAC `variable_id`. */
  variableId: HeatVariableId;
  /** Dropdown + tool-copy label, e.g. "Warm Nights". */
  label: string;
  /** Temperature statistic used to build the STAC `threshold_name`. */
  tempStat: "t2max" | "t2min";
  /** Default absolute threshold token for this metric, e.g. "100F". */
  defaultThreshold: string;
  /** Chart y-axis label. */
  yAxisLabel: string;
  /** Metric label used inside the chart title, e.g. "Warm Nights". */
  titleLabel: string;
  /** Noun used in accessible chart text, e.g. "warm nights". */
  accessibleNoun: string;
  /** Unit shown on bar tooltips/values, e.g. "nights". */
  valueUnit: string;
  /** Threshold control tooltip (min- vs max-temp phrasing). */
  thresholdTooltip: string;
  /** PNG export filename prefix. */
  exportFilenamePrefix: string;
}

const EXTREME_HEAT_DAYS_METRIC: HeatMetricConfig = {
  value: "extreme-heat-days",
  variableId: "eh_days",
  label: "Extreme Heat Days",
  tempStat: "t2max",
  defaultThreshold: "100F",
  yAxisLabel: "Number of Extreme Heat Days per Year",
  titleLabel: "Extreme Heat",
  accessibleNoun: "extreme heat days",
  valueUnit: "days",
  thresholdTooltip: "The maximum temperature threshold used to determine an extreme heat day.",
  exportFilenamePrefix: "extreme-heat-days",
};

const WARM_NIGHTS_METRIC: HeatMetricConfig = {
  value: "warm-nights",
  variableId: "warm_nights",
  label: "Warm Nights",
  tempStat: "t2min",
  defaultThreshold: "70F",
  yAxisLabel: "Number of Warm Nights per Year",
  titleLabel: "Warm Nights",
  accessibleNoun: "warm nights",
  valueUnit: "nights",
  thresholdTooltip: "The minimum overnight temperature threshold used to determine a warm night.",
  exportFilenamePrefix: "warm-nights",
};

/** Metric registry keyed by `climateVariable` value. Order drives dropdown order. */
export const HEAT_METRICS: Readonly<Record<string, HeatMetricConfig>> = {
  [EXTREME_HEAT_DAYS_METRIC.value]: EXTREME_HEAT_DAYS_METRIC,
  [WARM_NIGHTS_METRIC.value]: WARM_NIGHTS_METRIC,
};

const DEFAULT_METRIC = EXTREME_HEAT_DAYS_METRIC;

/** Resolve a metric config, falling back to the default metric for unknown values. */
export function getHeatMetric(climateVariable: string): HeatMetricConfig {
  return HEAT_METRICS[climateVariable] ?? DEFAULT_METRIC;
}

export type ThresholdKind = "absolute" | "relative";

export const THRESHOLD_KIND_OPTIONS: readonly SelectOption[] = [
  { value: "absolute", label: "Absolute" },
  { value: "relative", label: "Relative" },
];

export const ABSOLUTE_THRESHOLD_MIN_F = 50;
export const ABSOLUTE_THRESHOLD_MAX_F = 135;
export const RELATIVE_THRESHOLD_MIN_PCTL = 75;
export const RELATIVE_THRESHOLD_MAX_PCTL = 99;

const DEFAULT_RELATIVE_THRESHOLD = "98pctl";

export function thresholdKindFor(threshold: string): ThresholdKind {
  return threshold.endsWith("pctl") ? "relative" : "absolute";
}

export function thresholdRangeFor(kind: ThresholdKind): { min: number; max: number } {
  switch (kind) {
    case "absolute":
      return { min: ABSOLUTE_THRESHOLD_MIN_F, max: ABSOLUTE_THRESHOLD_MAX_F };
    case "relative":
      return { min: RELATIVE_THRESHOLD_MIN_PCTL, max: RELATIVE_THRESHOLD_MAX_PCTL };
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

export function parseThresholdNumber(threshold: string): number | null {
  const match = /^(?<n>\d+)(?<unit>F|pctl)$/.exec(threshold);
  if (!match?.groups) return null;
  return Number(match.groups.n);
}

export function thresholdTokenFor(kind: ThresholdKind, value: number): string {
  const rounded = Math.round(value);
  switch (kind) {
    case "absolute":
      return `${rounded}F`;
    case "relative":
      return `${rounded}pctl`;
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

export function isAllowedThreshold(threshold: string): boolean {
  const kind: ThresholdKind | null = threshold.endsWith("pctl")
    ? "relative"
    : threshold.endsWith("F")
      ? "absolute"
      : null;
  if (kind == null) return false;
  const n = parseThresholdNumber(threshold);
  if (n == null) return false;
  const { min, max } = thresholdRangeFor(kind);
  if (n < min || n > max) return false;
  return thresholdTokenFor(kind, n) === threshold;
}

export function defaultThresholdFor(climateVariable: string): string {
  return getHeatMetric(climateVariable).defaultThreshold;
}

export function defaultThresholdForKind(climateVariable: string, kind: ThresholdKind): string {
  switch (kind) {
    case "absolute":
      return defaultThresholdFor(climateVariable);
    case "relative":
      return DEFAULT_RELATIVE_THRESHOLD;
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

export const CLIMATE_VARIABLE_OPTIONS: readonly SelectOption[] = Object.values(HEAT_METRICS).map(
  (metric) => ({ value: metric.value, label: metric.label })
);

export const COMING_SOON_CLIMATE_VARIABLE_OPTIONS: readonly SelectOption[] = [
  { value: "heat-waves", label: "Heat Waves", disabled: true, hint: "Coming soon" },
];

/** All climate-variable options for the dropdown: selectable metrics followed by
 *  coming soon options. */
export const CLIMATE_VARIABLE_SELECT_OPTIONS: readonly SelectOption[] = [
  ...CLIMATE_VARIABLE_OPTIONS,
  ...COMING_SOON_CLIMATE_VARIABLE_OPTIONS,
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

// Names match S3 filename tokens (underscores → spaces).
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

// California HUC8 units in the eh-metrics `ca_watersheds` boundary (140 total)
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

export function regionLabelFor(selections: ExtremeHeatDaysSelections): string {
  return `${selections.location}${getSpatialAggregation(selections.spatialAggregation).regionSuffix}`;
}

export const SPATIAL_AGGREGATION_OPTIONS: readonly SelectOption[] = Object.values(
  SPATIAL_AGGREGATIONS
).map((aggregation) => ({
  value: aggregation.value,
  label: aggregation.label,
  description: aggregation.description,
}));

export const DEFAULT_SELECTIONS: ExtremeHeatDaysSelections = {
  climateVariable: DEFAULT_METRIC.value,
  threshold: DEFAULT_METRIC.defaultThreshold,
  indicator: "frequency",
  spatialAggregation: DEFAULT_AGGREGATION.value,
  location: DEFAULT_AGGREGATION.defaultLocation,
};
