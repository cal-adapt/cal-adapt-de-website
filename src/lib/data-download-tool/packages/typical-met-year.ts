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

/** ERA5 is an observed reanalysis (not a WRF projection); its TMY only exists for `historical`. */
const ERA5_MODEL_ID = "era5" as const;
const HISTORICAL_PERIOD_ID = "historical" as const;

function isEra5Model(id: string): boolean {
  return id.toLowerCase() === ERA5_MODEL_ID;
}

/** `historical` requires ERA5; warming levels require at least one WRF (non-ERA5) model. */
function periodValidForModels(periodId: string, models: readonly string[]): boolean {
  if (periodId.toLowerCase() === HISTORICAL_PERIOD_ID) {
    return models.some(isEra5Model);
  }
  return models.some((m) => !isEra5Model(m));
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

  const stationLabels = stationLabelsFromCollection(collection);
  const countyOptions: MultiSelectOption[] = stationIds.map((id) => ({
    value: id,
    label: labelStation(id, stationLabels),
  }));
  const modelOptions: MultiSelectOption[] = modelIds.map((id) => ({
    value: id,
    label: labelCmip6Model(id),
  }));
  const timePeriodOptions: MultiSelectOption[] = gwlIds.map((id) => ({
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
      models: [...modelIds],
      scenarios: [],
      counties: [],
      percentiles: [],
      timePeriods: [...gwlIds],
      centeredYears: [],
      shockTypes: [],
    },
  };
}

function buildSearchFilters(selections: CustomizeSelections): ItemSearchFilters {
  const collectionFilter = `collection='${STAC_COLLECTION_ID}'`;

  const locationFilter =
    selections.counties.length > 0 ? orFilter("location", selections.counties) : undefined;
  const modelFilter =
    selections.models.length > 0 ? orFilter("model", selections.models) : undefined;
  const timePeriodFilter =
    selections.timePeriods.length > 0 ? orFilter("time_period", selections.timePeriods) : undefined;

  return {
    collectionFilter,
    locationFilter,
    modelFilter,
    timePeriodFilter,
  };
}

function searchFiltersKey(selections: CustomizeSelections): string {
  return stableMultiKey([selections.counties, selections.models, selections.timePeriods]);
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
          { label: "GWLs", value: gwlLabel },
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
  return (
    selections.counties.length > 0 &&
    selections.timePeriods.length > 0 &&
    selections.models.length > 0
  );
}

const fields: readonly CustomizeFieldConfig[] = [
  {
    kind: "multi",
    label: "GWLs",
    placeholder: "Choose GWLs…",
    // Only offer periods the selected models actually provide (Historical iff ERA5 is selected).
    options: (config, selections) =>
      (config.timePeriodOptions ?? []).filter((o) =>
        periodValidForModels(o.value, selections.models)
      ),
    value: (selections) => selections.timePeriods,
    patch: (next) => ({ timePeriods: next }),
  },
  {
    kind: "multi",
    label: "Models",
    placeholder: "Choose models…",
    options: (config) => config.modelOptions,
    value: (selections) => selections.models,
    // Prune periods no longer valid for the new model set (e.g. dropping every WRF model).
    patch: (next, selections) => ({
      models: next,
      timePeriods: selections.timePeriods.filter((p) => periodValidForModels(p, next)),
    }),
  },
  {
    kind: "multi",
    label: "Location",
    placeholder: "Choose stations…",
    options: (config) => config.countyOptions,
    value: (selections) => selections.counties,
    patch: (next) => ({ counties: next }),
  },
];

function zipFilenameSlug(selections: CustomizeSelections): string {
  const slug =
    selections.timePeriods.join("-").replace(/\s+/g, "-") ||
    selections.models.join("-") ||
    "typical-met-year";
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
