import { describe, expect, it } from "vitest";

import { formatChartExportFilename, formatDegreeDays, formatViewTitle } from "./format";
import type { HddCddSelections } from "./options";

const SELECTIONS: HddCddSelections = {
  climateVariable: "cdd",
  spatialAggregation: "ca_counties",
  location: "Sacramento",
};

describe("formatViewTitle", () => {
  it("includes the selected county with its ' County' suffix", () => {
    expect(formatViewTitle(SELECTIONS)).toBe(
      "Annual Cooling Degree Days (65°F) Timeseries: Sacramento County"
    );
  });

  it("reflects the heating-degree-days metric label", () => {
    expect(formatViewTitle({ ...SELECTIONS, climateVariable: "hdd" })).toBe(
      "Annual Heating Degree Days (65°F) Timeseries: Sacramento County"
    );
  });

  it("uses the raw location name for non-county aggregations", () => {
    expect(
      formatViewTitle({
        ...SELECTIONS,
        spatialAggregation: "forecast_zones",
        location: "Greater Bay Area",
      })
    ).toBe("Annual Cooling Degree Days (65°F) Timeseries: Greater Bay Area");
  });
});

describe("formatDegreeDays", () => {
  it("rounds to the nearest whole number with thousands separators", () => {
    expect(formatDegreeDays(1234.6)).toBe("1,235");
    expect(formatDegreeDays(0)).toBe("0");
  });

  it("returns an em dash for non-finite values", () => {
    expect(formatDegreeDays(NaN)).toBe("—");
    expect(formatDegreeDays(Infinity)).toBe("—");
  });
});

describe("formatChartExportFilename", () => {
  it("builds a slugified, dated PNG filename with the climate variable prefix", () => {
    const date = new Date(2026, 0, 15);
    expect(formatChartExportFilename("cdd", "Sacramento County", date)).toBe(
      "cdd_sacramento-county_2026-01-15.png"
    );
  });

  it("uses the hdd prefix for that metric", () => {
    const date = new Date(2026, 0, 15);
    expect(formatChartExportFilename("hdd", "San Diego", date)).toBe(
      "hdd_san-diego_2026-01-15.png"
    );
  });

  it("falls back to 'unknown' when the location slug is empty", () => {
    const date = new Date(2026, 0, 15);
    expect(formatChartExportFilename("cdd", "", date)).toBe("cdd_unknown_2026-01-15.png");
  });
});
