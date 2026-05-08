import { http, HttpResponse } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { STAC_API_BASE_URL } from "@/config/constants";
import { server } from "@/testing/mocks/server";

import { getCollection, searchItems } from "./stac-api";

describe("stac-api", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe("getCollection", () => {
    it("returns collection data for the given ID", async () => {
      const mockCollection = {
        type: "Collection",
        id: "loca2-county",
        description: "LOCA2 monthly county data",
        license: "CC-BY-4.0",
        summaries: {},
      };

      server.use(
        http.get(`${STAC_API_BASE_URL}/collections/:collectionId`, ({ params }) =>
          HttpResponse.json({ ...mockCollection, id: params.collectionId as string })
        )
      );

      const result = await getCollection("loca2-county");
      expect(result).toEqual(mockCollection);
    });

    it("throws on non-2xx response", async () => {
      server.use(
        http.get(
          `${STAC_API_BASE_URL}/collections/:collectionId`,
          () => new HttpResponse(null, { status: 404 })
        )
      );

      await expect(getCollection("nonexistent")).rejects.toThrow("Cal-Adapt STAC API Error: 404");
    });
  });

  describe("searchItems", () => {
    it("returns search results with empty filters", async () => {
      const mockResult = { type: "FeatureCollection", features: [], links: [] };
      let capturedUrl = "";

      server.use(
        http.get(`${STAC_API_BASE_URL}/search`, ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json(mockResult);
        })
      );

      const result = await searchItems({});
      expect(result).toEqual(mockResult);

      const params = new URL(capturedUrl).searchParams;
      expect(params.get("filter")).toBeNull();
      expect(params.get("filter_lang")).toBeNull();
      expect(params.get("limit")).toBe("3480");
    });

    it("joins multiple filters with AND", async () => {
      let capturedUrl = "";

      server.use(
        http.get(`${STAC_API_BASE_URL}/search`, ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json({ type: "FeatureCollection", features: [], links: [] });
        })
      );

      await searchItems({
        collectionFilter: "collection = 'loca2-county'",
        scenarioFilter: "scenario = 'ssp585'",
      });

      const url = new URL(capturedUrl);
      expect(url.searchParams.get("filter")).toBe(
        "collection = 'loca2-county' AND scenario = 'ssp585'"
      );
      expect(url.searchParams.get("filter_lang")).toBe("cql2-text");
    });

    it("throws on non-2xx response", async () => {
      server.use(
        http.get(`${STAC_API_BASE_URL}/search`, () => new HttpResponse(null, { status: 500 }))
      );

      await expect(searchItems({})).rejects.toThrow("Cal-Adapt STAC API Error: 500");
    });
  });
});
