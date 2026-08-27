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
import { labelPercentile, sortPercentileIds } from "../labels/percentiles";
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

const STAC_COLLECTION_ID = "xmy-persist" as const;

function buildCustomizeForm(
  collection: StacCollection,
  queryables?: StacCollectionQueryables
): CustomizeFormConfig {
  if (queryables == null) {
    throw new Error(
      "[data-download] xmy-persist requires STAC v2 queryables; pass options.queryables."
    );
  }

  const stationIds = enumStringsFromStacQueryables(queryables, "location");
  const modelIds = enumStringsFromStacQueryables(queryables, "model");
  const percentileIds = sortPercentileIds(enumStringsFromStacQueryables(queryables, "percentile"));
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
  const percentileOptions: MultiSelectOption[] = percentileIds.map((id) => ({
    value: id,
    label: labelPercentile(id),
  }));
  const timePeriodOptions: MultiSelectOption[] = gwlIds.map((id) => ({
    value: id,
    label: labelGwl(id),
  }));

  const emptySelect: SelectOption[] = [];

  const readOnlyFields = [
    {
      label: "Dataset",
      value: collection.title?.trim() || "Extreme Year (Persistence)",
    },
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
    kind: "xmy-persist",
    readOnlyFields,
    frequencyOptions: emptySelect,
    variableOptions: [],
    modelOptions,
    scenarioOptions: [],
    countyOptions,
    percentileOptions,
    timePeriodOptions,
    initial: {
      frequency: "",
      variables: [],
      models: [...modelIds],
      scenarios: [],
      counties: [],
      percentiles: [...percentileIds],
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
  const percentileFilter =
    selections.percentiles.length > 0 ? orFilter("percentile", selections.percentiles) : undefined;
  const timePeriodFilter =
    selections.timePeriods.length > 0 ? orFilter("time_period", selections.timePeriods) : undefined;

  return {
    collectionFilter,
    locationFilter,
    modelFilter,
    percentileFilter,
    timePeriodFilter,
  };
}

function searchFiltersKey(selections: CustomizeSelections): string {
  return stableMultiKey([
    selections.counties,
    selections.models,
    selections.percentiles,
    selections.timePeriods,
  ]);
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
    const percentileRaw = String(item.properties.percentile ?? "");
    const locationRaw = String(item.properties.location ?? "");
    const bundleKey = `${locationRaw}\0${timePeriodRaw}\0${modelRaw}\0${percentileRaw}`;

    let bundle = bundleBySelection.get(bundleKey);
    if (bundle == null) {
      const locationLabel = locationLabelById.get(locationRaw) ?? humanizeToken(locationRaw);
      const gwlLabel = labelGwl(timePeriodRaw);
      const modelLabel = labelCmip6Model(modelRaw);
      const percentileLabel = labelPercentile(percentileRaw);
      bundle = {
        stacItemId: slugifyFilenameSegment(
          `xmy-persist-${locationRaw}-${modelRaw}-${timePeriodRaw}-${percentileRaw}`
        ),
        metaBlocks: [
          { label: "Location", value: locationLabel },
          { label: "Global Warming Levels", value: gwlLabel },
          { label: "Model", value: modelLabel },
          { label: "Percentile", value: percentileLabel },
        ],
        filenameSuffix: `${percentileLabel}-${modelLabel}-${locationLabel}`,
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
    selections.models.length > 0 &&
    selections.percentiles.length > 0
  );
}

const fields: readonly CustomizeFieldConfig[] = [
  {
    kind: "multi",
    label: "Global Warming Levels",
    placeholder: "Choose global warming levels…",
    options: (config) => config.timePeriodOptions ?? [],
    value: (selections) => selections.timePeriods,
    patch: (next) => ({ timePeriods: next }),
  },
  {
    kind: "multi",
    label: "Models",
    placeholder: "Choose models…",
    options: (config) => config.modelOptions,
    value: (selections) => selections.models,
    patch: (next) => ({ models: next }),
  },
  {
    kind: "multi",
    label: "Percentiles",
    placeholder: "Choose percentiles…",
    options: (config) => config.percentileOptions ?? [],
    value: (selections) => selections.percentiles,
    patch: (next) => ({ percentiles: next }),
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
  const slug =
    selections.percentiles.join("-") ||
    selections.timePeriods.join("-").replace(/\s+/g, "-") ||
    "xmy-persist";
  return slug.toLowerCase().replace(/[^a-z0-9-]+/gi, "-");
}

export const xmyPersistPackage: PackageAdapter = {
  id: "xmy-persist",
  kind: "xmy-persist",
  stacCollectionId: STAC_COLLECTION_ID,
  needsQueryables: true,
  rail: {
    title: "Extreme Year (Persistence)",
    listDescription: "Sustained extreme climate profiles at stations, by percentile.",
  },
  methodsUrl:
    "https://analytics.cal-adapt.org/scientific-guidance/climate_profiles/extreme-met-year.html",
  messages: {
    skipped:
      "Select at least one location, GWL, model, and percentile on the previous step to fetch files.",
    empty: "No files matched your selections. Try broadening location, GWL, model, or percentiles.",
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
