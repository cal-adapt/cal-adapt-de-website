import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";

import Button from "@/components/common/ui/Button";
import ToolButton from "@/components/common/ui/ToolButton";
import { type ClimateStorySlug, getClimateStory } from "@/config/climate-stories";
import { type NavLink, navLinks, toolLinks } from "@/config/navigation";
import {
  resolveSelections as resolveClimateMetricsMapSelections,
  selectionsToSearchParams as climateMetricsMapSelectionsToSearchParams,
} from "@/lib/climate-metrics-map/options";
import { resolveSelections as resolveExtremeHeatSelections } from "@/lib/extreme-heat-days/options";
import { selectionsToSearchParams as extremeHeatSelectionsToSearchParams } from "@/lib/extreme-heat-days/search-params";
import { resolveSelections as resolveHddCddSelections } from "@/lib/hdd-cdd/options";
import { selectionsToSearchParams as hddCddSelectionsToSearchParams } from "@/lib/hdd-cdd/search-params";

import styles from "./ShownIn.module.scss";

type ToolId = (typeof navLinks)[
  | "climateMetricsMap"
  | "dataDownload"
  | "extremeHeatDays"
  | "hddCdd"
  | "renewablesVisualizer"]["id"];

interface ToolTarget {
  id: ToolId;
  /** Variable (or map metric) to open the tool on, e.g. "heat-wave-length". */
  variable: string;
}

interface ShownInProps {
  /** Tool ids, e.g. "extreme-heat-days", or `{ id, variable }` to open the tool
   *  on a variable. A tool behind a disabled feature flag is left out. */
  tools?: readonly (ToolId | ToolTarget)[];
  /** Climate story slugs, e.g. "extreme-heat". */
  stories?: readonly ClimateStorySlug[];
}

/** Link to a tool opened on a variable. Throws on a variable the tool doesn't offer. */
function toolHref(navLink: NavLink, id: ToolId, variable: string): string {
  let query: string;
  switch (id) {
    case "climate-metrics-map":
      query = climateMetricsMapSelectionsToSearchParams(
        resolveClimateMetricsMapSelections({ metric: variable })
      ).toString();
      break;
    case "extreme-heat-days":
      query = extremeHeatSelectionsToSearchParams(
        resolveExtremeHeatSelections({ climateVariable: variable })
      ).toString();
      break;
    case "hdd-cdd":
      query = hddCddSelectionsToSearchParams(
        resolveHddCddSelections({ climateVariable: variable })
      ).toString();
      break;
    default:
      throw new Error(`"${id}" can't be opened on a variable`);
  }
  return query ? `${navLink.href}?${query}` : navLink.href;
}

/** A row of pills linking to the tools and climate stories a dataset appears in. */
export default function ShownIn({ tools = [], stories = [] }: ShownInProps) {
  return (
    <div className={styles.row}>
      {tools.map((tool) => {
        const { id, variable } = typeof tool === "string" ? { id: tool, variable: null } : tool;
        const navLink = toolLinks.find((link) => link.id === id);
        if (!navLink) return null;
        const href = variable === null ? navLink.href : toolHref(navLink, id, variable);
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
