"use client";

import React from "react";
import { usePathname } from "next/navigation";

import DatasetOutlinedIcon from "@mui/icons-material/DatasetOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import ThermostatOutlinedIcon from "@mui/icons-material/ThermostatOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import useMediaQuery from "@mui/material/useMediaQuery";

import ErrorView from "@/components/common/layout/ErrorView";
import Button from "@/components/common/ui/Button";
import DashboardAppBar from "@/components/dashboard/DashboardAppBar";
import DashboardSidebar, {
  type DashboardSidebarNavItem,
} from "@/components/dashboard/DashboardSidebar";
import { mediaQueries } from "@/config/breakpoints";
import { hasNavChildren, type NavLink, navLinks } from "@/config/navigation";
import { useLeftDrawer } from "@/context/LeftDrawerContext";
import { SidePanelProvider } from "@/context/SidePanelContext";
import { extractSegment, normalizePath } from "@/utils/url";

interface LayoutProps {
  children: React.ReactNode;
}

const SIDEBAR_ITEMS: DashboardSidebarNavItem[] = [
  { link: navLinks.climateMetricsMap, icon: <MapOutlinedIcon /> },
  { link: navLinks.extremeHeatDays, icon: <ThermostatOutlinedIcon /> },
  { link: navLinks.dataDownload, icon: <DatasetOutlinedIcon /> },
  { link: navLinks.renewablesVisualizer, icon: <WbSunnyOutlinedIcon /> },
];

/** Resolve the active tool's nav link from the current `/dashboard/:tool` segment. */
function getPageLink(selectedPage: string | null): NavLink {
  const match = SIDEBAR_ITEMS.find((item) => item.link.id === selectedPage);
  return match?.link ?? navLinks.home;
}

/** Resolve the active nested page (e.g. "Methods") under the current tool, if any. */
function getSubPageLink(pageLink: NavLink, pathname: string): NavLink | undefined {
  if (!hasNavChildren(pageLink)) return undefined;
  const current = normalizePath(pathname);
  return pageLink.children.find(
    (child) => normalizePath(child.href) === current && child.href !== pageLink.href
  );
}

export default function Layout({ children }: LayoutProps) {
  const { open, toggleLeftDrawer } = useLeftDrawer();
  const pathname = usePathname();
  const selectedPage: string | null = extractSegment(pathname, "dashboard/", "/");
  const isMobile = useMediaQuery(mediaQueries.max.small);

  const pageLink = getPageLink(selectedPage);
  const subPageLink = getSubPageLink(pageLink, pathname);

  if (isMobile) {
    return (
      <SidePanelProvider>
        <ErrorView
          logo
          message="Due to the nature of the tools, the Cal-Adapt Dashboard is best used on a desktop or laptop computer"
        >
          <Button href="/">Go to the homepage</Button>
        </ErrorView>
      </SidePanelProvider>
    );
  }

  return (
    <SidePanelProvider>
      {/* Viewport-locked frame: the sidebar fills the window height and only the
          main content scrolls, so the sidebar stays fully visible on long pages.
          The height subtracts the site-wide banner so nothing overflows below it. */}
      <div
        style={{
          display: "flex",
          height: "calc(100dvh - var(--banner-height, 0px))",
          overflow: "hidden",
        }}
      >
        <DashboardSidebar
          open={open}
          onToggleOpen={toggleLeftDrawer}
          activeHref={pathname}
          items={SIDEBAR_ITEMS}
        />

        <div
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <DashboardAppBar page={pageLink} subPage={subPageLink} />

          <main id="main-content" style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
            {children}
          </main>
        </div>
      </div>
    </SidePanelProvider>
  );
}
