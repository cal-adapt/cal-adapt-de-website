import { http, HttpResponse } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { STAC_API_BASE_URL } from "@/config/constants";
import type { StacItem } from "@/lib/cal-adapt-api";
import { server } from "@/testing/mocks/server";

import { DEFAULT_SELECTIONS, type ExtremeHeatDaysSelections } from "./options";
import {
  buildSearchFilters,
  COUNTY_BOUNDARY_ID,
  EXTREME_HEAT_STAC_COLLECTION_ID,
  type ExtremeHeatSeries,
  fetchExtremeHeatSeries,
  hasRenderableSeries,
  searchFiltersKey,
  thresholdNameFor,
} from "./series";

function makeSeries(overrides: Partial<ExtremeHeatSeries> = {}): ExtremeHeatSeries {
  return {
    variableId: "eh_days",
    boundary: COUNTY_BOUNDARY_ID,
    county: "Sacramento",
    thresholdName: "t2max_ge100F",
    globalWarmingLevels: [0.8, 1.5, 2.0],
    median: [10, 20, 30],
    p10: [8, 18, 28],
    p90: [12, 22, 32],
    sourceItem: {} as StacItem,
    sourceCsvUrl: "https://example.com/sacramento.csv",
    ...overrides,
  };
}

describe("thresholdNameFor", () => {
  it("builds a t2max threshold_name for extreme heat days", () => {
    expect(thresholdNameFor({ ...DEFAULT_SELECTIONS, threshold: "105F" })).toBe("t2max_ge105F");
  });

  it("builds a t2min threshold_name for warm nights", () => {
    expect(
      thresholdNameFor({ ...DEFAULT_SELECTIONS, climateVariable: "warm-nights", threshold: "80F" })
    ).toBe("t2min_ge80F");
  });
});

describe("hasRenderableSeries", () => {
  it("is false for a null series", () => {
    expect(hasRenderableSeries(null)).toBe(false);
  });

  it("is false when there are no global warming levels", () => {
    expect(hasRenderableSeries(makeSeries({ globalWarmingLevels: [] }))).toBe(false);
  });

  it("is false when every median value is non-finite", () => {
    expect(hasRenderableSeries(makeSeries({ median: [NaN, NaN, NaN] }))).toBe(false);
  });

  it("is true when at least one median value is finite", () => {
    expect(hasRenderableSeries(makeSeries({ median: [NaN, 20, NaN] }))).toBe(true);
  });
});

describe("buildSearchFilters", () => {
  it("filters by collection, variable, boundary, and threshold_name", () => {
    expect(buildSearchFilters({ ...DEFAULT_SELECTIONS, county: "Fresno" })).toEqual({
      collectionFilter: `collection='${EXTREME_HEAT_STAC_COLLECTION_ID}'`,
      variableFilter: "variable_id='eh_days'",
      boundaryFilter: `boundary='${COUNTY_BOUNDARY_ID}'`,
      thresholdNameFilter: "threshold_name='t2max_ge100F'",
    });
  });

  it("uses the warm-nights variable and t2min threshold", () => {
    expect(
      buildSearchFilters({
        ...DEFAULT_SELECTIONS,
        climateVariable: "warm-nights",
        threshold: "80F",
      })
    ).toMatchObject({
      variableFilter: "variable_id='warm_nights'",
      thresholdNameFilter: "threshold_name='t2min_ge80F'",
    });
  });
});

describe("searchFiltersKey", () => {
  it("keys on variable, boundary, threshold, and county (all affect the fetch)", () => {
    const base: ExtremeHeatDaysSelections = { ...DEFAULT_SELECTIONS, county: "Kern" };
    expect(searchFiltersKey(base)).toBe("eh_days|ca_counties|t2max_ge100F|Kern");
    expect(searchFiltersKey({ ...base, threshold: "105F" })).toBe(
      "eh_days|ca_counties|t2max_ge105F|Kern"
    );
    expect(searchFiltersKey({ ...base, climateVariable: "warm-nights", threshold: "80F" })).toBe(
      "warm_nights|ca_counties|t2min_ge80F|Kern"
    );
    expect(searchFiltersKey({ ...base, county: "Marin" })).toBe(
      "eh_days|ca_counties|t2max_ge100F|Marin"
    );
  });
});

describe("fetchExtremeHeatSeries", () => {
  const ASSET_PREFIX =
    "s3://cadcat/wrf/extreme-heat-tool/multimodel_per_boundary/eh_days/ca_counties/ssp370/t2max_ge100F/";
  const NORMALIZED_CSV_URL =
    "https://cadcat.s3.amazonaws.com/wrf/extreme-heat-tool/multimodel_per_boundary/eh_days/ca_counties/ssp370/t2max_ge100F/Sacramento_County_t2max_ge100F.csv";

  const SELECTIONS: ExtremeHeatDaysSelections = { ...DEFAULT_SELECTIONS, county: "Sacramento" };

  function makeItem(overrides: Partial<StacItem> = {}): StacItem {
    return {
      type: "Feature",
      id: "eh-metrics-mm-boundary-csv-eh_days-ca_counties-t2max_ge100F",
      geometry: null,
      links: [],
      assets: { data: { href: ASSET_PREFIX } },
      properties: {
        variable_id: "eh_days",
        boundary: "ca_counties",
        threshold_name: "t2max_ge100F",
      },
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

  it("parses the region CSV into a chart-ready median series", async () => {
    mockSearch([makeItem()]);
    mockCsv(
      [
        "warming_level,multimodel_median,multimodel_p10,multimodel_p90",
        "0.8,34.0,30.0,38.0",
        "1.5,48.0,44.0,52.0",
        "2.0,52.5,48.5,56.5",
      ].join("\n")
    );

    const series = await fetchExtremeHeatSeries(SELECTIONS);

    expect(series.county).toBe("Sacramento");
    expect(series.variableId).toBe("eh_days");
    expect(series.thresholdName).toBe("t2max_ge100F");
    expect(series.globalWarmingLevels).toEqual([0.8, 1.5, 2.0]);
    expect(series.median).toEqual([34.0, 48.0, 52.5]);
    expect(series.p10).toEqual([30.0, 44.0, 48.5]);
    expect(series.p90).toEqual([38.0, 52.0, 56.5]);
    expect(series.sourceCsvUrl).toBe(NORMALIZED_CSV_URL);
  });

  it("builds the county CSV url (with `_County` suffix) under the asset prefix", async () => {
    let requestedUrl = "";
    mockSearch([makeItem()]);
    server.use(
      http.get(NORMALIZED_CSV_URL, ({ request }) => {
        requestedUrl = request.url;
        return HttpResponse.text("warming_level,multimodel_median\n0.8,10");
      })
    );

    await fetchExtremeHeatSeries(SELECTIONS);

    expect(requestedUrl).toBe(NORMALIZED_CSV_URL);
  });

  it("averages duplicate warming-level rows (tolerant parse)", async () => {
    mockSearch([makeItem()]);
    mockCsv(
      [
        "warming_level,multimodel_median,multimodel_p10,multimodel_p90",
        "0.8,34.0,34.0,34.0",
        "0.8,32.0,32.0,32.0",
        "1.5,50.0,50.0,50.0",
        "1.5,46.0,46.0,46.0",
      ].join("\n")
    );

    const series = await fetchExtremeHeatSeries(SELECTIONS);

    expect(series.globalWarmingLevels).toEqual([0.8, 1.5]);
    expect(series.median).toEqual([33.0, 48.0]);
  });

  it("skips rows with a non-numeric warming level", async () => {
    mockSearch([makeItem()]);
    mockCsv(["warming_level,multimodel_median", "0.8,10", "not-a-number,999", "2.0,30"].join("\n"));

    const series = await fetchExtremeHeatSeries(SELECTIONS);

    expect(series.globalWarmingLevels).toEqual([0.8, 2.0]);
    expect(series.median).toEqual([10, 30]);
  });

  it("represents an absent median cell as NaN", async () => {
    mockSearch([makeItem()]);
    mockCsv(["warming_level,multimodel_p10", "0.8,5", "1.5,6"].join("\n"));

    const series = await fetchExtremeHeatSeries(SELECTIONS);

    expect(series.median).toEqual([NaN, NaN]);
  });

  it("appends the CSV filename to a prefix href that lacks a trailing slash", async () => {
    let requestedUrl = "";
    mockSearch([makeItem({ assets: { data: { href: ASSET_PREFIX.replace(/\/$/, "") } } })]);
    server.use(
      http.get(NORMALIZED_CSV_URL, ({ request }) => {
        requestedUrl = request.url;
        return HttpResponse.text("warming_level,multimodel_median\n0.8,10");
      })
    );

    await fetchExtremeHeatSeries(SELECTIONS);

    expect(requestedUrl).toBe(NORMALIZED_CSV_URL);
  });

  it("throws when no STAC item matches the selection", async () => {
    mockSearch([]);
    await expect(fetchExtremeHeatSeries(SELECTIONS)).rejects.toThrow("No STAC item found");
  });

  it("throws when the STAC item has no data asset href", async () => {
    mockSearch([makeItem({ assets: {} })]);
    await expect(fetchExtremeHeatSeries(SELECTIONS)).rejects.toThrow("has no `data` asset href");
  });

  it("throws when the CSV fetch fails", async () => {
    mockSearch([makeItem()]);
    server.use(http.get(NORMALIZED_CSV_URL, () => new HttpResponse(null, { status: 404 })));

    await expect(fetchExtremeHeatSeries(SELECTIONS)).rejects.toThrow("CSV fetch failed");
  });
});
