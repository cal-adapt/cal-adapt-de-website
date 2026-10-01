import { describe, expect, it } from "vitest";

import { DEFAULT_SELECTIONS } from "@/lib/extreme-heat-days/options";

import { extremeHeatSelections, extremeHeatToolHref } from "./extreme-heat-selections";

describe("extremeHeatSelections", () => {
  it("fills unspecified fields from the tool defaults", () => {
    expect(extremeHeatSelections({ location: "Imperial", threshold: "100F" })).toEqual({
      ...DEFAULT_SELECTIONS,
      location: "Imperial",
      threshold: "100F",
    });
  });

  it("rejects values the tool does not offer", () => {
    expect(() => extremeHeatSelections({ location: "Imperal" })).toThrow(/Imperal/);
    expect(() => extremeHeatSelections({ threshold: "200F" })).toThrow(/200F/);
    expect(() => extremeHeatSelections({ climateVariable: "humidity" })).toThrow(/humidity/);
    expect(() => extremeHeatSelections({ spatialAggregation: "zip_codes" })).toThrow(/zip_codes/);
  });
});

describe("extremeHeatToolHref", () => {
  it("adds only non-default selections to the query", () => {
    const selections = extremeHeatSelections({ location: "Imperial", threshold: "100F" });
    expect(extremeHeatToolHref("/dashboard/extreme-heat-days", selections)).toBe(
      "/dashboard/extreme-heat-days?location=Imperial"
    );
  });

  it("returns the bare href for default selections", () => {
    expect(extremeHeatToolHref("/dashboard/extreme-heat-days", DEFAULT_SELECTIONS)).toBe(
      "/dashboard/extreme-heat-days"
    );
  });
});
