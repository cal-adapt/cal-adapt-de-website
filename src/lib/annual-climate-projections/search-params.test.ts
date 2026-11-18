import { describe, expect, it } from "vitest";

import { DEFAULT_SELECTIONS } from "./options";
import { selectionsFromSearchParams, selectionsToSearchParams } from "./search-params";

describe("selectionsFromSearchParams", () => {
  it("returns the defaults for empty params", () => {
    expect(selectionsFromSearchParams(new URLSearchParams())).toEqual(DEFAULT_SELECTIONS);
  });

  it("reads valid values from their query keys", () => {
    const params = new URLSearchParams(
      "variable=precipitation&location=Fresno&ensemble=loca2&scenario=ssp585"
    );
    expect(selectionsFromSearchParams(params)).toEqual({
      ...DEFAULT_SELECTIONS,
      climateVariable: "precipitation",
      location: "Fresno",
      ensemble: "loca2",
      scenario: "ssp585",
    });
  });

  it("falls back for values the selected ensemble doesn't offer", () => {
    // LOCA2 has no dew point; WRF only has SSP3-7.0.
    expect(
      selectionsFromSearchParams(new URLSearchParams("ensemble=loca2&variable=dew-point"))
    ).toMatchObject({ ensemble: "loca2", climateVariable: DEFAULT_SELECTIONS.climateVariable });
    expect(selectionsFromSearchParams(new URLSearchParams("scenario=ssp245"))).toMatchObject({
      ensemble: "wrf",
      scenario: "ssp370",
    });
  });
});

describe("selectionsToSearchParams", () => {
  it("omits defaults", () => {
    expect(selectionsToSearchParams(DEFAULT_SELECTIONS).toString()).toBe("");
  });

  it("round-trips non-default selections", () => {
    const selections = {
      ...DEFAULT_SELECTIONS,
      climateVariable: "precipitation",
      ensemble: "loca2" as const,
      scenario: "ssp245",
    };
    expect(selectionsFromSearchParams(selectionsToSearchParams(selections))).toEqual(selections);
  });
});
