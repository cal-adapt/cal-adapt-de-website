import { describe, expect, it } from "vitest";

import type { StacCollection, StacCollectionQueryables, StacItem } from "@/lib/cal-adapt-api";

import type { CustomizeFormConfig, CustomizeSelections, DataDownloadWorkspaceData } from "../types";

import { buildSummaryRows } from "./shared";
import { typicalMetYearPackage } from "./typical-met-year";

function makeSelections(overrides: Partial<CustomizeSelections> = {}): CustomizeSelections {
  return {
    frequency: "",
    variables: [],
    models: ["ACCESS-CM2"],
    scenarios: [],
    counties: ["san_francisco_intl"],
    percentiles: [],
    timePeriods: ["present-day"],
    ...overrides,
  };
}

function makeItem(overrides: Partial<StacItem> = {}): StacItem {
  return {
    type: "Feature",
    id: "tmy-item",
    geometry: null,
    links: [],
    properties: {
      location: "san_francisco_intl",
      time_period: "present-day",
      model: "ACCESS-CM2",
    },
    assets: {
      epw: { href: "https://example.com/a.epw", "file:size": 100 },
      csv: { href: "https://example.com/a.csv", "file:size": 50 },
    },
    ...overrides,
  };
}

describe("typicalMetYearPackage", () => {
  it("builds CQL2 search filters using location/model/time_period keys", () => {
    const filters = typicalMetYearPackage.buildSearchFilters(makeSelections());
    expect(filters.collectionFilter).toBe("collection='typical-met-year'");
    expect(filters.locationFilter).toBe("(location='san_francisco_intl')");
    expect(filters.modelFilter).toBe("(model='ACCESS-CM2')");
    expect(filters.timePeriodFilter).toBe("(time_period='present-day')");
  });

  it("requires location, time periods, and models for validateSelections", () => {
    expect(typicalMetYearPackage.validateSelections(makeSelections())).toBe(true);
    expect(typicalMetYearPackage.validateSelections(makeSelections({ counties: [] }))).toBe(false);
    expect(typicalMetYearPackage.validateSelections(makeSelections({ timePeriods: [] }))).toBe(
      false
    );
    expect(typicalMetYearPackage.validateSelections(makeSelections({ models: [] }))).toBe(false);
  });

  it("throws when buildCustomizeForm is called without queryables", () => {
    const collection = {
      type: "Collection",
      id: "typical-met-year",
      description: "",
      license: "",
    } as StacCollection;
    expect(() => typicalMetYearPackage.buildCustomizeForm(collection)).toThrow(
      /requires STAC v2 queryables/
    );
  });

  it("searchFiltersKey covers location, models, and time periods only", () => {
    const base = makeSelections();
    const key = typicalMetYearPackage.searchFiltersKey(base);

    // Fields this package doesn't use should not change the key.
    expect(typicalMetYearPackage.searchFiltersKey(makeSelections({ variables: ["tasmax"] }))).toBe(
      key
    );
    expect(
      typicalMetYearPackage.searchFiltersKey(makeSelections({ percentiles: ["50ptile"] }))
    ).toBe(key);

    // Relevant fields must change the key.
    expect(
      typicalMetYearPackage.searchFiltersKey(makeSelections({ models: ["MPI-ESM1-2-HR"] }))
    ).not.toBe(key);
    expect(
      typicalMetYearPackage.searchFiltersKey(makeSelections({ timePeriods: ["mid-century"] }))
    ).not.toBe(key);
  });

  it("buildSummaryRows derives edit-view fields into {label, value} rows after readOnlyFields", () => {
    const form: CustomizeFormConfig = {
      kind: "typical-met-year",
      readOnlyFields: [{ label: "Dataset", value: "Typical Met Year" }],
      frequencyOptions: [],
      variableOptions: [],
      modelOptions: [{ value: "ACCESS-CM2", label: "ACCESS-CM2" }],
      scenarioOptions: [],
      countyOptions: [{ value: "san_francisco_intl", label: "San Francisco Intl" }],
      timePeriodOptions: [{ value: "present-day", label: "Present day" }],
      initial: {
        frequency: "",
        variables: [],
        models: [],
        scenarios: [],
        counties: [],
        percentiles: [],
        timePeriods: [],
      },
    };
    const workspace = { customizeForm: form } as DataDownloadWorkspaceData;
    const rows = buildSummaryRows(typicalMetYearPackage, workspace, makeSelections());
    expect(rows).toEqual([
      { label: "Dataset", value: "Typical Met Year" },
      { label: "GWLs", value: "Present day" },
      { label: "Models", value: "ACCESS-CM2" },
      { label: "Location", value: "San Francisco Intl" },
    ]);
  });

  it("orders GWL options chronologically regardless of queryables order", () => {
    const collection = {
      type: "Collection",
      id: "typical-met-year",
      description: "",
      license: "",
    } as StacCollection;
    const queryables = {
      properties: {
        location: { enum: ["san_francisco_intl"] },
        model: { enum: ["ACCESS-CM2"] },
        // Intentionally shuffled and including an unknown id to verify sorting.
        time_period: {
          enum: ["mid-late-century", "future-extreme", "present-day", "mid-century", "near-future"],
        },
      },
    } as unknown as StacCollectionQueryables;

    const config = typicalMetYearPackage.buildCustomizeForm(collection, queryables);
    expect(config.timePeriodOptions?.map((o) => o.value)).toEqual([
      "present-day",
      "near-future",
      "mid-century",
      "mid-late-century",
      "future-extreme",
    ]);
    expect(config.initial.timePeriods).toEqual([
      "present-day",
      "near-future",
      "mid-century",
      "mid-late-century",
      "future-extreme",
    ]);
  });

  it("emits one asset per file type per (location, time_period, model) bundle", () => {
    const { bundles, totalBytes } = typicalMetYearPackage.mapItemsToBundles(
      [makeItem()],
      makeSelections()
    );
    expect(bundles).toHaveLength(1);
    expect(bundles[0].assets.map((a) => a.label).sort()).toEqual(["CSV", "EPW"]);
    expect(totalBytes).toBe(150);
  });
});
