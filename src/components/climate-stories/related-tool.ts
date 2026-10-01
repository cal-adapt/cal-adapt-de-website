import type { ClimateStoryRelatedToolId } from "@/config/climate-stories";
import { type NavLink, navLinks } from "@/config/navigation";

const RELATED_TOOL_LINKS = {
  "climate-metrics-map": navLinks.climateMetricsMap,
  "data-download-tool": navLinks.dataDownload,
  "extreme-heat-days": navLinks.extremeHeatDays,
  "renewables-visualizer": navLinks.renewablesVisualizer,
} as const satisfies Record<ClimateStoryRelatedToolId, NavLink>;

export function relatedToolLink(toolId: ClimateStoryRelatedToolId): NavLink {
  return RELATED_TOOL_LINKS[toolId];
}
