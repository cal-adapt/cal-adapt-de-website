export const CLIMATE_STORIES_HREF = "/dashboard/climate-stories";

/** Callout can link to related tools, defined below. */
export type ClimateStoryRelatedToolId =
  | "climate-metrics-map"
  | "data-download-tool"
  | "extreme-heat-days"
  | "renewables-visualizer";

interface ClimateStoryBase {
  /** Reserved URL segment; only published stories get a route. */
  slug: string;
  id: string;
  title: string;
  hazard: string;
  summary: string;
}

export interface ClimateStory extends ClimateStoryBase {
  status: "published";
  /** Short name for sidebar/nav. Falls back to `title` when omitted. */
  label?: string;
  href: string;
  lastUpdated: string;
  isNew?: boolean;
  /** "In this story" blurb on the story page. */
  intro: string;
  relatedToolId: ClimateStoryRelatedToolId;
}

/** Catalog-only teaser: no route, nav entry, or sitemap entry. */
export interface UpcomingClimateStory extends ClimateStoryBase {
  status: "coming-soon";
}

export type ClimateStoryEntry = ClimateStory | UpcomingClimateStory;

type ClimateStoryDefinition = Omit<ClimateStory, "href"> | UpcomingClimateStory;

/** Catalog display order. */
const climateStoryDefinitions = [
  {
    status: "published",
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
  {
    status: "coming-soon",
    slug: "precipitation",
    id: "climate-story-precipitation",
    title: "Precipitation in California",
    hazard: "Precipitation",
    summary:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin ac eros felis. Duis id commodo dolor. Vestibulum ex velit, egestas ut quam eget, placerat hendrerit orci.",
  },
] as const satisfies readonly ClimateStoryDefinition[];

function toEntry(definition: ClimateStoryDefinition): ClimateStoryEntry {
  switch (definition.status) {
    case "published":
      return { ...definition, href: `${CLIMATE_STORIES_HREF}/${definition.slug}` };
    case "coming-soon":
      return definition;
    default: {
      const unhandled: never = definition;
      throw new Error(`Unhandled climate story status: ${JSON.stringify(unhandled)}`);
    }
  }
}

/** Every story in display order. Only the catalog page should use this. */
export const climateStoryCatalog: readonly ClimateStoryEntry[] =
  climateStoryDefinitions.map(toEntry);

/** Published stories: drive routes, nav, and sitemap. */
export const climateStories: readonly ClimateStory[] = climateStoryCatalog.filter(
  (story): story is ClimateStory => story.status === "published"
);

export type ClimateStorySlug = Extract<
  (typeof climateStoryDefinitions)[number],
  { status: "published" }
>["slug"];

export function getClimateStory(slug: string): ClimateStory | undefined {
  return climateStories.find((story) => story.slug === slug);
}
