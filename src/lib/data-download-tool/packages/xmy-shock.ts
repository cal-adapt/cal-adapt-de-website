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
import { labelShockType, sortShockTypeIds } from "../labels/shock-types";
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

const STAC_COLLECTION_ID = "xmy-shock" as const;

function buildCustomizeForm(
  collection: StacCollection,
  queryables?: StacCollectionQueryables
): CustomizeFormConfig {
  if (queryables == null) {
    throw new Error(
      "[data-download] xmy-shock requires STAC v2 queryables; pass options.queryables."
    );
  }

  const stationIds = enumStringsFromStacQueryables(queryables, "location");
  const modelIds = enumStringsFromStacQueryables(queryables, "model");
  const shockTypeIds = sortShockTypeIds(enumStringsFromStacQueryables(queryables, "shock_type"));
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
  const shockTypeOptions: MultiSelectOption[] = shockTypeIds.map((id) => ({
    value: id,
    label: labelShockType(id),
  }));
  const timePeriodOptions: MultiSelectOption[] = gwlIds.map((id) => ({
    value: id,
    label: labelGwl(id),
  }));

  const emptySelect: SelectOption[] = [];

  const readOnlyFields = [
    {
      label: "Dataset",
      value: collection.title?.trim() || "Extreme Meteorological Year — Shock",
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
    kind: "xmy-shock",
    readOnlyFields,
    frequencyOptions: emptySelect,
    variableOptions: [],
    modelOptions,
    scenarioOptions: [],
    countyOptions,
    percentileOptions: [],
    timePeriodOptions,
    shockTypeOptions,
    initial: {
      frequency: "",
      variables: [],
      models: [...modelIds],
      scenarios: [],
      counties: [],
      percentiles: [],
      timePeriods: [...gwlIds],
      centeredYears: [],
      shockTypes: [...shockTypeIds],
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
  const shockTypeFilter =
    selections.shockTypes.length > 0 ? orFilter("shock_type", selections.shockTypes) : undefined;

  return {
    collectionFilter,
    locationFilter,
    modelFilter,
    timePeriodFilter,
    shockTypeFilter,
  };
}

function searchFiltersKey(selections: CustomizeSelections): string {
  return stableMultiKey([
    selections.counties,
    selections.models,
    selections.timePeriods,
    selections.shockTypes,
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
    const shockTypeRaw = String(item.properties.shock_type ?? "");
    const locationRaw = String(item.properties.location ?? "");
    const bundleKey = `${locationRaw}\0${timePeriodRaw}\0${modelRaw}\0${shockTypeRaw}`;

    let bundle = bundleBySelection.get(bundleKey);
    if (bundle == null) {
      const locationLabel = locationLabelById.get(locationRaw) ?? humanizeToken(locationRaw);
      const gwlLabel = labelGwl(timePeriodRaw);
      const modelLabel = labelCmip6Model(modelRaw);
      const shockLabel = labelShockType(shockTypeRaw);
      bundle = {
        stacItemId: slugifyFilenameSegment(
          `xmy-shock-${locationRaw}-${modelRaw}-${shockTypeRaw}-${timePeriodRaw}`
        ),
        metaBlocks: [
          { label: "Location", value: locationLabel },
          { label: "Global Warming Levels", value: gwlLabel },
          { label: "Model", value: modelLabel },
          { label: "Shock type", value: shockLabel },
        ],
        filenameSuffix: `${shockLabel}-${modelLabel}-${locationLabel}`,
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
    selections.shockTypes.length > 0
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
    label: "Shock type",
    placeholder: "Choose shock type…",
    options: (config) => config.shockTypeOptions ?? [],
    value: (selections) => selections.shockTypes,
    patch: (next) => ({ shockTypes: next }),
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
    selections.shockTypes.join("-") ||
    selections.timePeriods.join("-").replace(/\s+/g, "-") ||
    "xmy-shock";
  return slug.toLowerCase().replace(/[^a-z0-9-]+/gi, "-");
}

export const xmyShockPackage: PackageAdapter = {
  id: "xmy-shock",
  kind: "xmy-shock",
  stacCollectionId: STAC_COLLECTION_ID,
  needsQueryables: true,
  rail: {
    title: "Extreme Meteorological Year — Shock",
    listDescription: "Short-duration hot and cold shock climate profiles at stations.",
  },
  messages: {
    skipped:
      "Select at least one location, GWL, model, and shock type on the previous step to fetch files.",
    empty:
      "No files matched your selections. Try broadening location, GWL, model, or shock type choices.",
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
