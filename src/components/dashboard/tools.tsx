import { type ReactNode } from "react";

import DatasetOutlinedIcon from "@mui/icons-material/DatasetOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import ThermostatOutlinedIcon from "@mui/icons-material/ThermostatOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";

import { type IconVariant } from "@/components/common/ui/Icon";
import { navGroups, type NavLink } from "@/config/navigation";

export interface DashboardToolAppbarConfig {
  /** Tooltip for the Appbar's right-side icon button (typically opens a side panel). */
  tooltipTitle: string;
  icon: IconVariant;
}

export interface DashboardToolUi {
  sidebarIcon: ReactNode;
  /** Omit if the tool has no Appbar side-panel toggle. */
  appbar?: DashboardToolAppbarConfig;
}

export interface DashboardTool extends DashboardToolUi {
  navLink: NavLink;
}

/** String-literal union of tool ids, derived from the canonical nav list. */
type DashboardToolNavLinkId = (typeof navGroups.tools.links)[number]["id"];

/**
 * UI metadata for each dashboard tool, keyed by NavLink id.
 * New tools must be added to `navGroups.tools.links`, with UI metadata registered here.
 */
const TOOL_UI_BY_ID: Record<DashboardToolNavLinkId, DashboardToolUi> = {
  "climate-metrics-map": {
    sidebarIcon: <MapOutlinedIcon />,
  },
  "data-download-tool": {
    sidebarIcon: <DatasetOutlinedIcon />,
    appbar: {
      tooltipTitle: "Review your selected package",
      icon: "package",
    },
  },
  "extreme-heat-days": {
    sidebarIcon: <ThermostatOutlinedIcon />,
  },
  "renewables-visualizer": {
    sidebarIcon: <WbSunnyOutlinedIcon />,
    appbar: {
      tooltipTitle: "Change your visualization parameters",
      icon: "settings",
    },
  },
};

export const dashboardTools: readonly DashboardTool[] = navGroups.tools.links.map((navLink) => ({
  navLink,
  ...TOOL_UI_BY_ID[navLink.id],
}));

export function getDashboardToolByNavId(id: string | null): DashboardTool | undefined {
  if (id == null) return undefined;
  return dashboardTools.find((t) => t.navLink.id === id);
}
