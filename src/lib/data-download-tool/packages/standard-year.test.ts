import { describe, expect, it } from "vitest";

import type { CountyItem, StacCollection, StacCollectionQueryables } from "@/lib/cal-adapt-api";

import type { CustomizeFormConfig, CustomizeSelections, DataDownloadWorkspaceData } from "../types";

import { buildSummaryRows } from "./shared";
import { standardYearPackage } from "./standard-year";

function makeSelections(overrides: Partial<CustomizeSelections> = {}): CustomizeSelections {
  return {
    frequency: "",
    variables: ["tasmax"],
    models: [],
    scenarios: [],
    counties: ["san_francisco_intl"],
    aggregation: "",
    percentiles: ["50ptile"],
    timePeriods: ["present-day"],
    ...overrides,
  };
}

function makeItem(overrides: Partial<CountyItem> = {}): CountyItem {
  return {
    type: "Feature",
    id: "sy-item",
    geometry: null,
    links: [],
    properties: {
      location: "san_francisco_intl",
      time_period: "present-day",
      percentile: "50ptile",
      variable: "tasmax",
    },
    assets: { data: { href: "https://example.com/a.csv", "file:size": 10 } },
    ...overrides,
  };
}

describe("standardYearPackage", () => {
  it("builds CQL2 search filters using the station-profile queryable keys", () => {
    const filters = standardYearPackage.buildSearchFilters(makeSelections());
    expect(filters.collectionFilter).toBe("collection='standard-year'");
    expect(filters.locationFilter).toBe("(location='san_francisco_intl')");
    expect(filters.variableFilter).toBe("(variable='tasmax')");
    expect(filters.percentileFilter).toBe("(percentile='50ptile')");
    expect(filters.timePeriodFilter).toBe("(time_period='present-day')");
  });

  it("requires location, variables, percentiles, and time periods for validateSelections", () => {
    expect(standardYearPackage.validateSelections(makeSelections())).toBe(true);
    expect(standardYearPackage.validateSelections(makeSelections({ counties: [] }))).toBe(false);
    expect(standardYearPackage.validateSelections(makeSelections({ variables: [] }))).toBe(false);
    expect(standardYearPackage.validateSelections(makeSelections({ percentiles: [] }))).toBe(false);
    expect(standardYearPackage.validateSelections(makeSelections({ timePeriods: [] }))).toBe(false);
  });

  it("throws when buildCustomizeForm is called without queryables", () => {
    const collection = {
      type: "Collection",
      id: "standard-year",
      description: "",
      license: "",
    } as StacCollection;
    expect(() => standardYearPackage.buildCustomizeForm(collection)).toThrow(
      /requires STAC v2 queryables/
    );
  });

  it("searchFiltersKey covers location, variables, percentiles, and time periods only", () => {
    const base = makeSelections();
    const key = standardYearPackage.searchFiltersKey(base);

    // Fields this package doesn't use should not change the key.
    expect(standardYearPackage.searchFiltersKey(makeSelections({ models: ["X"] }))).toBe(key);
    expect(standardYearPackage.searchFiltersKey(makeSelections({ aggregation: "max" }))).toBe(key);

    // Relevant fields must change the key.
    expect(standardYearPackage.searchFiltersKey(makeSelections({ variables: ["pr"] }))).not.toBe(
      key
    );
    expect(
      standardYearPackage.searchFiltersKey(makeSelections({ timePeriods: ["mid-century"] }))
    ).not.toBe(key);
  });

  it("buildSummaryRows derives edit-view fields into {label, value} rows after readOnlyFields", () => {
    const form: CustomizeFormConfig = {
      kind: "standard-year",
      readOnlyFields: [{ label: "Dataset", value: "Standard Year" }],
      frequencyOptions: [],
      variableOptions: [{ value: "tasmax", label: "Max Temp" }],
      modelOptions: [],
      scenarioOptions: [],
      countyOptions: [{ value: "san_francisco_intl", label: "San Francisco Intl" }],
      aggregationOptions: [],
      percentileOptions: [{ value: "50ptile", label: "50th percentile" }],
      timePeriodOptions: [{ value: "present-day", label: "Present day" }],
      initial: {
        frequency: "",
        variables: [],
        models: [],
        scenarios: [],
        counties: [],
        aggregation: "",
        percentiles: [],
        timePeriods: [],
      },
    };
    const workspace = { customizeForm: form } as DataDownloadWorkspaceData;
    const rows = buildSummaryRows(standardYearPackage, workspace, makeSelections());
    expect(rows).toEqual([
      { label: "Dataset", value: "Standard Year" },
      { label: "GWLs", value: "Present day" },
      { label: "Variables", value: "Max Temp" },
      { label: "Percentiles", value: "50th percentile" },
      { label: "Location", value: "San Francisco Intl" },
    ]);
  });

  it("groups items by (location, time_period, percentile) and dedupes identical assets", () => {
    const base = {
      location: "san_francisco_intl",
      time_period: "present-day",
      percentile: "50ptile",
      variable: "tasmax",
    };
    const items: CountyItem[] = [
      makeItem({ id: "a", properties: base }),
      makeItem({ id: "b", properties: base }), // same bundle + same href → dedupe
      makeItem({
        id: "c",
        properties: { ...base, time_period: "mid-century" }, // different bundle
        assets: { data: { href: "https://example.com/c.csv", "file:size": 20 } },
      }),
    ];

    const { bundles, totalBytes } = standardYearPackage.mapItemsToBundles(
      items,
      makeSelections({ timePeriods: ["present-day", "mid-century"] })
    );
    expect(bundles).toHaveLength(2);
    expect(totalBytes).toBe(30);
  });
});
