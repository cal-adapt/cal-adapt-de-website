import { describe, expect, it } from "vitest";

import type { StacCollection, StacCollectionQueryables, StacItem } from "@/lib/cal-adapt-api";

import type { CustomizeFormConfig, CustomizeSelections, DataDownloadWorkspaceData } from "../types";

import { buildSummaryRows, flattenMultiSelectOptions } from "./shared";
import { standardYearPackage } from "./standard-year";

function multiField(label: string) {
  const field = standardYearPackage.fields.find((f) => f.label === label);
  if (field?.kind !== "multi") {
    throw new Error(`${label} must be a multi-select`);
  }
  return field;
}

function singleField(label: string) {
  const field = standardYearPackage.fields.find((f) => f.label === label);
  if (field?.kind !== "single") {
    throw new Error(`${label} must be a single-select`);
  }
  return field;
}

function makeStandardYearConfig() {
  const collection = {
    type: "Collection",
    id: "standard-year",
    description: "",
    license: "",
  } as StacCollection;
  const queryables = {
    properties: {
      location: { enum: ["san_francisco_intl"] },
      variable: { enum: ["t2"] },
      percentile: { enum: ["05ptile", "50ptile", "95ptile"] },
      time_period: { enum: ["present-day", "time-based"] },
      centered_year: { enum: ["2015", "2025"] },
    },
  } as unknown as StacCollectionQueryables;
  return standardYearPackage.buildCustomizeForm(collection, queryables);
}

function makeSelections(overrides: Partial<CustomizeSelections> = {}): CustomizeSelections {
  return {
    frequency: "",
    variables: ["tasmax"],
    models: [],
    scenarios: [],
    counties: ["san_francisco_intl"],
    percentiles: ["50ptile"],
    timePeriods: ["present-day"],
    centeredYears: [],
    shockTypes: [],
    computationApproach: "gwl",
    ...overrides,
  };
}

function makeItem(overrides: Partial<StacItem> = {}): StacItem {
  return {
    type: "Feature",
    id: "sy-item",
    geometry: null,
    links: [],
    properties: {
      location: "san_francisco_intl",
      time_period: "present-day",
      percentile: "50ptile",
      variable: "tasmax",
    },
    assets: { data: { href: "https://example.com/a.csv", "file:size": 10 } },
    ...overrides,
  };
}

describe("standardYearPackage", () => {
  it("builds CQL2 search filters using the station-profile queryable keys", () => {
    const filters = standardYearPackage.buildSearchFilters(makeSelections());
    expect(filters.collectionFilter).toBe("collection='standard-year'");
    expect(filters.locationFilter).toBe("(location='san_francisco_intl')");
    expect(filters.variableFilter).toBe("(variable='tasmax')");
    expect(filters.percentileFilter).toBe("(percentile='50ptile')");
    expect(filters.timePeriodFilter).toBe("(time_period='present-day')");
  });

  it("requires location, variables, percentiles, and time periods for validateSelections", () => {
    expect(standardYearPackage.validateSelections(makeSelections())).toBe(true);
    expect(standardYearPackage.validateSelections(makeSelections({ counties: [] }))).toBe(false);
    expect(standardYearPackage.validateSelections(makeSelections({ variables: [] }))).toBe(false);
    expect(standardYearPackage.validateSelections(makeSelections({ percentiles: [] }))).toBe(false);
    expect(standardYearPackage.validateSelections(makeSelections({ timePeriods: [] }))).toBe(false);
  });

  it("throws when buildCustomizeForm is called without queryables", () => {
    const collection = {
      type: "Collection",
      id: "standard-year",
      description: "",
      license: "",
    } as StacCollection;
    expect(() => standardYearPackage.buildCustomizeForm(collection)).toThrow(
      /requires STAC v2 queryables/
    );
  });

  it("searchFiltersKey covers location, variables, percentiles, and time periods only", () => {
    const base = makeSelections();
    const key = standardYearPackage.searchFiltersKey(base);

    // Fields this package doesn't use should not change the key.
    expect(standardYearPackage.searchFiltersKey(makeSelections({ models: ["X"] }))).toBe(key);

    // Relevant fields must change the key.
    expect(standardYearPackage.searchFiltersKey(makeSelections({ variables: ["pr"] }))).not.toBe(
      key
    );
    expect(
      standardYearPackage.searchFiltersKey(makeSelections({ timePeriods: ["mid-century"] }))
    ).not.toBe(key);
  });

  it("buildSummaryRows derives edit-view fields into {label, value} rows after readOnlyFields", () => {
    const form: CustomizeFormConfig = {
      kind: "standard-year",
      readOnlyFields: [{ label: "Dataset", value: "Standard Year" }],
      frequencyOptions: [],
      variableOptions: [{ value: "tasmax", label: "Max Temp" }],
      modelOptions: [],
      scenarioOptions: [],
      countyOptions: [{ value: "san_francisco_intl", label: "San Francisco Intl" }],
      percentileOptions: [{ value: "50ptile", label: "50th percentile" }],
      timePeriodOptions: [{ value: "present-day", label: "Present day" }],
      initial: {
        frequency: "",
        variables: [],
        models: [],
        scenarios: [],
        counties: [],
        percentiles: [],
        timePeriods: [],
        centeredYears: [],
        shockTypes: [],
        computationApproach: "gwl",
      },
    };
    const workspace = { customizeForm: form } as DataDownloadWorkspaceData;
    const rows = buildSummaryRows(standardYearPackage, workspace, makeSelections());
    // In the GWL approach the Years row is hidden; the toggle row is surfaced.
    expect(rows).toEqual([
      { label: "Dataset", value: "Standard Year" },
      { label: "Computation approach", value: "Global warming level" },
      { label: "Global Warming Levels", value: "Present day" },
      { label: "Variables", value: "Max Temp" },
      { label: "Percentiles", value: "50th percentile" },
      { label: "Locations", value: "San Francisco Intl" },
    ]);
  });

  it("hides the GWLs row and shows the Years row in the time-based approach", () => {
    const form: CustomizeFormConfig = {
      kind: "standard-year",
      readOnlyFields: [{ label: "Dataset", value: "Standard Year" }],
      frequencyOptions: [],
      variableOptions: [{ value: "tasmax", label: "Max Temp" }],
      modelOptions: [],
      scenarioOptions: [],
      countyOptions: [{ value: "san_francisco_intl", label: "San Francisco Intl" }],
      percentileOptions: [{ value: "50ptile", label: "50th percentile" }],
      timePeriodOptions: [{ value: "present-day", label: "Present day" }],
      centeredYearOptions: [{ value: "2015", label: "2015" }],
      initial: {
        frequency: "",
        variables: [],
        models: [],
        scenarios: [],
        counties: [],
        percentiles: [],
        timePeriods: [],
        centeredYears: [],
        shockTypes: [],
        computationApproach: "time-based",
      },
    };
    const workspace = { customizeForm: form } as DataDownloadWorkspaceData;
    const rows = buildSummaryRows(
      standardYearPackage,
      workspace,
      makeSelections({
        computationApproach: "time-based",
        centeredYears: ["2015"],
        timePeriods: [],
      })
    );
    expect(rows).toEqual([
      { label: "Dataset", value: "Standard Year" },
      { label: "Computation approach", value: "Time-based (years)" },
      { label: "Years", value: "2015" },
      { label: "Variables", value: "Max Temp" },
      { label: "Percentiles", value: "50th percentile" },
      { label: "Locations", value: "San Francisco Intl" },
    ]);
  });

  it("orders GWL options chronologically regardless of queryables order", () => {
    const collection = {
      type: "Collection",
      id: "standard-year",
      description: "",
      license: "",
    } as StacCollection;
    const queryables = {
      properties: {
        location: { enum: ["san_francisco_intl"] },
        variable: { enum: ["tasmax"] },
        percentile: { enum: ["50ptile"] },
        model: { enum: [] },
        // Intentionally shuffled and including an unknown id to verify sorting.
        time_period: {
          enum: ["mid-late-century", "future-extreme", "present-day", "mid-century", "near-future"],
        },
      },
    } as unknown as StacCollectionQueryables;

    const config = standardYearPackage.buildCustomizeForm(collection, queryables);
    expect(config.timePeriodOptions?.map((o) => o.value)).toEqual([
      "present-day",
      "near-future",
      "mid-century",
      "mid-late-century",
      "future-extreme",
    ]);
    expect(config.initial.timePeriods).toEqual([
      "present-day",
      "near-future",
      "mid-century",
      "mid-late-century",
      "future-extreme",
    ]);
  });

  it("groups items by (location, time_period, percentile) and dedupes identical assets", () => {
    const base = {
      location: "san_francisco_intl",
      time_period: "present-day",
      percentile: "50ptile",
      variable: "tasmax",
    };
    const items: StacItem[] = [
      makeItem({ id: "a", properties: base }),
      makeItem({ id: "b", properties: base }), // same bundle + same href → dedupe
      makeItem({
        id: "c",
        properties: { ...base, time_period: "mid-century" }, // different bundle
        assets: { data: { href: "https://example.com/c.csv", "file:size": 20 } },
      }),
    ];

    const { bundles, totalBytes } = standardYearPackage.mapItemsToBundles(
      items,
      makeSelections({ timePeriods: ["present-day", "mid-century"] })
    );
    expect(bundles).toHaveLength(2);
    expect(totalBytes).toBe(30);
  });

  it("surfaces `time-based` as the Years field, not a GWL option", () => {
    const collection = {
      type: "Collection",
      id: "standard-year",
      description: "",
      license: "",
    } as StacCollection;
    const queryables = {
      properties: {
        location: { enum: ["san_francisco_intl"] },
        variable: { enum: ["tasmax"] },
        percentile: { enum: ["50ptile"] },
        time_period: { enum: ["present-day", "time-based", "mid-century"] },
        centered_year: { enum: ["2055", "2015", "2035"] },
      },
    } as unknown as StacCollectionQueryables;

    const config = standardYearPackage.buildCustomizeForm(collection, queryables);
    expect(config.timePeriodOptions?.map((o) => o.value)).toEqual(["present-day", "mid-century"]);
    expect(config.centeredYearOptions?.map((o) => o.value)).toEqual(["2015", "2035", "2055"]);
    expect(config.initial.timePeriods).toEqual(["present-day", "mid-century"]);
    expect(config.initial.centeredYears).toEqual([]);
  });

  it("builds time-based filters when the time-based approach is active", () => {
    const filters = standardYearPackage.buildSearchFilters(
      makeSelections({
        computationApproach: "time-based",
        timePeriods: ["present-day"],
        centeredYears: ["2015", "2025"],
      })
    );
    expect(filters.timePeriodFilter).toBe("time_period='time-based'");
    expect(filters.centeredYearFilter).toBe("(centered_year=2015 or centered_year=2025)");
  });

  it("uses the GWL approach (no centered_year filter) by default", () => {
    const filters = standardYearPackage.buildSearchFilters(makeSelections());
    expect(filters.timePeriodFilter).toBe("(time_period='present-day')");
    expect(filters.centeredYearFilter).toBeUndefined();
  });

  it("requires the active approach's time dimension in validateSelections", () => {
    // GWL approach → needs GWLs, ignores whether years are present.
    expect(standardYearPackage.validateSelections(makeSelections())).toBe(true);
    expect(standardYearPackage.validateSelections(makeSelections({ timePeriods: [] }))).toBe(false);

    // Time-based approach → needs years, GWLs are irrelevant.
    expect(
      standardYearPackage.validateSelections(
        makeSelections({
          computationApproach: "time-based",
          timePeriods: [],
          centeredYears: ["2015"],
        })
      )
    ).toBe(true);
    expect(
      standardYearPackage.validateSelections(
        makeSelections({
          computationApproach: "time-based",
          timePeriods: ["present-day"],
          centeredYears: [],
        })
      )
    ).toBe(false);
  });

  it("restricts Percentiles to the 50th in the time-based approach, all otherwise", () => {
    const config = makeStandardYearConfig();
    const percentiles = multiField("Percentiles");
    const values = (computationApproach: string) =>
      flattenMultiSelectOptions(
        percentiles.options(config, makeSelections({ computationApproach }))
      ).map((o) => o.value);

    expect(values("gwl")).toEqual(["05ptile", "50ptile", "95ptile"]);
    expect(values("time-based")).toEqual(["50ptile"]);
  });

  it("reveals GWLs xor Years based on the active approach", () => {
    const gwls = multiField("Global Warming Levels");
    const years = multiField("Years");

    const gwl = makeSelections({ computationApproach: "gwl" });
    expect(gwls.visible?.(gwl) ?? true).toBe(true);
    expect(years.visible?.(gwl) ?? true).toBe(false);

    const timeBased = makeSelections({ computationApproach: "time-based" });
    expect(gwls.visible?.(timeBased) ?? true).toBe(false);
    expect(years.visible?.(timeBased) ?? true).toBe(true);
  });

  it("prunes non-median percentiles when switching to the time-based approach", () => {
    const approach = singleField("Computation approach");

    // Keeps the median, drops the extremes.
    expect(
      approach.patch(
        "time-based",
        makeSelections({ percentiles: ["05ptile", "50ptile", "95ptile"] })
      )
    ).toEqual({ computationApproach: "time-based", percentiles: ["50ptile"] });

    // No median selected → default to it so the revealed field isn't left empty.
    expect(approach.patch("time-based", makeSelections({ percentiles: ["95ptile"] }))).toEqual({
      computationApproach: "time-based",
      percentiles: ["50ptile"],
    });

    // Switching back to the GWL approach leaves percentiles untouched.
    expect(approach.patch("gwl", makeSelections({ computationApproach: "time-based" }))).toEqual({
      computationApproach: "gwl",
    });
  });

  it("keys a time-based bundle by its centered year and labels it as a Year", () => {
    const { bundles } = standardYearPackage.mapItemsToBundles(
      [
        makeItem({
          id: "t",
          properties: {
            location: "san_francisco_intl",
            time_period: "time-based",
            centered_year: 2055,
            percentile: "50ptile",
            variable: "tasmax",
          },
        }),
      ],
      makeSelections({ centeredYears: ["2055"] })
    );
    expect(bundles).toHaveLength(1);
    expect(bundles[0].metaBlocks).toContainEqual({ label: "Year", value: "2055" });
  });
});
