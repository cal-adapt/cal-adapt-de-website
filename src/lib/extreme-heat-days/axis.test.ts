import { describe, expect, it } from "vitest";

import { buildTickValues, niceCeil, Y_AXIS_FALLBACK_MAX } from "./axis";

describe("niceCeil", () => {
  it("rounds up to a nice 1/2/2.5/5/10 × 10ⁿ maximum", () => {
    expect(niceCeil(1)).toBe(1);
    expect(niceCeil(1.1)).toBe(2);
    expect(niceCeil(2)).toBe(2);
    expect(niceCeil(2.1)).toBe(2.5);
    expect(niceCeil(4)).toBe(5);
    expect(niceCeil(6)).toBe(10);
    expect(niceCeil(155)).toBe(200);
    expect(niceCeil(60)).toBe(100);
  });

  it("falls back for non-positive or non-finite input", () => {
    expect(niceCeil(0)).toBe(Y_AXIS_FALLBACK_MAX);
    expect(niceCeil(-5)).toBe(Y_AXIS_FALLBACK_MAX);
    expect(niceCeil(NaN)).toBe(Y_AXIS_FALLBACK_MAX);
    expect(niceCeil(Infinity)).toBe(Y_AXIS_FALLBACK_MAX);
  });
});

describe("buildTickValues", () => {
  it("returns 0..max at the given step, including max when it lands on the step", () => {
    expect(buildTickValues(160, 25)).toEqual([0, 25, 50, 75, 100, 125, 150]);
    expect(buildTickValues(260, 50)).toEqual([0, 50, 100, 150, 200, 250]);
    expect(buildTickValues(100, 25)).toEqual([0, 25, 50, 75, 100]);
  });

  it("tolerates floating-point drift so the final tick isn't dropped", () => {
    expect(buildTickValues(0.3, 0.1)).toEqual([0, 0.1, 0.2, 0.3]);
  });

  it("returns undefined when no positive step or usable max is given", () => {
    expect(buildTickValues(160)).toBeUndefined();
    expect(buildTickValues(160, 0)).toBeUndefined();
    expect(buildTickValues(160, -5)).toBeUndefined();
    expect(buildTickValues(0, 25)).toBeUndefined();
    expect(buildTickValues(NaN, 25)).toBeUndefined();
  });
});
