/**
 * Cal-Adapt Map API Client
 *
 * Centralizes Map API calls using Orval-generated fetchers to
 * expose a friendlier API: getGwlInfo, getTileJson, getPoint, getPointData.
 */

import {
  infoEndpointInfoGet,
  pointPointLonLatGet,
  tilejsonTileMatrixSetIdTilejsonJsonGet,
} from "./generated/map";
import type { TilejsonTileMatrixSetIdTilejsonJsonGetParams } from "./generated/map/models";
import { assertOk } from "./utils";

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

/**
 * Get Global Warming Levels (GWL) list for a dataset
 */
export async function getGwlInfo(url: string, variable: string): Promise<number[]> {
  const res = await infoEndpointInfoGet({ url, variable });
  const data = assertOk<InfoWithGwl>(res, API_NAME);
  return data.dimensions?.gwl?.data ?? [];
}

/**
 * Get TileJSON configuration for raster layer
 */
export async function getTileJson(params: TileJsonParams): Promise<TileJson> {
  const res = await tilejsonTileMatrixSetIdTilejsonJsonGet("WebMercatorQuad", {
    url: params.url,
    variable: params.variable,
    datetime: params.datetime,
    rescale: [params.rescale],
    colormap_name:
      params.colormap.toLowerCase() as TilejsonTileMatrixSetIdTilejsonJsonGetParams["colormap_name"],
  });
  return assertOk<TileJson>(res, API_NAME);
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
  const res = await pointPointLonLatGet(lng, lat, params);
  return assertOk<T>(res, API_NAME);
}

/**
 * Get point data (min, max, mean) at a specific coordinate,
 * extracting the value at the given GWL index.
 */
export async function getPointData(params: PointDataParams): Promise<PointData> {
  const { lng, lat, meanPath, minPath, maxPath, variable, gwlIndex } = params;
  const results: PointData = { min: null, max: null, value: null };

  const pointParams = (path: string) => ({ url: path, variable });

  const extractValue = (data: PointResponse | undefined): number | null =>
    data?.data?.[gwlIndex] ?? null;

  try {
    const [meanResponse, minResponse, maxResponse] = await Promise.all([
      pointPointLonLatGet(lng, lat, pointParams(meanPath)),
      minPath ? pointPointLonLatGet(lng, lat, pointParams(minPath)) : null,
      maxPath ? pointPointLonLatGet(lng, lat, pointParams(maxPath)) : null,
    ]);

    if (meanResponse.status >= 200 && meanResponse.status < 300) {
      results.value = extractValue(meanResponse.data as PointResponse);
    }
    if (minResponse && minResponse.status >= 200 && minResponse.status < 300) {
      results.min = extractValue(minResponse.data as PointResponse);
    }
    if (maxResponse && maxResponse.status >= 200 && maxResponse.status < 300) {
      results.max = extractValue(maxResponse.data as PointResponse);
    }
  } catch (error) {
    console.error("Error getting point data:", error);
  }

  return results;
}
