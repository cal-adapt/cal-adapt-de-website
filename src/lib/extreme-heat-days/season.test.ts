import { http, HttpResponse } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { STAC_API_BASE_URL } from "@/config/constants";
import type { StacItem } from "@/lib/cal-adapt-api";
import { server } from "@/testing/mocks/server";

import { fetchHeatChartData, hasRenderableChartData } from "./chart-data";
import { formatNoLeapDate, formatSeasonDescription, formatViewSubtitle } from "./format";
import { DEFAULT_SELECTIONS, type ExtremeHeatDaysSelections } from "./options";
import {
  DAYS_IN_YEAR,
  type ExtremeHeatSeason,
  fetchExtremeHeatSeason,
  hasRenderableSeason,
  summarizeFrequentSeason,
} from "./season";
import { buildSearchFilters, searchFiltersKey } from "./series";

const SELECTIONS: ExtremeHeatDaysSelections = {
  ...DEFAULT_SELECTIONS,
  climateVariable: "extreme-heat-season",
  threshold: "90F",
  location: "Imperial",
};

/** 365 days at `outside`, with days `first`-`last` set to `inside`. */
function yearWith(first: number, last: number, inside: number, outside = 0): number[] {
  return Array.from({ length: DAYS_IN_YEAR }, (_, i) =>
    i + 1 >= first && i + 1 <= last ? inside : outside
  );
}

function makeSeason(overrides: Partial<ExtremeHeatSeason> = {}): ExtremeHeatSeason {
  return {
    boundary: "ca_counties",
    location: "Imperial",
    thresholdName: "t2max_ge90F",
    globalWarmingLevels: [0.8, 3.0],
    frequencyPercent: [yearWith(152, 243, 60), yearWith(121, 273, 90)],
    sourceItem: {} as StacItem,
    sourceCsvUrl: "https://example.com/imperial.csv",
    ...overrides,
  };
}

describe("extreme heat season search", () => {
  it("searches the season collection by boundary and threshold", () => {
    expect(buildSearchFilters(SELECTIONS)).toEqual({
      collectionFilter: "collection='ehs-metrics-mm-boundary-csv'",
      variableFilter: "variable_id='frequency_percent'",
      boundaryFilter: "boundary='ca_counties'",
      thresholdNameFilter: "threshold_name='t2max_ge90F'",
    });
    expect(searchFiltersKey(SELECTIONS)).toBe("frequency_percent|ca_counties|t2max_ge90F|Imperial");
  });
});

describe("hasRenderableSeason", () => {
  it("is false for a null or empty season", () => {
    expect(hasRenderableSeason(null)).toBe(false);
    expect(hasRenderableSeason(makeSeason({ globalWarmingLevels: [], frequencyPercent: [] }))).toBe(
      false
    );
  });

  it("is false when every value is missing", () => {
    const missing = yearWith(1, DAYS_IN_YEAR, NaN);
    expect(hasRenderableSeason(makeSeason({ frequencyPercent: [missing, missing] }))).toBe(false);
  });

  it("is true when a value is 0%, which is data rather than missing", () => {
    const zeros = yearWith(1, DAYS_IN_YEAR, 0);
    expect(hasRenderableSeason(makeSeason({ frequencyPercent: [zeros, zeros] }))).toBe(true);
  });
});

describe("summarizeFrequentSeason", () => {
  it("counts the days at or above 50% and finds the first and last", () => {
    expect(summarizeFrequentSeason(yearWith(152, 243, 50))).toEqual({
      dayCount: 92,
      firstDay: 152,
      lastDay: 243,
    });
  });

  it("is null when no day reaches 50%, including when values are missing", () => {
    expect(summarizeFrequentSeason(yearWith(152, 243, 49.9))).toBeNull();
    expect(summarizeFrequentSeason(yearWith(1, DAYS_IN_YEAR, NaN))).toBeNull();
  });
});

describe("formatNoLeapDate", () => {
  it("uses a calendar without February 29", () => {
    expect(formatNoLeapDate(1)).toBe("Jan 1");
    expect(formatNoLeapDate(59)).toBe("Feb 28");
    expect(formatNoLeapDate(60)).toBe("Mar 1");
    expect(formatNoLeapDate(182)).toBe("Jul 1");
    expect(formatNoLeapDate(365)).toBe("Dec 31");
  });
});

describe("extreme heat season chart text", () => {
  it("names the statistic and threshold in the subtitle", () => {
    expect(formatViewSubtitle(SELECTIONS)).toBe(
      "Multi-model mean of region-median exceedance frequency above 90°F"
    );
    expect(formatViewSubtitle({ ...SELECTIONS, threshold: "95pctl" })).toBe(
      "Multi-model mean of region-median exceedance frequency above the 95th percentile"
    );
  });

  it("describes the location, warming levels, and seasonal pattern", () => {
    const description = formatSeasonDescription(SELECTIONS, makeSeason());
    expect(description).toContain("Heatmap for Imperial County.");
    expect(description).toContain("global warming level (0.8°C, 3.0°C)");
    expect(description).toContain(
      "At 0.8°C, the threshold is exceeded in at least half of years on 92 days of the year, between Jun 1 and Aug 31."
    );
    expect(description).toContain(
      "At 3.0°C, the threshold is exceeded in at least half of years on 153 days of the year, between May 1 and Sep 30."
    );
  });

  it("says so when no day reaches half of years", () => {
    const description = formatSeasonDescription(
      SELECTIONS,
      makeSeason({ frequencyPercent: [yearWith(1, 365, 0), yearWith(1, 365, 10)] })
    );
    expect(description).toContain(
      "At 0.8°C, no day of the year exceeds the threshold in at least half of years."
    );
  });
});

describe("fetchExtremeHeatSeason", () => {
  const ASSET_PREFIX =
    "s3://cadcat/wrf/extreme-heat-season/multimodel_per_boundary/ca_counties/gwl/csv/t2max_ge90F/";
  const CSV_URL =
    "https://cadcat.s3.amazonaws.com/wrf/extreme-heat-season/multimodel_per_boundary/ca_counties/gwl/csv/t2max_ge90F/Imperial_County_t2max_ge90F.csv";
  const HEADER =
    "warming_level,day_of_year,frequency_percent,Lambert_Conformal,region_id,region_mask,region_name";

  const ITEM: StacItem = {
    type: "Feature",
    id: "ehs-metrics-mm-boundary-csv-ca_counties-t2max_ge90F",
    geometry: null,
    links: [],
    assets: { data: { href: ASSET_PREFIX } },
    properties: {
      variable_id: "frequency_percent",
      boundary: "ca_counties",
      threshold_name: "t2max_ge90F",
    },
  };

  function mockSearch(features: StacItem[]) {
    server.use(
      http.get(`${STAC_API_BASE_URL}/search`, () =>
        HttpResponse.json({ type: "FeatureCollection", features, links: [] })
      )
    );
  }

  function mockCsv(rows: string[]) {
    server.use(http.get(CSV_URL, () => HttpResponse.text([HEADER, ...rows].join("\n"))));
  }

  function row(level: string, day: number, value: string): string {
    return `${level},${day},${value},1,35,35.0,Imperial County`;
  }

  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("places each row by its warming level and day of year, whatever the row order", async () => {
    mockSearch([ITEM]);
    mockCsv([row("3.0", 2, "96.7"), row("0.8", 365, "3.3"), row("0.8", 1, "0.0")]);

    const season = await fetchExtremeHeatSeason(SELECTIONS);

    expect(season.globalWarmingLevels).toEqual([0.8, 3.0]);
    expect(season.frequencyPercent).toHaveLength(2);
    expect(season.frequencyPercent[0]).toHaveLength(DAYS_IN_YEAR);
    expect(season.frequencyPercent[0][0]).toBe(0);
    expect(season.frequencyPercent[0][364]).toBe(3.3);
    expect(season.frequencyPercent[1][1]).toBe(96.7);
    expect(season.thresholdName).toBe("t2max_ge90F");
    expect(season.sourceCsvUrl).toBe(CSV_URL);
  });

  it("keeps missing days and empty cells as NaN rather than 0", async () => {
    mockSearch([ITEM]);
    mockCsv([row("0.8", 1, "10.0"), row("0.8", 2, "")]);

    const season = await fetchExtremeHeatSeason(SELECTIONS);

    expect(season.frequencyPercent[0][1]).toBeNaN();
    expect(season.frequencyPercent[0][2]).toBeNaN();
  });

  it("ignores rows outside the 365-day calendar", async () => {
    mockSearch([ITEM]);
    mockCsv([row("0.8", 1, "10.0"), row("0.8", 366, "50.0"), row("0.8", 0, "50.0")]);

    const season = await fetchExtremeHeatSeason(SELECTIONS);

    expect(season.frequencyPercent[0].filter((v) => Number.isFinite(v))).toEqual([10]);
  });

  it("throws when no STAC item matches", async () => {
    mockSearch([]);
    await expect(fetchExtremeHeatSeason(SELECTIONS)).rejects.toThrow("No STAC item found");
  });

  it("rejects a variable that is not a day-of-year metric", async () => {
    await expect(fetchExtremeHeatSeason(DEFAULT_SELECTIONS)).rejects.toThrow(
      "is not a day-of-year metric"
    );
  });

  it("is what the tool fetches for the extreme heat season variable", async () => {
    mockSearch([ITEM]);
    mockCsv([row("0.8", 1, "10.0")]);

    const data = await fetchHeatChartData(SELECTIONS);

    expect(data.kind).toBe("heatmap");
    expect(hasRenderableChartData(data)).toBe(true);
  });
});
