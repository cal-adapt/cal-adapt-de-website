"use client";

import React from "react";
import { usePathname } from "next/navigation";

import useMediaQuery from "@mui/material/useMediaQuery";

import ErrorView from "@/components/common/layout/ErrorView";
import Button from "@/components/common/ui/Button";
import DashboardAppBar from "@/components/dashboard/DashboardAppBar";
import DashboardSidebar, {
  type DashboardSidebarNavItem,
} from "@/components/dashboard/DashboardSidebar";
import { getDashboardSidebarItems } from "@/components/dashboard/tools";
import { mediaQueries } from "@/config/breakpoints";
import { hasNavChildren, type NavLink, navLinks } from "@/config/navigation";
import { useLeftDrawer } from "@/context/LeftDrawerContext";
import { SidePanelProvider } from "@/context/SidePanelContext";
import { extractSegment, normalizePath } from "@/utils/url";

import styles from "./layout.module.scss";

interface LayoutProps {
  children: React.ReactNode;
}

const SIDEBAR_ITEMS: DashboardSidebarNavItem[] = getDashboardSidebarItems();

/** Resolve the active sidebar item from the current `/dashboard/:segment` path. */
function getPageLink(selectedPage: string | null): NavLink {
  const match = SIDEBAR_ITEMS.find((item) => item.link.id === selectedPage);
  return match?.link ?? navLinks.home;
}

/** Resolve the active nested page (e.g. "Methods") under the current item, if any. */
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
      <div className={styles.frame}>
        <DashboardSidebar
          open={open}
          onToggleOpen={toggleLeftDrawer}
          activeHref={pathname}
          items={SIDEBAR_ITEMS}
        />

        <div className={styles.content}>
          <DashboardAppBar page={pageLink} subPage={subPageLink} />

          <main id="main-content" className={styles.main}>
            {children}
          </main>
        </div>
      </div>
    </SidePanelProvider>
  );
}
