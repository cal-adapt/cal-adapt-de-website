/**
 * Cal-Adapt Map API Client
 *
 * Centralizes Map API calls using `@hey-api/openapi-ts`-generated clients.
 */

import {
  infoEndpointInfoGet,
  pointPointLonLatGet,
  tilejsonTileMatrixSetIdTilejsonJsonGet,
} from "./generated/map";
import type { TilejsonTileMatrixSetIdTilejsonJsonGetData } from "./generated/map/types.gen";
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
  const res = await infoEndpointInfoGet({
    query: { url, variable },
  });
  const data = assertOk<InfoWithGwl>(res, API_NAME);
  return data.dimensions?.gwl?.data ?? [];
}

/**
 * Get TileJSON configuration for raster layer
 */
export async function getTileJson(params: TileJsonParams): Promise<TileJson> {
  const res = await tilejsonTileMatrixSetIdTilejsonJsonGet({
    path: { tileMatrixSetId: "WebMercatorQuad" },
    query: {
      url: params.url,
      variable: params.variable,
      datetime: params.datetime,
      rescale: [params.rescale],
      colormap_name:
        params.colormap.toLowerCase() as TilejsonTileMatrixSetIdTilejsonJsonGetData["query"]["colormap_name"],
    },
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
  const res = await pointPointLonLatGet({
    path: { lon: lng, lat },
    query: { url: params.url, variable: params.variable },
  });
  return assertOk<T>(res, API_NAME);
}

/**
 * Get point data (min, max, mean) at a specific coordinate,
 * extracting the value at the given GWL index.
 */
export async function getPointGwlStats(params: PointDataParams): Promise<PointData> {
  const { lng, lat, meanPath, minPath, maxPath, variable, gwlIndex } = params;
  const results: PointData = { min: null, max: null, value: null };

  const pointParams = (path: string) => ({
    path: { lon: lng, lat } as const,
    query: { url: path, variable },
  });

  const extractValue = (data: PointResponse | undefined): number | null =>
    data?.data?.[gwlIndex] ?? null;

  const failures: unknown[] = [];
  const handleResponse = (
    res: { data?: unknown; error?: unknown; response?: Response } | null,
    assign: (value: number | null) => void
  ) => {
    if (!res) return;
    if (res.error != null || !res.response?.ok) {
      failures.push(res.error ?? new Error(`HTTP ${res.response?.status ?? "?"}`));
      return;
    }
    assign(extractValue(res.data as PointResponse));
  };

  try {
    const [meanResponse, minResponse, maxResponse] = await Promise.all([
      pointPointLonLatGet(pointParams(meanPath)),
      minPath ? pointPointLonLatGet(pointParams(minPath)) : null,
      maxPath ? pointPointLonLatGet(pointParams(maxPath)) : null,
    ]);

    handleResponse(meanResponse, (v) => (results.value = v));
    handleResponse(minResponse, (v) => (results.min = v));
    handleResponse(maxResponse, (v) => (results.max = v));
  } catch (error) {
    failures.push(error);
  }

  if (failures.length > 0) {
    console.error("Error getting point data:", ...failures);
  }

  return results;
}
