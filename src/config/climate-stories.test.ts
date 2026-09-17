import { describe, expect, it } from "vitest";

import { CLIMATE_STORIES_HREF, climateStories, getClimateStory } from "./climate-stories";
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
});

describe("climateStories", () => {
  it("uses unique slugs and hrefs derived from slug", () => {
    const slugs = climateStories.map((story) => story.slug);
    const hrefs = climateStories.map((story) => story.href);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(hrefs).size).toBe(hrefs.length);
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
