import type { MultiSelectOption, SelectOption } from "@/components/common/form";
import type {
  CountyItem,
  ItemSearchFilters,
  StacCollection,
  StacCollectionQueryables,
} from "@/lib/cal-adapt-api";
import { createOrStatement } from "@/utils/query";
import { toSentenceCase } from "@/utils/string";
import { normalizeDownloadUrl } from "@/utils/url";

import { labelGwl } from "../labels/gwls";
import { labelPercentile } from "../labels/percentiles";
import { labelVariable } from "../labels/variables";
import type { CustomizeFormConfig, CustomizeSelections, DownloadBundle } from "../types";

import {
  enumStringsFromStacQueryables,
  formatDoiUrl,
  formatTimeSpanLabel,
  humanizeToken,
  parseStacAssetSizeBytes,
  slugifyFilenameSegment,
  stableMultiKey,
} from "./shared";
import type { CustomizeFieldConfig, PackageAdapter, PackageBundleMapResult } from "./types";

const STAC_COLLECTION_ID = "standard-year" as const;

function labelsByVariableId(q: StacCollectionQueryables): Map<string, string> {
  const variableIds = enumStringsFromStacQueryables(q, "variable");
  const variableLabels = enumStringsFromStacQueryables(q, "variable_label");
  const entries = variableIds
    .map((id, index) => [id, variableLabels[index] ?? ""] as const)
    .filter(([, label]) => label.trim().length > 0);
  return new Map(entries);
}

function buildCustomizeForm(
  collection: StacCollection,
  queryables?: StacCollectionQueryables
): CustomizeFormConfig {
  if (queryables == null) {
    throw new Error(
      "[data-download] standard-year requires STAC v2 queryables; pass options.queryables."
    );
  }

  const stationIds = enumStringsFromStacQueryables(queryables, "location");
  const variableIds = enumStringsFromStacQueryables(queryables, "variable");
  const percentileIds = enumStringsFromStacQueryables(queryables, "percentile");
  const modelIds = enumStringsFromStacQueryables(queryables, "model");
  const gwlIds = enumStringsFromStacQueryables(queryables, "time_period");
  const variableLabelById = labelsByVariableId(queryables);

  const countyOptions: MultiSelectOption[] = stationIds.map((id) => ({
    value: id,
    label: humanizeToken(id),
  }));

  const variableOptions: MultiSelectOption[] = variableIds.map((id) => ({
    value: id,
    label: variableLabelById.get(id) ?? labelVariable(id),
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
    { label: "Dataset", value: collection.title?.trim() || "Standard Meteorological Year" },
    { label: "Data format", value: "CSV" },
    {
      label: "Boundary type",
      value: toSentenceCase(collection["caladapt:spatial_type"] ?? "") || "—",
    },
    { label: "Time span", value: formatTimeSpanLabel(collection) },
    { label: "License", value: collection.license?.trim() || "-" },
    { label: "DOI", value: formatDoiUrl(collection["sci:doi"]) || "-" },
  ];

  return {
    kind: "standard-year",
    readOnlyFields,
    frequencyOptions: emptySelect,
    variableOptions,
    modelOptions: [],
    scenarioOptions: [],
    countyOptions,
    aggregationOptions: emptySelect,
    percentileOptions,
    timePeriodOptions,
    initial: {
      frequency: "",
      variables: [...variableIds],
      models: [...modelIds],
      scenarios: [],
      counties: [],
      aggregation: "",
      percentiles: ["50ptile"],
      timePeriods: [...gwlIds],
    },
  };
}

function buildSearchFilters(selections: CustomizeSelections): ItemSearchFilters {
  const collectionFilter = `collection='${STAC_COLLECTION_ID}'`;

  const locationFilter =
    selections.counties.length > 0 ? createOrStatement("location", selections.counties) : undefined;
  const variableFilter =
    selections.variables.length > 0
      ? createOrStatement("variable", selections.variables)
      : undefined;
  const percentileFilter =
    selections.percentiles.length > 0
      ? createOrStatement("percentile", selections.percentiles)
      : undefined;
  const timePeriodFilter =
    selections.timePeriods.length > 0
      ? createOrStatement("time_period", selections.timePeriods)
      : undefined;

  return {
    collectionFilter,
    locationFilter,
    variableFilter,
    percentileFilter,
    timePeriodFilter,
  };
}

function searchFiltersKey(selections: CustomizeSelections): string {
  return stableMultiKey([
    selections.counties,
    selections.variables,
    selections.percentiles,
    selections.timePeriods,
  ]);
}

function mapItemsToBundles(
  features: CountyItem[],
  selections: CustomizeSelections
): PackageBundleMapResult {
  const selected = new Set(selections.variables);
  const bundleBySelection = new Map<string, DownloadBundle>();
  const seenAssetKeys = new Set<string>();
  let totalBytes = 0;
  const allHrefs: string[] = [];

  for (const item of features) {
    const variableId = String(item.properties.variable ?? "");
    const variableLabelRaw = item.properties.variable_label;
    const variableLabel =
      typeof variableLabelRaw === "string" && variableLabelRaw.trim().length > 0
        ? variableLabelRaw
        : labelVariable(variableId);
    if (!selected.has(variableId)) {
      continue;
    }

    const assetEntry = item.assets.data ?? item.assets[variableId] ?? Object.values(item.assets)[0];
    if (assetEntry == null) {
      continue;
    }
    const hrefRaw = typeof assetEntry.href === "string" ? assetEntry.href : "";
    const href = normalizeDownloadUrl(hrefRaw);
    if (!href) {
      continue;
    }
    const sizeBytes = parseStacAssetSizeBytes(assetEntry as Record<string, unknown>);

    const percentileRaw = String(item.properties.percentile ?? "");
    const timePeriodRaw = String(item.properties.time_period ?? "");
    const locationRaw = String(item.properties.location ?? "");
    const bundleKey = `${locationRaw}\0${timePeriodRaw}\0${percentileRaw}`;

    let bundle = bundleBySelection.get(bundleKey);
    if (bundle == null) {
      const locationLabel = humanizeToken(locationRaw);
      const gwlLabel = labelGwl(timePeriodRaw);
      const percentileLabel = labelPercentile(percentileRaw);
      bundle = {
        stacItemId: slugifyFilenameSegment(
          `standard-year-${locationRaw}-${timePeriodRaw}-${percentileRaw}`
        ),
        metaBlocks: [
          { label: "Location", value: locationLabel },
          { label: "GWLs", value: gwlLabel },
          { label: "Percentile", value: percentileLabel },
        ],
        filenameSuffix: `${percentileLabel}-${locationLabel}`,
        assets: [],
      };
      bundleBySelection.set(bundleKey, bundle);
    }

    const dedupeKey = `${bundleKey}\0${variableId}\0${href}`;
    if (seenAssetKeys.has(dedupeKey)) {
      continue;
    }
    seenAssetKeys.add(dedupeKey);

    bundle.assets.push({
      variableId,
      label: variableLabel,
      href,
      sizeBytes,
    });
    totalBytes += sizeBytes;
    allHrefs.push(href);
  }

  const bundles = Array.from(bundleBySelection.values()).filter((b) => b.assets.length > 0);
  bundles.sort((a, b) => a.stacItemId.localeCompare(b.stacItemId));

  return { bundles, totalBytes, allHrefs };
}

function validateSelections(selections: CustomizeSelections): boolean {
  return (
    selections.counties.length > 0 &&
    selections.variables.length > 0 &&
    selections.percentiles.length > 0 &&
    selections.timePeriods.length > 0
  );
}

const fields: readonly CustomizeFieldConfig[] = [
  {
    kind: "multi",
    label: "GWLs",
    placeholder: "Choose GWLs…",
    options: (config) => config.timePeriodOptions ?? [],
    value: (selections) => selections.timePeriods,
    patch: (next) => ({ timePeriods: next }),
  },
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
    label: "Percentiles",
    placeholder: "Choose percentiles…",
    options: (config) => config.percentileOptions ?? [],
    value: (selections) => selections.percentiles,
    patch: (next) => ({ percentiles: next }),
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
    selections.percentiles.join("-") ||
    "standard-year";
  return slug.toLowerCase().replace(/[^a-z0-9-]+/gi, "-");
}

export const standardYearPackage: PackageAdapter = {
  id: "standard-year",
  kind: "standard-year",
  stacCollectionId: STAC_COLLECTION_ID,
  useStacV2: true,
  needsQueryables: true,
  rail: {
    title: "Standard year",
    listDescription: "Standard Met Year profiles at stations (8760 hourly, CSV).",
  },
  messages: {
    skipped:
      "Select at least one location, GWL, variables, and percentiles on the previous step to fetch files.",
    empty:
      "No files matched your selections. Try broadening location, GWL, variables, or percentiles.",
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
