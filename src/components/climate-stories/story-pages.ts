import type { ComponentType } from "react";

import type { ClimateStory, ClimateStorySlug } from "@/config/climate-stories";

import ExtremeHeatStory from "./ExtremeHeatStory";

interface ClimateStoryPage {
  Body: ComponentType<{ story: ClimateStory }>;
}

const climateStoryPages = {
  "extreme-heat": {
    Body: ExtremeHeatStory,
  },
} as const satisfies Record<ClimateStorySlug, ClimateStoryPage>;

export function getClimateStoryPage(slug: string): ClimateStoryPage | undefined {
  if (Object.hasOwn(climateStoryPages, slug)) {
    return climateStoryPages[slug as ClimateStorySlug];
  }
  return undefined;
}
