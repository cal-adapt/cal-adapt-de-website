import { type DataMethodsPageId, type NavLink, navLinks } from "@/config/navigation";

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
  /** One-line description of what the page's variables measure. */
  summary: string;
  /** Keywords shown on the row and as filter chips above the list. */
  tags: readonly DataMethodsTag[];
}

export interface DataMethodsEntry extends DataMethodsDetails {
  page: NavLink;
}

const DETAILS_BY_PAGE: Record<DataMethodsPageId, DataMethodsDetails> = {
  "data-methods-extreme-heat-days": {
    summary:
      "Days per year above a daytime high, or nights per year above an overnight low, temperature threshold.",
    tags: ["Extreme heat"],
  },
  "data-methods-heat-waves": {
    summary:
      "Heat wave frequency and heat wave length: how often heat waves occur and how long they last.",
    tags: ["Extreme heat"],
  },
  "data-methods-extreme-heat-season": {
    summary: "When in the year hot days tend to occur.",
    tags: ["Extreme heat"],
  },
  "data-methods-extreme-precipitation": {
    summary: "How much rain falls on really heavy rain days.",
    tags: ["Precipitation"],
  },
  "data-methods-fire-weather": {
    summary: "Days per year when the weather is conducive to wildfires.",
    tags: ["Wildfire"],
  },
  "data-methods-hdd-cdd": {
    summary:
      "How much and for how long daily average temperatures fall below or exceed 65 °F, reflecting demand for indoor heating and cooling.",
    tags: ["Energy demand"],
  },
  "data-methods-renewables": {
    summary:
      "Days per month when solar or wind generation potential falls below half of its historical average for that day of the year.",
    tags: ["Renewable energy"],
  },
};

/** One entry per data methods page enabled in this environment, in display order. */
export const dataMethodsEntries: readonly DataMethodsEntry[] = navLinks.dataMethods.children.map(
  (page) => ({ page, ...DETAILS_BY_PAGE[page.id] })
);
