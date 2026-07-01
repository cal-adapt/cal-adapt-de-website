import clsx from "clsx";
import type { ReactNode } from "react";

import Button from "@/components/common/ui/Button";
import Icon from "@/components/common/ui/Icon";
import Link from "@/components/common/ui/Link";
import { hasNavChildren, type NavLink, navLinks } from "@/config/navigation";
import { normalizePath } from "@/utils/url";

import styles from "./DashboardSidebar2.module.scss";

export interface DashboardSidebar2NavItem {
  link: NavLink;
  icon: ReactNode;
}

export interface DashboardSidebar2Props {
  open: boolean;
  onToggleOpen: () => void;
  items: DashboardSidebar2NavItem[];
  activeHref?: string;
}

export default function DashboardSidebar2({
  open,
  onToggleOpen,
  items,
  activeHref,
}: DashboardSidebar2Props) {
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
                  <div className={styles.subNav}>
                    {item.link.children.map((child) => {
                      const childSelected = activePath === normalizePath(child.href);

                      return (
                        <Link
                          key={child.id}
                          href={child.href}
                          className={clsx(
                            styles.subNavLink,
                            childSelected && styles.subNavSelected
                          )}
                          aria-current={childSelected ? "page" : undefined}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
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
