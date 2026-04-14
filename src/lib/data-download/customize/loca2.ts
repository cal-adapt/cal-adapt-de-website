import type { MultiSelectOption, SelectOption } from "@/components/common/form";
import type { StacCollection, StacCollectionQueryables } from "@/lib/cal-adapt-api";
import { CMIP6_SCENARIO_LABELS, CMIP6_VARIABLE_LABELS } from "@/lib/data-download/labels/cmip6";

import { LOCA2_COUNTY_STAC_COLLECTION_ID } from "../catalog/ids";
import type { CustomizeFormConfig,PackageId  } from "../types";

import { buildStandardMetYearCustomizeForm } from "./climateProfile";
import { LOCA2_COUNTY_V2_ASSET_VARIABLE_IDS } from "./loca2Constants";
import { boundaryTypeSummaryValue } from "./spatialType";
import { coalesceSummaryOrQueryableEnum } from "./utils";

/** STAC `summaries` / queryables keys for LOCA2 county (v1 used `countyname`; v2 uses `county_name`). */
const COUNTY_OPTION_KEYS = ["county_name", "countyname"] as const;
const SUMMARY_VARIABLE = "cmip6:variable_id";
const SUMMARY_MODEL = "cmip6:source_id";
const SUMMARY_SCENARIO = "cmip6:experiment_id";

const DEFAULT_AGGREGATION_OPTIONS: SelectOption[] = [
  { value: "mean", label: "Ensemble mean" },
  { value: "min", label: "Minimum" },
  { value: "max", label: "Maximum" },
];

type CollectionWithExtent = StacCollection & {
  extent?: {
    temporal?: { interval?: [string, string][] };
  };
};

function formatTimeSpanLabel(collection: CollectionWithExtent): string {
  const interval = collection.extent?.temporal?.interval?.[0];
  if (!interval?.[0] || !interval?.[1]) {
    return "—";
  }
  const y0 = interval[0].slice(0, 4);
  const y1 = interval[1].slice(0, 4);
  return `${y0} – ${y1}`;
}

/**
 * Builds customize form options + defaults from a STAC Collection document.
 * LOCA2 county: non-empty `summaries` (typical v1) or v2 `queryables` enums for the same property keys.
 * Climate profiles: v2 `queryables` only (see `buildStandardMetYearCustomizeForm`).
 */
export function buildCustomizeFormConfigFromStacCollection(
  collection: StacCollection,
  catalogPackageId: PackageId,
  options?: { queryables?: StacCollectionQueryables }
): CustomizeFormConfig {
  if (catalogPackageId === "standard-year-profile" || catalogPackageId === "tmy-profile") {
    if (options?.queryables == null) {
      throw new Error(
        "[data-download] standard-year-profile and tmy-profile require STAC v2 queryables; pass options.queryables."
      );
    }
    return buildStandardMetYearCustomizeForm(collection, options.queryables, catalogPackageId);
  }

  const summaries = collection.summaries ?? {};
  const q = options?.queryables;

  let countyNames: string[] = [];
  for (const key of COUNTY_OPTION_KEYS) {
    countyNames = coalesceSummaryOrQueryableEnum(summaries, q, key);
    if (countyNames.length > 0) {
      break;
    }
  }

  let variableIds = coalesceSummaryOrQueryableEnum(summaries, q, SUMMARY_VARIABLE);
  if (variableIds.length === 0 && collection.id === LOCA2_COUNTY_STAC_COLLECTION_ID) {
    variableIds = [...LOCA2_COUNTY_V2_ASSET_VARIABLE_IDS];
  }
  const sourceIds = coalesceSummaryOrQueryableEnum(summaries, q, SUMMARY_MODEL);
  const experimentIds = coalesceSummaryOrQueryableEnum(summaries, q, SUMMARY_SCENARIO);

  /** Values must match STAC item `county_name` (v2) or `countyname` (v1) for CQL2 filters. */
  const countyOptions: MultiSelectOption[] = countyNames.map((name) => ({
    value: name,
    label: name,
  }));

  const variableOptions: MultiSelectOption[] = variableIds.map((id) => ({
    value: id,
    label: CMIP6_VARIABLE_LABELS[id] ?? id,
  }));

  /** Values must match STAC `cmip6:source_id` for CQL2 filters. */
  const modelOptions: MultiSelectOption[] = sourceIds.map((id) => ({
    value: id,
    label: id,
  }));

  const scenarioOptions: MultiSelectOption[] = experimentIds.map((id) => ({
    value: id,
    label: CMIP6_SCENARIO_LABELS[id] ?? id,
  }));

  /** This collection is monthly averages; keep a single frequency until summaries expose cadence. */
  const frequencyOptions: SelectOption[] = [{ value: "monthly", label: "Monthly" }];

  const license = collection.license?.trim() || "—";

  /** Tooltip copy for these rows lives in `countyGriddedTooltips.tsx` (rich links; not serializable from STAC). */
  const readOnlyFields = [
    { label: "Dataset", value: "LOCA2" },
    { label: "Data format", value: "NetCDF" },
    { label: "Boundary type", value: boundaryTypeSummaryValue(collection, "loca2-county") },
    { label: "Units", value: "Metric" },
    {
      label: "Time span",
      value: formatTimeSpanLabel(collection as CollectionWithExtent),
    },
    { label: "License", value: license },
  ];

  return {
    kind: "loca2-county",
    readOnlyFields,
    frequencyOptions,
    variableOptions,
    modelOptions,
    scenarioOptions,
    countyOptions,
    aggregationOptions: DEFAULT_AGGREGATION_OPTIONS,
    initial: {
      frequency: "monthly",
      variables: ["tasmax", "tasmin", "pr"],
      models: ["ACCESS-CM2", "MPI-ESM1-2-HR", "EC-Earth3", "FGOALS-g3", "CNRM-ESM2-1"],
      scenarios: ["historical", "ssp370"],
      counties: [],
      aggregation: "mean",
      percentiles: [],
      timePeriods: [],
    },
  };
}
