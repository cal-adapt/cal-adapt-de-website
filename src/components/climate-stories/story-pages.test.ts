import { describe, expect, it } from "vitest";

import { climateStories, climateStoryCatalog } from "@/config/climate-stories";

import { getClimateStoryPage } from "./story-pages";

describe("getClimateStoryPage", () => {
  it("registers a page with unique section ids for every published story", () => {
    for (const story of climateStories) {
      const page = getClimateStoryPage(story.slug);
      expect(page).toBeDefined();
      expect(page?.Body).toBeTypeOf("function");
      const ids = page?.sections.map((section) => section.id) ?? [];
      expect(ids.length).toBeGreaterThan(0);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("has no page for coming-soon stories", () => {
    for (const story of climateStoryCatalog) {
      if (story.status === "coming-soon") {
        expect(getClimateStoryPage(story.slug)).toBeUndefined();
      }
    }
  });

  it("returns undefined for unknown slugs and prototype keys", () => {
    expect(getClimateStoryPage("unknown")).toBeUndefined();
    expect(getClimateStoryPage("toString")).toBeUndefined();
    expect(getClimateStoryPage("constructor")).toBeUndefined();
  });
});
