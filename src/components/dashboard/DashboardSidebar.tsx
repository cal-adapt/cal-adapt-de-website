import { type ReactNode, Suspense } from "react";

import clsx from "clsx";

import Button from "@/components/common/ui/Button";
import Icon from "@/components/common/ui/Icon";
import Link from "@/components/common/ui/Link";
import { hasNavChildren, type NavLink, navLinks } from "@/config/navigation";
import { normalizePath } from "@/utils/url";

import SidebarSubNav, { SubNavLinks } from "./SidebarSubNav";

import styles from "./DashboardSidebar.module.scss";

export interface DashboardSidebarNavItem {
  link: NavLink;
  icon: ReactNode;
}

export interface DashboardSidebarProps {
  open: boolean;
  onToggleOpen: () => void;
  items: DashboardSidebarNavItem[];
  activeHref?: string;
}

export default function DashboardSidebar({
  open,
  onToggleOpen,
  items,
  activeHref,
}: DashboardSidebarProps) {
  return (
    <nav className={clsx(styles.sidebar, open ? styles.open : styles.closed)} aria-label="Sidebar">
      <div className={styles.top}>
        <div className={styles.header}>
          {open && (
            <Link className={styles.logoLink} href="/">
              <Icon variant="logoCalAdapt" />
            </Link>
          )}
          <Button
            variant="tertiary"
            className={styles.sidebarButton}
            onClick={onToggleOpen}
            ariaLabel={open ? "Collapse sidebar" : "Expand sidebar"}
            svgOnly
          >
            {open ? (
              <Icon variant="chevronsLeft" className={styles.icon} />
            ) : (
              <Icon variant="chevronsRight" className={styles.icon} />
            )}
          </Button>
        </div>

        <nav className={styles.nav} aria-label="Dashboard navigation">
          {items.map((item) => {
            const activePath = activeHref ? normalizePath(activeHref) : null;
            const toolPath = normalizePath(item.link.href);
            const toolActive =
              !!activePath && (activePath === toolPath || activePath.startsWith(`${toolPath}/`));
            const showSubNav = open && hasNavChildren(item.link) && toolActive;

            if (!open) {
              return (
                <Button
                  key={item.link.id}
                  className={clsx(styles.iconButton, toolActive && styles.selected)}
                  variant="tertiary"
                  href={item.link.href}
                  ariaLabel={item.link.label}
                  svgOnly
                >
                  {item.icon}
                </Button>
              );
            }

            // A tool with children shows the active child highlighted in its sub-nav,
            // so the parent button only gets a subtle (bold) active treatment.
            const parentSelected = toolActive && !hasNavChildren(item.link);
            const parentActive = toolActive && hasNavChildren(item.link);

            return (
              <div key={item.link.id} className={styles.navGroup}>
                <Button
                  className={clsx(
                    styles.navButton,
                    parentSelected && styles.selected,
                    parentActive && styles.active
                  )}
                  variant="tertiary"
                  href={item.link.href}
                  ariaLabel={item.link.label}
                >
                  {item.icon}
                  {item.link.label}
                </Button>

                {showSubNav && hasNavChildren(item.link) && (
                  <Suspense
                    fallback={
                      <SubNavLinks links={item.link.children} activePath={activePath} query="" />
                    }
                  >
                    <SidebarSubNav links={item.link.children} activePath={activePath} />
                  </Suspense>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div className={styles.bottom}>
        {open ? (
          <Button
            className={styles.footerButton}
            variant="secondary"
            prefix={<Icon variant="feedback" />}
            href={navLinks.feedback.href}
            ariaLabel={navLinks.feedback.label}
          >
            Feedback
          </Button>
        ) : (
          <Button
            variant="secondary"
            href={navLinks.feedback.href}
            ariaLabel={navLinks.feedback.label}
            svgOnly
          >
            <Icon variant="feedback" className={styles.icon} />
          </Button>
        )}
      </div>
    </nav>
  );
}
