import { describe, expect, it } from "vitest";

import {
  CLIMATE_VARIABLE_OPTIONS,
  DEFAULT_SELECTIONS,
  DURATION_OPTIONS,
  type ExtremeHeatDaysSelections,
  getHeatMetric,
  locationOptionsFor,
  SPATIAL_AGGREGATION_OPTIONS,
  thresholdTokenFor,
  thresholdValuesFor,
} from "./options";
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
    const warmNights = new URLSearchParams("variable=warm-nights&threshold=70F");
    expect(selectionsFromSearchParams(warmNights)).toMatchObject({
      climateVariable: "warm-nights",
      threshold: "70F",
    });

    const relative = new URLSearchParams("variable=extreme-heat-days&threshold=98pctl");
    expect(selectionsFromSearchParams(relative).threshold).toBe("98pctl");

    const heatDaysLow = new URLSearchParams("variable=extreme-heat-days&threshold=70F");
    expect(selectionsFromSearchParams(heatDaysLow).threshold).toBe("100F");

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

describe("duration", () => {
  it("reads a valid duration for heat wave frequency", () => {
    const params = new URLSearchParams("variable=heat-wave-frequency&threshold=110F&duration=7");
    expect(selectionsFromSearchParams(params)).toMatchObject({
      climateVariable: "heat-wave-frequency",
      threshold: "110F",
      duration: "7",
    });
  });

  it("falls back to the default for an out-of-range duration", () => {
    const params = new URLSearchParams("variable=heat-wave-frequency&duration=30");
    expect(selectionsFromSearchParams(params).duration).toBe(DEFAULT_SELECTIONS.duration);
  });

  it("writes duration only for metrics keyed by it", () => {
    const hwf: ExtremeHeatDaysSelections = {
      ...DEFAULT_SELECTIONS,
      climateVariable: "heat-wave-frequency",
      threshold: "110F",
      duration: "7",
    };
    expect(selectionsToSearchParams(hwf).get("duration")).toBe("7");
    expect(
      selectionsToSearchParams({
        ...hwf,
        climateVariable: "extreme-heat-days",
        threshold: "100F",
      }).has("duration")
    ).toBe(false);
  });
});

describe("search params round trip", () => {
  // Every valid value of each field should survive being written to the URL
  // and read back, including values that equal some other context's default
  // (e.g. 100°F, the Extreme Heat Days default, on Warm Nights).
  function expectRoundTrip(selections: ExtremeHeatDaysSelections) {
    expect(selectionsFromSearchParams(selectionsToSearchParams(selections))).toEqual(selections);
  }

  it("keeps every threshold of every variable", () => {
    for (const { value: climateVariable } of CLIMATE_VARIABLE_OPTIONS) {
      for (const kind of ["absolute", "relative"] as const) {
        for (const n of thresholdValuesFor(kind, climateVariable)) {
          expectRoundTrip({
            ...DEFAULT_SELECTIONS,
            climateVariable,
            threshold: thresholdTokenFor(kind, n),
          });
        }
      }
    }
  });

  it("keeps every location of every aggregation", () => {
    for (const { value: spatialAggregation } of SPATIAL_AGGREGATION_OPTIONS) {
      for (const { value: location } of locationOptionsFor(spatialAggregation)) {
        expectRoundTrip({ ...DEFAULT_SELECTIONS, spatialAggregation, location });
      }
    }
  });

  it("keeps every duration for variables that use one", () => {
    const climateVariable = CLIMATE_VARIABLE_OPTIONS.find(
      ({ value }) => getHeatMetric(value).usesDuration
    )!.value;
    for (const { value: duration } of DURATION_OPTIONS) {
      expectRoundTrip({
        ...DEFAULT_SELECTIONS,
        climateVariable,
        threshold: getHeatMetric(climateVariable).defaultThreshold,
        duration,
      });
    }
  });

  it("omits a threshold equal to the variable's own default", () => {
    const selections = { ...DEFAULT_SELECTIONS, climateVariable: "warm-nights", threshold: "70F" };
    expect(selectionsToSearchParams(selections).has("threshold")).toBe(false);
  });
});
