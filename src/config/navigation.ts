import { CLIMATE_STORIES_HREF, climateStories } from "@/config/climate-stories";
import { climateVariables } from "@/config/climate-variables";
import { FEEDBACK_URL } from "@/config/constants";
import { featureFlags } from "@/config/feature-flags";

type FeatureFlagKey = keyof typeof featureFlags;

export interface NavLink {
  id: string;
  label: string;
  href: string;
  external?: boolean;
  /** When set, the link is only shown if the corresponding feature flag is enabled. */
  featureFlag?: FeatureFlagKey;
  /** Nested pages under this link; they form the second level of the dashboard breadcrumb. */
  children?: readonly NavLink[];
}

export interface NavGroup {
  id: string;
  label: string;
  links: readonly NavLink[];
}

export type NavItem = NavLink | NavGroup;

export function isNavGroup(item: NavItem): item is NavGroup {
  return "links" in item;
}

export function isNavLink(item: NavItem): item is NavLink {
  return "href" in item;
}

export function hasNavChildren(link: NavLink): link is NavLink & { children: readonly NavLink[] } {
  return Array.isArray(link.children) && link.children.length > 0;
}

export function isNavLinkEnabled(link: NavLink): boolean {
  return link.featureFlag == null || featureFlags[link.featureFlag];
}

const CLIMATE_STORIES_FLAG = "__FF_CLIMATE_STORIES__" satisfies FeatureFlagKey;
const DATA_METHODS_HREF = "/dashboard/data-methods";
const ANALYTICS_GUIDANCE_URL = "https://analytics.cal-adapt.org/guidance/";

/** Data methods pages, in display order (alphabetical by label). */
const dataMethodsPages = [
  {
    id: "data-methods-extreme-heat-days",
    label: climateVariables["extreme-heat-days-and-warm-nights"].label,
    href: `${DATA_METHODS_HREF}/extreme-heat-days`,
  },
  {
    id: "data-methods-extreme-heat-season",
    label: climateVariables["extreme-heat-season"].label,
    href: `${DATA_METHODS_HREF}/extreme-heat-season`,
  },
  {
    id: "data-methods-extreme-precipitation",
    label: climateVariables["extreme-precipitation"].label,
    href: `${DATA_METHODS_HREF}/extreme-precipitation`,
  },
  {
    id: "data-methods-fire-weather",
    label: climateVariables["fire-weather"].label,
    href: `${DATA_METHODS_HREF}/fire-weather`,
  },
  {
    id: "data-methods-heat-waves",
    label: climateVariables["heat-waves"].label,
    href: `${DATA_METHODS_HREF}/heat-waves`,
  },
  {
    id: "data-methods-hdd-cdd",
    label: climateVariables["heating-and-cooling-degree-days"].label,
    href: `${DATA_METHODS_HREF}/hdd-cdd`,
    featureFlag: "__FF_HDD_CDD__",
  },
  {
    id: "data-methods-renewables",
    label: climateVariables["solar-and-wind-resource-droughts"].label,
    href: `${DATA_METHODS_HREF}/renewables`,
  },
] as const satisfies readonly NavLink[];

export type DataMethodsPageId = (typeof dataMethodsPages)[number]["id"];

export const navLinks = {
  home: {
    id: "home",
    label: "Home",
    href: "/",
  },
  climateStories: {
    id: "climate-stories",
    label: "Climate Stories",
    href: CLIMATE_STORIES_HREF,
    featureFlag: CLIMATE_STORIES_FLAG,
    children: climateStories.map((story) => ({
      id: story.id,
      label: story.label ?? story.title,
      href: story.href,
      featureFlag: CLIMATE_STORIES_FLAG,
    })),
  },
  /** The climate stories catalog page, as listed among the stories themselves. */
  allClimateStories: {
    id: "all-climate-stories",
    label: "All Stories",
    href: CLIMATE_STORIES_HREF,
    featureFlag: CLIMATE_STORIES_FLAG,
  },
  climateMetricsMap: {
    id: "climate-metrics-map",
    label: "Climate Metrics Map",
    href: "/dashboard/climate-metrics-map",
  },
  dataDownload: {
    id: "data-download-tool",
    label: "Data Download Tool",
    href: "/dashboard/data-download-tool",
  },
  extremeHeatDays: {
    id: "extreme-heat-days",
    label: "Extreme Heat",
    href: "/dashboard/extreme-heat-days",
    featureFlag: "__FF_EXTREME_HEAT_DAYS__",
  },
  hddCdd: {
    id: "hdd-cdd",
    label: "Heating & Cooling Degree Days",
    href: "/dashboard/hdd-cdd",
    featureFlag: "__FF_HDD_CDD__",
  },
  renewablesVisualizer: {
    id: "renewables-visualizer",
    label: "Renewables Visualizer",
    href: "/dashboard/renewables-visualizer",
  },
  /**
   * Data methods index. Its children are the individual methods pages; a page
   * with a feature flag is hidden when that flag is off.
   */
  dataMethods: {
    id: "data-methods",
    label: "Data Methods",
    href: DATA_METHODS_HREF,
    featureFlag: "__FF_DATA_METHODS__",
    children: dataMethodsPages.filter(isNavLinkEnabled),
  },
  fourthAssessment: {
    id: "fourth-assessment",
    label: "4th Assessment Cal-Adapt",
    href: "https://cmip5.cal-adapt.org",
    external: true,
  },
  guidance: {
    id: "guidance",
    label: "Guidance",
    href: ANALYTICS_GUIDANCE_URL,
    external: true,
  },
  moreGuidance: {
    id: "more-guidance",
    label: "More Guidance",
    href: ANALYTICS_GUIDANCE_URL,
    external: true,
  },
  data: {
    id: "data",
    label: "Data Docs",
    href: "https://analytics.cal-adapt.org/data/",
    external: true,
  },
  contact: {
    id: "contact",
    label: "Contact Us",
    href: "mailto:analytics@cal-adapt.org",
    external: true,
  },
  feedback: {
    id: "feedback",
    label: "Feedback",
    href: FEEDBACK_URL,
    external: true,
  },
} as const satisfies Record<string, NavLink>;

/**
 * The site's information architecture: every navigable page, grouped into sections.
 * Key order is display order. Links are already filtered by feature flag, so a
 * section can be empty in some environments; use `enabledNavSections` to render.
 */
export const navSections = {
  climateStories: {
    id: "climate-stories",
    label: "Climate Stories",
    links: [navLinks.allClimateStories, ...navLinks.climateStories.children].filter(
      isNavLinkEnabled
    ),
  },
  tools: {
    id: "tools",
    label: "Tools",
    links: [navLinks.climateMetricsMap, navLinks.dataDownload].filter(isNavLinkEnabled),
  },
  betaTools: {
    id: "beta-tools",
    label: "Beta Tools",
    links: [navLinks.extremeHeatDays, navLinks.hddCdd, navLinks.renewablesVisualizer].filter(
      isNavLinkEnabled
    ),
  },
  guidance: {
    id: "guidance",
    label: "Guidance",
    links: [navLinks.dataMethods, navLinks.moreGuidance].filter(isNavLinkEnabled),
  },
} as const satisfies Record<string, NavGroup>;

export type NavSectionId = (typeof navSections)[keyof typeof navSections]["id"];

export interface NavSection extends NavGroup {
  id: NavSectionId;
}

/** Sections with at least one link in this environment, in display order. */
export const enabledNavSections: readonly NavSection[] = Object.values(navSections).filter(
  (section) => section.links.length > 0
);

/** Every dashboard tool, stable then beta. */
export const toolLinks: readonly NavLink[] = [
  ...navSections.tools.links,
  ...navSections.betaTools.links,
];

/** Dashboard pages that head a breadcrumb trail; their `children` form the second level. */
export const dashboardPages: readonly NavLink[] = [
  navLinks.climateStories,
  ...toolLinks,
  navLinks.dataMethods,
].filter(isNavLinkEnabled);
