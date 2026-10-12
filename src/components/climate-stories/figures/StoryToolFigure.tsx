import { navLinks } from "@/config/navigation";

import StoryFigure from "../StoryFigure";

import StoryToolLink, { type StoryRelatedLink, type StoryToolLinkTarget } from "./StoryToolLink";
import {
  storyToolCharts,
  storyToolHref,
  type StoryToolId,
  type StoryToolSelections,
} from "./tool-charts";

interface StoryToolFigureProps<K extends StoryToolId> {
  tool: K;
  selections: StoryToolSelections[K];
  caption?: string;
  /** From `climateMetricsMapHref`. Adds a link to the map of this metric. */
  mapHref?: string;
  /** Further reading on another site, e.g. a blog post about this chart. */
  relatedLinks?: readonly StoryRelatedLink[];
}

export default function StoryToolFigure<K extends StoryToolId>({
  tool,
  selections,
  caption,
  mapHref,
  relatedLinks,
}: StoryToolFigureProps<K>) {
  const { Chart, navLink } = storyToolCharts[tool];
  const links: StoryToolLinkTarget[] = [{ navLink, href: storyToolHref(tool, selections) }];
  if (mapHref) links.push({ navLink: navLinks.climateMetricsMap, href: mapHref });

  return (
    <StoryFigure caption={caption}>
      <StoryToolLink links={links} relatedLinks={relatedLinks}>
        <Chart selections={selections} />
      </StoryToolLink>
    </StoryFigure>
  );
}
