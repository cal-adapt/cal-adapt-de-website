import StoryFigure from "../StoryFigure";

import { storyToolCharts, type StoryToolId, type StoryToolSelections } from "./tool-charts";

interface StoryToolFigureProps<K extends StoryToolId> {
  tool: K;
  selections: StoryToolSelections[K];
  caption?: string;
}

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
