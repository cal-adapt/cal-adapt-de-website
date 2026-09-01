import { describe, expect, it } from "vitest";

import { DEFAULT_SELECTIONS, type ExtremeHeatDaysSelections } from "./options";
import { selectionsFromSearchParams, selectionsToSearchParams } from "./search-params";

describe("selectionsFromSearchParams", () => {
  it("returns the defaults for empty params", () => {
    expect(selectionsFromSearchParams(new URLSearchParams())).toEqual(DEFAULT_SELECTIONS);
  });

  it("reads valid values from their query keys", () => {
    const params = new URLSearchParams("location=Fresno&threshold=105F");
    expect(selectionsFromSearchParams(params)).toEqual({
      ...DEFAULT_SELECTIONS,
      location: "Fresno",
      threshold: "105F",
    });
  });

  it("falls back to defaults for values outside the allowed set", () => {
    const params = new URLSearchParams("location=Atlantis&threshold=999F");
    expect(selectionsFromSearchParams(params)).toEqual(DEFAULT_SELECTIONS);
  });

  it("validates the location against the selected aggregation's options", () => {
    const forecastZones = new URLSearchParams(
      "aggregation=forecast_zones&location=Greater Bay Area"
    );
    expect(selectionsFromSearchParams(forecastZones)).toMatchObject({
      spatialAggregation: "forecast_zones",
      location: "Greater Bay Area",
    });

    const mismatch = new URLSearchParams("aggregation=forecast_zones&location=Fresno");
    expect(selectionsFromSearchParams(mismatch)).toMatchObject({
      spatialAggregation: "forecast_zones",
      location: "Greater Bay Area",
    });

    const watersheds = new URLSearchParams("aggregation=ca_watersheds&location=Russian");
    expect(selectionsFromSearchParams(watersheds)).toMatchObject({
      spatialAggregation: "ca_watersheds",
      location: "Russian",
    });
  });

  it("falls back for unknown aggregations", () => {
    const params = new URLSearchParams("aggregation=ious_pous");
    expect(selectionsFromSearchParams(params).spatialAggregation).toBe(
      DEFAULT_SELECTIONS.spatialAggregation
    );
  });

  it("maps the 'variable' query key onto climateVariable", () => {
    // Unknown variable → default; proves the field is read under "variable".
    const params = new URLSearchParams("variable=not-a-variable");
    expect(selectionsFromSearchParams(params).climateVariable).toBe(
      DEFAULT_SELECTIONS.climateVariable
    );
  });

  it("validates the threshold against the selected metric's options", () => {
    const warmNights = new URLSearchParams("variable=warm-nights&threshold=80F");
    expect(selectionsFromSearchParams(warmNights)).toMatchObject({
      climateVariable: "warm-nights",
      threshold: "80F",
    });

    const relative = new URLSearchParams("variable=extreme-heat-days&threshold=98pctl");
    expect(selectionsFromSearchParams(relative).threshold).toBe("98pctl");

    const heatDays = new URLSearchParams("variable=extreme-heat-days&threshold=40F");
    expect(selectionsFromSearchParams(heatDays).threshold).toBe("100F");
  });

  it("falls back to the metric default threshold for warm nights when omitted", () => {
    const params = new URLSearchParams("variable=warm-nights");
    expect(selectionsFromSearchParams(params).threshold).toBe("70F");
  });
});

describe("selectionsToSearchParams", () => {
  it("omits fields equal to their default", () => {
    expect(selectionsToSearchParams(DEFAULT_SELECTIONS).toString()).toBe("");
  });

  it("serializes only changed fields under their mapped keys", () => {
    const params = selectionsToSearchParams({
      ...DEFAULT_SELECTIONS,
      location: "Los Angeles",
      threshold: "105F",
    });

    expect(params.get("location")).toBe("Los Angeles");
    expect(params.get("threshold")).toBe("105F");
    expect(params.get("variable")).toBeNull();
    expect(params.get("indicator")).toBeNull();
  });
});

describe("round-trip", () => {
  it("preserves a non-default county selection through to/from", () => {
    const selections: ExtremeHeatDaysSelections = {
      ...DEFAULT_SELECTIONS,
      location: "Imperial",
      threshold: "105F",
    };

    const restored = selectionsFromSearchParams(selectionsToSearchParams(selections));
    expect(restored).toEqual(selections);
  });

  it("preserves a non-default aggregation + location through to/from", () => {
    const selections: ExtremeHeatDaysSelections = {
      ...DEFAULT_SELECTIONS,
      spatialAggregation: "electric_balancing_areas",
      location: "CALISO",
    };

    const restored = selectionsFromSearchParams(selectionsToSearchParams(selections));
    expect(restored).toEqual(selections);
  });
});
