import { describe, expect, it } from "vitest";

import {
  CLIMATE_VARIABLE_OPTIONS,
  DEFAULT_SELECTIONS,
  defaultLocationFor,
  getMetric,
  getSpatialAggregation,
  type HddCddSelections,
  locationOptionsFor,
  regionLabelFor,
} from "./options";

describe("getMetric", () => {
  it("resolves 'cdd' to the Cooling Degree Days config with a distinct color from 'hdd'", () => {
    const cdd = getMetric("cdd");
    const hdd = getMetric("hdd");
    expect(cdd.value).toBe("cdd");
    expect(hdd.value).toBe("hdd");
    expect(cdd.color).not.toBe(hdd.color);
  });

  it("falls back to the default metric (CDD) for an unknown climateVariable", () => {
    expect(getMetric("not-a-metric")).toEqual(getMetric("cdd"));
  });
});

describe("CLIMATE_VARIABLE_OPTIONS", () => {
  it("exposes both metrics with their dropdown labels", () => {
    expect(CLIMATE_VARIABLE_OPTIONS).toEqual([
      { value: "cdd", label: "Cooling Degree Days" },
      { value: "hdd", label: "Heating Degree Days" },
    ]);
  });
});

describe("regionLabelFor", () => {
  it("appends ' County' for the county aggregation", () => {
    const selections: HddCddSelections = {
      ...DEFAULT_SELECTIONS,
      spatialAggregation: "ca_counties",
      location: "Sacramento",
    };
    expect(regionLabelFor(selections)).toBe("Sacramento County");
  });

  it("uses the raw location name for aggregations without a suffix", () => {
    const selections: HddCddSelections = {
      ...DEFAULT_SELECTIONS,
      spatialAggregation: "ca_watersheds",
      location: "Russian",
    };
    expect(regionLabelFor(selections)).toBe("Russian");
  });
});

describe("getSpatialAggregation", () => {
  it("falls back to the county aggregation for an unknown boundary", () => {
    expect(getSpatialAggregation("not-a-boundary")).toEqual(getSpatialAggregation("ca_counties"));
  });
});

describe("locationOptionsFor / defaultLocationFor", () => {
  it("returns the county options and default for the county aggregation", () => {
    expect(defaultLocationFor("ca_counties")).toBe("Sacramento");
    expect(locationOptionsFor("ca_counties")).toContainEqual({
      value: "Sacramento",
      label: "Sacramento",
    });
  });

  it("returns a different location set for the watersheds aggregation", () => {
    expect(defaultLocationFor("ca_watersheds")).toBe("Lower Sacramento");
    expect(locationOptionsFor("ca_watersheds")).not.toEqual(locationOptionsFor("ca_counties"));
  });
});
