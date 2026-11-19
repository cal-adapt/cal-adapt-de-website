import { http, HttpResponse } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { STAC_API_BASE_URL } from "@/config/constants";
import type { StacItem } from "@/lib/cal-adapt-api";
import { server } from "@/testing/mocks/server";

import { DEFAULT_SELECTIONS, withEnsemble } from "./options";
import {
  buildSearchFilters,
  fetchAnnualSeries,
  parseBoundaryCsv,
  parseObservedCsv,
  regionCsvFileName,
} from "./series";

const LOCA2_SSP245 = { ...withEnsemble(DEFAULT_SELECTIONS, "loca2"), scenario: "ssp245" };

describe("buildSearchFilters", () => {
  it("filters the boundary item by collection, variable, boundary and scenario", () => {
    expect(buildSearchFilters(DEFAULT_SELECTIONS, "boundary")).toEqual({
      collectionFilter: "collection='acp-wrf-boundary-csv'",
      variableFilter: "variable_id='t2max'",
      boundaryFilter: "boundary='ca_counties'",
      scenarioFilter: "cmip6:experiment_id='ssp370'",
    });
  });

  it("uses the LOCA2 collection and variable id for LOCA2", () => {
    expect(buildSearchFilters(LOCA2_SSP245, "boundary")).toMatchObject({
      collectionFilter: "collection='acp-loca2-boundary-csv'",
      variableFilter: "variable_id='tasmax'",
      scenarioFilter: "cmip6:experiment_id='ssp245'",
    });
  });

  it("filters the observed item without a scenario", () => {
    expect(buildSearchFilters(DEFAULT_SELECTIONS, "observed")).toEqual({
      collectionFilter: "collection='acp-era5-boundary-csv'",
      variableFilter: "variable_id='t2max'",
      boundaryFilter: "boundary='ca_counties'",
    });
  });
});

describe("regionCsvFileName", () => {
  it("builds the boundary and observed file names", () => {
    expect(regionCsvFileName(DEFAULT_SELECTIONS, "boundary")).toBe(
      "Alameda_County_t2max_ssp370.csv"
    );
    expect(regionCsvFileName(DEFAULT_SELECTIONS, "observed")).toBe("Alameda_County_t2max_era5.csv");
    expect(regionCsvFileName(LOCA2_SSP245, "boundary")).toBe("Alameda_County_tasmax_ssp245.csv");
  });
});

describe("fetchAnnualSeries", () => {
  const BOUNDARY_PREFIX =
    "s3://cadcat/wrf/annual-climate-projections/per_boundary/t2max/ca_counties/ssp370/csv/";
  const OBSERVED_PREFIX =
    "s3://cadcat/wrf/annual-climate-projections/era5_per_boundary/t2max/ca_counties/csv/";
  const HTTPS = "https://cadcat.s3.amazonaws.com/wrf/annual-climate-projections";

  function item(id: string, href: string): StacItem {
    return {
      type: "Feature",
      id,
      geometry: null,
      links: [],
      assets: { data: { href } },
      properties: {},
    };
  }

  /** Answers each STAC search with the item for the collection in its filter. */
  function mockSearch(itemsByCollection: Record<string, StacItem[]>) {
    server.use(
      http.get(`${STAC_API_BASE_URL}/search`, ({ request }) => {
        const filter = new URL(request.url).searchParams.get("filter") ?? "";
        const collection = filter.match(/collection='([^']+)'/)?.[1] ?? "";
        return HttpResponse.json({
          type: "FeatureCollection",
          features: itemsByCollection[collection] ?? [],
          links: [],
        });
      })
    );
  }

  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("resolves both CSVs through STAC and parses them", async () => {
    mockSearch({
      "acp-wrf-boundary-csv": [item("wrf", BOUNDARY_PREFIX)],
      "acp-era5-boundary-csv": [item("era5", OBSERVED_PREFIX)],
    });
    server.use(
      http.get(
        `${HTTPS}/per_boundary/t2max/ca_counties/ssp370/csv/Alameda_County_t2max_ssp370.csv`,
        () => HttpResponse.text("year,mean,min,max,MIROC6\n2000,70,69,71,70")
      ),
      http.get(
        `${HTTPS}/era5_per_boundary/t2max/ca_counties/csv/Alameda_County_t2max_era5.csv`,
        () => HttpResponse.text("year,value\n2000,68")
      )
    );

    const series = await fetchAnnualSeries(DEFAULT_SELECTIONS);

    expect(series.simulationNames).toEqual(["MIROC6"]);
    expect(series.rows[0]).toMatchObject({ year: 2000, mean: 70, min: 69, max: 71 });
    expect(series.observed).toEqual([{ year: 2000, value: 68 }]);
    expect(series.sourceCsvUrl).toBe(
      `${HTTPS}/per_boundary/t2max/ca_counties/ssp370/csv/Alameda_County_t2max_ssp370.csv`
    );
  });

  it("throws when STAC has no item for the selections", async () => {
    mockSearch({});
    await expect(fetchAnnualSeries(LOCA2_SSP245)).rejects.toThrow(/No STAC item found/);
  });
});

describe("parseBoundaryCsv", () => {
  it("reads the summary columns and treats the rest as simulations", () => {
    const text = "year,mean,min,max,MIROC6,TaiESM1\n2000,60,59,61,59,61\n1999,58,57,59,57,";
    const { rows, simulationNames } = parseBoundaryCsv(text);
    expect(simulationNames).toEqual(["MIROC6", "TaiESM1"]);
    expect(rows.map((row) => row.year)).toEqual([1999, 2000]);
    expect(rows[1]).toEqual({
      year: 2000,
      mean: 60,
      min: 59,
      max: 61,
      simulations: { MIROC6: 59, TaiESM1: 61 },
    });
    expect(rows[0].simulations.TaiESM1).toBeNaN();
  });
});

describe("parseObservedCsv", () => {
  it("reads year and value", () => {
    expect(parseObservedCsv("year,value\n1981,59.03\n1982,56.39")).toEqual([
      { year: 1981, value: 59.03 },
      { year: 1982, value: 56.39 },
    ]);
  });
});
