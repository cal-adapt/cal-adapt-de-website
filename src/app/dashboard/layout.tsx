"use client";

import React from "react";
import { usePathname } from "next/navigation";

import useMediaQuery from "@mui/material/useMediaQuery";

import ErrorView from "@/components/common/layout/ErrorView";
import Button from "@/components/common/ui/Button";
import DashboardAppBar from "@/components/dashboard/DashboardAppBar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import {
  dashboardSidebarLinks,
  dashboardSidebarSections,
} from "@/components/dashboard/sidebarSections";
import { mediaQueries } from "@/config/breakpoints";
import { hasNavChildren, type NavLink, navLinks } from "@/config/navigation";
import { useLeftDrawer } from "@/context/LeftDrawerContext";
import { SidePanelProvider } from "@/context/SidePanelContext";
import { normalizePath } from "@/utils/url";

interface LayoutProps {
  children: React.ReactNode;
}

/** Resolve the active sidebar link: the one whose href is the longest prefix of the path. */
function getPageLink(pathname: string): NavLink {
  const current = normalizePath(pathname);
  const match = dashboardSidebarLinks
    .filter((link) => {
      const href = normalizePath(link.href);
      return current === href || current.startsWith(`${href}/`);
    })
    .sort((a, b) => b.href.length - a.href.length)[0];
  return match ?? navLinks.home;
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
  const isMobile = useMediaQuery(mediaQueries.max.small);

  const pageLink = getPageLink(pathname);
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
          sections={dashboardSidebarSections}
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
