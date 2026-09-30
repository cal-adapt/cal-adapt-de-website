import type { ComponentType } from "react";

import type { ClimateStory, ClimateStorySlug } from "@/config/climate-stories";

import ExtremeHeatStory, { extremeHeatSections } from "./ExtremeHeatStory";
import type { StorySection } from "./StoryTableOfContents";

interface ClimateStoryPage {
  Body: ComponentType<{ story: ClimateStory }>;
  /** Table of contents entries, in page order. References is appended by the layout. */
  sections: readonly StorySection[];
}

const climateStoryPages = {
  "extreme-heat": {
    Body: ExtremeHeatStory,
    sections: extremeHeatSections,
  },
} as const satisfies Record<ClimateStorySlug, ClimateStoryPage>;

export function getClimateStoryPage(slug: string): ClimateStoryPage | undefined {
  if (Object.hasOwn(climateStoryPages, slug)) {
    return climateStoryPages[slug as ClimateStorySlug];
  }
  return undefined;
}
