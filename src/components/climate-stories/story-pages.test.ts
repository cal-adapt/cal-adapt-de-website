import { describe, expect, it } from "vitest";

import { climateStories, climateStoryCatalog } from "@/config/climate-stories";

import { getClimateStoryPage } from "./story-pages";

describe("getClimateStoryPage", () => {
  it("registers a page for every published story", () => {
    for (const story of climateStories) {
      const page = getClimateStoryPage(story.slug);
      expect(page).toBeDefined();
      expect(page?.Body).toBeTypeOf("function");
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
