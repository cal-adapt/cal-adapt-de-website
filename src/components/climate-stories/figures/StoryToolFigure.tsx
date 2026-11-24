import StoryFigure, { type StoryFigureRelatedLink, type StoryFigureToolLink } from "../StoryFigure";

import {
  storyToolCharts,
  type StoryToolId,
  storyToolLink,
  type StoryToolSelections,
} from "./tool-charts";

interface StoryToolFigureProps<K extends StoryToolId> {
  tool: K;
  selections: StoryToolSelections[K];
  caption?: string;
  /** Other tools to explore this figure in, after the figure's own tool. */
  toolLinks?: readonly StoryFigureToolLink[];
  /** Further reading on another site, e.g. a blog post about this chart. */
  relatedLinks?: readonly StoryFigureRelatedLink[];
}

export default function StoryToolFigure<K extends StoryToolId>({
  tool,
  selections,
  caption,
  toolLinks = [],
  relatedLinks,
}: StoryToolFigureProps<K>) {
  const { Chart } = storyToolCharts[tool];

  return (
    <StoryFigure
      caption={caption}
      toolLinks={[storyToolLink(tool, selections), ...toolLinks]}
      relatedLinks={relatedLinks}
    >
      <Chart selections={selections} />
    </StoryFigure>
  );
}
