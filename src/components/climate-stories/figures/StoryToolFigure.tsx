import StoryFigure from "../StoryFigure";

import { storyToolCharts, type StoryToolId, type StoryToolSelections } from "./tool-charts";

interface StoryToolFigureProps<K extends StoryToolId> {
  tool: K;
  /** Build with `resolveStoryToolSelections` at module level. */
  selections: StoryToolSelections[K];
  caption?: string;
}

/** A tool's chart, fixed to the given selections, with the tool's own loading, error, and source states. */
export default function StoryToolFigure<K extends StoryToolId>({
  tool,
  selections,
  caption,
}: StoryToolFigureProps<K>) {
  const { Chart } = storyToolCharts[tool];

  return (
    <StoryFigure caption={caption}>
      <Chart selections={selections} />
    </StoryFigure>
  );
}
