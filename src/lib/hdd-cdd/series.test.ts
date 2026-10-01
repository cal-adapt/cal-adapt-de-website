import { http, HttpResponse } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { STAC_API_BASE_URL } from "@/config/constants";
import type { StacItem } from "@/lib/cal-adapt-api";
import { server } from "@/testing/mocks/server";

import { DEFAULT_SELECTIONS, type HddCddSelections } from "./options";
import {
  buildSearchFilters,
  fetchHddCddSeries,
  hasHistoricalData,
  hasRenderableSeries,
  hasScenarioData,
  HDD_CDD_STAC_COLLECTION_ID,
  type HddCddSeries,
  type HddCddYearRow,
  historicalRows,
  LAST_HISTORICAL_YEAR,
  scenarioRows,
  searchFiltersKey,
} from "./series";

function makeRow(overrides: Partial<HddCddYearRow> = {}): HddCddYearRow {
  return {
    year: 2000,
    hddMean: 10,
    hddMin: 5,
    hddMax: 15,
    cddMean: 20,
    cddMin: 15,
    cddMax: 25,
    ...overrides,
  };
}

function makeSeries(overrides: Partial<HddCddSeries> = {}): HddCddSeries {
  return {
    boundary: "ca_counties",
    location: "Sacramento",
    rows: [makeRow({ year: 2000 }), makeRow({ year: 2050 })],
    sourceItem: {} as StacItem,
    sourceCsvUrl: "https://example.com/sacramento.csv",
    ...overrides,
  };
}

describe("historicalRows / scenarioRows", () => {
  const rows = [
    makeRow({ year: LAST_HISTORICAL_YEAR - 1 }),
    makeRow({ year: LAST_HISTORICAL_YEAR }),
    makeRow({ year: LAST_HISTORICAL_YEAR + 1 }),
  ];

  it("splits rows at LAST_HISTORICAL_YEAR (inclusive on the historical side)", () => {
    expect(historicalRows(rows).map((r) => r.year)).toEqual([
      LAST_HISTORICAL_YEAR - 1,
      LAST_HISTORICAL_YEAR,
    ]);
    expect(scenarioRows(rows).map((r) => r.year)).toEqual([LAST_HISTORICAL_YEAR + 1]);
  });
});

describe("hasHistoricalData / hasScenarioData", () => {
  it("is false for a null series", () => {
    expect(hasHistoricalData(null, "cdd")).toBe(false);
    expect(hasScenarioData(null, "cdd")).toBe(false);
  });

  it("checks the metric-specific mean column for the requested climateVariable", () => {
    const series = makeSeries({
      rows: [
        makeRow({ year: 2000, hddMean: NaN, cddMean: 20 }),
        makeRow({ year: 2050, hddMean: NaN, cddMean: NaN }),
      ],
    });

    expect(hasHistoricalData(series, "cdd")).toBe(true);
    expect(hasHistoricalData(series, "hdd")).toBe(false);
    expect(hasScenarioData(series, "cdd")).toBe(false);
    expect(hasScenarioData(series, "hdd")).toBe(false);
  });
});

describe("hasRenderableSeries", () => {
  it("is false for a null series or empty rows", () => {
    expect(hasRenderableSeries(null, "cdd")).toBe(false);
    expect(hasRenderableSeries(makeSeries({ rows: [] }), "cdd")).toBe(false);
  });

  it("is false when every value for the climateVariable is non-finite", () => {
    const series = makeSeries({
      rows: [makeRow({ cddMean: NaN }), makeRow({ cddMean: NaN })],
    });
    expect(hasRenderableSeries(series, "cdd")).toBe(false);
  });

  it("is true when at least one historical or scenario value is finite", () => {
    const series = makeSeries({
      rows: [makeRow({ year: 2000, cddMean: 42 })],
    });
    expect(hasRenderableSeries(series, "cdd")).toBe(true);
  });
});

describe("buildSearchFilters", () => {
  it("filters by collection and boundary only (metric/scenario live in one CSV)", () => {
    expect(buildSearchFilters({ ...DEFAULT_SELECTIONS, location: "Fresno" })).toEqual({
      collectionFilter: `collection='${HDD_CDD_STAC_COLLECTION_ID}'`,
      boundaryFilter: "boundary='ca_counties'",
    });
  });

  it("uses the selected spatial aggregation as the boundary", () => {
    expect(
      buildSearchFilters({
        ...DEFAULT_SELECTIONS,
        spatialAggregation: "forecast_zones",
        location: "Greater Bay Area",
      })
    ).toMatchObject({ boundaryFilter: "boundary='forecast_zones'" });
  });
});

describe("searchFiltersKey", () => {
  it("keys on spatial aggregation and location only, not climateVariable", () => {
    const base: HddCddSelections = { ...DEFAULT_SELECTIONS, location: "Kern" };
    expect(searchFiltersKey(base)).toBe("ca_counties|Kern");
    expect(searchFiltersKey({ ...base, climateVariable: "hdd" })).toBe("ca_counties|Kern");
    expect(searchFiltersKey({ ...base, location: "Marin" })).toBe("ca_counties|Marin");
    expect(
      searchFiltersKey({
        ...base,
        spatialAggregation: "electric_balancing_areas",
        location: "CALISO",
      })
    ).toBe("electric_balancing_areas|CALISO");
  });
});

describe("fetchHddCddSeries", () => {
  const ASSET_PREFIX = "s3://cadcat/wrf/hdd-cdd-tool/multimodel_per_boundary/ca_counties/ssp370/";
  const NORMALIZED_CSV_URL =
    "https://cadcat.s3.amazonaws.com/wrf/hdd-cdd-tool/multimodel_per_boundary/ca_counties/ssp370/Sacramento_County.csv";

  const SELECTIONS: HddCddSelections = { ...DEFAULT_SELECTIONS, location: "Sacramento" };

  function makeItem(overrides: Partial<StacItem> = {}): StacItem {
    return {
      type: "Feature",
      id: "hdd-cdd-metrics-mm-boundary-csv-ca_counties",
      geometry: null,
      links: [],
      assets: { data: { href: ASSET_PREFIX } },
      properties: { boundary: "ca_counties" },
      ...overrides,
    };
  }

  function featureCollection(features: StacItem[]) {
    return { type: "FeatureCollection", features, links: [] };
  }

  function mockSearch(features: StacItem[]) {
    server.use(
      http.get(`${STAC_API_BASE_URL}/search`, () => HttpResponse.json(featureCollection(features)))
    );
  }

  function mockCsv(body: string, url = NORMALIZED_CSV_URL) {
    server.use(http.get(url, () => HttpResponse.text(body)));
  }

  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("parses the region CSV into hdd and cdd mean/min/max columns", async () => {
    mockSearch([makeItem()]);
    mockCsv(
      [
        "year,hdd_mean,hdd_min,hdd_max,cdd_mean,cdd_min,cdd_max",
        "2000,1200,1000,1400,300,250,350",
        "1999,1300,1100,1500,280,230,330",
      ].join("\n")
    );

    const series = await fetchHddCddSeries(SELECTIONS);

    expect(series.location).toBe("Sacramento");
    expect(series.boundary).toBe("ca_counties");
    // Sorted ascending by year.
    expect(series.rows.map((r) => r.year)).toEqual([1999, 2000]);
    expect(series.rows[1]).toEqual({
      year: 2000,
      hddMean: 1200,
      hddMin: 1000,
      hddMax: 1400,
      cddMean: 300,
      cddMin: 250,
      cddMax: 350,
    });
    expect(series.sourceCsvUrl).toBe(NORMALIZED_CSV_URL);
  });

  it("builds the county CSV url (with `_County` suffix) under the asset prefix", async () => {
    let requestedUrl = "";
    mockSearch([makeItem()]);
    server.use(
      http.get(NORMALIZED_CSV_URL, ({ request }) => {
        requestedUrl = request.url;
        return HttpResponse.text("year,hdd_mean\n2000,10");
      })
    );

    await fetchHddCddSeries(SELECTIONS);

    expect(requestedUrl).toBe(NORMALIZED_CSV_URL);
  });

  it("builds a non-county region CSV url, encoding special characters", async () => {
    const forecastZonePrefix =
      "s3://cadcat/wrf/hdd-cdd-tool/multimodel_per_boundary/forecast_zones/ssp370/";
    const forecastZoneCsvUrl =
      "https://cadcat.s3.amazonaws.com/wrf/hdd-cdd-tool/multimodel_per_boundary/forecast_zones/ssp370/SDG%26E.csv";
    let requestedUrl = "";
    mockSearch([
      makeItem({
        assets: { data: { href: forecastZonePrefix } },
        properties: { boundary: "forecast_zones" },
      }),
    ]);
    server.use(
      http.get(forecastZoneCsvUrl, ({ request }) => {
        requestedUrl = request.url;
        return HttpResponse.text("year,hdd_mean\n2000,10");
      })
    );

    const series = await fetchHddCddSeries({
      ...DEFAULT_SELECTIONS,
      spatialAggregation: "forecast_zones",
      location: "SDG&E",
    });

    expect(requestedUrl).toBe(forecastZoneCsvUrl);
    expect(series.boundary).toBe("forecast_zones");
    expect(series.location).toBe("SDG&E");
  });

  it("skips rows with a non-numeric year and represents missing cells as NaN", async () => {
    mockSearch([makeItem()]);
    mockCsv(["year,hdd_mean,cdd_mean", "2000,10,", "not-a-year,999,999", "2001,,30"].join("\n"));

    const series = await fetchHddCddSeries(SELECTIONS);

    expect(series.rows.map((r) => r.year)).toEqual([2000, 2001]);
    expect(series.rows[0].cddMean).toBeNaN();
    expect(series.rows[1].hddMean).toBeNaN();
  });

  it("appends the CSV filename to a prefix href that lacks a trailing slash", async () => {
    let requestedUrl = "";
    mockSearch([makeItem({ assets: { data: { href: ASSET_PREFIX.replace(/\/$/, "") } } })]);
    server.use(
      http.get(NORMALIZED_CSV_URL, ({ request }) => {
        requestedUrl = request.url;
        return HttpResponse.text("year,hdd_mean\n2000,10");
      })
    );

    await fetchHddCddSeries(SELECTIONS);

    expect(requestedUrl).toBe(NORMALIZED_CSV_URL);
  });

  it("throws when no STAC item matches the selection", async () => {
    mockSearch([]);
    await expect(fetchHddCddSeries(SELECTIONS)).rejects.toThrow("No STAC item found");
  });

  it("throws when the STAC item has no data asset href", async () => {
    mockSearch([makeItem({ assets: {} })]);
    await expect(fetchHddCddSeries(SELECTIONS)).rejects.toThrow("has no `data` asset href");
  });

  it("throws when the CSV fetch fails", async () => {
    mockSearch([makeItem()]);
    server.use(http.get(NORMALIZED_CSV_URL, () => new HttpResponse(null, { status: 404 })));

    await expect(fetchHddCddSeries(SELECTIONS)).rejects.toThrow("CSV fetch failed");
  });
});
