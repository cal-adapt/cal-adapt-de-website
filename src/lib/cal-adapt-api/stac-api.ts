/**
 * Cal-Adapt STAC (SpatioTemporal Asset Catalog) API Client
 *
 * Centralizes STAC API calls using Orval-generated fetchers to
 * expose a friendlier API: getCollection, searchItems.
 *
 * NOTE: The STAC OpenAPI spec does not define response body schemas for
 * `/collections/{id}` or `/search`, so the generated API client uses `data: unknown`.
 */

import { getCollectionCollectionsCollectionIdGet, searchSearchGet } from "./generated/stac";
import { assertOk } from "./utils";

type StacVersion = "1.0.0";

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
  summaries: Record<string, string[]>;
  [key: string]: unknown;
};

type CountyItem = Omit<StacItem, "properties" | "assets"> & {
  properties: {
    countyname: string;
    "cmip6:source_id"?: string;
    "cmip6:experiment_id"?: string;
    "cmip6:member_id"?: string;
    start_datetime?: string;
    end_datetime?: string;
    [key: string]: unknown;
  };
  assets: Record<string, StacAsset & { "file:size": number }>;
};
type CountyItemCollection = StacItemCollection & { features: CountyItem[] };

/** App-level filters */
export type ItemSearchFilters = {
  collectionFilter?: string;
  scenarioFilter?: string;
  countyFilter?: string;
  modelFilter?: string;
};

const API_NAME = "Cal-Adapt STAC API";

const COUNTY_SEARCH_LIMIT = 3480;

/**
 * Get a STAC collection by ID
 */
export async function getCollection(collectionId: string): Promise<StacCollection> {
  const res = await getCollectionCollectionsCollectionIdGet(collectionId);
  return assertOk<StacCollection>(res, API_NAME);
}

/**
 * Search for items in county collections using CQL2 filters.
 */
export async function searchItems(filters: ItemSearchFilters): Promise<CountyItemCollection> {
  const filterParts: string[] = [];

  if (filters.collectionFilter) filterParts.push(filters.collectionFilter);
  if (filters.scenarioFilter) filterParts.push(filters.scenarioFilter);
  if (filters.countyFilter) filterParts.push(filters.countyFilter);
  if (filters.modelFilter) filterParts.push(filters.modelFilter);

  const filterStr = filterParts.join(" AND ");

  const res = await searchSearchGet({
    limit: COUNTY_SEARCH_LIMIT,
    filter: filterStr || undefined,
    filter_lang: "cql2-text",
  });

  return assertOk<CountyItemCollection>(res, API_NAME);
}
