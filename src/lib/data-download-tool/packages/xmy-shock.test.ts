import { describe, expect, it } from "vitest";

import type { StacCollection, StacCollectionQueryables, StacItem } from "@/lib/cal-adapt-api";

import type { CustomizeSelections } from "../types";

import { xmyShockPackage } from "./xmy-shock";

function makeSelections(overrides: Partial<CustomizeSelections> = {}): CustomizeSelections {
  return {
    frequency: "",
    variables: [],
    models: ["taiesm1"],
    scenarios: [],
    counties: ["san_francisco_intl"],
    percentiles: [],
    timePeriods: ["present-day"],
    centeredYears: [],
    shockTypes: ["hot"],
    ...overrides,
  };
}

function makeItem(overrides: Partial<StacItem> = {}): StacItem {
  return {
    type: "Feature",
    id: "xmy-shock-item",
    geometry: null,
    links: [],
    properties: {
      location: "san_francisco_intl",
      time_period: "present-day",
      model: "taiesm1",
      shock_type: "hot",
      "file:size": 300,
    },
    assets: { epw: { href: "https://example.com/a.epw" } },
    ...overrides,
  };
}

describe("xmyShockPackage", () => {
  it("builds CQL2 search filters using location/model/time_period/shock_type keys", () => {
    const filters = xmyShockPackage.buildSearchFilters(makeSelections());
    expect(filters.collectionFilter).toBe("collection='xmy-shock'");
    expect(filters.locationFilter).toBe("(location='san_francisco_intl')");
    expect(filters.modelFilter).toBe("(model='taiesm1')");
    expect(filters.timePeriodFilter).toBe("(time_period='present-day')");
    expect(filters.shockTypeFilter).toBe("(shock_type='hot')");
  });

  it("requires location, time periods, models, and shock types for validateSelections", () => {
    expect(xmyShockPackage.validateSelections(makeSelections())).toBe(true);
    expect(xmyShockPackage.validateSelections(makeSelections({ counties: [] }))).toBe(false);
    expect(xmyShockPackage.validateSelections(makeSelections({ timePeriods: [] }))).toBe(false);
    expect(xmyShockPackage.validateSelections(makeSelections({ models: [] }))).toBe(false);
    expect(xmyShockPackage.validateSelections(makeSelections({ shockTypes: [] }))).toBe(false);
  });

  it("defaults to both shock types and orders them cold before hot", () => {
    const collection = {
      type: "Collection",
      id: "xmy-shock",
      description: "",
      license: "",
    } as StacCollection;
    const queryables = {
      properties: {
        location: { enum: ["san_francisco_intl"] },
        model: { enum: ["taiesm1"] },
        shock_type: { enum: ["hot", "cold"] },
        time_period: { enum: ["present-day"] },
      },
    } as unknown as StacCollectionQueryables;

    const config = xmyShockPackage.buildCustomizeForm(collection, queryables);
    expect(config.shockTypeOptions).toEqual([
      { value: "cold", label: "Cold shock" },
      { value: "hot", label: "Hot shock" },
    ]);
    expect(config.initial.shockTypes).toEqual(["cold", "hot"]);
  });

  it("groups items by (location, time_period, model, shock_type) with a Shock type meta block", () => {
    const { bundles, totalBytes } = xmyShockPackage.mapItemsToBundles(
      [makeItem()],
      makeSelections()
    );
    expect(bundles).toHaveLength(1);
    expect(bundles[0].metaBlocks).toContainEqual({ label: "Shock type", value: "Hot shock" });
    expect(totalBytes).toBe(300);
  });
});
