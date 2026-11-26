import { describe, expect, it } from "vitest";

import { formatChartExportFilename } from "./format";
import {
  type ClimateProfilesSelections,
  DEFAULT_SELECTIONS,
  profileLabel,
  usesAdvancedSelections,
  withDefaultAdvanced,
} from "./options";
import {
  buildSearchFilters,
  hourOfYear,
  HOURS_PER_YEAR,
  monthOfHour,
  parseHourlyCsv,
  profileForItem,
  searchFiltersKey,
} from "./profiles";
import { selectionsFromSearchParams, selectionsToSearchParams } from "./search-params";
import { isStationId } from "./stations";

const persistence: ClimateProfilesSelections = {
  ...DEFAULT_SELECTIONS,
  xmy: "cold-persistence",
  hotPercentile: "95ptile",
  coldPercentile: "5ptile",
};

describe("hourOfYear / monthOfHour", () => {
  it("indexes a non-leap year from 0", () => {
    expect(hourOfYear(1, 1, 0)).toBe(0);
    expect(hourOfYear(3, 1, 0)).toBe(59 * 24);
    expect(hourOfYear(12, 31, 23)).toBe(HOURS_PER_YEAR - 1);
  });

  it("maps hours back to months", () => {
    expect(monthOfHour(0)).toBe(1);
    expect(monthOfHour(hourOfYear(2, 28, 23))).toBe(2);
    expect(monthOfHour(hourOfYear(3, 1, 0))).toBe(3);
    expect(monthOfHour(HOURS_PER_YEAR - 1)).toBe(12);
  });
});

describe("parseHourlyCsv", () => {
  const csv = [
    "722868,'Palm Springs Regional Airport (KPSP)',CA,-7,33.8,-116.5,145.0,Generated on Cal-Adapt",
    "time,Air temperature at 2m (degC),Relative humidity (0-100),Wind direction at 10m (degrees)",
    "2021-01-01 00:00,10.0,50.0,300",
    "2045-03-01 05:00,0.0,,10",
  ].join("\n");

  it("skips the metadata line, places rows by month/day/hour and converts °C to °F", () => {
    const values = parseHourlyCsv(csv);
    expect(values.temperature).toHaveLength(HOURS_PER_YEAR);
    expect(values.temperature![0]).toBe(50);
    expect(values.temperature![hourOfYear(3, 1, 5)]).toBe(32);
    expect(values.relativeHumidity![hourOfYear(3, 1, 5)]).toBeNaN();
    expect(values.temperature![1]).toBeNaN();
  });

  it("only returns variables the tool shows", () => {
    expect(Object.keys(parseHourlyCsv(csv)).sort()).toEqual(["relativeHumidity", "temperature"]);
  });
});

describe("STAC filters", () => {
  it("builds one search covering every profile for the station, model and warming level", () => {
    expect(buildSearchFilters(persistence)).toEqual({
      collectionFilter:
        "((collection='typical-met-year') OR (collection='xmy-shock' AND shock_type='hot') OR " +
        "(collection='xmy-shock' AND shock_type='cold') OR " +
        "(collection='xmy-persist' AND percentile='95ptile') OR " +
        "(collection='xmy-persist' AND percentile='5ptile'))",
      locationFilter: "location='sacramento_executive_airport_ksac'",
      modelFilter: "model='mpi-esm1-2-hr'",
      timePeriodFilter: "time_period='mid-century'",
    });
  });

  it("matches search results back to profiles", () => {
    const item = (collection: string, properties: Record<string, unknown> = {}) => ({
      collection,
      properties,
    });
    expect(profileForItem(item("typical-met-year"), persistence)).toBe("tmy");
    expect(profileForItem(item("xmy-shock", { shock_type: "cold" }), persistence)).toBe(
      "cold-shock"
    );
    expect(profileForItem(item("xmy-persist", { percentile: "95ptile" }), persistence)).toBe(
      "hot-persistence"
    );
    expect(profileForItem(item("xmy-persist", { percentile: "5ptile" }), persistence)).toBe(
      "cold-persistence"
    );
    expect(profileForItem(item("xmy-persist", { percentile: "40ptile" }), persistence)).toBe(
      undefined
    );
  });

  it("doesn't refetch when only the shown profiles or variable change", () => {
    const toggled = { ...DEFAULT_SELECTIONS, profiles: [], variable: "windSpeed" as const };
    expect(searchFiltersKey(toggled)).toBe(searchFiltersKey(DEFAULT_SELECTIONS));
    expect(searchFiltersKey(persistence)).not.toBe(searchFiltersKey(DEFAULT_SELECTIONS));
  });
});

describe("profile labels and advanced view", () => {
  it("names the persistence percentile", () => {
    expect(profileLabel("hot-shock", DEFAULT_SELECTIONS)).toBe("Hot shock XMY");
    expect(profileLabel("hot-persistence", DEFAULT_SELECTIONS)).toBe(
      "Hot persistence XMY (90th percentile)"
    );
    expect(profileLabel("cold-persistence", persistence)).toBe(
      "Cold persistence XMY (5th percentile)"
    );
  });

  it("detects and resets advanced selections", () => {
    expect(usesAdvancedSelections(DEFAULT_SELECTIONS)).toBe(false);
    expect(usesAdvancedSelections(persistence)).toBe(true);
    const reset = withDefaultAdvanced({ ...persistence, model: "miroc6" });
    expect(usesAdvancedSelections(reset)).toBe(false);
    expect(reset.xmy).toBe(persistence.xmy);
  });
});

describe("search params", () => {
  it("round-trips selections and keeps defaults out of the URL", () => {
    expect(selectionsToSearchParams(DEFAULT_SELECTIONS).toString()).toBe("");
    const params = selectionsToSearchParams(persistence);
    expect(params.get("compare")).toBe("cold-persistence");
    expect(selectionsFromSearchParams(params)).toEqual(persistence);
  });

  it("falls back to defaults for unknown values", () => {
    const params = new URLSearchParams("model=gfdl&station=x' OR '1'='1");
    expect(selectionsFromSearchParams(params)).toEqual(DEFAULT_SELECTIONS);
  });

  it("ignores an unknown comparison", () => {
    expect(selectionsFromSearchParams(new URLSearchParams("compare=tmy")).xmy).toBe("hot-shock");
  });
});

describe("isStationId", () => {
  it("accepts STAC location slugs and rejects anything that could break a CQL filter", () => {
    expect(isStationId("burbank-glendale-pasadena_airport_kbur")).toBe(true);
    expect(isStationId("x' OR '1'='1")).toBe(false);
    expect(isStationId("")).toBe(false);
  });
});

describe("formatChartExportFilename", () => {
  it("names the variable, comparison, station and date", () => {
    expect(
      formatChartExportFilename(
        persistence,
        "Sacramento Executive Airport (KSAC)",
        new Date(2026, 10, 25)
      )
    ).toBe("temperature_tmy-vs-cold-persistence_sacramento-executive-airport-ksac_2026-11-25.png");
  });
});
