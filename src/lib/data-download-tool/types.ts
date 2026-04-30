import type { MultiSelectOption, SelectOption } from "@/components/common/form";

export type PackageId = "loca2-county" | "typical-met-year" | "standard-year";

/** Which STAC-driven customize layout to render (LOCA2 county grid vs station-profile packages). */
export type CustomizeFormKind = "loca2-county" | "standard-year" | "typical-met-year";

/**
 * Options + defaults for the Customize step, built from STAC (or future sources).
 * Hint/tooltip copy is applied at the component layer via per-package tooltip maps.
 */
export type CustomizeFormConfig = {
  kind: CustomizeFormKind;
  readOnlyFields: { label: string; value: string }[];
  frequencyOptions: SelectOption[];
  variableOptions: MultiSelectOption[];
  modelOptions: MultiSelectOption[];
  scenarioOptions: MultiSelectOption[];
  countyOptions: MultiSelectOption[];
  /** station-profile packages (currently standard-year) — `percentile` queryable */
  percentileOptions?: MultiSelectOption[];
  /** station-profile packages — `time_period` queryable (shown as GWLs in the UI) */
  timePeriodOptions?: MultiSelectOption[];
  initial: {
    frequency: string;
    variables: string[];
    models: string[];
    scenarios: string[];
    counties: string[];
    percentiles: string[];
    timePeriods: string[];
  };
};

/**
 * User-controlled selections from the Customize step (mirrors `CustomizeFormConfig.initial` keys).
 * Values must match STAC property semantics: county as in `county_name` (v2) / `countyname` (v1), model `cmip6:source_id`, etc.
 */
export type CustomizeSelections = {
  frequency: string;
  variables: string[];
  models: string[];
  scenarios: string[];
  counties: string[];
  percentiles: string[];
  timePeriods: string[];
};

/** One downloadable NetCDF (or other) asset in a STAC item. */
export type DownloadAssetRow = {
  variableId: string;
  label: string;
  href: string;
  sizeBytes: number;
};

/**
 * STAC search result grouped for the download UI (one row per logical bundle — definition depends on the package).
 * `metaBlocks` + `filenameSuffix` are filled by the package adapter's `mapItemsToBundles`.
 */
export type DownloadBundle = {
  /** Stable id used for keys + zip filenames. */
  stacItemId: string;
  /** Display blocks shown at the top of the bundle card (label/value pairs, e.g. Model, Scenario, Boundary). */
  metaBlocks: { label: string; value: string }[];
  /** Short machine-safe slug used when naming a single-bundle zip download. */
  filenameSuffix: string;
  assets: DownloadAssetRow[];
};

/**
 * Normalized view-model for the Data Download workspace UI.
 * Populated from STAC today; future sources (TMY API, Standard Year API) add parallel mappers
 * that produce the same shape so `DataDownload` stays presentation-only.
 */
export type DataDownloadWorkspaceData = {
  /** STAC collection identifier (e.g. `loca2-county`). */
  collectionId: string;
  /** Human-readable dataset name from STAC or fallback. */
  datasetTitle: string;
  /** Collection description for intro / context copy. */
  datasetDescription: string;
  /** STAC `summaries` — use later to drive filters (variables, scenarios, etc.). */
  summaries: Record<string, string[]>;
  license?: string;
  /**
   * Canonical DOI URL (`https://doi.org/{id}`) derived from STAC `sci:doi`.
   * Undefined for packages without a published DOI (e.g. LOCA2).
   */
  doi?: string;
  /** Which catalog package this collection corresponds to (rail selection + view wiring). */
  catalogPackageId: PackageId;
  /** Customize step: field options and defaults derived from the collection. */
  customizeForm: CustomizeFormConfig;
};
