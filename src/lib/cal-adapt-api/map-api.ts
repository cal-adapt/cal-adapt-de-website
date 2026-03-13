/**
 * Cal-Adapt Map API Client
 *
 * Centralizes Map API calls using Orval-generated fetchers to
 * expose a friendlier API: getGwlInfo, getTileJson, getPointData.
 */

import {
  infoEndpointInfoGet,
  pointPointLonLatGet,
  tilejsonTileMatrixSetIdTilejsonJsonGet,
} from "./generated/map";
import type { TilejsonTileMatrixSetIdTilejsonJsonGetParams } from "./generated/map/models";

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

/** Accepts generated response union (success | error); throws on non-2xx and returns data */
function assertOk<T>(res: { data: unknown; status: number }): T {
  if (res.status < 200 || res.status >= 300) {
    throw new Error(`Cal-Adapt Map API error: ${res.status}`);
  }
  return res.data as T;
}

/** Map /info can return dimensions.gwl.data; OpenAPI Info type may not include it */
type InfoWithGwl = { dimensions?: { gwl?: { data?: number[] } } };

/** Point endpoint returns { data: number[] } */
type PointResponse = { data?: number[] };

/**
 * Get Global Warming Levels (GWL) list for a dataset
 */
export async function getGwlInfo(url: string, variable: string): Promise<number[]> {
  const res = await infoEndpointInfoGet({ url, variable });
  const data = assertOk(res) as InfoWithGwl;
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
  const data = assertOk(res);
  return data as TileJson;
}

/**
 * Get point data (min, max, mean) at a specific coordinate
 */
export async function getPointData(params: PointDataParams): Promise<PointData> {
  const { lng, lat, meanPath, minPath, maxPath, variable, gwlIndex } = params;
  const results: PointData = { min: null, max: null, value: null };

  const pointParams = (path: string) => ({ url: path, variable });

  try {
    const meanRes = await pointPointLonLatGet(lng, lat, pointParams(meanPath));
    if (meanRes.status >= 200 && meanRes.status < 300) {
      const arr = (meanRes.data as PointResponse)?.data;
      results.value = arr?.[gwlIndex] ?? null;
    }

    const [minRes, maxRes] = await Promise.all([
      minPath ? pointPointLonLatGet(lng, lat, pointParams(minPath)) : null,
      maxPath ? pointPointLonLatGet(lng, lat, pointParams(maxPath)) : null,
    ]);

    if (minRes && minRes.status >= 200 && minRes.status < 300) {
      const arr = (minRes.data as PointResponse)?.data;
      results.min = arr?.[gwlIndex] ?? null;
    }
    if (maxRes && maxRes.status >= 200 && maxRes.status < 300) {
      const arr = (maxRes.data as PointResponse)?.data;
      results.max = arr?.[gwlIndex] ?? null;
    }
  } catch (error) {
    console.error("Error getting point data:", error);
  }

  return results;
}
