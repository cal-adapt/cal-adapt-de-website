import { FEEDBACK_URL } from "@/config/constants";

export interface NavLink {
  id: string;
  label: string;
  href: string;
  external?: boolean;
  /** Optional nested pages rendered as an indented sub-navigation group */
  children?: readonly NavLink[];
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

export const navLinks = {
  home: {
    id: "home",
    label: "Home",
    href: "/",
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
    label: "Extreme Heat Days",
    href: "/dashboard/extreme-heat-days",
    children: [
      {
        id: "extreme-heat-days-dashboard",
        label: "Dashboard",
        href: "/dashboard/extreme-heat-days",
      },
      {
        id: "extreme-heat-days-methods",
        label: "Methods",
        href: "/dashboard/extreme-heat-days/methods",
      },
      {
        id: "extreme-heat-days-guidance",
        label: "Guidance",
        href: "/dashboard/extreme-heat-days/guidance",
      },
    ],
  },
  renewablesVisualizer: {
    id: "renewables-visualizer",
    label: "Renewables Visualizer",
    href: "/dashboard/renewables-visualizer",
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
  tools: {
    id: "tools",
    label: "Tools",
    links: [
      navLinks.climateMetricsMap,
      navLinks.dataDownload,
      navLinks.extremeHeatDays,
      navLinks.renewablesVisualizer,
    ],
  },
} as const satisfies Record<string, NavGroup>;
