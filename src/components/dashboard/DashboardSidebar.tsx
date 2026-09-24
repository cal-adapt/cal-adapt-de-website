"use client";

import { type ReactNode, Suspense, useState } from "react";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import clsx from "clsx";
import { ExternalLink } from "lucide-react";

import Button from "@/components/common/ui/Button";
import Icon from "@/components/common/ui/Icon";
import Link from "@/components/common/ui/Link";
import { hasNavChildren, type NavLink, navLinks } from "@/config/navigation";
import { normalizePath } from "@/utils/url";

import SidebarSubNav, { SubNavLinks } from "./SidebarSubNav";

import styles from "./DashboardSidebar.module.scss";

export interface DashboardSidebarSection {
  id: string;
  label: string;
  icon: ReactNode;
  links: NavLink[];
}

export interface DashboardSidebarProps {
  open: boolean;
  onToggleOpen: () => void;
  sections: DashboardSidebarSection[];
  activeHref?: string;
}

export default function DashboardSidebar({
  open,
  onToggleOpen,
  sections,
  activeHref,
}: DashboardSidebarProps) {
  const activePath = activeHref ? normalizePath(activeHref) : null;
  const isLinkActive = (link: NavLink) => {
    const linkPath = normalizePath(link.href);
    return !!activePath && (activePath === linkPath || activePath.startsWith(`${linkPath}/`));
  };
  const activeSectionId = sections.find((section) => section.links.some(isLinkActive))?.id ?? null;

  // Sections start collapsed, except the one containing the current page.
  const [expandedSectionIds, setExpandedSectionIds] = useState<ReadonlySet<string>>(
    () => new Set(activeSectionId ? [activeSectionId] : [])
  );

  const setSectionExpanded = (id: string, expanded: boolean) => {
    setExpandedSectionIds((prev) => {
      const next = new Set(prev);
      if (expanded) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  // Navigating into a different section opens it, so the current page is always visible.
  const [prevActiveSectionId, setPrevActiveSectionId] = useState(activeSectionId);
  if (activeSectionId !== prevActiveSectionId) {
    setPrevActiveSectionId(activeSectionId);
    if (activeSectionId) setSectionExpanded(activeSectionId, true);
  }

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
          {sections.map((section) => {
            const expanded = expandedSectionIds.has(section.id);

            // Collapsed rail: one icon per section; clicking it opens the sidebar on that section.
            if (!open) {
              return (
                <Button
                  key={section.id}
                  className={clsx(
                    styles.iconButton,
                    section.id === activeSectionId && styles.selected
                  )}
                  variant="tertiary"
                  onClick={() => {
                    setSectionExpanded(section.id, true);
                    onToggleOpen();
                  }}
                  ariaLabel={section.label}
                  svgOnly
                >
                  {section.icon}
                </Button>
              );
            }

            return (
              <div key={section.id} className={styles.section}>
                <Button
                  className={clsx(styles.navButton, !expanded && styles.sectionHeaderCollapsed)}
                  variant="tertiary"
                  onClick={() => setSectionExpanded(section.id, !expanded)}
                  ariaLabel={`${expanded ? "Collapse" : "Expand"} ${section.label}`}
                >
                  {section.icon}
                  <span className={styles.sectionLabel}>{section.label}</span>
                  <ExpandMoreIcon
                    className={clsx(styles.sectionChevron, !expanded && styles.collapsed)}
                  />
                </Button>
                <div className={styles.sectionLinks} hidden={!expanded}>
                  {section.links.map((link) => {
                    const linkActive = isLinkActive(link);
                    const showSubNav = hasNavChildren(link) && linkActive;

                    // A tool with children shows the active child highlighted in its sub-nav,
                    // so the parent button only gets a subtle (bold) active treatment.
                    const parentSelected = linkActive && !hasNavChildren(link);
                    const parentActive = linkActive && hasNavChildren(link);

                    return (
                      <div key={link.id} className={styles.navGroup}>
                        <Button
                          className={clsx(
                            styles.navButton,
                            parentSelected && styles.selected,
                            parentActive && styles.active
                          )}
                          variant="tertiary"
                          href={link.href}
                          openInNewTab={link.external}
                          ariaLabel={
                            link.external ? `${link.label} (opens in a new tab)` : link.label
                          }
                          suffix={
                            link.external ? (
                              <ExternalLink size={14} strokeWidth={2} aria-hidden />
                            ) : undefined
                          }
                        >
                          {link.label}
                        </Button>

                        {showSubNav && hasNavChildren(link) && (
                          <Suspense
                            fallback={
                              <SubNavLinks links={link.children} activePath={activePath} query="" />
                            }
                          >
                            <SidebarSubNav links={link.children} activePath={activePath} />
                          </Suspense>
                        )}
                      </div>
                    );
                  })}
                </div>
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
