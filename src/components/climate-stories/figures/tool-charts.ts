import type { ComponentType } from "react";

import { type NavLink, navLinks } from "@/config/navigation";
import {
  type ExtremeHeatDaysSelections,
  resolveSelections as resolveExtremeHeatSelections,
} from "@/lib/extreme-heat-days/options";
import { selectionsToSearchParams as extremeHeatSelectionsToSearchParams } from "@/lib/extreme-heat-days/search-params";
import {
  type HddCddSelections,
  resolveSelections as resolveHddCddSelections,
} from "@/lib/hdd-cdd/options";
import { selectionsToSearchParams as hddCddSelectionsToSearchParams } from "@/lib/hdd-cdd/search-params";

import ExtremeHeatChart from "./ExtremeHeatChart";
import HddCddChart from "./HddCddChart";

/** Add a tool here and to `storyToolCharts` to make its chart usable in stories. */
export interface StoryToolSelections {
  "extreme-heat-days": ExtremeHeatDaysSelections;
  "hdd-cdd": HddCddSelections;
}

export type StoryToolId = keyof StoryToolSelections;

interface StoryToolChart<S> {
  navLink: NavLink;
  /** Throws on values the tool doesn't offer. */
  resolveSelections: (overrides: Partial<S>) => S;
  toSearchParams: (selections: S) => URLSearchParams;
  Chart: ComponentType<{ selections: S }>;
}

export const storyToolCharts: { [K in StoryToolId]: StoryToolChart<StoryToolSelections[K]> } = {
  "extreme-heat-days": {
    navLink: navLinks.extremeHeatDays,
    resolveSelections: resolveExtremeHeatSelections,
    toSearchParams: extremeHeatSelectionsToSearchParams,
    Chart: ExtremeHeatChart,
  },
  "hdd-cdd": {
    navLink: navLinks.hddCdd,
    resolveSelections: resolveHddCddSelections,
    toSearchParams: hddCddSelectionsToSearchParams,
    Chart: HddCddChart,
  },
};

/** Call at module level in a story so a bad selection breaks the build, not the page. */
export function resolveStoryToolSelections<K extends StoryToolId>(
  tool: K,
  overrides: Partial<StoryToolSelections[K]> = {}
): StoryToolSelections[K] {
  return storyToolCharts[tool].resolveSelections(overrides);
}

export function storyToolHref<K extends StoryToolId>(
  tool: K,
  selections: StoryToolSelections[K]
): string {
  const { navLink, toSearchParams } = storyToolCharts[tool];
  const query = toSearchParams(selections).toString();
  return query ? `${navLink.href}?${query}` : navLink.href;
}
