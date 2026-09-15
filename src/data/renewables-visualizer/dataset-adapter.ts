/**
 * Renewable Energy Dataset Adapter
 *
 * Provides a typed abstraction over S3/Zarr renewable energy datasets.
 * Maps user-facing selections (mode, resource, installation, scenario) to:
 * - S3/Zarr asset URLs
 * - Catile variable names
 * - Tile rescale ranges
 * - Units and labels
 * - Metadata
 *
 * This replaces the current hardcoded path construction logic (srdu/srdd/wrdn/wrdf)
 * with a discoverable, documented data interface.
 */

export type RenewableMode = "seasonal-generation" | "low-generation-days" | "coincident-stress";
export type ResourceType = "solar" | "wind";
export type Installation = "utility" | "distributed" | "onshore" | "offshore";
export type Scenario = "historical" | "ssp370";
export type Grid = "d02" | "d03";

/** GWL values (°C) present in the `gwl` dimension of these datasets, in index order. */
export const GWL_LEVELS = [0.8, 1.5, 2.0, 2.5, 3.0] as const;

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

export interface RenewableDatasetConfig {
  id: string;
  mode: RenewableMode;
  resource: ResourceType;
  installation: Installation;
  scenario: Scenario;
  grid: Grid;
  variable: string;
  s3Path: string;
  caTileVariable: string;
  units: string;
  label: string;
  description: string;
  rescaleMin: number;
  rescaleMax: number;
  defaultColormap: string;
  availableColormaps: string[];
  metadata: {
    source: string;
    timeResolution: string;
    spatialGrid: string;
    processingMethod?: string;
    citation?: string;
    datasetVersion?: string;
  };
}

export interface ModeDefinition {
  id: RenewableMode;
  label: string;
  description: string;
  shortDescription: string;
  helpText: string;
  defaultDataset: RenewableDatasetConfig;
}

/**
 * Seasonal Generation Potential Mode
 * Shows absolute capacity factor or change from baseline for a selected month/season/year
 */
export const SEASONAL_GENERATION_MODE: ModeDefinition = {
  id: "seasonal-generation",
  label: "Seasonal Generation Potential",
  description: "Absolute capacity factor or change from baseline across seasons",
  shortDescription: "How does renewable generation potential change seasonally?",
  helpText:
    "This mode shows capacity factor (0-100%) for solar or wind resources. Compare baseline historical conditions with future projections to understand seasonal shifts in generation potential.",
  defaultDataset: {
    id: "solar-utility-seasonal-ssp370-d03",
    mode: "seasonal-generation",
    resource: "solar",
    installation: "utility",
    scenario: "ssp370",
    grid: "d03",
    variable: "srdu",
    s3Path: "s3://cadcat/tmp/era/wrf/cae/mm4mean/ssp370/gwl/srdu/d03",
    caTileVariable: "srdu",
    units: "%",
    label: "Solar Capacity Factor (Utility)",
    description: "Monthly mean capacity factor for utility-scale solar installations",
    rescaleMin: 0,
    rescaleMax: 100,
    defaultColormap: "viridis",
    availableColormaps: ["viridis", "plasma", "inferno", "turbo", "RdYlGn"],
    metadata: {
      source: "WRF-CAE UCLA",
      timeResolution: "Monthly",
      spatialGrid: "WRF 9km (D03)",
      processingMethod: "Monthly mean from hourly model data",
      citation: "Cal-Adapt Climate Data",
      datasetVersion: "2024-01",
    },
  },
};

/**
 * Low-Generation Days Mode
 * Shows count of days below a defined generation threshold
 */
export const LOW_GENERATION_DAYS_MODE: ModeDefinition = {
  id: "low-generation-days",
  label: "Low-Generation Days",
  description: "Number of days below a defined generation threshold",
  shortDescription: "Which periods experience frequent low renewable generation?",
  helpText:
    "This mode counts days when generation falls below a threshold (default 40% capacity factor). Higher counts indicate periods of reduced renewable resource availability.",
  defaultDataset: {
    id: "solar-utility-low-gen-ssp370-d03",
    mode: "low-generation-days",
    resource: "solar",
    installation: "utility",
    scenario: "ssp370",
    grid: "d03",
    variable: "srdu",
    s3Path: "s3://cadcat/tmp/era/wrf/cae/mm4mean/ssp370/gwl/srdu/d03",
    caTileVariable: "srdu",
    units: "days",
    label: "Solar Low-Generation Days",
    description: "Annual count of days with capacity factor below 40%",
    rescaleMin: 0,
    rescaleMax: 365,
    defaultColormap: "YlOrRd",
    availableColormaps: ["YlOrRd", "Reds", "RdPu", "RdYlBu"],
    metadata: {
      source: "WRF-CAE UCLA",
      timeResolution: "Annual",
      spatialGrid: "WRF 9km (D03)",
      processingMethod: "Count of days with capacity factor < 40%",
      citation: "Cal-Adapt Climate Data",
      datasetVersion: "2024-01",
    },
  },
};

/**
 * Coincident Solar & Wind Stress Mode
 * Shows frequency of days when both resources are below threshold
 * (Signature feature of redesign—requires backend product)
 */
export const COINCIDENT_STRESS_MODE: ModeDefinition = {
  id: "coincident-stress",
  label: "Coincident Solar & Wind Stress",
  description: "Days when both solar and wind experience simultaneous low generation",
  shortDescription: "When do solar and wind stress coincide?",
  helpText:
    "This mode identifies days when both solar and wind resources fall below their respective thresholds. This helps identify periods of potential generation diversity loss. Note: this is a resource-availability indicator, not a grid-reliability or outage-risk estimate.",
  defaultDataset: {
    id: "coincident-stress-ssp370-d03",
    mode: "coincident-stress",
    resource: "solar",
    installation: "utility",
    scenario: "ssp370",
    grid: "d03",
    variable: "coincident-stress",
    s3Path: "s3://cadcat/tmp/era/wrf/cae/mm4mean/ssp370/gwl/coincident-stress/d03",
    caTileVariable: "coincident-stress",
    units: "days",
    label: "Coincident Solar & Wind Stress Days",
    description: "Annual count of days with both solar and wind capacity factors below 40%",
    rescaleMin: 0,
    rescaleMax: 365,
    defaultColormap: "RdPu",
    availableColormaps: ["RdPu", "Purples", "Spectral"],
    metadata: {
      source: "WRF-CAE UCLA (derived)",
      timeResolution: "Annual",
      spatialGrid: "WRF 9km (D03)",
      processingMethod: "Days with solar CF < 40% AND wind CF < 40%",
      citation: "Cal-Adapt Climate Data",
      datasetVersion: "2024-01",
    },
  },
};

/**
 * Map of all available modes
 */
export const RENEWABLE_MODES: Record<RenewableMode, ModeDefinition> = {
  "seasonal-generation": SEASONAL_GENERATION_MODE,
  "low-generation-days": LOW_GENERATION_DAYS_MODE,
  "coincident-stress": COINCIDENT_STRESS_MODE,
};

/**
 * Get a mode definition by ID
 */
export function getMode(modeId: RenewableMode): ModeDefinition {
  const mode = RENEWABLE_MODES[modeId];
  if (!mode) {
    throw new Error(`Unknown renewable mode: ${modeId}`);
  }
  return mode;
}

/**
 * All available dataset configurations
 * (In a full implementation, this would be populated from STAC or a backend API)
 */
export const RENEWABLE_DATASETS: Record<string, RenewableDatasetConfig> = {
  [SEASONAL_GENERATION_MODE.defaultDataset.id]: SEASONAL_GENERATION_MODE.defaultDataset,
  [LOW_GENERATION_DAYS_MODE.defaultDataset.id]: LOW_GENERATION_DAYS_MODE.defaultDataset,
  [COINCIDENT_STRESS_MODE.defaultDataset.id]: COINCIDENT_STRESS_MODE.defaultDataset,
};

/**
 * Format a dataset value with units for display
 */
export function formatDatasetValue(value: number | null, config: RenewableDatasetConfig): string {
  if (value === null) {
    return "N/A";
  }
  // Format to 1 decimal place for capacity factor, 0 for days
  const decimals = config.units === "%" ? 1 : 0;
  return `${value.toFixed(decimals)} ${config.units}`;
}
