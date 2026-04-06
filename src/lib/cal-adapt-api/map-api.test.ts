import { http, HttpResponse } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { MAP_API_BASE_URL } from "@/config/constants";
import { server } from "@/testing/mocks/server";

import { getGwlInfo, getPoint, getPointGwlStats, getTileJson } from "./map-api";

describe("map-api", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe("getGwlInfo", () => {
    it("extracts the GWL array from the info response", async () => {
      server.use(
        http.get(`${MAP_API_BASE_URL}/info`, () =>
          HttpResponse.json({
            dimensions: { gwl: { data: [1.0, 1.5, 2.0, 2.5, 3.0] } },
          })
        )
      );

      const result = await getGwlInfo("s3://bucket/key", "tasmax");
      expect(result).toEqual([1.0, 1.5, 2.0, 2.5, 3.0]);
    });

    it("returns empty array when response has no GWL dimensions", async () => {
      server.use(http.get(`${MAP_API_BASE_URL}/info`, () => HttpResponse.json({ dimensions: {} })));

      const result = await getGwlInfo("s3://bucket/key", "tasmax");
      expect(result).toEqual([]);
    });

    it("throws on non-2xx response", async () => {
      server.use(
        http.get(`${MAP_API_BASE_URL}/info`, () => new HttpResponse(null, { status: 500 }))
      );

      await expect(getGwlInfo("s3://bucket/key", "tasmax")).rejects.toThrow(
        "Cal-Adapt Map API Error: 500"
      );
    });
  });

  describe("getTileJson", () => {
    it("lowercases the colormap name and returns TileJSON", async () => {
      const mockTileJson = {
        tiles: [`${MAP_API_BASE_URL}/tiles/1/{z}/{x}/{y}.png`],
        tileSize: 256,
      };
      let capturedUrl = "";

      server.use(
        http.get(`${MAP_API_BASE_URL}/WebMercatorQuad/tilejson.json`, ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json(mockTileJson);
        })
      );

      const result = await getTileJson({
        url: "s3://bucket/key",
        variable: "tasmax",
        datetime: "1.5",
        rescale: "0,1",
        colormap: "Viridis",
      });

      expect(new URL(capturedUrl).searchParams.get("colormap_name")).toBe("viridis");
      expect(result).toEqual(mockTileJson);
    });

    it("throws on non-2xx response", async () => {
      server.use(
        http.get(
          `${MAP_API_BASE_URL}/WebMercatorQuad/tilejson.json`,
          () => new HttpResponse(null, { status: 404 })
        )
      );

      await expect(
        getTileJson({
          url: "https://bucket/key",
          variable: "tasmax",
          datetime: "1.5",
          rescale: "0,1",
          colormap: "viridis",
        })
      ).rejects.toThrow("Cal-Adapt Map API Error: 404");
    });
  });

  describe("getPoint", () => {
    it("returns the response body for a given coordinate", async () => {
      server.use(
        http.get(`${MAP_API_BASE_URL}/point/:coords`, () =>
          HttpResponse.json({
            data: [
              [1, 2],
              [3, 4],
            ],
          })
        )
      );

      const result = await getPoint<{ data: number[][] }>(-122, 37.5, {
        url: "s3://bucket/path",
        variable: "tasmax",
      });

      expect(result).toEqual({
        data: [
          [1, 2],
          [3, 4],
        ],
      });
    });

    it("throws on non-2xx response", async () => {
      server.use(
        http.get(`${MAP_API_BASE_URL}/point/:coords`, () => new HttpResponse(null, { status: 500 }))
      );

      await expect(
        getPoint(-122, 37.5, { url: "s3://bucket/path", variable: "tasmax" })
      ).rejects.toThrow("Cal-Adapt Map API Error: 500");
    });
  });

  describe("getPointGwlStats", () => {
    it("returns mean value at gwlIndex when only meanPath is provided", async () => {
      server.use(
        http.get(`${MAP_API_BASE_URL}/point/:coords`, () =>
          HttpResponse.json({ data: [10, 20, 30] })
        )
      );

      const result = await getPointGwlStats({
        lng: -122,
        lat: 37.5,
        meanPath: "s3://bucket/key",
        variable: "tasmax",
        gwlIndex: 1,
      });

      expect(result).toEqual({ min: null, max: null, value: 20 });
    });

    it("returns min, max, and mean values at gwlIndex when all paths provided", async () => {
      server.use(
        http.get(`${MAP_API_BASE_URL}/point/:coords`, ({ request }) => {
          const urlParam = new URL(request.url).searchParams.get("url") ?? "";
          if (urlParam.endsWith("/min")) return HttpResponse.json({ data: [5, 15, 25] });
          if (urlParam.endsWith("/max")) return HttpResponse.json({ data: [15, 25, 35] });
          return HttpResponse.json({ data: [10, 20, 30] });
        })
      );

      const result = await getPointGwlStats({
        lng: -122,
        lat: 37.5,
        meanPath: "s3://bucket/path/to/mean",
        minPath: "s3://bucket/path/to/min",
        maxPath: "s3://bucket/path/to/max",
        variable: "tasmax",
        gwlIndex: 2,
      });

      expect(result).toEqual({ min: 25, max: 35, value: 30 });
    });

    it("returns all nulls and logs error on network failure", async () => {
      server.use(http.get(`${MAP_API_BASE_URL}/point/:coords`, () => HttpResponse.error()));
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const result = await getPointGwlStats({
        lng: -122,
        lat: 37.5,
        meanPath: "s3://bucket/key",
        variable: "tasmax",
        gwlIndex: 0,
      });

      expect(result).toEqual({ min: null, max: null, value: null });
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
