"use client";

import React from "react";
import { usePathname } from "next/navigation";

import useMediaQuery from "@mui/material/useMediaQuery";

import ErrorView from "@/components/common/layout/ErrorView";
import Button from "@/components/common/ui/Button";
import DashboardAppBar from "@/components/dashboard/DashboardAppBar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { mediaQueries } from "@/config/breakpoints";
import { dashboardPages, enabledNavSections, navLinks } from "@/config/navigation";
import { useLeftDrawer } from "@/context/LeftDrawerContext";
import { SidePanelProvider } from "@/context/SidePanelContext";
import { findActiveChildLink, findActiveNavLink } from "@/utils/navigation";

import styles from "./layout.module.scss";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { open, toggleLeftDrawer } = useLeftDrawer();
  const pathname = usePathname();
  const isMobile = useMediaQuery(mediaQueries.max.small);

  const pageLink = findActiveNavLink(dashboardPages, pathname) ?? navLinks.home;
  const subPageLink = findActiveChildLink(pageLink, pathname);

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
          pathname={pathname}
          sections={enabledNavSections}
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
