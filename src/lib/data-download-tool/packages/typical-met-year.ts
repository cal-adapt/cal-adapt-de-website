import type { MultiSelectOption, SelectOption } from "@/components/common/form";
import {
  type ItemSearchFilters,
  orFilter,
  type StacCollection,
  type StacCollectionQueryables,
  type StacItem,
} from "@/lib/cal-adapt-api";
import { toSentenceCase } from "@/utils/string";
import { normalizeDownloadUrl } from "@/utils/url";

import { labelGwl, sortGwlIds } from "../labels/gwls";
import { labelCmip6Model } from "../labels/models";
import type { CustomizeFormConfig, CustomizeSelections, DownloadBundle } from "../types";

import {
  enumStringsFromStacQueryables,
  formatDoiUrl,
  formatTimeSpanLabel,
  humanizeToken,
  labelStation,
  parseStacAssetSizeBytes,
  parseStacFileSizeBytes,
  slugifyFilenameSegment,
  stableMultiKey,
  stationLabelsFromCollection,
} from "./shared";
import type { CustomizeFieldConfig, PackageAdapter, PackageBundleMapResult } from "./types";

const STAC_COLLECTION_ID = "typical-met-year" as const;

// ERA5 is observed reanalysis and only exists for `historical`;
// the other models are climate projections and only exist for the warming levels.
const ERA5_MODEL_ID = "era5" as const;
const HISTORICAL_PERIOD_ID = "historical" as const;

const DATA_SOURCE_REANALYSIS = "historical-reanalysis" as const;
const DATA_SOURCE_PROJECTIONS = "climate-projections" as const;

const DATA_SOURCE_OPTIONS: SelectOption[] = [
  { value: DATA_SOURCE_REANALYSIS, label: "Historical reanalysis (ERA)" },
  { value: DATA_SOURCE_PROJECTIONS, label: "Climate projections" },
];

function isEra5Model(id: string): boolean {
  return id.toLowerCase() === ERA5_MODEL_ID;
}

function isHistoricalPeriod(id: string): boolean {
  return id.toLowerCase() === HISTORICAL_PERIOD_ID;
}

function isReanalysisSource(selections: CustomizeSelections): boolean {
  return selections.dataSource === DATA_SOURCE_REANALYSIS;
}

function buildCustomizeForm(
  collection: StacCollection,
  queryables?: StacCollectionQueryables
): CustomizeFormConfig {
  if (queryables == null) {
    throw new Error(
      "[data-download] typical-met-year requires STAC v2 queryables; pass options.queryables."
    );
  }

  const stationIds = enumStringsFromStacQueryables(queryables, "location");
  const modelIds = enumStringsFromStacQueryables(queryables, "model");
  const gwlIds = sortGwlIds(enumStringsFromStacQueryables(queryables, "time_period"));

  // ERA5 and Historical live behind the Data source toggle, so the Models/GWLs
  // multiselects only offer the climate-projection values.
  const projectionModelIds = modelIds.filter((id) => !isEra5Model(id));
  const warmingPeriodIds = gwlIds.filter((id) => !isHistoricalPeriod(id));

  const stationLabels = stationLabelsFromCollection(collection);
  const countyOptions: MultiSelectOption[] = stationIds.map((id) => ({
    value: id,
    label: labelStation(id, stationLabels),
  }));
  const modelOptions: MultiSelectOption[] = projectionModelIds.map((id) => ({
    value: id,
    label: labelCmip6Model(id),
  }));
  const timePeriodOptions: MultiSelectOption[] = warmingPeriodIds.map((id) => ({
    value: id,
    label: labelGwl(id),
  }));

  const emptySelect: SelectOption[] = [];

  const readOnlyFields = [
    { label: "Dataset", value: collection.title?.trim() || "Typical Meteorological Year" },
    { label: "Data format", value: "EPW, CSV" },
    {
      label: "Boundary type",
      value: toSentenceCase(collection["caladapt:spatial_type"] ?? "") || "—",
    },
    { label: "Time span", value: formatTimeSpanLabel(collection) },
    { label: "License", value: collection.license?.trim() || "-" },
    { label: "DOI", value: formatDoiUrl(collection["sci:doi"]) || "-" },
  ];

  return {
    kind: "typical-met-year",
    readOnlyFields,
    frequencyOptions: emptySelect,
    variableOptions: [],
    modelOptions,
    scenarioOptions: [],
    countyOptions,
    percentileOptions: [],
    timePeriodOptions,
    initial: {
      frequency: "",
      variables: [],
      models: [...projectionModelIds],
      scenarios: [],
      counties: [],
      percentiles: [],
      timePeriods: [...warmingPeriodIds],
      centeredYears: [],
      shockTypes: [],
      dataSource: DATA_SOURCE_PROJECTIONS,
    },
  };
}

/** Model + time period actually queried, resolved from the chosen data source. */
function effectiveModelPeriod(selections: CustomizeSelections): {
  models: string[];
  timePeriods: string[];
} {
  if (isReanalysisSource(selections)) {
    return { models: [ERA5_MODEL_ID], timePeriods: [HISTORICAL_PERIOD_ID] };
  }
  return {
    models: selections.models.filter((id) => !isEra5Model(id)),
    timePeriods: selections.timePeriods.filter((id) => !isHistoricalPeriod(id)),
  };
}

function buildSearchFilters(selections: CustomizeSelections): ItemSearchFilters {
  const collectionFilter = `collection='${STAC_COLLECTION_ID}'`;
  const { models, timePeriods } = effectiveModelPeriod(selections);

  const locationFilter =
    selections.counties.length > 0 ? orFilter("location", selections.counties) : undefined;
  const modelFilter = models.length > 0 ? orFilter("model", models) : undefined;
  const timePeriodFilter =
    timePeriods.length > 0 ? orFilter("time_period", timePeriods) : undefined;

  return {
    collectionFilter,
    locationFilter,
    modelFilter,
    timePeriodFilter,
  };
}

function searchFiltersKey(selections: CustomizeSelections): string {
  const { models, timePeriods } = effectiveModelPeriod(selections);
  return stableMultiKey([selections.counties, models, timePeriods]);
}

function mapItemsToBundles(
  features: StacItem[],
  _selections: CustomizeSelections,
  customizeForm?: CustomizeFormConfig
): PackageBundleMapResult {
  const locationLabelById = new Map(
    (customizeForm?.countyOptions ?? []).map((o) => [o.value, o.label])
  );
  const bundleBySelection = new Map<string, DownloadBundle>();
  const seenAssetKeys = new Set<string>();
  let totalBytes = 0;
  const allHrefs: string[] = [];

  for (const item of features) {
    const modelRaw = String(item.properties.model ?? "");
    const timePeriodRaw = String(item.properties.time_period ?? "");
    const locationRaw = String(item.properties.location ?? "");
    const bundleKey = `${locationRaw}\0${timePeriodRaw}\0${modelRaw}`;

    let bundle = bundleBySelection.get(bundleKey);
    if (bundle == null) {
      const locationLabel = locationLabelById.get(locationRaw) ?? humanizeToken(locationRaw);
      const gwlLabel = labelGwl(timePeriodRaw);
      const modelLabel = labelCmip6Model(modelRaw);
      bundle = {
        stacItemId: slugifyFilenameSegment(`tmy-${locationRaw}-${modelRaw}-${timePeriodRaw}`),
        metaBlocks: [
          { label: "Location", value: locationLabel },
          { label: "Global Warming Levels", value: gwlLabel },
          { label: "Model", value: modelLabel },
        ],
        filenameSuffix: `${modelLabel}-${locationLabel}`,
        assets: [],
      };
      bundleBySelection.set(bundleKey, bundle);
    }

    for (const [assetKey, raw] of Object.entries(item.assets)) {
      const hrefRaw = typeof raw.href === "string" ? raw.href : "";
      const href = normalizeDownloadUrl(hrefRaw);
      if (!href) {
        continue;
      }
      const sizeBytes =
        parseStacAssetSizeBytes(raw as Record<string, unknown>) ||
        parseStacFileSizeBytes(item.properties["file:size"]);
      const fileTypeLabel = /^[a-z0-9]{2,5}$/i.test(assetKey)
        ? assetKey.toUpperCase()
        : humanizeToken(assetKey);
      const dedupeKey = `${bundleKey}\0${assetKey}\0${href}`;
      if (seenAssetKeys.has(dedupeKey)) {
        continue;
      }
      seenAssetKeys.add(dedupeKey);

      bundle.assets.push({
        variableId: assetKey,
        label: fileTypeLabel,
        href,
        sizeBytes,
      });
      totalBytes += sizeBytes;
      allHrefs.push(href);
    }
  }

  const bundles = Array.from(bundleBySelection.values()).filter((b) => b.assets.length > 0);
  bundles.sort((a, b) => a.stacItemId.localeCompare(b.stacItemId));
  return { bundles, totalBytes, allHrefs };
}

function validateSelections(selections: CustomizeSelections): boolean {
  if (selections.counties.length === 0) {
    return false;
  }
  // Reanalysis implies ERA5 + Historical, so a location is enough. Projections
  // still require at least one climate projections model and warming level.
  const { models, timePeriods } = effectiveModelPeriod(selections);
  return models.length > 0 && timePeriods.length > 0;
}

const fields: readonly CustomizeFieldConfig[] = [
  {
    kind: "single",
    label: "Data source",
    options: () => DATA_SOURCE_OPTIONS,
    value: (selections) => selections.dataSource ?? DATA_SOURCE_PROJECTIONS,
    patch: (next) => ({ dataSource: next }),
  },
  {
    kind: "multi",
    label: "Global Warming Levels",
    placeholder: "Choose global warming levels…",
    // Reanalysis only has Historical, so lock field to that single option;
    // climate projection selections are preserved via `selections.timePeriods` for the toggle back.
    options: (config, selections) =>
      isReanalysisSource(selections)
        ? [{ value: HISTORICAL_PERIOD_ID, label: labelGwl(HISTORICAL_PERIOD_ID) }]
        : (config.timePeriodOptions ?? []),
    value: (selections) =>
      isReanalysisSource(selections) ? [HISTORICAL_PERIOD_ID] : selections.timePeriods,
    patch: (next, selections) => (isReanalysisSource(selections) ? {} : { timePeriods: next }),
  },
  {
    kind: "multi",
    label: "Models",
    placeholder: "Choose models…",
    // Reanalysis only has ERA5, so lock the field to that single option;
    // projection selections are preserved (via `selections.models`) for the toggle back.
    options: (config, selections) =>
      isReanalysisSource(selections)
        ? [{ value: ERA5_MODEL_ID, label: labelCmip6Model(ERA5_MODEL_ID) }]
        : config.modelOptions,
    value: (selections) => (isReanalysisSource(selections) ? [ERA5_MODEL_ID] : selections.models),
    patch: (next, selections) => (isReanalysisSource(selections) ? {} : { models: next }),
  },
  {
    kind: "multi",
    label: "Locations",
    placeholder: "Choose stations…",
    options: (config) => config.countyOptions,
    value: (selections) => selections.counties,
    patch: (next) => ({ counties: next }),
  },
];

function zipFilenameSlug(selections: CustomizeSelections): string {
  const { models, timePeriods } = effectiveModelPeriod(selections);
  const slug = timePeriods.join("-").replace(/\s+/g, "-") || models.join("-") || "typical-met-year";
  return slug.toLowerCase().replace(/[^a-z0-9-]+/gi, "-");
}

export const typicalMetYearPackage: PackageAdapter = {
  id: "typical-met-year",
  kind: "typical-met-year",
  stacCollectionId: STAC_COLLECTION_ID,
  needsQueryables: true,
  rail: {
    title: "Typical meteorological year",
    listDescription: "Representative year climate profiles for analysis.",
  },
  messages: {
    skipped: "Select at least one location, GWL, and model on the previous step to fetch files.",
    empty: "No files matched your selections. Try broadening location, GWL, or model choices.",
    variableTableHeaders: { metric: "File type", download: "Single file" },
  },
  buildCustomizeForm,
  buildSearchFilters,
  searchFiltersKey,
  mapItemsToBundles,
  validateSelections,
  fields,
  zipFilenameSlug,
};
