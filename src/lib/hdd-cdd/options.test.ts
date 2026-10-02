import { describe, expect, it } from "vitest";

import {
  CLIMATE_VARIABLE_OPTIONS,
  DEFAULT_SELECTIONS,
  getMetric,
  resolveSelections,
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

describe("resolveSelections", () => {
  it("returns the defaults when nothing is overridden", () => {
    expect(resolveSelections({})).toEqual(DEFAULT_SELECTIONS);
  });

  it("uses the aggregation's own default location when only the aggregation is set", () => {
    expect(resolveSelections({ spatialAggregation: "ca_watersheds" })).toEqual({
      ...DEFAULT_SELECTIONS,
      spatialAggregation: "ca_watersheds",
      location: "Lower Sacramento",
    });
  });

  it("rejects values the tool does not offer", () => {
    expect(() => resolveSelections({ climateVariable: "humidity" })).toThrow(/humidity/);
    expect(() => resolveSelections({ spatialAggregation: "zip_codes" })).toThrow(/zip_codes/);
    expect(() => resolveSelections({ location: "Imperal" })).toThrow(/Imperal/);
  });
});
