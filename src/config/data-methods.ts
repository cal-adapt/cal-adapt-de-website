import { type DataMethodsPageId, type NavLink, navLinks } from "@/config/navigation";

/** Filter keywords, in the order their chips are shown. */
export const DATA_METHODS_TAGS = [
  "Energy demand",
  "Extreme heat",
  "Precipitation",
  "Renewables",
  "Wildfire",
] as const;

export type DataMethodsTag = (typeof DATA_METHODS_TAGS)[number];

interface DataMethodsDetails {
  /** One-line description of what the page's variables measure. */
  summary: string;
  /** Keywords shown on the row and as filter chips above the list. */
  tags: readonly DataMethodsTag[];
  /** Extra search terms that don't appear in the visible text. */
  keywords: readonly string[];
}

export interface DataMethodsEntry extends DataMethodsDetails {
  page: NavLink;
}

const HEAT_KEYWORDS = [
  "Extreme Heat tool",
  "global warming levels",
  "GWL",
  "threshold",
  "percentile",
  "exceedance",
  "maximum daily air temperature",
  "t2max",
  "WRF",
] as const;

const DETAILS_BY_PAGE: Record<DataMethodsPageId, DataMethodsDetails> = {
  "data-methods-extreme-heat-days": {
    summary:
      "Days per year above a daytime high, or nights per year above an overnight low, temperature threshold.",
    tags: ["Extreme heat"],
    keywords: [
      ...HEAT_KEYWORDS,
      "minimum daily air temperature",
      "t2min",
      "ERA5",
      "hot days",
      "overnight",
    ],
  },
  "data-methods-heat-waves": {
    summary:
      "Heat wave frequency and heat wave length: how often heat waves occur and how long they last.",
    tags: ["Extreme heat"],
    keywords: [...HEAT_KEYWORDS, "consecutive days", "duration", "streak", "heatwave"],
  },
  "data-methods-extreme-heat-season": {
    summary: "When in the year hot days tend to occur.",
    tags: ["Extreme heat"],
    keywords: [...HEAT_KEYWORDS, "day of year", "timing", "calendar"],
  },
  "data-methods-extreme-precipitation": {
    summary: "How much rain falls on really heavy rain days.",
    tags: ["Precipitation"],
    keywords: [
      "Climate Metrics Map",
      "global warming levels",
      "GWL",
      "99th percentile",
      "1-day accumulated precipitation",
      "rainfall",
      "snowfall",
      "storm",
      "flood",
      "R99p",
      "WRF",
    ],
  },
  "data-methods-fire-weather": {
    summary: "Days per year when the weather is conducive to wildfires.",
    tags: ["Wildfire"],
    keywords: [
      "Climate Metrics Map",
      "global warming levels",
      "GWL",
      "Fosberg fire weather index",
      "FFWI",
      "relative humidity",
      "wind speed",
      "air temperature",
      "WRF",
    ],
  },
  "data-methods-hdd-cdd": {
    summary:
      "How much and for how long daily average temperatures fall below or exceed 65 °F, reflecting demand for indoor heating and cooling.",
    tags: ["Energy demand"],
    keywords: [
      "average daily air temperature",
      "SSP3-7.0",
      "scenario",
      "energy",
      "electricity demand",
      "WRF",
      "HDD",
      "CDD",
      "air conditioning",
    ],
  },
  "data-methods-renewables": {
    summary:
      "Days per month when solar or wind generation potential falls below half of its historical average for that day of the year.",
    tags: ["Renewables"],
    keywords: [
      "Renewables Visualizer",
      "photovoltaic",
      "PV",
      "PVWatts",
      "generation",
      "turbine",
      "onshore",
      "offshore",
      "land use exclusions",
      "global warming levels",
      "GWL",
      "SSP3-7.0",
    ],
  },
};

/** One entry per data methods page enabled in this environment, in display order. */
export const dataMethodsEntries: readonly DataMethodsEntry[] = navLinks.dataMethods.children.map(
  (page) => ({ page, ...DETAILS_BY_PAGE[page.id] })
);
