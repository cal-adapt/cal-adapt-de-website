import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";

import { isNavLinkEnabled, type NavLink, navLinks } from "@/config/navigation";

import type { DashboardSidebarSection } from "./DashboardSidebar";

export const dashboardSidebarSections: DashboardSidebarSection[] = [
  {
    id: "climate-stories",
    label: "Climate Stories",
    icon: <MenuBookOutlinedIcon />,
    links: [navLinks.extremeHeatStory, navLinks.extremePrecipitationStory],
  },
  {
    id: "tools",
    label: "Tools",
    icon: <BuildOutlinedIcon />,
    links: [navLinks.climateMetricsMap, navLinks.dataDownload],
  },
  {
    id: "beta-tools",
    label: "Beta Tools",
    icon: <ScienceOutlinedIcon />,
    links: [
      navLinks.renewablesVisualizer,
      navLinks.electricityAssetPlanning,
      navLinks.extremeHeatDays,
    ],
  },
  {
    id: "guidance",
    label: "Guidance",
    icon: <LightbulbOutlinedIcon />,
    links: [navLinks.glossary, navLinks.dataMethods, navLinks.analyticsEngineGuidance],
  },
].map((section) => ({ ...section, links: section.links.filter(isNavLinkEnabled) }));

/** Every link in the sidebar, flattened across sections. */
export const dashboardSidebarLinks: NavLink[] = dashboardSidebarSections.flatMap(
  (section) => section.links
);
