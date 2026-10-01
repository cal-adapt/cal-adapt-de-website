import { describe, expect, it, vi } from "vitest";

import {
  CLIMATE_VARIABLE_GROUPS,
  CLIMATE_VARIABLE_OPTIONS,
  CLIMATE_VARIABLE_SELECT_OPTIONS,
  defaultThresholdForKind,
  EH_METRICS_STAC_COLLECTION_ID,
  getHeatMetric,
  HEAT_METRICS,
  isAllowedThreshold,
  isContiguous,
  parseThresholdNumber,
  thresholdKindFor,
  thresholdRangeFor,
  thresholdTokenFor,
  thresholdValuesFor,
} from "./options";

// Every flag off, as in production, so flag-gated metrics should be hidden.
vi.mock("@/config/feature-flags", () => ({
  featureFlags: new Proxy({}, { get: () => false }),
}));

describe("threshold helpers", () => {
  it("classifies F tokens as absolute and pctl tokens as relative", () => {
    expect(thresholdKindFor("100F")).toBe("absolute");
    expect(thresholdKindFor("98pctl")).toBe("relative");
  });

  it("parses the numeric part of a threshold token", () => {
    expect(parseThresholdNumber("100F")).toBe(100);
    expect(parseThresholdNumber("98pctl")).toBe(98);
    expect(parseThresholdNumber("nope")).toBeNull();
  });

  it("builds tokens and rejects values outside the metric's allowed ranges", () => {
    expect(thresholdTokenFor("absolute", 100)).toBe("100F");
    expect(thresholdTokenFor("relative", 98)).toBe("98pctl");
    expect(isAllowedThreshold("80F", "extreme-heat-days")).toBe(true);
    expect(isAllowedThreshold("135F", "extreme-heat-days")).toBe(true);
    expect(isAllowedThreshold("79F", "extreme-heat-days")).toBe(false);
    expect(isAllowedThreshold("70F", "extreme-heat-days")).toBe(false);
    expect(isAllowedThreshold("136F", "extreme-heat-days")).toBe(false);
    expect(isAllowedThreshold("65F", "warm-nights")).toBe(true);
    expect(isAllowedThreshold("70F", "warm-nights")).toBe(true);
    expect(isAllowedThreshold("64F", "warm-nights")).toBe(false);
    expect(isAllowedThreshold("90pctl", "extreme-heat-days")).toBe(true);
    expect(isAllowedThreshold("99pctl", "warm-nights")).toBe(true);
    expect(isAllowedThreshold("89pctl", "extreme-heat-days")).toBe(false);
    expect(isAllowedThreshold("100pctl", "warm-nights")).toBe(false);
  });

  it("exposes absolute ranges per metric and a shared relative range", () => {
    expect(thresholdRangeFor("absolute", "extreme-heat-days")).toEqual({ min: 80, max: 135 });
    expect(thresholdRangeFor("absolute", "warm-nights")).toEqual({ min: 65, max: 135 });
    expect(thresholdRangeFor("relative", "extreme-heat-days")).toEqual({ min: 90, max: 99 });
    expect(thresholdRangeFor("relative", "warm-nights")).toEqual({ min: 90, max: 99 });
  });

  it("defaults relative thresholding to the 98th percentile", () => {
    expect(defaultThresholdForKind("extreme-heat-days", "relative")).toBe("98pctl");
    expect(defaultThresholdForKind("warm-nights", "relative")).toBe("98pctl");
    expect(defaultThresholdForKind("extreme-heat-days", "absolute")).toBe("100F");
    expect(defaultThresholdForKind("warm-nights", "absolute")).toBe("70F");
  });
});

describe("per-metric threshold values", () => {
  it("lists every selectable value for each kind", () => {
    expect(thresholdValuesFor("relative", "extreme-heat-days")).toEqual([
      90, 91, 92, 93, 94, 95, 96, 97, 98, 99,
    ]);
    const absolute = thresholdValuesFor("absolute", "warm-nights");
    expect(absolute[0]).toBe(65);
    expect(absolute[absolute.length - 1]).toBe(135);
    expect(absolute).toHaveLength(71);
  });

  it("detects gaps so sparse sets can use a dropdown", () => {
    expect(isContiguous([90, 91, 92])).toBe(true);
    expect(isContiguous([95, 99])).toBe(false);
    expect(isContiguous([])).toBe(true);
  });

  it("points existing metrics at the eh-metrics collection", () => {
    expect(getHeatMetric("extreme-heat-days").collectionId).toBe(EH_METRICS_STAC_COLLECTION_ID);
    expect(getHeatMetric("warm-nights").collectionId).toBe(EH_METRICS_STAC_COLLECTION_ID);
  });
});

describe("heat wave frequency thresholds", () => {
  it("uses 85-115°F and only the 95th/99th percentiles", () => {
    expect(thresholdRangeFor("absolute", "heat-wave-frequency")).toEqual({ min: 85, max: 115 });
    expect(thresholdValuesFor("relative", "heat-wave-frequency")).toEqual([95, 99]);
    expect(isAllowedThreshold("95pctl", "heat-wave-frequency")).toBe(true);
    expect(isAllowedThreshold("98pctl", "heat-wave-frequency")).toBe(false);
    expect(isAllowedThreshold("120F", "heat-wave-frequency")).toBe(false);
  });

  it("defaults to 110°F, or the 95th percentile for relative", () => {
    expect(defaultThresholdForKind("heat-wave-frequency", "absolute")).toBe("110F");
    expect(defaultThresholdForKind("heat-wave-frequency", "relative")).toBe("95pctl");
  });

  it("is unselectable while its feature flag is off", () => {
    const values = CLIMATE_VARIABLE_OPTIONS.map((option) => option.value);
    expect(values).not.toContain("heat-wave-frequency");
  });
});

describe("climate variable dropdown groups", () => {
  it("puts every metric in exactly one group", () => {
    const grouped = CLIMATE_VARIABLE_GROUPS.flatMap((group) => group.metrics.map((m) => m.value));
    expect([...grouped].sort()).toEqual(Object.keys(HEAT_METRICS).sort());
  });

  it("shows flag-off metrics as disabled 'Coming soon' entries under their heading", () => {
    expect(CLIMATE_VARIABLE_SELECT_OPTIONS.map((group) => group.label)).toEqual([
      "Extreme Heat Days",
      "Warm Nights",
      "Heat Waves",
    ]);
    const heatWaves = CLIMATE_VARIABLE_SELECT_OPTIONS.find((group) => group.label === "Heat Waves");
    expect(heatWaves?.options).toEqual([
      {
        value: "heat-wave-frequency",
        label: "Heat Wave Frequency",
        disabled: true,
        hint: "Coming soon",
      },
    ]);
  });
});
