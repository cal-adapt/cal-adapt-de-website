import { describe, expect, it } from "vitest";

import {
  defaultThresholdForKind,
  isAllowedThreshold,
  parseThresholdNumber,
  thresholdKindFor,
  thresholdRangeFor,
  thresholdTokenFor,
} from "./options";

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
