# MVP 1.1 — Additional Metric: Warm Nights

**Tool:** Extreme Heat (formerly "Extreme Heat Days")
**Route:** `/dashboard/extreme-heat-days` (unchanged)
**Status:** Implemented behind `__FF_EXTREME_HEAT_DAYS__` (dev/staging). See §9.
**Feature flag:** `__FF_EXTREME_HEAT_DAYS__` (existing)

---

## 1. Summary

MVP 1.0 shipped a single-metric tool ("Extreme Heat Days") plotting the number of
extreme heat days per year across global warming levels for a selected county.

MVP 1.1 adds a **second climate variable — "Warm Nights"** — selectable from the
existing "Climate variable" dropdown. Selecting it fetches real Warm Nights data
from the API, re-renders the chart (threshold, title, y-axis), swaps the
subheading copy, and generalizes the tool title from "Extreme Heat Days" to
"Extreme Heat".

**Important:** MVP 1.1 also requires repointing the tool to a new STAC collection
(`eh-metrics-mm-boundary-csv`) whose data model is **fundamentally different**
from what MVP 1.0 was built against. This is not a drop-in dataset swap — it
inverts how threshold selection works and how CSVs are addressed (see §3). Plan
accordingly: the bulk of the effort is re-plumbing the data layer; adding Warm
Nights on top is comparatively small.

This spec covers user stories **14–17** plus the collection migration.

---

## 2. Backend / data dependency

> Request from backend: _"Front end extreme heat tool should point to
> `eh-metrics-mm-boundary-csv`."_

The frontend currently reads from `wrf-extreme-heat-tool-county-csv`:

```27:27:src/lib/extreme-heat-days/series.ts
export const EXTREME_HEAT_STAC_COLLECTION_ID = "wrf-extreme-heat-tool-county-csv" as const;
```

Repoint to `eh-metrics-mm-boundary-csv`. This collection is the multi-metric
(`mm`), multi-boundary product that serves **both** this metric axis (1.1) and
the future spatial-aggregation axis (MVP 1.3, §5.1).

> **Why `boundary`, not `county`?** MVP 1.3 replaces "County" with a generic
> "Spatial Aggregation" (county, watershed, census tract, IOU/POU, forecast
> zone, electric balancing area). The collection already contains all six
> boundary types; MVP 1.1 only exposes counties.

---

## 3. Data model (verified against the live STAC/S3, 2026-07-21)

This section is ground truth pulled from `stac.cal-adapt.org` and the `cadcat`
S3 bucket, not assumptions.

### 3.1 Collection shape — 1,332 items

`1,332 = 6 boundary types × 2 variables × 111 thresholds`

| Dimension | STAC property         | Values                                                                                                        |
| --------- | --------------------- | ------------------------------------------------------------------------------------------------------------- |
| Variable  | `variable_id`         | `eh_days` (Extreme heat days), `warm_nights` (Warm nights)                                                    |
| Boundary  | `boundary`            | `ca_counties`, `ca_watersheds`, `ca_census_tracts`, `ious_pous`, `forecast_zones`, `electric_balancing_areas` |
| Threshold | `threshold_name`      | 111 per variable (see §3.3)                                                                                   |
| Scenario  | `cmip6:experiment_id` | `ssp370` only                                                                                                 |

Human labels are provided by the collection:

- `caladapt:boundary_labels` (e.g. `ca_counties` → "California counties")
- `caladapt:variable_labels` (`eh_days` → "Extreme heat days", `warm_nights` →
  "Warm nights")

Queryable properties (from `/queryables`): `boundary`, `variable_id`,
`threshold_name`, `boundary_label`, `bias_adjusted`, `cmip6:activity_id`,
`cmip6:experiment_id`, `cmip6:institution_id`, `caladapt:spatial_type`.

### 3.2 STAC item = (variable × boundary × threshold)

A single item is **not** one region. It is one combination of variable, boundary
type, and threshold. Example item id:

```
eh-metrics-mm-boundary-csv-warm_nights-ious_pous-t2min_ge99pctl
```

Item properties of note: `variable_id`, `boundary`, `threshold_name`,
`boundary_label`, `caladapt:spatial_type: "boundary"`, `bias_adjusted: true`.

The `data` asset href is an **S3 directory prefix (ends in `/`), not a file**:

```
s3://cadcat/wrf/extreme-heat-tool/multimodel_per_boundary/{variable_id}/{boundary}/ssp370/{threshold_name}/
```

### 3.3 Thresholds (111 per variable)

- **Absolute:** `t2max_ge50F` … `t2max_ge135F` (86 values) — `t2max` for
  `eh_days`, `t2min` for `warm_nights`.
- **Percentile:** `..._ge75pctl` … `..._ge99pctl` (25 values).
- The current UI defaults `100F` and `105F` **do exist** (`t2max_ge100F`,
  `t2max_ge105F`), so MVP 1.0 defaults remain valid after migration.
- The only difference between the two metrics' thresholds is the `t2max` vs
  `t2min` prefix — reinforcing that they share one code path.

### 3.4 Per-region CSV (addressed by filename under the asset prefix)

Each region's CSV lives **under** the asset prefix, named
`{RegionName}_{threshold_name}.csv` with spaces replaced by underscores:

- Counties: `Sacramento_County_t2max_ge100F.csv` (note the `_County` suffix)
- IOU/POUs: `Alameda_Power_&_Telecom_t2min_ge99pctl.csv`, `City_of_Palo_Alto_t2min_ge99pctl.csv`

**CSV columns** (verified):

```
warming_level,multimodel_median,multimodel_p10,multimodel_p90
0.8,34.0,34.0,34.0
1.5,48.0,48.0,48.0
2.0,52.5,52.5,52.5
2.5,55.5,55.5,55.5
3.0,64.5,64.5,64.5
...
```

- Plot value = `multimodel_median` per warming level. `p10`/`p90` are available
  for an optional uncertainty band (out of scope for 1.1 unless product wants).
- ⚠️ **Data anomaly to confirm (§7 Q3):** the sampled Sacramento CSV contained
  **20 rows (the 5 warming levels repeated 4×)** and `median == p10 == p90` in
  every row. The parser must define how to collapse duplicate warming-level rows,
  and the identical percentiles suggest the ensemble stats are still placeholder.

### 3.5 The architecture inversion (why this is not a drop-in swap)

|                                | MVP 1.0 (as built)                   | `eh-metrics-mm-boundary-csv`                                       |
| ------------------------------ | ------------------------------------ | ------------------------------------------------------------------ |
| STAC item granularity          | one per county                       | one per (variable × boundary × threshold)                          |
| `assets.data.href`             | single CSV file                      | S3 **directory prefix**                                            |
| Region CSV                     | the item's file                      | `{prefix}{Region}_{threshold}.csv`                                 |
| CSV columns                    | one column per threshold             | `warming_level, multimodel_median, multimodel_p10, multimodel_p90` |
| **Threshold switch**           | client-side column pick (no refetch) | **new item + new CSV = refetch**                                   |
| **Variable switch**            | n/a                                  | **refetch**                                                        |
| Fetch key (`searchFiltersKey`) | `county`                             | `variable_id + boundary + threshold + region`                      |

Consequence: the current `series.ts` model —
`VALUE_COLUMN_VARIABLE_IDS`, `STAC_VARIABLE_ID_BY_THRESHOLD`,
`valuesByVariable` keyed by threshold column, `valuesForThreshold()` — is
**obsolete** and must be rewritten. The new `ExtremeHeatSeries` shape is roughly:

```ts
interface ExtremeHeatSeries {
  variableId: "eh_days" | "warm_nights";
  boundary: string; // e.g. "ca_counties"
  location: string; // e.g. "Sacramento"
  thresholdName: string; // e.g. "t2max_ge100F"
  warmingLevels: number[];
  median: number[]; // index-aligned; the plotted value
  p10: number[];
  p90: number[];
  sourceItem: StacItem;
  sourceCsvUrl: string;
}
```

Refetch-on-every-change is fine: each CSV is ~400–450 bytes.

### 3.6 API contract (from `openapi.json` + `/conformance`, verified 2026-07-21)

STAC API version 0.1 (OpenAPI 3.1.0). Relevant endpoint:

- **`GET /search`** supports `filter` with `filter-lang` ∈ {`cql2-text`,
  `cql2-json`}, plus `query`, `sortby`, `fields`, and `token` pagination.
  Conformance advertises the CQL2 filter extension
  (`item-search#filter`, `ogcapi-features-3/.../conf/filter`).
- **The existing client already speaks this.** `searchItems()` in
  `src/lib/cal-adapt-api/stac-api.ts` issues `GET /search` with `filter` +
  `filter_lang: "cql2-text"`. **No new API plumbing is required** — the
  migration only changes which CQL2 filter parts are assembled.

The tool's search for one chart is:

```
collection='eh-metrics-mm-boundary-csv'
  AND variable_id='<eh_days|warm_nights>'
  AND boundary='<ca_counties|…>'
  AND threshold_name='<t2max_ge100F|…>'
```

This resolves to **exactly one item**, so pagination/`limit` is a non-issue
(the current `COUNTY_SEARCH_LIMIT = 3480` becomes irrelevant here).

Notes for implementation:

- `ItemSearchFilters` already has generic slots; add/assemble parts for
  `variable_id`, `boundary`, `threshold_name`. ⚠️ Don't reuse the existing
  `locationFilter` field — it maps to a STAC `location` (station id) on a
  _different_ collection. In this collection there is **no** STAC field for the
  region; the region is encoded in the CSV **filename** (§3.4), not a queryable.
- `openapi.json` defines **no response body schemas** for `/search` or
  `/collections/{id}` — continue runtime-guarding `properties`/`assets` (the
  existing pattern).
- `/queryables` enum-constrains `boundary`, `variable_id`, and `boundary_label`
  (these can drive dropdowns from the API — useful for MVP 1.3), but
  `threshold_name` is an unconstrained string, so the threshold dropdown must be
  a curated list (§7 Q5).

---

## 4. User stories & acceptance criteria

### Story 14 — Plot fetches Warm Nights from API (not mocked)

**Given** I'm on the "Extreme Heat" page
**When** I open "Climate variable" and select "Warm Nights"
**Then** the Warm Nights series is fetched from `eh-metrics-mm-boundary-csv`
(`variable_id='warm_nights'`) — not mocked.

Acceptance:

- Selecting "Warm Nights" issues a STAC search with `variable_id='warm_nights'`,
  the selected `boundary` (`ca_counties` in 1.1), and `threshold_name`, then
  fetches the region CSV from the resolved asset prefix.
- Loading, error (with retry), and empty/no-data states behave as they do today
  (reuse `ChartView`).
- Deep-linking `?variable=warm-nights` (and back/forward) restores the view.

### Story 15 — Update chart

**When** I select "Warm Nights"
**Then** the chart re-renders for Warm Nights at its predetermined (default)
threshold unless the user specifies otherwise,
**and** the chart title updates to reflect the selected metric,
**and** the y-axis updates accordingly.

Acceptance:

- **Y-axis label:** `"Number of Warm Nights per Year"`.
- **Y-axis domain:** must accommodate warm-nights-per-year, which can far exceed
  the heat-days range. The current fixed `[0, 70]` (`Y_AXIS_MAX_DAYS` in
  `BarChart.tsx`) is wrong for this metric — use a per-metric max or derive from
  data (§7 Q4).
- **Chart title:** reflects the metric, e.g. `"Warm Nights Frequency by Global
Warming Level: <Location>"` (final wording §7 Q5).
- **Threshold:** switching to Warm Nights resets threshold to the Warm Nights
  default (a `t2min_*` value); the Threshold dropdown lists Warm-Nights
  thresholds. Because threshold is now a fetch dimension, changing it triggers a
  refetch. "Unless otherwise specified" → a user threshold override persists in
  the URL and is honored.

### Story 16 — Dynamic subheading copy

**Given** Warm Nights is selected
**When** I read the subheading near the top of the page
**Then** it briefly explains what a warm night is and why it matters.

Acceptance:

- The two intro paragraphs currently hard-coded in `ExtremeHeatDays.tsx` become
  per-metric.
- Draft copy (confirm with content owner; aligned with the Guidance page's "What
  is a warm night?"):
  > A night in which the minimum daily temperature stays above a defined
  > threshold, limiting overnight recovery from daytime heat.
  >
  > Warm nights compound the health risks of extreme heat: when temperatures do
  > not drop enough overnight, the body cannot recover, increasing heat-related
  > illness and mortality. Tracking warm nights helps identify at-risk
  > populations and how overnight heat is shifting under climate change.
- Switching back to Extreme Heat Days restores the existing copy.

### Story 17 — Rename tool title to "Extreme Heat"

**Given** the tool now hosts multiple metrics
**Then** the tool title reads "Extreme Heat", not "Extreme Heat Days".

Acceptance:

- Page `<h1>` and sidebar/nav label read "Extreme Heat" (both derive from
  `navLinks.extremeHeatDays.label`).
- Route stays `/dashboard/extreme-heat-days`; nav `id` and sub-nav (Dashboard /
  Methods / Guidance) unchanged.
- Decide whether Methods/Guidance page titles also generalize (§7 Q6).

---

## 5. Recommended design: a per-metric config

Extreme Heat Days and Warm Nights are structurally identical (same chart, same
pipeline; they differ only in `t2max` vs `t2min`, threshold set, and copy).
Drive everything metric-specific from **one registry** keyed by climate variable
instead of scattering `if (climateVariable === "warm-nights")` branches.

```ts
export interface HeatMetricConfig {
  value: string; // select value / URL param, e.g. "warm-nights"
  variableId: "eh_days" | "warm_nights"; // STAC variable_id
  label: string; // "Warm Nights"
  thresholdOptions: readonly SelectOption[]; // curated subset of the 111
  defaultThreshold: string; // e.g. "t2min_ge70F" (product to confirm)
  yAxisLabel: string; // "Number of Warm Nights per Year"
  yAxisMax?: number; // per-metric fixed max, or omit for data-driven
  formatTitle: (s: ExtremeHeatDaysSelections) => string;
  accessibleNoun: string; // "warm nights"
  thresholdTooltip: string; // min-temp phrasing
  introParagraphs: readonly ReactNode[];
  exportFilenamePrefix: string; // "warm-nights"
}

export const HEAT_METRICS: Readonly<Record<string, HeatMetricConfig>>;
```

`CLIMATE_VARIABLE_OPTIONS` derives from `HEAT_METRICS`. Threshold values stored in
the UI should map cleanly to `threshold_name` (e.g. UI `"100F"` →
`t2max_ge100F` / `t2min_ge100F` depending on `variableId`) — or just store the
full `threshold_name` and format the label.

### 5.1 Forward compatibility with MVP 1.3 (Spatial Aggregation)

MVP 1.3 replaces "County" with **"Spatial Aggregation"** (the 6 `boundary`
types) plus a dependent **"Location"** control, reading the same collection.

**Two orthogonal axes** — keep independent so 1.1 doesn't block 1.3:

| Axis                | Owned by | STAC dimension             | Config                         |
| ------------------- | -------- | -------------------------- | ------------------------------ |
| Metric              | MVP 1.1  | `variable_id`              | `HEAT_METRICS` (§5)            |
| Spatial aggregation | MVP 1.3  | `boundary` (+ region file) | future `AGGREGATIONS` registry |

Keep-1.1-future-proof guidelines:

- **Model county as one boundary type**, not a hard-coded axis. In `series.ts`,
  build the search around `{ variableId, boundary, thresholdName, location }`
  with `boundary` fixed to `ca_counties` for now.
- **Region → CSV filename is boundary-type-specific** (counties add `_County`;
  IOU/POU names use underscores + `&`). Encapsulate this as a per-boundary
  filename builder so 1.3 can add the other five conventions. **This is the #1
  risk — see §7 Q1.**
- **Chart title/export take a location label**, so 1.3's "title reflects the
  location" (story 25) is a formatter tweak.
- **URL:** 1.3 introduces `aggregation` + `location` (effectively renaming
  today's `county`). Don't over-invest in the `county` param name; isolate it
  behind `selectionsFromSearchParams`.

> Out of scope for 1.1: shipping aggregation UI, the Location control, or any
> non-county boundary data.

---

## 6. Implementation plan (files & changes)

| #   | File                                                   | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `src/lib/extreme-heat-days/series.ts`                  | **Rewrite.** Repoint collection id → `eh-metrics-mm-boundary-csv`. New `ExtremeHeatSeries` (§3.5) with `median`/`p10`/`p90`. `buildSearchFilters` filters on `variable_id`, `boundary`, `threshold_name`. Resolve asset **prefix**, then build region CSV url via a per-boundary filename builder (`{prefix}{location}_County_{threshold}.csv` for counties). Parse `warming_level, multimodel_median/p10/p90`; define dedupe rule for repeated warming-level rows (§7 Q3). `searchFiltersKey` = variable+boundary+threshold+location. |
| 2   | `src/hooks/use-extreme-heat-series.ts`                 | Update dep/key so refetch triggers on variable + threshold + location (not just county).                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 3   | `src/lib/extreme-heat-days/options.ts`                 | Add `warm-nights` to `CLIMATE_VARIABLE_OPTIONS`; introduce `HEAT_METRICS` (§5); per-metric threshold options + defaults; keep `DEFAULT_SELECTIONS` = extreme heat days.                                                                                                                                                                                                                                                                                                                                                                |
| 4   | `src/lib/extreme-heat-days/format.ts`                  | Metric-aware `formatViewTitle`, y-axis label, `formatChartExportFilename`.                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 5   | `src/components/extreme-heat-days/BarChart.tsx`        | Replace hard-coded `Y_AXIS_LABEL`, SVG `<title>`, accessible-description noun with props/config. Make `Y_AXIS_MAX_DAYS` per-metric or data-driven.                                                                                                                                                                                                                                                                                                                                                                                     |
| 6   | `src/components/extreme-heat-days/ExtremeHeatDays.tsx` | Per-metric intro paragraphs (replace hard-coded `<p>`s ~L83–98); pass metric-derived title/labels down.                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 7   | `src/components/extreme-heat-days/Controls.tsx`        | Threshold `<Select>` uses current metric's threshold options; **on climate-variable change, reset threshold to the metric default** (today it spreads the stale value).                                                                                                                                                                                                                                                                                                                                                                |
| 8   | `src/lib/extreme-heat-days/tooltips.ts`                | Metric-aware threshold tooltip (min-temp for warm nights).                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 9   | `src/lib/extreme-heat-days/search-params.ts`           | Validate `threshold` against the current metric's options; on `variable` change where the threshold is invalid, fall back to that metric's default.                                                                                                                                                                                                                                                                                                                                                                                    |
| 10  | `src/config/navigation.ts`                             | `navLinks.extremeHeatDays.label`: "Extreme Heat Days" → "Extreme Heat".                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 11  | Tests                                                  | Rewrite `series.test.ts` (new collection, item→prefix→CSV path, median parsing, dedupe). Update `format.test.ts`, `search-params.test.ts` (variable↔threshold reset).                                                                                                                                                                                                                                                                                                                                                                  |
| 12  | MDX (optional)                                         | Light title edits in guidance/methods if titles generalize (§7 Q6).                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

---

## 7. Open questions (need data/product answers before build)

1. **Region → CSV filename (top risk).** The asset href is a directory prefix,
   so the frontend must construct the region CSV filename. Confirmed convention:
   counties = `{County}_County_{threshold}.csv`. Is that convention stable and
   documented for all boundary types (esp. IOU/POU with `&`, `-`)? Preferred:
   backend exposes a per-region asset/manifest so the frontend doesn't hard-code
   filename rules. How should we handle URL-encoding of `&`, spaces?
2. **Metric switch = refetch, confirmed.** Since threshold and variable are both
   encoded in the item/CSV path, every control change refetches. Acceptable
   (~430-byte CSVs)? Any rate/caching concerns?
3. **CSV row anomaly.** Sampled Sacramento CSV had the 5 warming levels repeated
   4× with `median == p10 == p90`. What is the intended row structure — one row
   per warming level? What do the duplicate rows represent, and are the ensemble
   percentiles final or placeholder? Defines the parser's dedupe/aggregation.
4. **Y-axis domain for warm nights** — fixed per-metric max, or data-driven?
5. **Threshold dropdown curation + defaults.** 111 thresholds exist per variable
   (absolute 50–135°F + 75–99th pctl). Which subset appears in the dropdown for
   each metric, and what is each metric's default? (Story 15's "predetermined
   threshold" for Warm Nights.) Do we expose percentile thresholds in 1.1?
6. **Chart title wording** for Warm Nights, and whether Methods/Guidance page
   titles/`<h1>` generalize to "Extreme Heat".
7. **Subheading copy** — confirm final Warm Nights text with content owner.
8. **Scenario.** Only `ssp370` exists in this collection; confirm no scenario
   control is expected and it can stay implicit.
9. **p10/p90 uncertainty band** — show it in the chart now, or defer?

---

## 9. Implementation notes (as built)

Implemented against the verified data model; all extreme-heat-days unit tests
rewritten and passing.

Decisions resolved during build:

- **Q1 (region filename):** county convention confirmed for all 58 counties as
  `{County}_County_{threshold}.csv`; implemented as a filename builder in
  `series.ts`. (Non-county boundary conventions still TBD for MVP 1.3.)
- **Q3 (CSV row anomaly):** tolerant parser ships — rows are grouped by
  `warming_level` and finite values averaged, so both the current repeated-row
  CSVs and a future one-row-per-level CSV work. **Still flag to backend** to
  confirm intended row structure and whether p10/p90 are final.
- **Q5 (thresholds/default):** curated per metric. Extreme Heat Days keeps
  `100°F` (default) / `105°F`. Warm Nights ships `60–80°F` with **default
  `70°F`** — corrected from the initially-proposed `80°F` after live data showed
  ≥80°F overnight minimums are effectively never reached in CA (empty chart);
  `65–70°F` carries the real signal. Percentile thresholds deferred.
- **Q4 (y-axis):** Extreme Heat Days keeps the fixed `[0, 70]`; Warm Nights is
  data-driven (nice-rounded max) since counts vary widely by threshold.

Still open / product-facing: chart-title wording confirmation (Q6), Warm Nights
subheading copy sign-off (Q7), and whether Methods/Guidance page titles/`<h1>`
generalize to "Extreme Heat" (currently only the nav-derived metadata title
changed; MDX headings left as-is).

---

## 8. QA / acceptance checklist

- [ ] Tool reads from `eh-metrics-mm-boundary-csv`; Extreme Heat Days still works
      end-to-end after migration (default: county Sacramento, 100°F).
- [ ] "Warm Nights" appears in the Climate variable dropdown.
- [ ] Selecting it fetches real data (`variable_id='warm_nights'`) from the API.
- [ ] Chart re-renders: Warm Nights default threshold, correct median bars.
- [ ] Y-axis label reads "Number of Warm Nights per Year"; domain is sensible.
- [ ] Chart title reflects the Warm Nights metric.
- [ ] Threshold dropdown shows Warm Nights thresholds; resets to default on
      metric switch; user overrides persist in the URL and refetch correctly.
- [ ] Subheading explains what a warm night is and its importance.
- [ ] Tool `<h1>` and sidebar label read "Extreme Heat".
- [ ] Switching back to Extreme Heat Days fully restores its title/copy/axis.
- [ ] Loading / error+retry / no-data states work for Warm Nights.
- [ ] Deep link `?variable=warm-nights` restores state; back/forward works.
- [ ] PNG export filename and accessible chart description are metric-correct.
- [ ] Region CSV URL construction handled for county names with spaces.
- [ ] Unit tests updated and passing.

```

```
