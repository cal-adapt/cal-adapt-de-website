import { describe, expect, it } from "vitest";

import {
  COLOR_BY_GLOBAL_WARMING_LEVEL,
  colorForGlobalWarmingLevel,
  formatChartExportFilename,
  formatDaysPerYear,
  formatGlobalWarmingLevel,
  formatGlobalWarmingLevelName,
  formatThresholdLabel,
  formatViewTitle,
} from "./format";
import type { ExtremeHeatDaysSelections } from "./options";

const SELECTIONS: ExtremeHeatDaysSelections = {
  climateVariable: "extreme-heat-days",
  threshold: "100F",
  indicator: "frequency",
  spatialAggregation: "ca_counties",
  location: "Sacramento",
};

describe("colorForGlobalWarmingLevel", () => {
  it("returns the mapped color for known warming levels", () => {
    expect(colorForGlobalWarmingLevel(0.8)).toBe(COLOR_BY_GLOBAL_WARMING_LEVEL[0.8]);
    expect(colorForGlobalWarmingLevel(3.0)).toBe(COLOR_BY_GLOBAL_WARMING_LEVEL[3.0]);
  });

  it("falls back to a neutral color for unknown levels", () => {
    expect(colorForGlobalWarmingLevel(99)).toBe("#acb5bd");
  });
});

describe("formatViewTitle", () => {
  it("includes the selected county with its ' County' suffix", () => {
    expect(formatViewTitle(SELECTIONS)).toBe(
      "Extreme Heat Frequency by Global Warming Level: Sacramento County (100°F)"
    );
  });

  it("reflects the warm-nights metric label", () => {
    expect(formatViewTitle({ ...SELECTIONS, climateVariable: "warm-nights" })).toBe(
      "Warm Nights Frequency by Global Warming Level: Sacramento County (100°F)"
    );
  });

  it("includes a percentile threshold in the title", () => {
    expect(formatViewTitle({ ...SELECTIONS, threshold: "98pctl" })).toBe(
      "Extreme Heat Frequency by Global Warming Level: Sacramento County (98th percentile)"
    );
  });

  it("uses the raw location name for non-county aggregations", () => {
    expect(
      formatViewTitle({
        ...SELECTIONS,
        spatialAggregation: "forecast_zones",
        location: "Greater Bay Area",
      })
    ).toBe("Extreme Heat Frequency by Global Warming Level: Greater Bay Area (100°F)");
  });
});

describe("formatGlobalWarmingLevel", () => {
  it("formats to one decimal place with a °C suffix", () => {
    expect(formatGlobalWarmingLevel(2)).toBe("2.0°C");
    expect(formatGlobalWarmingLevel(1.5)).toBe("1.5°C");
  });
});

describe("formatGlobalWarmingLevelName", () => {
  it("returns the era name for known warming levels", () => {
    expect(formatGlobalWarmingLevelName(0.8)).toBe("Historical");
    expect(formatGlobalWarmingLevelName(3.0)).toBe("End of century");
  });

  it("returns an empty string for unknown levels", () => {
    expect(formatGlobalWarmingLevelName(99)).toBe("");
  });
});

describe("formatDaysPerYear", () => {
  it("rounds to one decimal place", () => {
    expect(formatDaysPerYear(48.33)).toBe("48.3");
    expect(formatDaysPerYear(0)).toBe("0.0");
  });
});

describe("formatThresholdLabel", () => {
  it("maps known threshold values to their display label across metrics", () => {
    expect(formatThresholdLabel("100F")).toBe("100°F");
    expect(formatThresholdLabel("105F")).toBe("105°F");
    expect(formatThresholdLabel("80F")).toBe("80°F");
    expect(formatThresholdLabel("98pctl")).toBe("98th percentile");
    expect(formatThresholdLabel("75pctl")).toBe("75th percentile");
  });

  it("passes through an unknown threshold unchanged", () => {
    expect(formatThresholdLabel("999F")).toBe("999F");
  });
});

describe("formatChartExportFilename", () => {
  it("builds a slugified, dated PNG filename with the metric prefix", () => {
    const date = new Date(2026, 0, 15);
    expect(formatChartExportFilename("extreme-heat-days", "San Diego", date)).toBe(
      "extreme-heat-days_san-diego_2026-01-15.png"
    );
  });

  it("uses the warm-nights prefix for that metric", () => {
    const date = new Date(2026, 0, 15);
    expect(formatChartExportFilename("warm-nights", "San Diego", date)).toBe(
      "warm-nights_san-diego_2026-01-15.png"
    );
  });

  it("falls back to 'unknown' when the location slug is empty", () => {
    const date = new Date(2026, 0, 15);
    expect(formatChartExportFilename("extreme-heat-days", "", date)).toBe(
      "extreme-heat-days_unknown_2026-01-15.png"
    );
  });
});
