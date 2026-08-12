import { describe, expect, it } from "vitest";

import type { StacCollection, StacCollectionQueryables, StacItem } from "@/lib/cal-adapt-api";

import type { CustomizeSelections } from "../types";

import { xmyPersistPackage } from "./xmy-persist";

function makeSelections(overrides: Partial<CustomizeSelections> = {}): CustomizeSelections {
  return {
    frequency: "",
    variables: [],
    models: ["taiesm1"],
    scenarios: [],
    counties: ["san_francisco_intl"],
    percentiles: ["95ptile"],
    timePeriods: ["present-day"],
    centeredYears: [],
    shockTypes: [],
    ...overrides,
  };
}

function makeItem(overrides: Partial<StacItem> = {}): StacItem {
  return {
    type: "Feature",
    id: "xmy-persist-item",
    geometry: null,
    links: [],
    properties: {
      location: "san_francisco_intl",
      time_period: "present-day",
      model: "taiesm1",
      percentile: "95ptile",
      "file:size": 200,
    },
    assets: { epw: { href: "https://example.com/a.epw" } },
    ...overrides,
  };
}

describe("xmyPersistPackage", () => {
  it("builds CQL2 search filters using location/model/percentile/time_period keys", () => {
    const filters = xmyPersistPackage.buildSearchFilters(makeSelections());
    expect(filters.collectionFilter).toBe("collection='xmy-persist'");
    expect(filters.locationFilter).toBe("(location='san_francisco_intl')");
    expect(filters.modelFilter).toBe("(model='taiesm1')");
    expect(filters.percentileFilter).toBe("(percentile='95ptile')");
    expect(filters.timePeriodFilter).toBe("(time_period='present-day')");
  });

  it("requires location, time periods, models, and percentiles for validateSelections", () => {
    expect(xmyPersistPackage.validateSelections(makeSelections())).toBe(true);
    expect(xmyPersistPackage.validateSelections(makeSelections({ counties: [] }))).toBe(false);
    expect(xmyPersistPackage.validateSelections(makeSelections({ timePeriods: [] }))).toBe(false);
    expect(xmyPersistPackage.validateSelections(makeSelections({ models: [] }))).toBe(false);
    expect(xmyPersistPackage.validateSelections(makeSelections({ percentiles: [] }))).toBe(false);
  });

  it("sorts percentile options numerically", () => {
    const collection = {
      type: "Collection",
      id: "xmy-persist",
      description: "",
      license: "",
    } as StacCollection;
    const queryables = {
      properties: {
        location: { enum: ["san_francisco_intl"] },
        model: { enum: ["taiesm1"] },
        percentile: { enum: ["10ptile", "40ptile", "05ptile", "60ptile", "90ptile", "95ptile"] },
        time_period: { enum: ["present-day"] },
      },
    } as unknown as StacCollectionQueryables;

    const config = xmyPersistPackage.buildCustomizeForm(collection, queryables);
    expect(config.percentileOptions?.map((o) => o.value)).toEqual([
      "05ptile",
      "10ptile",
      "40ptile",
      "60ptile",
      "90ptile",
      "95ptile",
    ]);
  });

  it("groups items by (location, time_period, model, percentile) with a Percentile meta block", () => {
    const { bundles, totalBytes } = xmyPersistPackage.mapItemsToBundles(
      [makeItem()],
      makeSelections()
    );
    expect(bundles).toHaveLength(1);
    expect(bundles[0].metaBlocks).toContainEqual({ label: "Percentile", value: "95th percentile" });
    expect(totalBytes).toBe(200);
  });
});
