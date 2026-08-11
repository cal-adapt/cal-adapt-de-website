import { describe, expect, it } from "vitest";

import type { StacCollection, StacCollectionQueryables, StacItem } from "@/lib/cal-adapt-api";

import type { CustomizeFormConfig, CustomizeSelections, DataDownloadWorkspaceData } from "../types";

import { buildSummaryRows } from "./shared";
import { typicalMetYearPackage } from "./typical-met-year";

function makeSelections(overrides: Partial<CustomizeSelections> = {}): CustomizeSelections {
  return {
    frequency: "",
    variables: [],
    models: ["ACCESS-CM2"],
    scenarios: [],
    counties: ["san_francisco_intl"],
    percentiles: [],
    timePeriods: ["present-day"],
    centeredYears: [],
    shockTypes: [],
    dataSource: "climate-projections",
    ...overrides,
  };
}

function makeItem(overrides: Partial<StacItem> = {}): StacItem {
  return {
    type: "Feature",
    id: "tmy-item",
    geometry: null,
    links: [],
    properties: {
      location: "san_francisco_intl",
      time_period: "present-day",
      model: "ACCESS-CM2",
    },
    assets: {
      epw: { href: "https://example.com/a.epw", "file:size": 100 },
      csv: { href: "https://example.com/a.csv", "file:size": 50 },
    },
    ...overrides,
  };
}

function multiField(label: string) {
  const field = typicalMetYearPackage.fields.find((f) => f.label === label);
  if (field?.kind !== "multi") {
    throw new Error(`${label} must be a multi-select`);
  }
  return field;
}

function singleField(label: string) {
  const field = typicalMetYearPackage.fields.find((f) => f.label === label);
  if (field?.kind !== "single") {
    throw new Error(`${label} must be a single-select`);
  }
  return field;
}

function makeTmyConfig() {
  const collection = {
    type: "Collection",
    id: "typical-met-year",
    description: "",
    license: "",
  } as StacCollection;
  const queryables = {
    properties: {
      location: { enum: ["san_francisco_intl"] },
      model: { enum: ["era5", "ec-earth3"] },
      time_period: {
        enum: ["historical", "present-day", "near-future", "mid-century", "mid-late-century"],
      },
    },
  } as unknown as StacCollectionQueryables;
  return typicalMetYearPackage.buildCustomizeForm(collection, queryables);
}

describe("typicalMetYearPackage", () => {
  it("builds CQL2 search filters using location/model/time_period keys", () => {
    const filters = typicalMetYearPackage.buildSearchFilters(makeSelections());
    expect(filters.collectionFilter).toBe("collection='typical-met-year'");
    expect(filters.locationFilter).toBe("(location='san_francisco_intl')");
    expect(filters.modelFilter).toBe("(model='ACCESS-CM2')");
    expect(filters.timePeriodFilter).toBe("(time_period='present-day')");
  });

  it("requires location, time periods, and models for validateSelections", () => {
    expect(typicalMetYearPackage.validateSelections(makeSelections())).toBe(true);
    expect(typicalMetYearPackage.validateSelections(makeSelections({ counties: [] }))).toBe(false);
    expect(typicalMetYearPackage.validateSelections(makeSelections({ timePeriods: [] }))).toBe(
      false
    );
    expect(typicalMetYearPackage.validateSelections(makeSelections({ models: [] }))).toBe(false);
  });

  it("keeps ERA5 and Historical out of the projection option pools", () => {
    const config = makeTmyConfig();
    expect(config.modelOptions.map((o) => o.value)).toEqual(["ec-earth3"]);
    expect(config.timePeriodOptions?.map((o) => o.value)).toEqual([
      "present-day",
      "near-future",
      "mid-century",
      "mid-late-century",
    ]);
    expect(config.initial.models).toEqual(["ec-earth3"]);
    expect(config.initial.timePeriods).toEqual([
      "present-day",
      "near-future",
      "mid-century",
      "mid-late-century",
    ]);
    expect(config.initial.dataSource).toBe("climate-projections");
  });

  it("locks Models and GWLs to ERA5 + Historical under the reanalysis data source", () => {
    const config = makeTmyConfig();
    const models = multiField("Models");
    const gwls = multiField("Global Warming Levels");
    const reanalysis = makeSelections({ dataSource: "historical-reanalysis" });

    expect(models.options(config, reanalysis)).toEqual([{ value: "era5", label: "ERA5" }]);
    expect(models.value(reanalysis)).toEqual(["era5"]);
    // The single option can't be changed away from ERA5.
    expect(models.patch(["ec-earth3"], reanalysis)).toEqual({});

    expect(gwls.options(config, reanalysis)).toEqual([
      { value: "historical", label: "Historical" },
    ]);
    expect(gwls.value(reanalysis)).toEqual(["historical"]);
    expect(gwls.patch(["present-day"], reanalysis)).toEqual({});
  });

  it("uses the projection pools for Models and GWLs under the projections data source", () => {
    const config = makeTmyConfig();
    const models = multiField("Models");
    const gwls = multiField("Global Warming Levels");
    const projections = makeSelections({
      dataSource: "climate-projections",
      models: ["ec-earth3"],
      timePeriods: ["present-day"],
    });

    expect(models.options(config, projections)).toEqual(config.modelOptions);
    expect(models.value(projections)).toEqual(["ec-earth3"]);
    expect(gwls.options(config, projections)).toEqual(config.timePeriodOptions);
    expect(gwls.value(projections)).toEqual(["present-day"]);
  });

  it("routes the Data source toggle to the right model/time_period in search filters", () => {
    const dataSource = singleField("Data source");
    expect(dataSource.value(makeSelections())).toBe("climate-projections");
    expect(dataSource.patch("historical-reanalysis", makeSelections())).toEqual({
      dataSource: "historical-reanalysis",
    });

    // Reanalysis forces ERA5 + Historical, ignoring any stale projection selections.
    const reanalysis = typicalMetYearPackage.buildSearchFilters(
      makeSelections({
        dataSource: "historical-reanalysis",
        models: ["ec-earth3"],
        timePeriods: ["present-day"],
      })
    );
    expect(reanalysis.modelFilter).toBe("(model='era5')");
    expect(reanalysis.timePeriodFilter).toBe("(time_period='historical')");

    // Projections query the chosen climate projections models and warming levels.
    const projections = typicalMetYearPackage.buildSearchFilters(
      makeSelections({
        dataSource: "climate-projections",
        models: ["ec-earth3"],
        timePeriods: ["present-day"],
      })
    );
    expect(projections.modelFilter).toBe("(model='ec-earth3')");
    expect(projections.timePeriodFilter).toBe("(time_period='present-day')");
  });

  it("throws when buildCustomizeForm is called without queryables", () => {
    const collection = {
      type: "Collection",
      id: "typical-met-year",
      description: "",
      license: "",
    } as StacCollection;
    expect(() => typicalMetYearPackage.buildCustomizeForm(collection)).toThrow(
      /requires STAC v2 queryables/
    );
  });

  it("searchFiltersKey covers location, models, and time periods only", () => {
    const base = makeSelections();
    const key = typicalMetYearPackage.searchFiltersKey(base);

    // Fields this package doesn't use should not change the key.
    expect(typicalMetYearPackage.searchFiltersKey(makeSelections({ variables: ["tasmax"] }))).toBe(
      key
    );
    expect(
      typicalMetYearPackage.searchFiltersKey(makeSelections({ percentiles: ["50ptile"] }))
    ).toBe(key);

    // Relevant fields must change the key.
    expect(
      typicalMetYearPackage.searchFiltersKey(makeSelections({ models: ["MPI-ESM1-2-HR"] }))
    ).not.toBe(key);
    expect(
      typicalMetYearPackage.searchFiltersKey(makeSelections({ timePeriods: ["mid-century"] }))
    ).not.toBe(key);
  });

  it("buildSummaryRows derives edit-view fields into {label, value} rows after readOnlyFields", () => {
    const form: CustomizeFormConfig = {
      kind: "typical-met-year",
      readOnlyFields: [{ label: "Dataset", value: "Typical Met Year" }],
      frequencyOptions: [],
      variableOptions: [],
      modelOptions: [{ value: "ACCESS-CM2", label: "ACCESS-CM2" }],
      scenarioOptions: [],
      countyOptions: [{ value: "san_francisco_intl", label: "San Francisco Intl" }],
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
        dataSource: "climate-projections",
      },
    };
    const workspace = { customizeForm: form } as DataDownloadWorkspaceData;
    const rows = buildSummaryRows(typicalMetYearPackage, workspace, makeSelections());
    expect(rows).toEqual([
      { label: "Dataset", value: "Typical Met Year" },
      { label: "Data source", value: "Climate projections" },
      { label: "Global Warming Levels", value: "Present day" },
      { label: "Models", value: "ACCESS-CM2" },
      { label: "Locations", value: "San Francisco Intl" },
    ]);
  });

  it("orders GWL options chronologically regardless of queryables order", () => {
    const collection = {
      type: "Collection",
      id: "typical-met-year",
      description: "",
      license: "",
    } as StacCollection;
    const queryables = {
      properties: {
        location: { enum: ["san_francisco_intl"] },
        model: { enum: ["ACCESS-CM2"] },
        // Intentionally shuffled and including an unknown id to verify sorting.
        time_period: {
          enum: ["mid-late-century", "future-extreme", "present-day", "mid-century", "near-future"],
        },
      },
    } as unknown as StacCollectionQueryables;

    const config = typicalMetYearPackage.buildCustomizeForm(collection, queryables);
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

  it("labels Location options from caladapt:station_labels, falling back to a humanized id", () => {
    const collection = {
      type: "Collection",
      id: "typical-met-year",
      description: "",
      license: "",
      "caladapt:station_labels": {
        san_francisco_international_airport_ksfo: "San Francisco International Airport (KSFO)",
      },
    } as unknown as StacCollection;
    const queryables = {
      properties: {
        location: { enum: ["san_francisco_international_airport_ksfo", "unmapped_station_kxyz"] },
        model: { enum: ["ACCESS-CM2"] },
        time_period: { enum: ["present-day"] },
      },
    } as unknown as StacCollectionQueryables;

    const config = typicalMetYearPackage.buildCustomizeForm(collection, queryables);
    expect(config.countyOptions).toEqual([
      {
        value: "san_francisco_international_airport_ksfo",
        label: "San Francisco International Airport (KSFO)",
      },
      { value: "unmapped_station_kxyz", label: "Unmapped Station Kxyz" },
    ]);
  });

  it("uses the station label from customizeForm for a bundle's Location meta block", () => {
    const collection = {
      type: "Collection",
      id: "typical-met-year",
      description: "",
      license: "",
      "caladapt:station_labels": {
        san_francisco_intl: "San Francisco International Airport (KSFO)",
      },
    } as unknown as StacCollection;
    const queryables = {
      properties: {
        location: { enum: ["san_francisco_intl"] },
        model: { enum: ["ACCESS-CM2"] },
        time_period: { enum: ["present-day"] },
      },
    } as unknown as StacCollectionQueryables;
    const config = typicalMetYearPackage.buildCustomizeForm(collection, queryables);

    const { bundles } = typicalMetYearPackage.mapItemsToBundles(
      [makeItem()],
      makeSelections(),
      config
    );
    expect(bundles[0].metaBlocks).toContainEqual({
      label: "Location",
      value: "San Francisco International Airport (KSFO)",
    });
  });

  it("emits one asset per file type per (location, time_period, model) bundle", () => {
    const { bundles, totalBytes } = typicalMetYearPackage.mapItemsToBundles(
      [makeItem()],
      makeSelections()
    );
    expect(bundles).toHaveLength(1);
    expect(bundles[0].assets.map((a) => a.label).sort()).toEqual(["CSV", "EPW"]);
    expect(totalBytes).toBe(150);
  });
});
