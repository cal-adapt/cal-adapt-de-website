import { describe, expect, it } from "vitest";

import {
  defaultLocationFor,
  getSpatialAggregation,
  isKnownLocation,
  isKnownSpatialAggregation,
  locationOptionsFor,
  regionLabelFor,
  SPATIAL_AGGREGATIONS,
} from "./spatial-aggregations";

describe("regionLabelFor", () => {
  it("appends ' County' for the county aggregation", () => {
    expect(regionLabelFor({ spatialAggregation: "ca_counties", location: "Sacramento" })).toBe(
      "Sacramento County"
    );
  });

  it("uses the raw location name for aggregations without a suffix", () => {
    expect(regionLabelFor({ spatialAggregation: "ca_watersheds", location: "Russian" })).toBe(
      "Russian"
    );
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

  it("gives every aggregation a default that is one of its own locations", () => {
    for (const aggregation of Object.values(SPATIAL_AGGREGATIONS)) {
      expect(isKnownLocation(aggregation.value, aggregation.defaultLocation)).toBe(true);
    }
  });
});

describe("isKnownSpatialAggregation / isKnownLocation", () => {
  it("accepts configured values and rejects others, including prototype keys", () => {
    expect(isKnownSpatialAggregation("ca_counties")).toBe(true);
    expect(isKnownSpatialAggregation("zip_codes")).toBe(false);
    expect(isKnownSpatialAggregation("toString")).toBe(false);
    expect(isKnownLocation("ca_counties", "Imperial")).toBe(true);
    expect(isKnownLocation("ca_counties", "Imperal")).toBe(false);
  });
});
