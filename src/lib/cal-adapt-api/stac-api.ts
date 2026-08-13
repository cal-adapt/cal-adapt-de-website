/**
 * Cal-Adapt STAC (SpatioTemporal Asset Catalog) API Client
 *
 * Centralizes STAC API calls using the `@hey-api/openapi-ts`-generated client.
 *
 * NOTE: The STAC OpenAPI spec does not define response body schemas for
 * `/collections/{id}` or `/search`, so types are often `unknown`.
 */

import {
  collectionQueryablesCollectionsCollectionIdQueryablesGet,
  getCollectionCollectionsCollectionIdGet,
  searchSearchGet,
} from "./generated/stac";
import { assertOk } from "./utils";

type StacVersion = string;

type StacLink = {
  href: string;
  rel: string;
  type?: string;
  method?: string;
  [key: string]: unknown;
};

export type StacAsset = {
  href: string;
  title?: string;
  description?: string;
  type?: string;
  roles?: string[];
  [key: string]: unknown;
};

/**
 * STAC item shape from `/search`; generic across collections.
 * Adapters narrow `properties` and `assets` access at use-sites
 * (the STAC OpenAPI spec doesn't define response body schemas,
 * so per-collection types still need runtime guarding).
 */
export type StacItem = {
  type: "Feature";
  id: string;
  bbox?: [number, number, number, number];
  geometry: unknown;
  collection?: string;
  links: StacLink[];
  assets: Record<string, StacAsset>;
  properties: Record<string, unknown>;
  stac_version?: StacVersion;
  stac_extensions?: string[];
};

export type StacItemCollection = {
  type: "FeatureCollection";
  features: StacItem[];
  links: StacLink[];
  context?: { limit: number; returned: number };
};

export type StacCollection = {
  type: "Collection";
  id: string;
  title?: string;
  description: string;
  links?: StacLink[];
  assets?: Record<string, StacAsset>;
  stac_version?: StacVersion;
  stac_extensions?: string[];
  license: string;
  "sci:doi"?: string;
  /** PgSTAC climate-profile collections may omit summaries; use queryables instead. */
  summaries?: Record<string, string[]>;
  /** Cal-Adapt extension: e.g. `county` (LOCA2 county grid) or `point` */
  "caladapt:spatial_type"?: string;
  /** Cal-Adapt extension: station id -> display label */
  "caladapt:station_labels"?: Record<string, string>;
  [key: string]: unknown;
};

/** App-level filters */
export type ItemSearchFilters = {
  collectionFilter?: string;
  scenarioFilter?: string;
  countyFilter?: string;
  modelFilter?: string;
  /** standard-year — STAC `location` (station id) */
  locationFilter?: string;
  variableFilter?: string;
  percentileFilter?: string;
  timePeriodFilter?: string;
  /** standard-year time-based approach — STAC `centered_year` */
  centeredYearFilter?: string;
  /** xmy-shock — STAC `shock_type` */
  shockTypeFilter?: string;
  /** LOCA2 county — e.g. `cmip6:table_id = 'mon'` to avoid day + mon duplicate items */
  cmip6TableIdFilter?: string;
  /** eh-metrics boundary type — e.g. `boundary='ca_counties'` */
  boundaryFilter?: string;
  /** eh-metrics threshold — e.g. `threshold_name='t2max_ge100F'` */
  thresholdNameFilter?: string;
};

/** JSON Schema queryables document (`/collections/{id}/queryables`). */
export type StacCollectionQueryables = {
  properties?: Record<string, { enum?: unknown[] }>;
};

const API_NAME = "Cal-Adapt STAC API";

const COUNTY_SEARCH_LIMIT = 3480;

/**
 * STAC Filter Extension queryables (`/collections/{id}/queryables`).
 * Used for item property enums when `Collection.summaries` is empty (common on PgSTAC).
 */
export async function getCollectionQueryables(
  collectionId: string
): Promise<StacCollectionQueryables> {
  const res = await collectionQueryablesCollectionsCollectionIdQueryablesGet({
    path: { collectionId },
    headers: { Accept: "application/json, application/schema+json" },
  });
  return assertOk<StacCollectionQueryables>(res, API_NAME);
}

/**
 * Get a STAC collection by ID
 */
export async function getCollection(collectionId: string): Promise<StacCollection> {
  const res = await getCollectionCollectionsCollectionIdGet({
    path: { collectionId },
    headers: { Accept: "application/json, application/schema+json" },
  });
  return assertOk<StacCollection>(res, API_NAME);
}

/**
 * Search for items using CQL2 filters.
 */
export async function searchItems(filters: ItemSearchFilters): Promise<StacItemCollection> {
  const filterParts: string[] = [];

  if (filters.collectionFilter) filterParts.push(filters.collectionFilter);
  if (filters.scenarioFilter) filterParts.push(filters.scenarioFilter);
  if (filters.countyFilter) filterParts.push(filters.countyFilter);
  if (filters.modelFilter) filterParts.push(filters.modelFilter);
  if (filters.locationFilter) filterParts.push(filters.locationFilter);
  if (filters.variableFilter) filterParts.push(filters.variableFilter);
  if (filters.percentileFilter) filterParts.push(filters.percentileFilter);
  if (filters.timePeriodFilter) filterParts.push(filters.timePeriodFilter);
  if (filters.centeredYearFilter) filterParts.push(filters.centeredYearFilter);
  if (filters.shockTypeFilter) filterParts.push(filters.shockTypeFilter);
  if (filters.cmip6TableIdFilter) filterParts.push(filters.cmip6TableIdFilter);
  if (filters.boundaryFilter) filterParts.push(filters.boundaryFilter);
  if (filters.thresholdNameFilter) filterParts.push(filters.thresholdNameFilter);

  const filterStr = filterParts.join(" AND ");

  const res = await searchSearchGet({
    query: {
      limit: COUNTY_SEARCH_LIMIT,
      ...(filterStr ? { filter: filterStr, filter_lang: "cql2-text" } : {}),
    },
    headers: { Accept: "application/geo+json" },
  });
  return assertOk<StacItemCollection>(res, API_NAME);
}
