import { describe, expect, it } from "vitest";

import { DEFAULT_SELECTIONS, type HddCddSelections } from "./options";
import { selectionsFromSearchParams, selectionsToSearchParams } from "./search-params";

describe("selectionsFromSearchParams", () => {
  it("returns the defaults for empty params", () => {
    expect(selectionsFromSearchParams(new URLSearchParams())).toEqual(DEFAULT_SELECTIONS);
  });

  it("reads valid values from their query keys", () => {
    const params = new URLSearchParams("variable=hdd&location=Fresno");
    expect(selectionsFromSearchParams(params)).toEqual({
      ...DEFAULT_SELECTIONS,
      climateVariable: "hdd",
      location: "Fresno",
    });
  });

  it("falls back to defaults for values outside the allowed set", () => {
    const params = new URLSearchParams("variable=not-a-variable&location=Atlantis");
    expect(selectionsFromSearchParams(params)).toEqual(DEFAULT_SELECTIONS);
  });

  it("validates the location against the selected aggregation's options", () => {
    const watersheds = new URLSearchParams("aggregation=ca_watersheds&location=Russian");
    expect(selectionsFromSearchParams(watersheds)).toMatchObject({
      spatialAggregation: "ca_watersheds",
      location: "Russian",
    });

    const mismatch = new URLSearchParams("aggregation=ca_watersheds&location=Fresno");
    expect(selectionsFromSearchParams(mismatch)).toMatchObject({
      spatialAggregation: "ca_watersheds",
      location: "Lower Sacramento",
    });

    const forecastZones = new URLSearchParams(
      "aggregation=forecast_zones&location=Greater Bay Area"
    );
    expect(selectionsFromSearchParams(forecastZones)).toMatchObject({
      spatialAggregation: "forecast_zones",
      location: "Greater Bay Area",
    });
  });

  it("falls back for unknown aggregations", () => {
    const params = new URLSearchParams("aggregation=ious_pous");
    expect(selectionsFromSearchParams(params).spatialAggregation).toBe(
      DEFAULT_SELECTIONS.spatialAggregation
    );
  });

  it("maps the 'variable' query key onto climateVariable", () => {
    const params = new URLSearchParams("variable=hdd");
    expect(selectionsFromSearchParams(params).climateVariable).toBe("hdd");
  });
});

describe("selectionsToSearchParams", () => {
  it("omits fields equal to their default", () => {
    expect(selectionsToSearchParams(DEFAULT_SELECTIONS).toString()).toBe("");
  });

  it("serializes only changed fields under their mapped keys", () => {
    const params = selectionsToSearchParams({
      ...DEFAULT_SELECTIONS,
      climateVariable: "hdd",
      location: "Los Angeles",
    });

    expect(params.get("variable")).toBe("hdd");
    expect(params.get("location")).toBe("Los Angeles");
    expect(params.get("aggregation")).toBeNull();
  });
});

describe("round-trip", () => {
  it("preserves a non-default county selection through to/from", () => {
    const selections: HddCddSelections = {
      ...DEFAULT_SELECTIONS,
      climateVariable: "hdd",
      location: "Imperial",
    };

    const restored = selectionsFromSearchParams(selectionsToSearchParams(selections));
    expect(restored).toEqual(selections);
  });

  it("preserves a non-default aggregation + location through to/from", () => {
    const selections: HddCddSelections = {
      ...DEFAULT_SELECTIONS,
      spatialAggregation: "electric_balancing_areas",
      location: "CALISO",
    };

    const restored = selectionsFromSearchParams(selectionsToSearchParams(selections));
    expect(restored).toEqual(selections);
  });
});
