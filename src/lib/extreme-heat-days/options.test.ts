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

  it("builds tokens and rejects values outside the STAC ranges", () => {
    expect(thresholdTokenFor("absolute", 100)).toBe("100F");
    expect(thresholdTokenFor("relative", 98)).toBe("98pctl");
    expect(isAllowedThreshold("50F")).toBe(true);
    expect(isAllowedThreshold("135F")).toBe(true);
    expect(isAllowedThreshold("49F")).toBe(false);
    expect(isAllowedThreshold("136F")).toBe(false);
    expect(isAllowedThreshold("75pctl")).toBe(true);
    expect(isAllowedThreshold("99pctl")).toBe(true);
    expect(isAllowedThreshold("74pctl")).toBe(false);
    expect(isAllowedThreshold("100pctl")).toBe(false);
  });

  it("exposes the absolute and relative numeric ranges", () => {
    expect(thresholdRangeFor("absolute")).toEqual({ min: 50, max: 135 });
    expect(thresholdRangeFor("relative")).toEqual({ min: 75, max: 99 });
  });

  it("defaults relative thresholding to the 98th percentile", () => {
    expect(defaultThresholdForKind("extreme-heat-days", "relative")).toBe("98pctl");
    expect(defaultThresholdForKind("warm-nights", "absolute")).toBe("70F");
  });
});
