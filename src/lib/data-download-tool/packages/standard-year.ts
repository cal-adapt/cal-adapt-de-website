import type { MultiSelectOption, SelectOption } from "@/components/common/form";
import {
  type ItemSearchFilters,
  orFilter,
  orFilterNumeric,
  type StacCollection,
  type StacCollectionQueryables,
  type StacItem,
} from "@/lib/cal-adapt-api";
import { toSentenceCase } from "@/utils/string";
import { normalizeDownloadUrl } from "@/utils/url";

import { labelGwl, sortGwlIds } from "../labels/gwls";
import { labelPercentile, sortPercentileIds } from "../labels/percentiles";
import { labelVariable } from "../labels/variables";
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

const STAC_COLLECTION_ID = "standard-year" as const;

/**
 * Standard Year exposes two computation approaches via the `time_period` queryable:
 * GWLs and time-based (years) where items additionally keyed by `centered_year`.
 * Only 50th percentile has a time-based approach.
 */
const TIME_BASED_PERIOD = "time-based" as const;

// `gwl` filters on the warming-level `time_period`s; `time-based` filters on
// `time_period='time-based'` + `centered_year`. Only one branch is shown at a time.
const APPROACH_GWL = "gwl" as const;
const APPROACH_TIME_BASED = "time-based" as const;

const APPROACH_OPTIONS: SelectOption[] = [
  { value: APPROACH_GWL, label: "Global warming level" },
  { value: APPROACH_TIME_BASED, label: "Time-based (years)" },
];

function isTimeBasedApproach(selections: CustomizeSelections): boolean {
  return selections.computationApproach === APPROACH_TIME_BASED;
}

/** Percentiles published for the time-based approach (only the median today). */
const TIME_BASED_PERCENTILE_IDS: readonly string[] = ["50ptile"];

function isTimeBasedPercentile(id: string): boolean {
  return TIME_BASED_PERCENTILE_IDS.includes(id.toLowerCase());
}

function sortCenteredYearIds(ids: readonly string[]): string[] {
  return [...ids].sort((a, b) => Number(a) - Number(b));
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

  const rawLabels = collection["caladapt:variable_labels"];
  const variableLabelById: Map<string, string> =
    rawLabels != null && typeof rawLabels === "object" && !Array.isArray(rawLabels)
      ? new Map(Object.entries(rawLabels as Record<string, string>))
      : new Map();
  let variableIds = [...variableLabelById.keys()];
  if (variableIds.length === 0) {
    variableIds = enumStringsFromStacQueryables(queryables, "variable");
  }

  const stationIds = enumStringsFromStacQueryables(queryables, "location");
  const percentileIds = sortPercentileIds(enumStringsFromStacQueryables(queryables, "percentile"));
  const modelIds = enumStringsFromStacQueryables(queryables, "model");
  // `time-based` is a mode marker, not a warming level — surface it as the separate "Years" field.
  const gwlIds = sortGwlIds(
    enumStringsFromStacQueryables(queryables, "time_period").filter(
      (id) => id !== TIME_BASED_PERIOD
    )
  );
  const centeredYearIds = sortCenteredYearIds(
    enumStringsFromStacQueryables(queryables, "centered_year")
  );

  const stationLabels = stationLabelsFromCollection(collection);
  const countyOptions: MultiSelectOption[] = stationIds.map((id) => ({
    value: id,
    label: labelStation(id, stationLabels),
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

  const centeredYearOptions: MultiSelectOption[] = centeredYearIds.map((id) => ({
    value: id,
    label: id,
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
    percentileOptions,
    timePeriodOptions,
    centeredYearOptions,
    initial: {
      frequency: "",
      variables: [...variableIds],
      models: [...modelIds],
      scenarios: [],
      counties: [],
      percentiles: [...percentileIds],
      timePeriods: [...gwlIds],
      centeredYears: [],
      shockTypes: [],
      computationApproach: APPROACH_GWL,
    },
  };
}

function buildSearchFilters(selections: CustomizeSelections): ItemSearchFilters {
  const collectionFilter = `collection='${STAC_COLLECTION_ID}'`;

  const locationFilter =
    selections.counties.length > 0 ? orFilter("location", selections.counties) : undefined;
  const variableFilter =
    selections.variables.length > 0 ? orFilter("variable", selections.variables) : undefined;
  const percentileFilter =
    selections.percentiles.length > 0 ? orFilter("percentile", selections.percentiles) : undefined;

  // The active approach — not stale selections — decides which time filters apply.
  const timeBased = isTimeBasedApproach(selections);
  const timePeriodFilter = timeBased
    ? `time_period='${TIME_BASED_PERIOD}'`
    : selections.timePeriods.length > 0
      ? orFilter("time_period", selections.timePeriods)
      : undefined;
  const centeredYearFilter =
    timeBased && selections.centeredYears.length > 0
      ? orFilterNumeric("centered_year", selections.centeredYears)
      : undefined;

  return {
    collectionFilter,
    locationFilter,
    variableFilter,
    percentileFilter,
    timePeriodFilter,
    centeredYearFilter,
  };
}

function searchFiltersKey(selections: CustomizeSelections): string {
  return stableMultiKey([
    [selections.computationApproach ?? APPROACH_GWL],
    selections.counties,
    selections.variables,
    selections.percentiles,
    selections.timePeriods,
    selections.centeredYears,
  ]);
}

function mapItemsToBundles(
  features: StacItem[],
  selections: CustomizeSelections,
  customizeForm?: CustomizeFormConfig
): PackageBundleMapResult {
  const selected = new Set(selections.variables);
  const labelById = new Map(
    (customizeForm?.variableOptions ?? []).map(({ value, label }) => [value, label])
  );
  const locationLabelById = new Map(
    (customizeForm?.countyOptions ?? []).map(({ value, label }) => [value, label])
  );
  const bundleBySelection = new Map<string, DownloadBundle>();
  const seenAssetKeys = new Set<string>();
  let totalBytes = 0;
  const allHrefs: string[] = [];

  for (const item of features) {
    const variableId = String(item.properties.variable ?? "");
    const variableLabel = labelById.get(variableId) ?? labelVariable(variableId);
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
    const sizeBytes =
      parseStacAssetSizeBytes(assetEntry as Record<string, unknown>) ||
      parseStacFileSizeBytes(item.properties["file:size"]);

    const percentileRaw = String(item.properties.percentile ?? "");
    const timePeriodRaw = String(item.properties.time_period ?? "");
    const centeredYearRaw =
      item.properties.centered_year != null ? String(item.properties.centered_year) : "";
    const locationRaw = String(item.properties.location ?? "");
    const bundleKey = `${locationRaw}\0${timePeriodRaw}\0${centeredYearRaw}\0${percentileRaw}`;

    let bundle = bundleBySelection.get(bundleKey);
    if (bundle == null) {
      const locationLabel = locationLabelById.get(locationRaw) ?? humanizeToken(locationRaw);
      const percentileLabel = labelPercentile(percentileRaw);
      const isTimeBased = timePeriodRaw === TIME_BASED_PERIOD || centeredYearRaw !== "";
      const periodBlock = isTimeBased
        ? { label: "Year", value: centeredYearRaw || "—" }
        : { label: "Global Warming Levels", value: labelGwl(timePeriodRaw) };
      bundle = {
        stacItemId: slugifyFilenameSegment(
          `standard-year-${locationRaw}-${timePeriodRaw}-${centeredYearRaw}-${percentileRaw}`
        ),
        metaBlocks: [
          { label: "Location", value: locationLabel },
          periodBlock,
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
  const base =
    selections.counties.length > 0 &&
    selections.variables.length > 0 &&
    selections.percentiles.length > 0;
  return isTimeBasedApproach(selections)
    ? base && selections.centeredYears.length > 0
    : base && selections.timePeriods.length > 0;
}

const fields: readonly CustomizeFieldConfig[] = [
  {
    kind: "single",
    label: "Computation approach",
    options: () => APPROACH_OPTIONS,
    value: (selections) => selections.computationApproach ?? APPROACH_GWL,
    // Entering the time-based approach prunes non-median percentiles, since only
    // the 50th exists there.
    patch: (next, selections) => {
      if (next === APPROACH_TIME_BASED) {
        const median = selections.percentiles.filter(isTimeBasedPercentile);
        return {
          computationApproach: APPROACH_TIME_BASED,
          percentiles: median.length > 0 ? median : [...TIME_BASED_PERCENTILE_IDS],
        };
      }
      return { computationApproach: APPROACH_GWL };
    },
  },
  {
    kind: "multi",
    label: "Global Warming Levels",
    placeholder: "Choose global warming levels…",
    visible: (selections) => !isTimeBasedApproach(selections),
    options: (config) => config.timePeriodOptions ?? [],
    value: (selections) => selections.timePeriods,
    patch: (next) => ({ timePeriods: next }),
  },
  {
    kind: "multi",
    label: "Years",
    placeholder: "Choose years (time-based)…",
    visible: (selections) => isTimeBasedApproach(selections),
    options: (config) => config.centeredYearOptions ?? [],
    value: (selections) => selections.centeredYears,
    patch: (next) => ({ centeredYears: next }),
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
    // Time-based data is only published at the 50th percentile.
    options: (config, selections) => {
      const all = config.percentileOptions ?? [];
      return isTimeBasedApproach(selections)
        ? all.filter((o) => isTimeBasedPercentile(o.value))
        : all;
    },
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
    (isTimeBasedApproach(selections)
      ? selections.centeredYears.join("-")
      : selections.timePeriods.join("-").replace(/\s+/g, "-")) ||
    selections.percentiles.join("-") ||
    "standard-year";
  return slug.toLowerCase().replace(/[^a-z0-9-]+/gi, "-");
}

export const standardYearPackage: PackageAdapter = {
  id: "standard-year",
  kind: "standard-year",
  stacCollectionId: STAC_COLLECTION_ID,
  needsQueryables: true,
  rail: {
    title: "Standard year",
    listDescription: "Standard Met Year profiles at stations (8760 hourly, CSV).",
  },
  messages: {
    skipped:
      "Select at least one location, GWL (or year), variables, and percentiles on the previous step to fetch files.",
    empty:
      "No files matched your selections. Try broadening location, GWL/year, variables, or percentiles.",
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
