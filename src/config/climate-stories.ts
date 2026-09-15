export const CLIMATE_STORIES_HREF = "/dashboard/climate-stories";

/** Callout can link to related tools, defined below. */
export type ClimateStoryRelatedToolId =
  | "climate-metrics-map"
  | "data-download-tool"
  | "extreme-heat-days"
  | "renewables-visualizer";

export interface ClimateStory {
  slug: string;
  id: string;
  title: string;
  /** Short name for sidebar/nav. Falls back to `title` when omitted. */
  label?: string;
  href: string;
  hazard: string;
  lastUpdated: string;
  isNew?: boolean;
  summary: string;
  /** "In this story" blurb on the story page. */
  intro: string;
  relatedToolId: ClimateStoryRelatedToolId;
}

type ClimateStoryDefinition = Omit<ClimateStory, "href">;

const climateStoryDefinitions = [
  {
    slug: "extreme-heat",
    id: "climate-story-extreme-heat",
    title: "Extreme Heat in California",
    label: "Extreme Heat",
    hazard: "Heat",
    lastUpdated: "August 18, 2026",
    isNew: true,
    summary:
      "Extreme heat events cause some of the most severe impacts from climate change in California. These events create public health risks, threaten critical infrastructure, and drive electricity use that strains the limits of the electrical grid. Understanding how the hazards from extreme heat will continue to evolve with climate change is essential to planners across California.",
    intro:
      "This page provides an overview of some of the ways that extreme heat is projected to impact California in the coming decades, and highlights how the data and tools on Cal-Adapt can be used to learn about these projected changes. As you move through the page, explore the interactive visualizations to see how extreme heat will impact your community.",
    relatedToolId: "extreme-heat-days",
  },
] as const satisfies readonly ClimateStoryDefinition[];

export const climateStories: readonly ClimateStory[] = climateStoryDefinitions.map((story) => ({
  ...story,
  href: `${CLIMATE_STORIES_HREF}/${story.slug}`,
}));

export type ClimateStorySlug = (typeof climateStoryDefinitions)[number]["slug"];

export function getClimateStory(slug: string): ClimateStory | undefined {
  return climateStories.find((story) => story.slug === slug);
}
