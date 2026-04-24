import { describe, expect, it } from "vitest";

import type { CountyItem } from "@/lib/cal-adapt-api";

import type { CustomizeFormConfig, CustomizeSelections, DataDownloadWorkspaceData } from "../types";

import { loca2CountyPackage } from "./loca2-county";
import { buildSummaryRows } from "./shared";

function makeSelections(overrides: Partial<CustomizeSelections> = {}): CustomizeSelections {
  return {
    frequency: "monthly",
    variables: ["tasmax"],
    models: ["ACCESS-CM2"],
    scenarios: ["ssp370"],
    counties: ["Alameda County"],
    aggregation: "mean",
    percentiles: [],
    timePeriods: [],
    ...overrides,
  };
}

function makeItem(overrides: Partial<CountyItem> = {}): CountyItem {
  return {
    type: "Feature",
    id: "loca2.ACCESS-CM2.ssp370.mon",
    geometry: null,
    links: [],
    properties: { county_name: "Alameda County" },
    assets: { tasmax: { href: "https://example.com/tasmax.nc", "file:size": 100 } },
    ...overrides,
  };
}

describe("loca2CountyPackage", () => {
  it("builds CQL2 search filters with the correct STAC v2 property keys", () => {
    const filters = loca2CountyPackage.buildSearchFilters(makeSelections({ frequency: "daily" }));
    expect(filters.collectionFilter).toBe("collection='loca2-county'");
    expect(filters.countyFilter).toBe("(county_name='Alameda County')");
    expect(filters.modelFilter).toBe("(cmip6:source_id='ACCESS-CM2')");
    expect(filters.scenarioFilter).toBe("(cmip6:experiment_id='ssp370')");
    expect(filters.cmip6TableIdFilter).toBe("cmip6:table_id = 'day'");
  });

  it("requires all four dimensions for validateSelections", () => {
    expect(loca2CountyPackage.validateSelections(makeSelections())).toBe(true);
    expect(loca2CountyPackage.validateSelections(makeSelections({ counties: [] }))).toBe(false);
    expect(loca2CountyPackage.validateSelections(makeSelections({ variables: [] }))).toBe(false);
    expect(loca2CountyPackage.validateSelections(makeSelections({ models: [] }))).toBe(false);
    expect(loca2CountyPackage.validateSelections(makeSelections({ scenarios: [] }))).toBe(false);
  });

  it("maps STAC items into bundles with href normalization and size totals", () => {
    const item = makeItem({
      assets: {
        tasmax: { href: "s3://cal-adapt/tasmax.nc", "file:size": 100 },
        tasmin: { href: "https://example.com/tasmin.nc", "file:size": 50 },
      },
    });
    const { bundles, totalBytes, allHrefs } = loca2CountyPackage.mapItemsToBundles(
      [item],
      makeSelections({ variables: ["tasmax"] })
    );
    expect(bundles).toHaveLength(1);
    expect(bundles[0].assets.map((a) => a.variableId)).toEqual(["tasmax"]);
    expect(bundles[0].assets[0].href).toBe("https://cal-adapt.s3.amazonaws.com/tasmax.nc");
    expect(totalBytes).toBe(100);
    expect(allHrefs).toHaveLength(1);
  });

  it("searchFiltersKey ignores aggregation but tracks variables (which affect client-side mapping)", () => {
    const base = makeSelections();
    const key = loca2CountyPackage.searchFiltersKey(base);

    // Irrelevant field: key should be unchanged.
    expect(loca2CountyPackage.searchFiltersKey(makeSelections({ aggregation: "max" }))).toBe(key);

    // Relevant fields: key must change.
    expect(loca2CountyPackage.searchFiltersKey(makeSelections({ variables: ["pr"] }))).not.toBe(
      key
    );
    expect(loca2CountyPackage.searchFiltersKey(makeSelections({ frequency: "daily" }))).not.toBe(
      key
    );

    // Array order doesn't matter.
    expect(
      loca2CountyPackage.searchFiltersKey(
        makeSelections({ models: ["ACCESS-CM2", "MPI-ESM1-2-HR"] })
      )
    ).toBe(
      loca2CountyPackage.searchFiltersKey(
        makeSelections({ models: ["MPI-ESM1-2-HR", "ACCESS-CM2"] })
      )
    );
  });

  it("buildSummaryRows derives edit-view fields into {label, value} rows after readOnlyFields", () => {
    const form: CustomizeFormConfig = {
      kind: "loca2-county",
      readOnlyFields: [{ label: "Dataset", value: "LOCA2" }],
      frequencyOptions: [{ value: "monthly", label: "Monthly" }],
      variableOptions: [{ value: "tasmax", label: "Max Temp" }],
      modelOptions: [{ value: "ACCESS-CM2", label: "ACCESS-CM2" }],
      scenarioOptions: [{ value: "ssp370", label: "SSP3-7.0" }],
      countyOptions: [{ value: "Alameda County", label: "Alameda County" }],
      aggregationOptions: [{ value: "mean", label: "Mean" }],
      initial: {
        frequency: "monthly",
        variables: [],
        models: [],
        scenarios: [],
        counties: [],
        aggregation: "mean",
        percentiles: [],
        timePeriods: [],
      },
    };
    const workspace = { customizeForm: form } as DataDownloadWorkspaceData;
    const rows = buildSummaryRows(loca2CountyPackage, workspace, makeSelections());
    expect(rows).toEqual([
      { label: "Dataset", value: "LOCA2" },
      { label: "Variables", value: "Max Temp" },
      { label: "Models", value: "ACCESS-CM2" },
      { label: "Scenarios", value: "SSP3-7.0" },
      { label: "Counties", value: "Alameda County" },
      { label: "Frequency", value: "Monthly" },
      { label: "Aggregation", value: "Mean" },
    ]);
  });

  it("falls back to the v1 `countyname` property and parses model/scenario from the item id", () => {
    const item = makeItem({
      id: "loca2.MPI-ESM1-2-HR.historical.mon",
      properties: { countyname: "Legacy County" },
    });
    const { bundles } = loca2CountyPackage.mapItemsToBundles([item], makeSelections());
    expect(bundles[0].metaBlocks).toEqual(
      expect.arrayContaining([
        { label: "Model", value: "MPI-ESM1-2-HR" },
        { label: "Scenario", value: "Historical" },
        { label: "Boundary", value: "Legacy County" },
      ])
    );
  });
});
