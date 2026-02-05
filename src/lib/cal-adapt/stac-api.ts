/**
 * Cal-Adapt STAC (SpatioTemporal Asset Catalog) API Client
 */

import { buildUrlWithParams } from "@/utils/url";

const BASE_URL = "https://stac.cal-adapt.org";

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

/** GeoJSON Feature */
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

/** GeoJSON FeatureCollection */
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

/** A STAC item from a county collection */
type CountyItem = Omit<StacItem, "properties" | "assets"> & {
  properties: {
    countyname: string;
    "cmip6:source_id"?: string; // Model
    "cmip6:experiment_id"?: string; // Scenario
    "cmip6:member_id"?: string;
    start_datetime?: string;
    end_datetime?: string;
    [key: string]: unknown;
  };
  assets: Record<string, StacAsset & { "file:size": number }>;
};

/** Response from searching county collections */
type CountyItemCollection = StacItemCollection & {
  features: CountyItem[];
};

/** Filters for STAC item search (CQL2 query parts) */
export type ItemSearchFilters = {
  collectionFilter?: string;
  scenarioFilter?: string;
  countyFilter?: string;
  modelFilter?: string;
};

async function request<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Cal-Adapt STAC API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get a STAC collection by ID
 */
export async function getCollection(collectionId: string): Promise<StacCollection> {
  const url = `${BASE_URL}/collections/${collectionId}`;
  return request<StacCollection>(url);
}

/**
 * Search for items in county collections using CQL2 filters.
 */
export async function searchItems(filters: ItemSearchFilters): Promise<CountyItemCollection> {
  // Build the CQL2 filter string
  const filterParts: string[] = [];

  if (filters.collectionFilter) {
    filterParts.push(filters.collectionFilter);
  }
  if (filters.scenarioFilter) {
    filterParts.push(filters.scenarioFilter);
  }
  if (filters.countyFilter) {
    filterParts.push(filters.countyFilter);
  }
  if (filters.modelFilter) {
    filterParts.push(filters.modelFilter);
  }

  const filterStr = filterParts.join(" AND ");

  const url = buildUrlWithParams(`${BASE_URL}/search`, {
    limit: 3480,
    filter: filterStr,
    filter_lang: "cql2-text",
  });

  return request<CountyItemCollection>(url);
}
