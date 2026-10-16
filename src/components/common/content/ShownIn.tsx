import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";

import {
  resolveStoryToolSelections,
  storyToolHref,
  type StoryToolId,
  type StoryToolSelections,
} from "@/components/climate-stories/figures/tool-charts";
import Button from "@/components/common/ui/Button";
import ToolButton from "@/components/common/ui/ToolButton";
import { type ClimateStorySlug, getClimateStory } from "@/config/climate-stories";
import { navLinks, toolLinks } from "@/config/navigation";

import styles from "./ShownIn.module.scss";

type ToolId = (typeof navLinks)[
  | "climateMetricsMap"
  | "dataDownload"
  | "extremeHeatDays"
  | "hddCdd"
  | "renewablesVisualizer"]["id"];

/** A tool opened on selections, e.g. `{ id: "climate-metrics-map", selections: { metric: "fire-weather" } }`. */
type ToolTarget = {
  [K in StoryToolId]: { id: K; selections: Partial<StoryToolSelections[K]> };
}[StoryToolId];

interface ShownInProps {
  /** Tool ids, e.g. "extreme-heat-days", or `{ id, selections }` to open the tool
   *  preconfigured. A tool behind a disabled feature flag is left out. */
  tools?: readonly (ToolId | ToolTarget)[];
  /** Climate story slugs, e.g. "extreme-heat". */
  stories?: readonly ClimateStorySlug[];
}

/** A row of buttons linking to the tools and climate stories a dataset appears in. */
export default function ShownIn({ tools = [], stories = [] }: ShownInProps) {
  return (
    <div className={styles.row}>
      {tools.map((tool) => {
        const id = typeof tool === "string" ? tool : tool.id;
        const navLink = toolLinks.find((link) => link.id === id);
        if (!navLink) return null;
        const href =
          typeof tool === "string"
            ? navLink.href
            : storyToolHref(tool.id, resolveStoryToolSelections(tool.id, tool.selections));
        return <ToolButton key={href} navLink={navLink} href={href} />;
      })}
      {stories.map((slug) => {
        const story = getClimateStory(slug);
        return story ? (
          <Button
            key={slug}
            variant="outline"
            size="compact"
            href={story.href}
            prefix={<MenuBookOutlinedIcon />}
          >
            {`${story.label ?? story.title} Climate Story`}
          </Button>
        ) : null;
      })}
    </div>
  );
}
