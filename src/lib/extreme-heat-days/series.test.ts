import { http, HttpResponse } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { STAC_API_BASE_URL } from "@/config/constants";
import type { StacItem } from "@/lib/cal-adapt-api";
import { server } from "@/testing/mocks/server";

import { DEFAULT_SELECTIONS, type ExtremeHeatDaysSelections } from "./options";
import {
  buildSearchFilters,
  EXTREME_HEAT_STAC_COLLECTION_ID,
  type ExtremeHeatSeries,
  fetchExtremeHeatSeries,
  hasRenderableSeries,
  searchFiltersKey,
  stacVariableIdForThreshold,
  valuesForThreshold,
} from "./series";

function makeSeries(overrides: Partial<ExtremeHeatSeries> = {}): ExtremeHeatSeries {
  return {
    county: "Sacramento",
    countyCode: "06067",
    globalWarmingLevels: [0.8, 1.5, 2.0],
    valuesByVariable: {
      t2max_99pctl: [40, 42, 44],
      t2max_ge100F: [10, 20, 30],
      t2max_ge105F: [2, 5, 9],
    },
    sourceItem: {} as StacItem,
    sourceCsvUrl: "https://example.com/sacramento.csv",
    ...overrides,
  };
}

describe("stacVariableIdForThreshold", () => {
  it("maps known thresholds to their STAC variable id", () => {
    expect(stacVariableIdForThreshold("100F")).toBe("t2max_ge100F");
    expect(stacVariableIdForThreshold("105F")).toBe("t2max_ge105F");
  });

  it("returns null for an unmapped threshold", () => {
    expect(stacVariableIdForThreshold("110F")).toBeNull();
  });
});

describe("valuesForThreshold", () => {
  it("returns the column matching the threshold", () => {
    expect(valuesForThreshold(makeSeries(), "100F")).toEqual([10, 20, 30]);
    expect(valuesForThreshold(makeSeries(), "105F")).toEqual([2, 5, 9]);
  });

  it("returns null when the threshold has no STAC variable", () => {
    expect(valuesForThreshold(makeSeries(), "110F")).toBeNull();
  });
});

describe("hasRenderableSeries", () => {
  it("is false for a null series", () => {
    expect(hasRenderableSeries(null, "100F")).toBe(false);
  });

  it("is false when there are no global warming levels", () => {
    expect(hasRenderableSeries(makeSeries({ globalWarmingLevels: [] }), "100F")).toBe(false);
  });

  it("is false for a threshold with no matching column", () => {
    expect(hasRenderableSeries(makeSeries(), "110F")).toBe(false);
  });

  it("is false when every value is non-finite", () => {
    const series = makeSeries({
      valuesByVariable: {
        t2max_99pctl: [NaN, NaN, NaN],
        t2max_ge100F: [NaN, NaN, NaN],
        t2max_ge105F: [NaN, NaN, NaN],
      },
    });
    expect(hasRenderableSeries(series, "100F")).toBe(false);
  });

  it("is true when at least one value is finite", () => {
    const series = makeSeries({
      valuesByVariable: {
        t2max_99pctl: [NaN, NaN, NaN],
        t2max_ge100F: [NaN, 20, NaN],
        t2max_ge105F: [NaN, NaN, NaN],
      },
    });
    expect(hasRenderableSeries(series, "100F")).toBe(true);
  });
});

describe("buildSearchFilters", () => {
  it("filters by the extreme-heat collection and the selected county", () => {
    expect(buildSearchFilters({ ...DEFAULT_SELECTIONS, county: "Fresno" })).toEqual({
      collectionFilter: `collection='${EXTREME_HEAT_STAC_COLLECTION_ID}'`,
      countyFilter: "(county_name='Fresno')",
    });
  });
});

describe("searchFiltersKey", () => {
  it("keys only on county (so threshold/indicator changes don't refetch)", () => {
    const base: ExtremeHeatDaysSelections = { ...DEFAULT_SELECTIONS, county: "Kern" };
    expect(searchFiltersKey(base)).toBe("Kern");
    expect(searchFiltersKey({ ...base, threshold: "105F", indicator: "frequency" })).toBe("Kern");
    expect(searchFiltersKey({ ...base, county: "Marin" })).toBe("Marin");
  });
});

describe("fetchExtremeHeatSeries", () => {
  const S3_HREF = "s3://test-bucket/extreme-heat/sacramento.csv";
  const NORMALIZED_CSV_URL = "https://test-bucket.s3.amazonaws.com/extreme-heat/sacramento.csv";

  const SELECTIONS: ExtremeHeatDaysSelections = { ...DEFAULT_SELECTIONS, county: "Sacramento" };

  function makeItem(overrides: Partial<StacItem> = {}): StacItem {
    return {
      type: "Feature",
      id: "wrf-extreme-heat-tool-county-csv-06067",
      geometry: null,
      links: [],
      assets: { data: { href: S3_HREF } },
      properties: { county_name: "Sacramento", county_code: "06067" },
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

  it("parses the county CSV into a chart-ready series", async () => {
    mockSearch([makeItem()]);
    mockCsv(
      [
        "warming_level,t2max_99pctl,t2max_ge100F,t2max_ge105F",
        "0.8,40.1,10,2",
        "1.5,42.0,20,5",
        "2.0,44.5,30,9",
      ].join("\n")
    );

    const series = await fetchExtremeHeatSeries(SELECTIONS);

    expect(series.county).toBe("Sacramento");
    expect(series.countyCode).toBe("06067");
    expect(series.globalWarmingLevels).toEqual([0.8, 1.5, 2.0]);
    expect(series.valuesByVariable.t2max_ge100F).toEqual([10, 20, 30]);
    expect(series.valuesByVariable.t2max_ge105F).toEqual([2, 5, 9]);
    expect(series.sourceCsvUrl).toBe(NORMALIZED_CSV_URL);
  });

  it("normalizes the s3:// asset href to https before fetching the CSV", async () => {
    let requestedUrl = "";
    mockSearch([makeItem()]);
    server.use(
      http.get(NORMALIZED_CSV_URL, ({ request }) => {
        requestedUrl = request.url;
        return HttpResponse.text("warming_level,t2max_ge100F\n0.8,10");
      })
    );

    await fetchExtremeHeatSeries(SELECTIONS);

    expect(requestedUrl).toBe(NORMALIZED_CSV_URL);
  });

  it("skips rows with a non-numeric warming level", async () => {
    mockSearch([makeItem()]);
    mockCsv(
      [
        "warming_level,t2max_99pctl,t2max_ge100F,t2max_ge105F",
        "0.8,40.1,10,2",
        "not-a-number,1,1,1",
        "2.0,44.5,30,9",
      ].join("\n")
    );

    const series = await fetchExtremeHeatSeries(SELECTIONS);

    expect(series.globalWarmingLevels).toEqual([0.8, 2.0]);
    expect(series.valuesByVariable.t2max_ge100F).toEqual([10, 30]);
  });

  it("represents an absent metric column as NaN", async () => {
    mockSearch([makeItem()]);
    // CSV omits the t2max_ge105F column entirely.
    mockCsv(["warming_level,t2max_99pctl,t2max_ge100F", "0.8,40.1,10", "1.5,42.0,20"].join("\n"));

    const series = await fetchExtremeHeatSeries(SELECTIONS);

    expect(series.valuesByVariable.t2max_ge105F).toEqual([NaN, NaN]);
    expect(series.valuesByVariable.t2max_ge100F).toEqual([10, 20]);
  });

  it("reads an empty metric cell as 0 (current parser behavior)", async () => {
    mockSearch([makeItem()]);
    mockCsv(["warming_level,t2max_ge100F,t2max_ge105F", "0.8,,2", "1.5,20,5"].join("\n"));

    const series = await fetchExtremeHeatSeries(SELECTIONS);

    // Number("") === 0, so an empty cell is NOT treated as missing data.
    expect(series.valuesByVariable.t2max_ge100F[0]).toBe(0);
    expect(series.valuesByVariable.t2max_ge100F[1]).toBe(20);
  });

  it("falls back to the FIPS id suffix when county_code is absent", async () => {
    mockSearch([makeItem({ properties: { county_name: "Sacramento" } })]);
    mockCsv("warming_level,t2max_ge100F\n0.8,10");

    const series = await fetchExtremeHeatSeries(SELECTIONS);

    expect(series.countyCode).toBe("06067");
  });

  it("throws when no STAC item matches the county", async () => {
    mockSearch([]);
    await expect(fetchExtremeHeatSeries(SELECTIONS)).rejects.toThrow(
      'No STAC item found for county "Sacramento"'
    );
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
