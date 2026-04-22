import type { MultiSelectOption, SelectOption } from "@/components/common/form";
import type {
  CountyItem,
  ItemSearchFilters,
  StacCollection,
  StacCollectionQueryables,
} from "@/lib/cal-adapt-api";
import { createOrStatement } from "@/utils/query";
import { normalizeDownloadUrl } from "@/utils/url";

import { boundaryTypeSummaryValue } from "../customize/spatialType";
import type {
  CustomizeFormConfig,
  CustomizeSelections,
  DataDownloadWorkspaceData,
  DownloadBundle,
} from "../types";

import {
  enumStringsFromStacQueryables,
  formatDoiUrl,
  formatTimeSpanLabel,
  humanizeToken,
  joinOptionLabels,
  parseStacAssetSizeBytes,
  slugifyFilenameSegment,
} from "./shared";
import type { PackageAdapter, PackageBundleMapResult } from "./types";

const STAC_COLLECTION_ID = "typical-met-year" as const;

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
  const gwlIds = enumStringsFromStacQueryables(queryables, "time_period");

  const countyOptions: MultiSelectOption[] = stationIds.map((id) => ({
    value: id,
    label: humanizeToken(id),
  }));
  const modelOptions: MultiSelectOption[] = modelIds.map((id) => ({
    value: id,
    label: humanizeToken(id),
  }));
  const timePeriodOptions: MultiSelectOption[] = gwlIds.map((id) => ({
    value: id,
    label: humanizeToken(id),
  }));

  const emptySelect: SelectOption[] = [];

  const readOnlyFields = [
    { label: "Dataset", value: collection.title?.trim() || "Typical Meteorological Year" },
    { label: "Data format", value: "EPW, CSV" },
    { label: "Boundary type", value: boundaryTypeSummaryValue(collection, "climate-profile") },
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
    aggregationOptions: emptySelect,
    percentileOptions: [],
    timePeriodOptions,
    initial: {
      frequency: "",
      variables: [],
      models: [...modelIds],
      scenarios: [],
      counties: [],
      aggregation: "",
      percentiles: [],
      timePeriods: [...gwlIds],
    },
  };
}

function buildSearchFilters(selections: CustomizeSelections): ItemSearchFilters {
  const collectionFilter = `collection='${STAC_COLLECTION_ID}'`;

  const locationFilter =
    selections.counties.length > 0 ? createOrStatement("location", selections.counties) : undefined;
  const modelFilter =
    selections.models.length > 0 ? createOrStatement("model", selections.models) : undefined;
  const timePeriodFilter =
    selections.timePeriods.length > 0
      ? createOrStatement("time_period", selections.timePeriods)
      : undefined;

  return {
    collectionFilter,
    locationFilter,
    modelFilter,
    timePeriodFilter,
  };
}

function mapItemsToBundles(features: CountyItem[]): PackageBundleMapResult {
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
      const locationLabel = humanizeToken(locationRaw);
      const gwlLabel = humanizeToken(timePeriodRaw.replace(/-/g, " "));
      const modelLabel = humanizeToken(modelRaw);
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
      const sizeBytes = parseStacAssetSizeBytes(raw as Record<string, unknown>);
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

function buildSummaryRows(
  workspace: DataDownloadWorkspaceData,
  selections: CustomizeSelections
): { label: string; value: string }[] {
  const form = workspace.customizeForm;
  return [
    ...form.readOnlyFields,
    { label: "Location", value: joinOptionLabels(selections.counties, form.countyOptions) },
    { label: "GWLs", value: joinOptionLabels(selections.timePeriods, form.timePeriodOptions) },
    { label: "Models", value: joinOptionLabels(selections.models, form.modelOptions) },
  ];
}

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
  useStacV2: true,
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
  mapItemsToBundles,
  validateSelections,
  buildSummaryRows,
  zipFilenameSlug,
};
