/**
 * Cal-Adapt Map API Client
 *
 * Centralizes Map API calls against the deployed map API.
 */

import { MAP_API_BASE_URL } from "@/config/constants";

const API_NAME = "Cal-Adapt Map API";

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

type InfoWithGwl = { dimensions?: { gwl?: { data?: number[] } } };
type PointResponse = { data?: number[] };

async function fetchMapApi<T>(path: string, query: Record<string, string>): Promise<T> {
  const url = new URL(path, `${MAP_API_BASE_URL}/`);

  for (const [key, value] of Object.entries(query)) {
    url.searchParams.append(key, value);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`${API_NAME} Error: ${response.status}`);
  }

  return (await response.json()) as T;
}

/**
 * Get Global Warming Levels (GWL) list for a dataset
 */
export async function getGwlInfo(url: string, variable: string): Promise<number[]> {
  const data = await fetchMapApi<InfoWithGwl>("/info", { url, variable });
  return data.dimensions?.gwl?.data ?? [];
}

/**
 * Get TileJSON configuration for raster layer
 */
export async function getTileJson(params: TileJsonParams): Promise<TileJson> {
  return fetchMapApi<TileJson>("/WebMercatorQuad/tilejson.json", {
    url: params.url,
    variable: params.variable,
    datetime: params.datetime,
    rescale: params.rescale,
    colormap_name: params.colormap.toLowerCase(),
  });
}

/**
 * Get point values at a given coordinate from the `/point` endpoint,
 * with no post-processing on the returned data.
 */
export async function getPoint<T = unknown>(
  lng: number,
  lat: number,
  params: { url: string; variable: string }
): Promise<T> {
  return fetchMapApi<T>(`/point/${lng},${lat}`, {
    url: params.url,
    variable: params.variable,
  });
}

/**
 * Get point data (min, max, mean) at a specific coordinate,
 * extracting the value at the given GWL index.
 */
export async function getPointGwlStats(params: PointDataParams): Promise<PointData> {
  const { lng, lat, meanPath, minPath, maxPath, variable, gwlIndex } = params;
  const results: PointData = { min: null, max: null, value: null };
  const pointPath = `/point/${lng},${lat}`;

  const pointParams = (path: string) => ({
    url: path,
    variable,
  });

  const extractValue = (data: PointResponse | undefined): number | null =>
    data?.data?.[gwlIndex] ?? null;

  const failures: unknown[] = [];
  const fetchPoint = async (path?: string): Promise<PointResponse | null> => {
    if (!path) return null;

    try {
      return await fetchMapApi<PointResponse>(pointPath, pointParams(path));
    } catch (error) {
      failures.push(error);
      return null;
    }
  };

  const [meanResponse, minResponse, maxResponse] = await Promise.all([
    fetchPoint(meanPath),
    fetchPoint(minPath),
    fetchPoint(maxPath),
  ]);

  results.value = extractValue(meanResponse ?? undefined);
  results.min = extractValue(minResponse ?? undefined);
  results.max = extractValue(maxResponse ?? undefined);

  if (failures.length > 0) {
    console.error("Error getting point data:", ...failures);
  }

  return results;
}
