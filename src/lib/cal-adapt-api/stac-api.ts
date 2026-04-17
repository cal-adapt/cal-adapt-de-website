/**
 * Cal-Adapt STAC (SpatioTemporal Asset Catalog) API Client
 *
 * Centralizes STAC API calls using `@hey-api/openapi-ts`-generated clients.
 *
 * NOTE: The STAC OpenAPI spec does not define response body schemas for
 * `/collections/{id}` or `/search`, so types are often `unknown`.
 *
 * Collections in {@link STAC_API_V2_HOST_COLLECTION_IDS} use `generated/stacV2` with
 * {@link STAC_API_V2_BASE_URL} (all Data Download collections). Other collection IDs use v1.
 */

import { STAC_API_V2_BASE_URL } from "@/config/constants";
import { STAC_API_V2_HOST_COLLECTION_IDS } from "@/lib/data-download-tool/catalog/ids";

import { getCollectionCollectionsCollectionIdGet, searchSearchGet } from "./generated/stac";
import {
  collectionQueryablesCollectionsCollectionIdQueryablesGet as getStacV2CollectionQueryables,
  getCollectionCollectionsCollectionIdGet as getStacV2Collection,
  searchSearchGet as searchStacV2Items,
} from "./generated/stacV2";
import { assertOk } from "./utils";

type StacVersion = string;

type StacLink = {
  href: string;
  rel: string;
  type?: string;
  method?: string;
  [key: string]: unknown;
};

type StacAsset = {
  href: string;
  title?: string;
  description?: string;
  type?: string;
  roles?: string[];
  [key: string]: unknown;
};

type StacItem = {
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

type StacItemCollection = {
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
  /** V2 climate-profile collections may omit summaries; use queryables instead. */
  summaries?: Record<string, string[]>;
  /**
   * Cal-Adapt extension: `county` (LOCA2 county grid) vs `point` (climate profiles — fixed site, e.g. weather station).
   * See `boundaryTypeSummaryValue` in `@/lib/data-download-tool/customize/spatialType`.
   */
  "caladapt:spatial_type"?: string;
  [key: string]: unknown;
};

export type CountyItem = Omit<StacItem, "properties" | "assets"> & {
  properties: {
    countyname?: string;
    /** LOCA2 county v2 STAC items */
    county_name?: string;
    location?: string;
    variable?: string;
    variable_label?: string;
    percentile?: string;
    time_period?: string;
    "cmip6:source_id"?: string;
    "cmip6:experiment_id"?: string;
    /** `day` \| `mon` — LOCA2 county v2 */
    "cmip6:table_id"?: string;
    "cmip6:member_id"?: string;
    start_datetime?: string;
    end_datetime?: string;
    [key: string]: unknown;
  };
  assets: Record<string, StacAsset & { "file:size"?: number }>;
};
type CountyItemCollection = StacItemCollection & { features: CountyItem[] };

/** App-level filters */
export type ItemSearchFilters = {
  collectionFilter?: string;
  scenarioFilter?: string;
  countyFilter?: string;
  modelFilter?: string;
  /** standard-met-year — STAC `location` (station id) */
  locationFilter?: string;
  variableFilter?: string;
  percentileFilter?: string;
  timePeriodFilter?: string;
  /** LOCA2 county v2 — e.g. `cmip6:table_id = 'mon'` to avoid day + mon duplicate items */
  cmip6TableIdFilter?: string;
};

/** JSON Schema queryables document (`/collections/{id}/queryables`). */
export type StacCollectionQueryables = {
  properties?: Record<string, { enum?: unknown[] }>;
};

const API_NAME = "Cal-Adapt STAC API";

const COUNTY_SEARCH_LIMIT = 3480;

export function isStacV2CollectionId(collectionId: string): boolean {
  return STAC_API_V2_HOST_COLLECTION_IDS.has(collectionId);
}

/**
 * STAC Filter Extension queryables (`/collections/{id}/queryables`).
 * v2 hosts use this for item property enums when `Collection.summaries` is empty (common on PgSTAC).
 */
export async function getCollectionQueryables(
  collectionId: string
): Promise<StacCollectionQueryables> {
  if (!isStacV2CollectionId(collectionId)) {
    throw new Error(
      `[stac-api] getCollectionQueryables is only supported for STAC API v2 collections (got "${collectionId}").`
    );
  }
  const res = await getStacV2CollectionQueryables({
    path: { collectionId },
    baseUrl: STAC_API_V2_BASE_URL,
    headers: { Accept: "application/json, application/schema+json" },
  });
  return assertOk<StacCollectionQueryables>(res, API_NAME);
}

/**
 * Get a STAC collection by ID
 */
export async function getCollection(collectionId: string): Promise<StacCollection> {
  if (isStacV2CollectionId(collectionId)) {
    const res = await getStacV2Collection({
      path: { collectionId },
      baseUrl: STAC_API_V2_BASE_URL,
      headers: { Accept: "application/json, application/schema+json" },
    });
    return assertOk<StacCollection>(res, API_NAME);
  }
  const res = await getCollectionCollectionsCollectionIdGet({
    path: { collection_id: collectionId },
  });
  return assertOk<StacCollection>(res, API_NAME);
}

/**
 * Search for items using CQL2 filters (v1 STAC host or v2 when `collectionId` is a v2 id).
 */
export async function searchItems(
  filters: ItemSearchFilters,
  options?: { collectionId?: string }
): Promise<CountyItemCollection> {
  const filterParts: string[] = [];

  if (filters.collectionFilter) filterParts.push(filters.collectionFilter);
  if (filters.scenarioFilter) filterParts.push(filters.scenarioFilter);
  if (filters.countyFilter) filterParts.push(filters.countyFilter);
  if (filters.modelFilter) filterParts.push(filters.modelFilter);
  if (filters.locationFilter) filterParts.push(filters.locationFilter);
  if (filters.variableFilter) filterParts.push(filters.variableFilter);
  if (filters.percentileFilter) filterParts.push(filters.percentileFilter);
  if (filters.timePeriodFilter) filterParts.push(filters.timePeriodFilter);
  if (filters.cmip6TableIdFilter) filterParts.push(filters.cmip6TableIdFilter);

  const filterStr = filterParts.join(" AND ");

  const useV2 = options?.collectionId != null && isStacV2CollectionId(options.collectionId);

  if (useV2) {
    const res = await searchStacV2Items({
      baseUrl: STAC_API_V2_BASE_URL,
      query: {
        limit: COUNTY_SEARCH_LIMIT,
        ...(filterStr ? { filter: filterStr, "filter-lang": "cql2-text" } : {}),
      },
      headers: { Accept: "application/geo+json" },
    });
    return assertOk<CountyItemCollection>(res, API_NAME);
  }

  const res = await searchSearchGet({
    query: {
      limit: COUNTY_SEARCH_LIMIT,
      filter: filterStr || undefined,
      filter_lang: "cql2-text",
    },
  });

  return assertOk<CountyItemCollection>(res, API_NAME);
}
