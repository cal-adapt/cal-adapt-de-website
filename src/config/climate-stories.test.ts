import { describe, expect, it } from "vitest";

import {
  CLIMATE_STORIES_HREF,
  climateStories,
  climateStoryCatalog,
  getClimateStory,
} from "./climate-stories";
import { navLinks } from "./navigation";

const TOOL_IDS = new Set([
  navLinks.climateMetricsMap.id,
  navLinks.dataDownload.id,
  navLinks.extremeHeatDays.id,
  navLinks.renewablesVisualizer.id,
]);

describe("getClimateStory", () => {
  it("returns the Extreme Heat story by slug", () => {
    const story = getClimateStory("extreme-heat");
    expect(story?.title).toBe("Extreme Heat in California");
    expect(story?.label).toBe("Extreme Heat");
    expect(story?.href).toBe("/dashboard/climate-stories/extreme-heat");
    expect(story?.relatedToolId).toBe("extreme-heat-days");
    expect(story?.intro.length).toBeGreaterThan(0);
  });

  it("returns undefined for an unknown slug", () => {
    expect(getClimateStory("unknown")).toBeUndefined();
  });

  it("does not resolve coming-soon stories", () => {
    expect(getClimateStory("precipitation")).toBeUndefined();
  });
});

describe("climateStoryCatalog", () => {
  it("uses unique slugs and ids across published and coming-soon stories", () => {
    const slugs = climateStoryCatalog.map((story) => story.slug);
    const ids = climateStoryCatalog.map((story) => story.id);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("climateStories", () => {
  it("contains only published stories, in catalog order", () => {
    const published = climateStoryCatalog.filter((story) => story.status === "published");
    expect(climateStories).toEqual(published);
  });

  it("derives href from slug", () => {
    for (const story of climateStories) {
      expect(story.href).toBe(`${CLIMATE_STORIES_HREF}/${story.slug}`);
    }
  });

  it("points relatedToolId at a dashboard tool", () => {
    for (const story of climateStories) {
      expect(TOOL_IDS.has(story.relatedToolId)).toBe(true);
    }
  });
});
