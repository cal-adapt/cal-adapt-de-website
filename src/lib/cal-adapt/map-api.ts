/**
 * Cal-Adapt Map API Client
 */

import { buildUrlWithParams } from "@/utils/url";

const BASE_URL = "https://map.cal-adapt.org";

export type TileJson = {
  tiles: string[];
  tileSize?: number;
};

type PointData = {
  min: number | null;
  max: number | null;
  value: number | null;
};

type TileJsonParams = {
  url: string;
  variable: string;
  datetime: string;
  rescale: string;
  colormap: string;
};

type PointDataParams = {
  lng: number;
  lat: number;
  meanPath: string;
  minPath?: string;
  maxPath?: string;
  variable: string;
  gwlIndex: number;
};

async function request<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Cal-Adapt Map API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get Global Warming Levels (GWL) list for a dataset
 */
export async function getGwlInfo(url: string, variable: string): Promise<number[]> {
  const fullUrl = buildUrlWithParams(`${BASE_URL}/info`, { url, variable });
  const data = await request<{ dimensions: { gwl: { data: number[] } } }>(fullUrl);
  return data.dimensions.gwl.data;
}

/**
 * Get TileJSON configuration for raster layer
 */
export async function getTileJson(params: TileJsonParams): Promise<TileJson> {
  const url = buildUrlWithParams(`${BASE_URL}/WebMercatorQuad/tilejson.json`, {
    url: params.url,
    variable: params.variable,
    datetime: params.datetime,
    rescale: params.rescale,
    colormap_name: params.colormap.toLowerCase(),
  });

  return request<TileJson>(url);
}

/**
 * Get point data (min, max, mean) at a specific coordinate
 */
export async function getPointData(params: PointDataParams): Promise<PointData> {
  const { lng, lat, meanPath, minPath, maxPath, variable, gwlIndex } = params;

  const buildPointUrl = (path: string) =>
    `${BASE_URL}/point/${lng},${lat}?url=${encodeURIComponent(path)}&variable=${variable}`;

  const results: PointData = { min: null, max: null, value: null };

  try {
    // Get mean value (required)
    const meanRes = await request<{ data: number[] }>(buildPointUrl(meanPath));
    results.value = meanRes.data[gwlIndex] ?? null;

    // Get min/max in parallel if paths exist
    const [minRes, maxRes] = await Promise.all([
      minPath ? request<{ data: number[] }>(buildPointUrl(minPath)) : null,
      maxPath ? request<{ data: number[] }>(buildPointUrl(maxPath)) : null,
    ]);

    if (minRes) results.min = minRes.data[gwlIndex] ?? null;
    if (maxRes) results.max = maxRes.data[gwlIndex] ?? null;
  } catch (error) {
    console.error("Error getting point data:", error);
  }

  return results;
}
