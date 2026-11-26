import type { SelectOption } from "@/components/common/form";

export type ProfileId = "tmy" | "hot-shock" | "cold-shock" | "hot-persistence" | "cold-persistence";

export interface ProfileConfig {
  value: ProfileId;
  label: string;
  description: string;
  /** STAC collection. */
  collection: string;
  /** STAC `shock_type` for the shock XMYs. */
  shockType?: string;
  /** Which percentile selection a persistence XMY uses. */
  percentileKey?: "hotPercentile" | "coldPercentile";
}

/**
 * Climate profiles the chart can show, in drawing order (TMY first, so the
 * XMYs sit on top). Shock XMYs pick the months furthest from climatology;
 * persistence XMYs take a percentile hour by hour (hot above the median,
 * cold below).
 */
export const PROFILES: readonly ProfileConfig[] = [
  {
    value: "tmy",
    label: "TMY",
    description: "Typical weather for every hour of a year.",
    collection: "typical-met-year",
  },
  {
    value: "hot-shock",
    label: "Hot shock XMY",
    description: "A year built around a short, intense heat wave.",
    collection: "xmy-shock",
    shockType: "hot",
  },
  {
    value: "cold-shock",
    label: "Cold shock XMY",
    description: "A year built around a short, intense cold snap.",
    collection: "xmy-shock",
    shockType: "cold",
  },
  {
    value: "hot-persistence",
    label: "Hot persistence XMY",
    description: "A year with sustained hotter-than-normal conditions.",
    collection: "xmy-persist",
    percentileKey: "hotPercentile",
  },
  {
    value: "cold-persistence",
    label: "Cold persistence XMY",
    description: "A year with sustained colder-than-normal conditions.",
    collection: "xmy-persist",
    percentileKey: "coldPercentile",
  },
];

export const PROFILE_IDS: readonly ProfileId[] = PROFILES.map((p) => p.value);

export type XmyId = Exclude<ProfileId, "tmy">;

/** The extreme profiles, one of which is drawn over the TMY. */
export const XMY_PROFILES = PROFILES.filter(
  (p): p is ProfileConfig & { value: XmyId } => p.value !== "tmy"
);

export const XMY_OPTIONS = XMY_PROFILES.map(({ value, label, description }) => ({
  value,
  label,
  description,
}));

export function getProfile(id: ProfileId): ProfileConfig {
  return PROFILES.find((p) => p.value === id) ?? PROFILES[0];
}

/** Collection used for the station list (every profile shares the same stations). */
export const STATIONS_COLLECTION = "typical-met-year";

/** STAC `percentile` values in the persistence collection, above the median. */
export const HOT_PERCENTILE_OPTIONS = [
  { value: "60ptile", label: "60th" },
  { value: "90ptile", label: "90th" },
  { value: "95ptile", label: "95th" },
] as const satisfies readonly SelectOption[];

/** STAC `percentile` values in the persistence collection, below the median. */
export const COLD_PERCENTILE_OPTIONS = [
  { value: "5ptile", label: "5th" },
  { value: "10ptile", label: "10th" },
  { value: "40ptile", label: "40th" },
] as const satisfies readonly SelectOption[];

export type HotPercentile = (typeof HOT_PERCENTILE_OPTIONS)[number]["value"];
export type ColdPercentile = (typeof COLD_PERCENTILE_OPTIONS)[number]["value"];

/** STAC `time_period` values shared by the TMY and XMY collections. */
export const PERIOD_OPTIONS = [
  { value: "present-day", label: "Present day (1.2°C)" },
  { value: "near-future", label: "Near future (1.5°C)" },
  { value: "mid-century", label: "Mid-century (2.0°C)" },
  { value: "mid-late-century", label: "Mid-late century (2.5°C)" },
] as const satisfies readonly SelectOption[];

export type PeriodId = (typeof PERIOD_OPTIONS)[number]["value"];

/**
 * STAC `model` values for the WRF simulations the profiles are built from.
 * Profiles are built per model, so the tool shows one model at a time.
 */
export const MODEL_OPTIONS = [
  { value: "ec-earth3", label: "EC-Earth3" },
  { value: "miroc6", label: "MIROC6" },
  { value: "mpi-esm1-2-hr", label: "MPI-ESM1-2-HR" },
  { value: "taiesm1", label: "TaiESM1" },
] as const satisfies readonly SelectOption[];

export type ModelId = (typeof MODEL_OPTIONS)[number]["value"];

export type VariableId =
  | "temperature"
  | "dewpoint"
  | "relativeHumidity"
  | "shortwave"
  | "directNormal"
  | "diffuse"
  | "longwave"
  | "windSpeed"
  | "pressure";

export interface VariableConfig {
  value: VariableId;
  label: string;
  /** Shown under the option in the variable dropdown. Shortened from climakitae `variable_descriptions.csv`. */
  description: string;
  /** Display units. Temperatures are shown in °F like the site's other tools. */
  units: string;
  /** Column header in the TMY/XMY CSVs. */
  column: string;
  /** Convert CSV values to display units. */
  convert?: (value: number) => number;
}

const celsiusToFahrenheit = (c: number) => (c * 9) / 5 + 32;

// Wind direction is left out: a line chart of angles that wrap at 360° is misleading.
export const VARIABLES: readonly VariableConfig[] = [
  {
    value: "temperature",
    label: "Air temperature",
    description: "Temperature of the air 2m above Earth's surface.",
    units: "°F",
    column: "Air temperature at 2m (degC)",
    convert: celsiusToFahrenheit,
  },
  {
    value: "dewpoint",
    label: "Dew point temperature",
    description: "Temperature the air must cool to for 100% relative humidity.",
    units: "°F",
    column: "Dew point temperature at 2m (degC)",
    convert: celsiusToFahrenheit,
  },
  {
    value: "relativeHumidity",
    label: "Relative humidity",
    description: "Water vapor in the air relative to the amount needed to saturate it.",
    units: "%",
    column: "Relative humidity (0-100)",
  },
  {
    value: "shortwave",
    label: "Downwelling shortwave radiation",
    description: "Solar radiation that reaches Earth's surface.",
    units: "W/m²",
    column: "Instantaneous downwelling shortwave flux at bottom (W/m2)",
  },
  {
    value: "directNormal",
    label: "Direct normal irradiance",
    description: "Solar radiation received perpendicular to the sun.",
    units: "W/m²",
    column: "Shortwave surface downward direct normal irradiance (W/m2)",
  },
  {
    value: "diffuse",
    label: "Diffuse horizontal irradiance",
    description: "Solar radiation scattered by the atmosphere and clouds.",
    units: "W/m²",
    column: "Shortwave surface downward diffuse irradiance (W/m2)",
  },
  {
    value: "longwave",
    label: "Downwelling longwave radiation",
    description: "Longwave radiation from the atmosphere and clouds reaching the surface.",
    units: "W/m²",
    column: "Instantaneous downwelling longwave flux at bottom (W/m2)",
  },
  {
    value: "windSpeed",
    label: "Wind speed at 10m",
    description: "Wind speed 10m above Earth's surface.",
    units: "m/s",
    column: "Wind speed at 10m (m/s)",
  },
  {
    value: "pressure",
    label: "Surface pressure",
    description: "Air pressure at Earth's surface.",
    units: "Pa",
    column: "Surface pressure (Pa)",
  },
];

export const VARIABLE_OPTIONS: readonly SelectOption[] = VARIABLES.map(
  ({ value, label, description }) => ({ value, label, description })
);

export function getVariable(id: VariableId): VariableConfig {
  return VARIABLES.find((v) => v.value === id) ?? VARIABLES[0];
}

export const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export interface ClimateProfilesSelections {
  /** STAC `location` id of a HadISD station. */
  station: string;
  /** The extreme profile drawn over the TMY. */
  xmy: XmyId;
  period: PeriodId;
  variable: VariableId;
  /** Advanced view. */
  model: ModelId;
  hotPercentile: HotPercentile;
  coldPercentile: ColdPercentile;
}

/**
 * Defaults follow the white paper's figures: Sacramento, mid-century,
 * MPI-ESM1-2-HR, persistence at the 90th and 10th percentiles.
 */
export const DEFAULT_SELECTIONS: ClimateProfilesSelections = {
  station: "sacramento_executive_airport_ksac",
  xmy: "hot-shock",
  period: "mid-century",
  variable: "temperature",
  model: "mpi-esm1-2-hr",
  hotPercentile: "90ptile",
  coldPercentile: "10ptile",
};

/** Selections that live under Advanced view. */
export const ADVANCED_KEYS = ["model", "hotPercentile", "coldPercentile"] as const;

export function usesAdvancedSelections(selections: ClimateProfilesSelections): boolean {
  return ADVANCED_KEYS.some((key) => selections[key] !== DEFAULT_SELECTIONS[key]);
}

export function withDefaultAdvanced(
  selections: ClimateProfilesSelections
): ClimateProfilesSelections {
  const next = { ...selections };
  for (const key of ADVANCED_KEYS) Object.assign(next, { [key]: DEFAULT_SELECTIONS[key] });
  return next;
}

function labelFor(options: readonly SelectOption[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

/** STAC `percentile` a persistence profile uses, or undefined for other profiles. */
export function percentileFor(
  id: ProfileId,
  selections: ClimateProfilesSelections
): string | undefined {
  const key = getProfile(id).percentileKey;
  return key ? selections[key] : undefined;
}

/** Colors follow the white paper's Figure 4. */
const PROFILE_COLORS: Record<ProfileId, string> = {
  tmy: "#000000",
  "hot-shock": "#d62728",
  "cold-shock": "#1f4fd8",
  "hot-persistence": "#f28e2b",
  "cold-persistence": "#7b3fa0",
};

export function profileColor(id: ProfileId): string {
  return PROFILE_COLORS[id];
}

/** e.g. "Hot shock XMY" or "Hot persistence XMY (90th percentile)". */
export function profileLabel(id: ProfileId, selections: ClimateProfilesSelections): string {
  const { label } = getProfile(id);
  const percentile = percentileFor(id, selections);
  if (!percentile) return label;
  const options = id === "hot-persistence" ? HOT_PERCENTILE_OPTIONS : COLD_PERCENTILE_OPTIONS;
  return `${label} (${labelFor(options, percentile)} percentile)`;
}

export function modelLabel(model: ModelId): string {
  return labelFor(MODEL_OPTIONS, model);
}

export function periodLabel(period: PeriodId): string {
  return labelFor(PERIOD_OPTIONS, period);
}
