import type {
  MultiSelectOption,
  MultiSelectOptionGroup,
  MultiSelectOptions,
  SelectOption,
} from "@/components/common/form";
import {
  type ItemSearchFilters,
  orFilter,
  type StacCollection,
  type StacCollectionQueryables,
  type StacItem,
} from "@/lib/cal-adapt-api";
import { splitStringByPeriod, toSentenceCase } from "@/utils/string";
import { normalizeDownloadUrl } from "@/utils/url";

import { labelCmip6Model } from "../labels/models";
import { labelCmip6Scenario } from "../labels/scenarios";
import { labelVariable } from "../labels/variables";
import type {
  CustomizeFormConfig,
  CustomizeSelections,
  DownloadAssetRow,
  DownloadBundle,
} from "../types";

import {
  coalesceSummaryOrQueryableEnum,
  enumStringsFromStacQueryables,
  formatTimeSpanLabel,
  parseStacAssetSizeBytes,
  stableMultiKey,
} from "./shared";
import type { CustomizeFieldConfig, PackageAdapter, PackageBundleMapResult } from "./types";

/** Current STAC id for LOCA2 county-gridded downloads (v2 API). */
export const LOCA2_COUNTY_STAC_COLLECTION_ID = "loca2-county" as const;

/** STAC `summaries` / queryables keys for LOCA2 county (v1 used `countyname`; v2 uses `county_name`). */
const COUNTY_OPTION_KEYS = ["county_name", "countyname"] as const;
const SUMMARY_VARIABLE = "cmip6:variable_id";
const SUMMARY_MODEL = "cmip6:source_id";
const SUMMARY_SCENARIO = "cmip6:experiment_id";

/**
 * `loca2-county` on STAC API v2 does not expose `cmip6:variable_id` in collection summaries
 * or queryables; each item's variables are NetCDF asset keys. Keep in sync with item assets
 * returned by the API.
 */
const LOCA2_COUNTY_V2_ASSET_VARIABLE_IDS: readonly string[] = [
  "tasmax",
  "tasmin",
  "pr",
  "huss",
  "rsds",
  "hursmax",
  "hursmin",
  "wind_speed_derived",
];

/** Maps UI frequency values to CMIP6 `table_id` query values. */
const CMIP6_TABLE_ID_BY_FREQUENCY: Readonly<Record<string, string>> = {
  monthly: "mon",
  daily: "day",
};

const LOCA2_COUNTY_GENERAL_USE_MODELS: ReadonlySet<string> = new Set([
  "ACCESS-CM2",
  "CNRM-ESM2-1",
  "EC-Earth3",
  "FGOALS-g3",
  "MPI-ESM1-2-HR",
]);

function buildGroupedModelOptions(modelOptions: MultiSelectOption[]): MultiSelectOptions {
  const generalUse: MultiSelectOption[] = [];
  const notGeneralUse: MultiSelectOption[] = [];

  for (const opt of modelOptions) {
    if (LOCA2_COUNTY_GENERAL_USE_MODELS.has(opt.value)) {
      generalUse.push(opt);
    } else {
      notGeneralUse.push(opt);
    }
  }
  if (generalUse.length === 0 || notGeneralUse.length === 0) {
    return modelOptions;
  }

  const groups: MultiSelectOptionGroup[] = [
    { label: "General use", options: generalUse },
    { label: "Not general use", options: notGeneralUse },
  ];

  return groups;
}

function buildCustomizeForm(
  collection: StacCollection,
  queryables?: StacCollectionQueryables
): CustomizeFormConfig {
  const summaries = collection.summaries ?? {};

  let countyNames: string[] = [];
  for (const key of COUNTY_OPTION_KEYS) {
    countyNames = coalesceSummaryOrQueryableEnum(summaries, queryables, key);
    if (countyNames.length > 0) {
      break;
    }
  }

  const rawLabels = collection["caladapt:variable_labels"];
  const variableLabelById: Map<string, string> =
    rawLabels != null && typeof rawLabels === "object" && !Array.isArray(rawLabels)
      ? new Map(Object.entries(rawLabels as Record<string, string>))
      : new Map();
  let variableIds = [...variableLabelById.keys()];
  if (variableIds.length === 0) {
    variableIds = coalesceSummaryOrQueryableEnum(summaries, queryables, SUMMARY_VARIABLE);
  }
  if (variableIds.length === 0) {
    variableIds = [...LOCA2_COUNTY_V2_ASSET_VARIABLE_IDS];
  }

  const sourceIds = coalesceSummaryOrQueryableEnum(summaries, queryables, SUMMARY_MODEL);
  const experimentIds = coalesceSummaryOrQueryableEnum(summaries, queryables, SUMMARY_SCENARIO);

  /** Values must match STAC item `county_name` (v2) or `countyname` (v1) for CQL2 filters. */
  const countyOptions: MultiSelectOption[] = countyNames.map((name) => ({
    value: name,
    label: name,
  }));

  const variableOptions: MultiSelectOption[] = variableIds.map((id) => ({
    value: id,
    label: variableLabelById.get(id) ?? labelVariable(id),
  }));

  const modelOptions: MultiSelectOption[] = sourceIds.map((id) => ({
    value: id,
    label: labelCmip6Model(id),
  }));

  const scenarioOptions: MultiSelectOption[] = experimentIds.map((id) => ({
    value: id,
    label: labelCmip6Scenario(id),
  }));

  /** This collection is monthly averages; keep a single frequency until summaries expose cadence. */
  const frequencyOptions: SelectOption[] = [
    { value: "monthly", label: "Monthly" },
    { value: "daily", label: "Daily" },
  ];

  const license = collection.license?.trim() || "—";

  /** Tooltip copy for these rows is attached at the component layer. */
  const readOnlyFields = [
    { label: "Dataset", value: "LOCA2" },
    { label: "Data format", value: "NetCDF" },
    {
      label: "Boundary type",
      value: toSentenceCase(collection["caladapt:spatial_type"] ?? "") || "—",
    },
    { label: "Units", value: "Metric" },
    { label: "Time span", value: formatTimeSpanLabel(collection) },
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
    initial: {
      frequency: "monthly",
      variables: ["tasmax", "tasmin", "pr"],
      models: ["ACCESS-CM2", "MPI-ESM1-2-HR", "EC-Earth3", "FGOALS-g3", "CNRM-ESM2-1"],
      scenarios: ["historical", "ssp370"],
      counties: [],
      percentiles: [],
      timePeriods: [],
    },
  };
}

function buildSearchFilters(selections: CustomizeSelections): ItemSearchFilters {
  const collectionFilter = `collection='${LOCA2_COUNTY_STAC_COLLECTION_ID}'`;

  const countyFilter =
    selections.counties.length > 0 ? orFilter("county_name", selections.counties) : undefined;

  const scenarioFilter =
    selections.scenarios.length > 0
      ? orFilter("cmip6:experiment_id", selections.scenarios)
      : undefined;

  const modelFilter =
    selections.models.length > 0 ? orFilter("cmip6:source_id", selections.models) : undefined;

  const tableId = CMIP6_TABLE_ID_BY_FREQUENCY[selections.frequency];
  const cmip6TableIdFilter = tableId ? `cmip6:table_id = '${tableId}'` : undefined;

  return {
    collectionFilter,
    countyFilter,
    scenarioFilter,
    modelFilter,
    cmip6TableIdFilter,
  };
}

function searchFiltersKey(selections: CustomizeSelections): string {
  return stableMultiKey([
    selections.counties,
    selections.scenarios,
    selections.models,
    selections.variables,
    selections.frequency,
  ]);
}

function parseModelScenarioFromItemId(itemId: string): { model: string; scenario: string } {
  const parts = splitStringByPeriod(itemId);
  if (parts.length >= 3) {
    return { model: parts[1] ?? "", scenario: parts[2] ?? "" };
  }
  return { model: "", scenario: "" };
}

function pickModel(item: StacItem): string {
  const fromProps = item.properties["cmip6:source_id"];
  if (typeof fromProps === "string" && fromProps.length > 0) {
    return fromProps;
  }
  return parseModelScenarioFromItemId(item.id).model;
}

function pickScenarioId(item: StacItem): string {
  const fromProps = item.properties["cmip6:experiment_id"];
  if (typeof fromProps === "string" && fromProps.length > 0) {
    return fromProps;
  }
  return parseModelScenarioFromItemId(item.id).scenario;
}

function mapItemsToBundles(
  features: StacItem[],
  selections: CustomizeSelections
): PackageBundleMapResult {
  const selected = new Set(selections.variables);
  const bundles: DownloadBundle[] = [];
  let totalBytes = 0;
  const allHrefs: string[] = [];

  for (const item of features) {
    const assets: DownloadAssetRow[] = [];

    for (const variableId of Object.keys(item.assets)) {
      if (!selected.has(variableId)) {
        continue;
      }
      const raw = item.assets[variableId];
      const hrefRaw = typeof raw.href === "string" ? raw.href : "";
      const href = normalizeDownloadUrl(hrefRaw);
      if (!href) {
        continue;
      }
      const sizeBytes = parseStacAssetSizeBytes(raw as Record<string, unknown>);
      const rawRecord = raw as Record<string, unknown>;
      const variableLabel =
        typeof rawRecord.variable_label === "string" ? rawRecord.variable_label.trim() : "";
      const label = variableLabel || raw.title?.trim() || labelVariable(variableId);

      assets.push({ variableId, label, href, sizeBytes });
      totalBytes += sizeBytes;
      allHrefs.push(href);
    }

    if (assets.length === 0) {
      continue;
    }

    const scenarioId = pickScenarioId(item);
    const county = String(item.properties.county_name ?? item.properties.countyname ?? "");
    const model = pickModel(item);
    const scenarioLabel = labelCmip6Scenario(scenarioId);

    bundles.push({
      stacItemId: item.id,
      metaBlocks: [
        { label: "Model", value: model },
        { label: "Scenario", value: scenarioLabel },
        { label: "Boundary", value: county },
      ],
      filenameSuffix: `${model}-${county}`,
      assets,
    });
  }

  bundles.sort((a, b) => a.stacItemId.localeCompare(b.stacItemId));

  return { bundles, totalBytes, allHrefs };
}

function validateSelections(selections: CustomizeSelections): boolean {
  return (
    selections.counties.length > 0 &&
    selections.models.length > 0 &&
    selections.scenarios.length > 0 &&
    selections.variables.length > 0
  );
}

const fields: readonly CustomizeFieldConfig[] = [
  {
    kind: "multi",
    label: "Variables",
    placeholder: "Choose variables…",
    options: (config) => config.variableOptions,
    value: (selections) => selections.variables,
    patch: (next) => ({ variables: next }),
  },
  {
    kind: "multi",
    label: "Models",
    placeholder: "Choose models…",
    options: (config) => buildGroupedModelOptions(config.modelOptions),
    value: (selections) => selections.models,
    patch: (next) => ({ models: next }),
  },
  {
    kind: "multi",
    label: "Scenarios",
    placeholder: "Choose scenarios…",
    options: (config) => config.scenarioOptions,
    value: (selections) => selections.scenarios,
    patch: (next) => ({ scenarios: next }),
  },
  {
    kind: "single",
    label: "Frequency",
    options: (config) => config.frequencyOptions,
    value: (selections) => selections.frequency,
    patch: (next) => ({ frequency: next }),
  },
  {
    kind: "multi",
    label: "Counties",
    placeholder: "Choose counties…",
    options: (config) => config.countyOptions,
    value: (selections) => selections.counties,
    patch: (next) => ({ counties: next }),
  },
];

function zipFilenameSlug(
  selections: CustomizeSelections,
  customizeForm: CustomizeFormConfig
): string {
  const opt = customizeForm.frequencyOptions.find((o) => o.value === selections.frequency);
  if (opt?.label) {
    return opt.label.toLowerCase().replace(/\s+/g, "-");
  }
  return selections.frequency;
}

export const loca2CountyPackage: PackageAdapter = {
  id: "loca2-county",
  kind: "loca2-county",
  stacCollectionId: LOCA2_COUNTY_STAC_COLLECTION_ID,
  needsQueryables: true,
  rail: {
    title: "LOCA2 county",
    listDescription: "Gridded climate projections by county.",
  },
  messages: {
    skipped:
      "Select at least one county, model, scenario, and variables on the previous step to fetch files.",
    empty: "No files matched your selections. Try broadening counties, models, or variables.",
    variableTableHeaders: { metric: "Metric", download: "Single variable" },
  },
  buildCustomizeForm,
  buildSearchFilters,
  searchFiltersKey,
  mapItemsToBundles,
  validateSelections,
  fields,
  zipFilenameSlug,
};
