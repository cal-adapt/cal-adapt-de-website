import { CLIMATE_STORIES_HREF, climateStories } from "@/config/climate-stories";
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
  /** Optional nested pages rendered as an indented sub-navigation group */
  children?: readonly NavLink[];
  /** When true, child links stay visible even if this item is not the active route. */
  alwaysShowChildren?: boolean;
  /** When true, children drive breadcrumbs only and are not listed in the sidebar. */
  hideChildrenInSidebar?: boolean;
  /**
   * When false, child hrefs omit the current URL query string.
   * Defaults to true so tool subnavs keep chart/map selections.
   */
  persistQuery?: boolean;
}

export interface NavGroup {
  id: string;
  label: string;
  links: NavLink[];
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

const DATA_METHODS_HREF = "/dashboard/data-methods";

/** Data methods pages, in display order (alphabetical by label). */
const dataMethodsPages = [
  {
    id: "data-methods-extreme-heat-days",
    label: "Extreme Heat Days & Warm Nights",
    href: `${DATA_METHODS_HREF}/extreme-heat-days`,
  },
  {
    id: "data-methods-extreme-heat-season",
    label: "Extreme Heat Season",
    href: `${DATA_METHODS_HREF}/extreme-heat-season`,
  },
  {
    id: "data-methods-extreme-precipitation",
    label: "Extreme Precipitation",
    href: `${DATA_METHODS_HREF}/extreme-precipitation`,
  },
  {
    id: "data-methods-fire-weather",
    label: "Fire Weather",
    href: `${DATA_METHODS_HREF}/fire-weather`,
  },
  {
    id: "data-methods-heat-waves",
    label: "Heat Waves",
    href: `${DATA_METHODS_HREF}/heat-waves`,
  },
  {
    id: "data-methods-hdd-cdd",
    label: "Heating & Cooling Degree Days",
    href: `${DATA_METHODS_HREF}/hdd-cdd`,
    featureFlag: "__FF_HDD_CDD__",
  },
  {
    id: "data-methods-renewables",
    label: "Solar & Wind Resource Droughts",
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
    featureFlag: "__FF_CLIMATE_STORIES__",
    alwaysShowChildren: true,
    persistQuery: false,
    children: climateStories.map((story) => ({
      id: story.id,
      label: story.label ?? story.title,
      href: story.href,
    })),
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
    hideChildrenInSidebar: true,
    persistQuery: false,
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
    href: "https://analytics.cal-adapt.org/guidance/",
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

export const navGroups = {
  stories: {
    id: "stories",
    label: "Climate Stories",
    links: [navLinks.climateStories].filter(isNavLinkEnabled),
  },
  tools: {
    id: "tools",
    label: "Tools",
    links: [
      navLinks.climateMetricsMap,
      navLinks.dataDownload,
      navLinks.extremeHeatDays,
      navLinks.hddCdd,
      navLinks.renewablesVisualizer,
    ].filter(isNavLinkEnabled),
  },
} as const satisfies Record<string, NavGroup>;
