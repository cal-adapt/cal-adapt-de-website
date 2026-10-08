import { type ClimateVariableId, climateVariables } from "@/config/climate-variables";
import {
  type DataMethodsPageId,
  isNavLinkEnabled,
  type NavLink,
  navLinks,
} from "@/config/navigation";

/** Filter keywords, in the order their chips are shown. */
export const DATA_METHODS_TAGS = [
  "Energy demand",
  "Extreme heat",
  "Precipitation",
  "Renewable energy",
  "Wildfire",
] as const;

export type DataMethodsTag = (typeof DATA_METHODS_TAGS)[number];

interface DataMethodsDetails {
  /** The variable, or group of variables, the page covers. */
  variable: ClimateVariableId;
  /** Keywords shown on the row and as filter chips above the list. */
  tags: readonly DataMethodsTag[];
}

export interface DataMethodsEntry {
  page: NavLink;
  /** One-line description of what the page's variables measure. */
  summary: string;
  tags: readonly DataMethodsTag[];
}

const DETAILS_BY_PAGE: Record<DataMethodsPageId, DataMethodsDetails> = {
  "data-methods-extreme-heat-days": {
    variable: "extreme-heat-days-and-warm-nights",
    tags: ["Extreme heat"],
  },
  "data-methods-heat-waves": { variable: "heat-waves", tags: ["Extreme heat"] },
  "data-methods-extreme-heat-season": { variable: "extreme-heat-season", tags: ["Extreme heat"] },
  "data-methods-extreme-precipitation": {
    variable: "extreme-precipitation",
    tags: ["Precipitation"],
  },
  "data-methods-fire-weather": { variable: "fire-weather", tags: ["Wildfire"] },
  "data-methods-hdd-cdd": { variable: "heating-and-cooling-degree-days", tags: ["Energy demand"] },
  "data-methods-renewables": {
    variable: "solar-and-wind-resource-droughts",
    tags: ["Renewable energy"],
  },
};

/** One entry per data methods page enabled in this environment, in display order. */
export const dataMethodsEntries: readonly DataMethodsEntry[] = navLinks.dataMethods.children.map(
  (page) => {
    const { variable, tags } = DETAILS_BY_PAGE[page.id];
    return { page, tags, summary: climateVariables[variable].description };
  }
);

/** Href of the data methods index, or undefined when the section is off in this environment. */
export const dataMethodsIndexHref: string | undefined = isNavLinkEnabled(navLinks.dataMethods)
  ? navLinks.dataMethods.href
  : undefined;

/** Href of a data methods page, or undefined when the section or that page is off. */
export function dataMethodsHref(id: DataMethodsPageId): string | undefined {
  if (dataMethodsIndexHref == null) return undefined;
  return dataMethodsEntries.find((entry) => entry.page.id === id)?.page.href;
}
