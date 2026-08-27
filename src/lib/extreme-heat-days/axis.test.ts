import { describe, expect, it } from "vitest";

import { resolveYAxisMax, Y_AXIS_FALLBACK_MAX } from "./axis";

describe("resolveYAxisMax", () => {
  it("adds 20% headroom above the max of the given values", () => {
    expect(resolveYAxisMax([10, 45.5, 30])).toBeCloseTo(54.6);
  });

  it("ignores non-finite values", () => {
    expect(resolveYAxisMax([NaN, 20, Infinity, -Infinity, 35])).toBeCloseTo(42);
  });

  it("falls back to Y_AXIS_FALLBACK_MAX when the max is zero or negative", () => {
    expect(resolveYAxisMax([-10, -5])).toBe(Y_AXIS_FALLBACK_MAX);
    expect(resolveYAxisMax([0])).toBe(Y_AXIS_FALLBACK_MAX);
  });

  it("falls back to Y_AXIS_FALLBACK_MAX when there are no finite values", () => {
    expect(resolveYAxisMax([])).toBe(Y_AXIS_FALLBACK_MAX);
    expect(resolveYAxisMax([NaN, Infinity])).toBe(Y_AXIS_FALLBACK_MAX);
  });
});
