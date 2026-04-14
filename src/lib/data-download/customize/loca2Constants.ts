/**
 * `loca2-county` on STAC API v2 does not expose `cmip6:variable_id` in collection summaries or
 * queryables; each item’s variables are NetCDF asset keys (`pr`, `tasmax`, …).
 *
 * Keep in sync with item assets returned by the API.
 */
export const LOCA2_COUNTY_V2_ASSET_VARIABLE_IDS: readonly string[] = [
  "tasmax",
  "tasmin",
  "pr",
  "huss",
  "rsds",
  "hursmax",
  "hursmin",
];
