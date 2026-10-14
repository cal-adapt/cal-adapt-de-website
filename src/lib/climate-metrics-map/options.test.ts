import { describe, expect, it } from "vitest";

import {
  DEFAULT_SELECTIONS,
  resolveSelections,
  selectionsToSearchParams,
  type ValueType,
} from "./options";

describe("resolveSelections", () => {
  it("fills in defaults", () => {
    expect(resolveSelections({})).toEqual(DEFAULT_SELECTIONS);
    expect(resolveSelections({ metric: "warm-nights", gwl: 2 })).toEqual({
      metric: "warm-nights",
      valueType: "abs",
      gwl: 2,
    });
  });

  it("throws for values the tool does not offer", () => {
    expect(() => resolveSelections({ metric: "extreme-heats" })).toThrow(/extreme-heats/);
    expect(() => resolveSelections({ valueType: "pct" as ValueType })).toThrow(/pct/);
    expect(() => resolveSelections({ gwl: Number.NaN })).toThrow(/warming level/);
  });
});

describe("selectionsToSearchParams", () => {
  it("writes only the non-default params the tool reads", () => {
    const params = selectionsToSearchParams(
      resolveSelections({ metric: "warm-nights", valueType: "del", gwl: 2 })
    );
    expect(params.toString()).toBe("metric=warm-nights&valueType=del");
    expect(selectionsToSearchParams(DEFAULT_SELECTIONS).toString()).toBe("");
  });
});
