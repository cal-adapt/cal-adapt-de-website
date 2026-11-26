// Fetch every climate profile (TMY, hot and cold shock XMY, hot and cold
// persistence XMY) for one station, model and warming level, and parse each
// into 8760 hourly values per variable, indexed by hour of a non-leap year
// (0 = Jan 1 00:00). All five load up front (~3.3 MB) so toggling profiles on
// the chart is instant.
//
// Pipeline:
//  1. One STAC `/search` covering all five profiles (an OR of each profile's
//     collection, shock type and percentile), filtered by station, model and
//     warming level. One request instead of five avoids extra round trips and
//     parallel STAC Lambda cold starts.
//  2. Each collection publishes separate CSV and EPW items; keep the CSVs.
//  3. Fetch and parse the five CSVs in parallel.

import { csvParse } from "d3";

import { calAdaptApi, type ItemSearchFilters, type StacItem } from "@/lib/cal-adapt-api";
import { normalizeDownloadUrl } from "@/utils/url";

import {
  type ClimateProfilesSelections,
  getProfile,
  percentileFor,
  PROFILE_IDS,
  type ProfileId,
  type VariableId,
  VARIABLES,
} from "./options";

export const HOURS_PER_YEAR = 8760;

/** Days before the start of each month in a non-leap year. */
const DAYS_BEFORE_MONTH = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

/** Hour-of-year index (0-8759) for a month (1-12), day (1-31) and hour (0-23). */
export function hourOfYear(month: number, day: number, hour: number): number {
  return (DAYS_BEFORE_MONTH[month - 1] + day - 1) * 24 + hour;
}

/** Month (1-12) that a given hour of year falls in. */
export function monthOfHour(hour: number): number {
  const day = Math.floor(hour / 24);
  let month = 12;
  while (DAYS_BEFORE_MONTH[month - 1] > day) month -= 1;
  return month;
}

/** Hourly values (length 8760) per variable, in display units. NaN where missing. */
export type HourlyProfile = Partial<Record<VariableId, number[]>>;

export interface ProfileSet {
  profiles: Record<ProfileId, HourlyProfile>;
  /** https URLs of the CSVs. */
  sourceUrls: Record<ProfileId, string>;
}

/**
 * Parse a TMY/XMY CSV. The first line is station metadata; the second is the
 * header (`time` plus one column per variable). Rows are placed by the
 * month, day and hour of their timestamp, ignoring the year: these profiles
 * stitch together months (or hours) from different years.
 */
export function parseHourlyCsv(text: string): HourlyProfile {
  const firstNewline = text.indexOf("\n");
  const rows = csvParse(firstNewline >= 0 ? text.slice(firstNewline + 1) : text);

  const values: HourlyProfile = {};
  const columns = VARIABLES.filter((v) => rows.columns.includes(v.column));
  for (const variable of columns) {
    values[variable.value] = new Array<number>(HOURS_PER_YEAR).fill(NaN);
  }

  for (const row of rows) {
    const match = /^\d{4}-(\d{2})-(\d{2})[ T](\d{2})/.exec(row.time ?? "");
    if (!match) continue;
    const [month, day, hour] = [Number(match[1]), Number(match[2]), Number(match[3])];
    if (month === 2 && day === 29) continue;
    const index = hourOfYear(month, day, hour);
    for (const variable of columns) {
      const raw = toNumber(row[variable.column]);
      values[variable.value]![index] = variable.convert ? variable.convert(raw) : raw;
    }
  }
  return values;
}

/** CQL2 clause matching one profile's items, e.g. `(collection='xmy-shock' AND shock_type='hot')`. */
function profileClause(id: ProfileId, selections: ClimateProfilesSelections): string {
  const { collection, shockType } = getProfile(id);
  const percentile = percentileFor(id, selections);
  const parts = [`collection='${collection}'`];
  if (shockType) parts.push(`shock_type='${shockType}'`);
  if (percentile) parts.push(`percentile='${percentile}'`);
  return `(${parts.join(" AND ")})`;
}

/** STAC filters for one search that returns every profile's items. */
export function buildSearchFilters(selections: ClimateProfilesSelections): ItemSearchFilters {
  return {
    collectionFilter: `(${PROFILE_IDS.map((id) => profileClause(id, selections)).join(" OR ")})`,
    locationFilter: `location='${selections.station}'`,
    modelFilter: `model='${selections.model}'`,
    timePeriodFilter: `time_period='${selections.period}'`,
  };
}

/** Which profile a STAC item belongs to, or undefined if none. */
export function profileForItem(
  item: Pick<StacItem, "collection" | "properties">,
  selections: ClimateProfilesSelections
): ProfileId | undefined {
  return PROFILE_IDS.find((id) => {
    const { collection, shockType } = getProfile(id);
    const percentile = percentileFor(id, selections);
    return (
      item.collection === collection &&
      (!shockType || item.properties.shock_type === shockType) &&
      (!percentile || item.properties.percentile === percentile)
    );
  });
}

/**
 * Cache key over the selections that change the request. Which profiles are
 * shown and the variable are display-only.
 */
export function searchFiltersKey(selections: ClimateProfilesSelections): string {
  const { station, period, model, hotPercentile, coldPercentile } = selections;
  return [station, period, model, hotPercentile, coldPercentile].join("|");
}

export async function fetchProfiles(
  selections: ClimateProfilesSelections,
  { signal }: { signal?: AbortSignal } = {}
): Promise<ProfileSet> {
  const items = await calAdaptApi.stac.searchItems(buildSearchFilters(selections), { signal });
  const csvUrls = new Map<ProfileId, string>();
  for (const item of items.features) {
    const id = profileForItem(item, selections);
    if (id && item.assets.csv) csvUrls.set(id, assetUrl(item, "csv"));
  }

  const loaded = await Promise.all(
    PROFILE_IDS.map(async (id) => {
      const url = csvUrls.get(id);
      if (!url) throw new Error(`No CSV item found for profile "${id}"`);
      return { id, url, values: parseHourlyCsv(await fetchCsvText(url, signal)) };
    })
  );
  return {
    profiles: Object.fromEntries(loaded.map((p) => [p.id, p.values])) as ProfileSet["profiles"],
    sourceUrls: Object.fromEntries(loaded.map((p) => [p.id, p.url])) as ProfileSet["sourceUrls"],
  };
}

function assetUrl(item: StacItem, key: string): string {
  const href = item.assets[key]?.href;
  if (typeof href !== "string" || href.length === 0) {
    throw new Error(`STAC item ${item.id} has no \`${key}\` asset href`);
  }
  return normalizeDownloadUrl(href);
}

async function fetchCsvText(url: string, signal?: AbortSignal): Promise<string> {
  const response = await fetch(url, { headers: { Accept: "text/csv" }, signal });
  if (!response.ok) {
    throw new Error(`CSV fetch failed (${response.status} ${response.statusText}): ${url}`);
  }
  return response.text();
}

function toNumber(raw: string | undefined): number {
  if (raw == null || raw.trim() === "") return NaN;
  return Number(raw);
}
