import type { MultiSelectOption, SelectOption } from "@/components/common/form";
import type { StacCollection, StacCollectionQueryables } from "@/lib/cal-adapt-api";
import { labelVariable } from "@/lib/data-download-tool/labels/variables";

import type { CustomizeFormConfig, PackageId } from "../types";

import { boundaryTypeSummaryValue } from "./spatialType";

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

function enumStrings(q: StacCollectionQueryables, key: string): string[] {
  const raw = q.properties?.[key]?.enum;
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.map((v) => String(v));
}

function labelsByVariableId(q: StacCollectionQueryables): Map<string, string> {
  const variableIds = enumStrings(q, "variable");
  const variableLabels = enumStrings(q, "variable_label");
  const entries = variableIds
    .map((id, index) => [id, variableLabels[index] ?? ""] as const)
    .filter(([, label]) => label.trim().length > 0);
  return new Map(entries);
}

/** Title-case station / variable ids for select labels. */
export function humanizeToken(id: string): string {
  return id.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildSmyReadOnlyFields(collection: StacCollection, license: string) {
  return [
    { label: "Dataset", value: collection.title?.trim() || "Standard Meteorological Year" },
    { label: "Data format", value: "CSV" },
    { label: "Boundary type", value: boundaryTypeSummaryValue(collection, "climate-profile") },
    { label: "Time span", value: formatTimeSpanLabel(collection as CollectionWithExtent) },
    { label: "License", value: license },
  ];
}

function buildTmyReadOnlyFields(collection: StacCollection, license: string) {
  return [
    { label: "Dataset", value: collection.title?.trim() || "Typical Meteorological Year" },
    { label: "Data format", value: "CSV, EPW" },
    { label: "Boundary type", value: boundaryTypeSummaryValue(collection, "climate-profile") },
    { label: "Time span", value: formatTimeSpanLabel(collection as CollectionWithExtent) },
    { label: "License", value: license },
  ];
}

/**
 * Customize form for climate-profile packages (standard-met-year / typical-met-year).
 * Options come from STAC queryables, not collection summaries.
 */
export function buildStandardMetYearCustomizeForm(
  collection: StacCollection,
  queryables: StacCollectionQueryables,
  catalogPackageId: PackageId
): CustomizeFormConfig {
  const stationIds = enumStrings(queryables, "location");
  const variableIds = enumStrings(queryables, "variable");
  const percentileIds = enumStrings(queryables, "percentile");
  const modelIds = enumStrings(queryables, "model");
  const gwlIds = enumStrings(queryables, "time_period");
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
  const license = collection.license?.trim() || "—";
  const isTmy = catalogPackageId === "typical-met-year";

  const smyInitial = {
    frequency: "",
    variables: [...variableIds],
    models: [...modelIds],
    scenarios: [],
    counties: [],
    aggregation: "",
    percentiles: ["50ptile"],
    timePeriods: [...gwlIds],
  };

  const tmyInitial = {
    frequency: "",
    variables: [],
    models: [...modelIds],
    scenarios: [],
    counties: [],
    aggregation: "",
    percentiles: [],
    timePeriods: [...gwlIds],
  };

  if (isTmy) {
    return {
      kind: "typical-met-year",
      readOnlyFields: buildTmyReadOnlyFields(collection, license),
      frequencyOptions: emptySelect,
      variableOptions: [],
      modelOptions,
      scenarioOptions: [],
      countyOptions,
      aggregationOptions: emptySelect,
      percentileOptions: [],
      timePeriodOptions,
      initial: tmyInitial,
    };
  }

  return {
    kind: "standard-met-year",
    readOnlyFields: buildSmyReadOnlyFields(collection, license),
    frequencyOptions: emptySelect,
    variableOptions,
    modelOptions: [],
    scenarioOptions: [],
    countyOptions,
    aggregationOptions: emptySelect,
    percentileOptions,
    timePeriodOptions,
    initial: smyInitial,
  };
}
