import { describe, expect, it } from "vitest";

import { DEFAULT_SELECTIONS, type ExtremeHeatDaysSelections } from "./options";
import { selectionsFromSearchParams, selectionsToSearchParams } from "./search-params";

describe("selectionsFromSearchParams", () => {
  it("returns the defaults for empty params", () => {
    expect(selectionsFromSearchParams(new URLSearchParams())).toEqual(DEFAULT_SELECTIONS);
  });

  it("reads valid values from their query keys", () => {
    const params = new URLSearchParams("county=Fresno&threshold=105F");
    expect(selectionsFromSearchParams(params)).toEqual({
      ...DEFAULT_SELECTIONS,
      county: "Fresno",
      threshold: "105F",
    });
  });

  it("falls back to defaults for values outside the allowed set", () => {
    const params = new URLSearchParams("county=Atlantis&threshold=999F");
    expect(selectionsFromSearchParams(params)).toEqual(DEFAULT_SELECTIONS);
  });

  it("maps the 'variable' query key onto climateVariable", () => {
    // Unknown variable → default; proves the field is read under "variable".
    const params = new URLSearchParams("variable=not-a-variable");
    expect(selectionsFromSearchParams(params).climateVariable).toBe(
      DEFAULT_SELECTIONS.climateVariable
    );
  });
});

describe("selectionsToSearchParams", () => {
  it("omits fields equal to their default", () => {
    expect(selectionsToSearchParams(DEFAULT_SELECTIONS).toString()).toBe("");
  });

  it("serializes only changed fields under their mapped keys", () => {
    const params = selectionsToSearchParams({
      ...DEFAULT_SELECTIONS,
      county: "Los Angeles",
      threshold: "105F",
    });

    expect(params.get("county")).toBe("Los Angeles");
    expect(params.get("threshold")).toBe("105F");
    expect(params.get("variable")).toBeNull();
    expect(params.get("indicator")).toBeNull();
  });
});

describe("round-trip", () => {
  it("preserves a non-default selection through to/from", () => {
    const selections: ExtremeHeatDaysSelections = {
      ...DEFAULT_SELECTIONS,
      county: "Imperial",
      threshold: "105F",
    };

    const restored = selectionsFromSearchParams(selectionsToSearchParams(selections));
    expect(restored).toEqual(selections);
  });
});
