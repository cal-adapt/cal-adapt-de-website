// Extreme Heat Season: how often each day of the year exceeds the threshold.
// Same STAC search → region CSV pipeline as `series.ts`, but the CSV holds one
// row per (warming level, day of year) instead of one row per warming level:
// 5 warming levels × 365 days = 1,825 values. February 29 is not in the data,
// so `day_of_year` runs 1-365 on a no-leap calendar.

import { csvParse } from "d3";

import type { StacItem } from "@/lib/cal-adapt-api";

import { type ExtremeHeatDaysSelections, getHeatMetric } from "./options";
import { fetchRegionCsv, type FetchSeriesOptions, toNumber } from "./series";

export const DAYS_IN_YEAR = 365;

/** Chart-ready shape for one region + threshold. */
export interface ExtremeHeatSeason {
  /** STAC `boundary` type, e.g. "ca_counties". */
  boundary: string;
  location: string;
  /** STAC `threshold_name`, e.g. "t2max_ge90F". */
  thresholdName: string;
  /** Global warming levels in °C, sorted ascending. */
  globalWarmingLevels: number[];
  /** Percent of years in the 30-year warming level window in which the day
   *  exceeds the threshold, as `frequencyPercent[levelIndex][dayOfYear - 1]`.
   *  NaN where the data has no value, which is not the same as 0%. */
  frequencyPercent: number[][];
  /** STAC item this season was derived from. */
  sourceItem: StacItem;
  /** https URL of the region CSV that produced this season. */
  sourceCsvUrl: string;
}

/** True when `season` has at least one value to plot. */
export function hasRenderableSeason(season: ExtremeHeatSeason | null): boolean {
  if (!season || season.globalWarmingLevels.length === 0) return false;
  return season.frequencyPercent.some((days) => days.some((v) => Number.isFinite(v)));
}

/**
 * End-to-end fetch: STAC search → region CSV download → parsed season. Throws
 * if any step fails so the calling hook can surface a single error state.
 */
export async function fetchExtremeHeatSeason(
  selections: ExtremeHeatDaysSelections,
  options: FetchSeriesOptions = {}
): Promise<ExtremeHeatSeason> {
  const metric = getHeatMetric(selections.climateVariable);
  if (metric.chartKind !== "heatmap") {
    throw new Error(`"${metric.value}" is not a day-of-year metric`);
  }
  const { item, csvUrl, csvText, thresholdName } = await fetchRegionCsv(selections, options);

  // Rows are placed by their own coordinates rather than by position, so the
  // result doesn't depend on the order the CSV lists them in.
  const byLevel = new Map<number, number[]>();
  for (const row of csvParse(csvText)) {
    const globalWarmingLevel = Number(row.warming_level);
    const dayOfYear = Number(row.day_of_year);
    if (!Number.isFinite(globalWarmingLevel)) continue;
    if (!Number.isInteger(dayOfYear) || dayOfYear < 1 || dayOfYear > DAYS_IN_YEAR) continue;
    let days = byLevel.get(globalWarmingLevel);
    if (!days) {
      days = new Array<number>(DAYS_IN_YEAR).fill(NaN);
      byLevel.set(globalWarmingLevel, days);
    }
    days[dayOfYear - 1] = toNumber(row[metric.valueColumn]);
  }

  const globalWarmingLevels = [...byLevel.keys()].sort((a, b) => a - b);

  return {
    boundary: selections.spatialAggregation,
    location: selections.location,
    thresholdName,
    globalWarmingLevels,
    frequencyPercent: globalWarmingLevels.map((level) => byLevel.get(level)!),
    sourceItem: item,
    sourceCsvUrl: csvUrl,
  };
}

/** The part of the year in which a day exceeds the threshold in at least half
 *  of years. */
export interface FrequentSeason {
  /** Number of days at or above 50%. */
  dayCount: number;
  /** First and last such day of year (1-365). Days between them may fall
   *  below 50%. */
  firstDay: number;
  lastDay: number;
}

const FREQUENT_PERCENT = 50;

/** Summarize one warming level's days, or null when no day reaches 50%. */
export function summarizeFrequentSeason(days: readonly number[]): FrequentSeason | null {
  let dayCount = 0;
  let firstDay = 0;
  let lastDay = 0;
  days.forEach((value, i) => {
    if (!(value >= FREQUENT_PERCENT)) return;
    dayCount += 1;
    if (firstDay === 0) firstDay = i + 1;
    lastDay = i + 1;
  });
  return dayCount === 0 ? null : { dayCount, firstDay, lastDay };
}
