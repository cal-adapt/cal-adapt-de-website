"use client";

import { type ReactNode, useState } from "react";

import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";

import clsx from "clsx";
import { ExternalLink } from "lucide-react";

import Button from "@/components/common/ui/Button";
import Icon from "@/components/common/ui/Icon";
import Link from "@/components/common/ui/Link";
import { type NavLink, navLinks, type NavSection, type NavSectionId } from "@/config/navigation";
import { findActiveNavLink } from "@/utils/navigation";

import styles from "./DashboardSidebar.module.scss";

const SECTION_ICONS: Record<NavSectionId, ReactNode> = {
  "climate-stories": <MenuBookOutlinedIcon />,
  tools: <BuildOutlinedIcon />,
  "beta-tools": <ScienceOutlinedIcon />,
  guidance: <LightbulbOutlinedIcon />,
};

export interface DashboardSidebarProps {
  open: boolean;
  onToggleOpen: () => void;
  sections: readonly NavSection[];
  pathname: string;
}

/**
 * Tracks which sections are expanded. Sections start collapsed except the one
 * holding the current page, and navigating into another section expands it.
 */
function useExpandedSections(activeSectionId: NavSectionId | undefined) {
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<NavSectionId>>(
    () => new Set(activeSectionId ? [activeSectionId] : [])
  );

  const setExpanded = (id: NavSectionId, expanded: boolean) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (expanded) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const [prevActiveSectionId, setPrevActiveSectionId] = useState(activeSectionId);
  if (activeSectionId !== prevActiveSectionId) {
    setPrevActiveSectionId(activeSectionId);
    if (activeSectionId) setExpanded(activeSectionId, true);
  }

  return { isExpanded: (id: NavSectionId) => expandedIds.has(id), setExpanded };
}

export default function DashboardSidebar({
  open,
  onToggleOpen,
  sections,
  pathname,
}: DashboardSidebarProps) {
  const activeLink = findActiveNavLink(
    sections.flatMap((section) => section.links),
    pathname
  );
  const activeSectionId = activeLink
    ? sections.find((section) => section.links.some((link) => link === activeLink))?.id
    : undefined;
  const { isExpanded, setExpanded } = useExpandedSections(activeSectionId);

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
          {sections.map((section) =>
            open ? (
              <SidebarSection
                key={section.id}
                section={section}
                expanded={isExpanded(section.id)}
                onToggle={() => setExpanded(section.id, !isExpanded(section.id))}
                activeLink={activeLink}
              />
            ) : (
              // Collapsed rail: one icon per section; clicking it opens the sidebar on that section.
              <Button
                key={section.id}
                className={clsx(
                  styles.iconButton,
                  section.id === activeSectionId && styles.selected
                )}
                variant="tertiary"
                onClick={() => {
                  setExpanded(section.id, true);
                  onToggleOpen();
                }}
                ariaLabel={section.label}
                title={section.label}
                svgOnly
              >
                {SECTION_ICONS[section.id]}
              </Button>
            )
          )}
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

interface SidebarSectionProps {
  section: NavSection;
  expanded: boolean;
  onToggle: () => void;
  activeLink: NavLink | undefined;
}

function SidebarSection({ section, expanded, onToggle, activeLink }: SidebarSectionProps) {
  const linksId = `sidebar-section-${section.id}`;

  return (
    <div className={styles.section}>
      <Button
        className={clsx(styles.navButton, expanded && styles.sectionHeaderExpanded)}
        variant="tertiary"
        onClick={onToggle}
        ariaExpanded={expanded}
        ariaControls={linksId}
      >
        {SECTION_ICONS[section.id]}
        <span className={styles.sectionLabel}>{section.label}</span>
        <ExpandMoreIcon
          className={clsx(styles.sectionChevron, !expanded && styles.collapsed)}
          aria-hidden
        />
      </Button>
      <div id={linksId} className={styles.sectionLinks} hidden={!expanded}>
        {section.links.map((link) => (
          <SidebarLink key={link.id} link={link} active={link === activeLink} />
        ))}
      </div>
    </div>
  );
}

function SidebarLink({ link, active }: { link: NavLink; active: boolean }) {
  return (
    <Button
      className={clsx(styles.navButton, styles.sectionLink, active && styles.selected)}
      variant="tertiary"
      href={link.href}
      openInNewTab={link.external}
      ariaCurrent={active ? "page" : undefined}
      ariaLabel={link.external ? `${link.label} (opens in a new tab)` : undefined}
      suffix={link.external ? <ExternalLink size={14} strokeWidth={2} aria-hidden /> : undefined}
    >
      {link.label}
    </Button>
  );
}
