"use client";

import { type PointerEvent, type ReactNode, useEffect, useRef, useState } from "react";

import clsx from "clsx";
import { ChevronDown, ExternalLink, Menu as MenuIcon, X } from "lucide-react";

import Button from "@/components/common/ui/Button";
import Icon from "@/components/common/ui/Icon";
import Link from "@/components/common/ui/Link";
import ToolIcon, { isToolId } from "@/components/common/ui/ToolIcon";
import {
  dashboardPages,
  type NavLink,
  navLinks,
  type NavMenu,
  navMenus,
  type NavSection,
  type ToolId,
} from "@/config/navigation";
import useDismiss from "@/hooks/use-dismiss";
import { analytics } from "@/lib/analytics";
import { findActiveNavLink } from "@/utils/navigation";
import { isExternalUrl } from "@/utils/url";

import styles from "./Header.module.scss";

const MOBILE_MENU_ID = "mobile-menu";

function trackLinkClick(link: NavLink) {
  if (isExternalUrl(link.href)) {
    analytics.trackExternalLink(link.href, link.label);
  }
}

function menuSections(menu: NavMenu): readonly NavSection[] {
  return [menu, ...menu.subsections].filter((section) => section.links.length > 0);
}

/** A link's name, followed by an external-link marker when it opens a new tab. */
function LinkLabel({ link }: { link: NavLink }) {
  return (
    <>
      {link.label}
      {link.external ? (
        <>
          <ExternalLink className={styles.externalIcon} size={14} aria-hidden />
          <span className="sr-only"> (opens in a new tab)</span>
        </>
      ) : null}
    </>
  );
}

function NavAnchor({
  link,
  className,
  onSelect,
  children,
}: {
  link: NavLink;
  className?: string;
  onSelect?: () => void;
  children: ReactNode;
}) {
  return (
    <Link
      href={link.href}
      className={className}
      onClick={() => {
        trackLinkClick(link);
        onSelect?.();
      }}
    >
      {children}
    </Link>
  );
}

/* ---------- Menu content, shared by the desktop panels and the mobile sheet ---------- */

function ToolLink({
  link,
  toolId,
  onSelect,
}: {
  link: NavLink;
  toolId: ToolId;
  onSelect: () => void;
}) {
  return (
    <NavAnchor link={link} className={styles.toolLink} onSelect={onSelect}>
      <span className={styles.iconTile}>
        <ToolIcon id={toolId} size={16} />
      </span>
      <LinkLabel link={link} />
    </NavAnchor>
  );
}

/**
 * A menu's own links, then each subsection under its heading. Phones can't use
 * most of the dashboard, so those links are hidden there.
 */
function MenuPanelContent({ menu, onSelect }: { menu: NavMenu; onSelect: () => void }) {
  return menuSections(menu).map((section) => {
    const isSubsection = section !== menu;
    return (
      <div
        key={section.id}
        className={clsx(
          isSubsection && styles.panelSubsection,
          !hasPhoneLinks([section]) && styles.desktopOnly
        )}
      >
        {isSubsection ? (
          <p className={styles.panelHeading}>
            {section.label}
            {section.beta ? <span className={styles.betaNote}>In user testing</span> : null}
          </p>
        ) : null}
        <ul className={styles.panelList}>
          {section.links.map((link) => (
            <li key={link.id} className={clsx(!worksOnPhones(link) && styles.desktopOnly)}>
              {isToolId(link.id) ? (
                <ToolLink link={link} toolId={link.id} onSelect={onSelect} />
              ) : (
                <NavAnchor link={link} className={styles.compactLink} onSelect={onSelect}>
                  <LinkLabel link={link} />
                </NavAnchor>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  });
}

/** Matches the dashboard layout, which shows phones a desktop-only message unless the page opts in. */
function worksOnPhones(link: NavLink): boolean {
  if (link.external) return true;
  const dashboardPage = findActiveNavLink(dashboardPages, link.href);
  return !dashboardPage || dashboardPage.supportsMobile === true;
}

function hasPhoneLinks(sections: readonly NavSection[]): boolean {
  return sections.some((section) => section.links.some(worksOnPhones));
}

/* ---------- Desktop ---------- */

/** Grace period before a hovered menu closes, so a pointer can cross to the panel or wobble off it. */
const HOVER_CLOSE_DELAY_MS = 150;

/**
 * Opens on mouse hover. Click and keyboard still toggle it, for touch screens
 * and keyboard users; clicking a hover-opened menu keeps it open.
 */
function DesktopMenu({
  menu,
  open,
  onOpen,
  onClose,
}: {
  menu: NavMenu;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const openedByHoverRef = useRef(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useDismiss(containerRef, open, onClose, buttonRef);

  const cancelClose = () => clearTimeout(closeTimerRef.current);
  useEffect(() => () => clearTimeout(closeTimerRef.current), []);

  const handlePointerEnter = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    cancelClose();
    if (!open) {
      openedByHoverRef.current = true;
      onOpen();
    }
  };

  const handlePointerLeave = (event: PointerEvent) => {
    if (event.pointerType !== "mouse" || !openedByHoverRef.current) return;
    closeTimerRef.current = setTimeout(onClose, HOVER_CLOSE_DELAY_MS);
  };

  const handleClick = () => {
    if (open && !openedByHoverRef.current) onClose();
    else onOpen();
    openedByHoverRef.current = false;
  };

  const panelId = `${menu.id}-panel`;

  return (
    <div
      ref={containerRef}
      className={styles.menu}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <button
        ref={buttonRef}
        type="button"
        className={clsx(styles.navItem, open && styles.navItemOpen)}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={handleClick}
      >
        {menu.label}
        <ChevronDown
          className={clsx(styles.chevron, open && styles.chevronOpen)}
          size={16}
          aria-hidden
        />
      </button>
      <div id={panelId} className={styles.panel} hidden={!open}>
        <MenuPanelContent menu={menu} onSelect={onClose} />
      </div>
    </div>
  );
}

function DesktopNav() {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  return (
    <div className={styles.links}>
      {navMenus.map((menu) =>
        menu.landing ? (
          <NavAnchor key={menu.id} link={menu.landing} className={styles.navItem}>
            {menu.label}
          </NavAnchor>
        ) : (
          <DesktopMenu
            key={menu.id}
            menu={menu}
            open={openMenuId === menu.id}
            onOpen={() => setOpenMenuId(menu.id)}
            onClose={() => setOpenMenuId((id) => (id === menu.id ? null : id))}
          />
        )
      )}
    </div>
  );
}

/* ---------- Mobile ---------- */

/** A group with nothing usable on phones is hidden there, unless it has a note to show instead. */
function MobileGroup({ menu, onSelect }: { menu: NavMenu; onSelect: () => void }) {
  return (
    <div
      className={clsx(
        styles.sheetGroup,
        !menu.phoneNote && !hasPhoneLinks(menuSections(menu)) && styles.desktopOnly
      )}
    >
      <p className={styles.sheetHeading}>{menu.label}</p>
      <MenuPanelContent menu={menu} onSelect={onSelect} />
      {menu.phoneNote ? (
        <p className={clsx(styles.sheetNote, styles.phoneOnly)}>{menu.phoneNote}</p>
      ) : null}
    </div>
  );
}

function MobileNav() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const close = () => setOpen(false);
  useDismiss(containerRef, open, close, buttonRef);

  return (
    <div ref={containerRef} className={styles.mobile}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.menuButton}
        aria-label="Menu"
        aria-expanded={open}
        aria-controls={MOBILE_MENU_ID}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X size={24} aria-hidden /> : <MenuIcon size={24} aria-hidden />}
      </button>
      <div id={MOBILE_MENU_ID} className={styles.sheet} hidden={!open}>
        {navMenus.map((menu) => (
          <MobileGroup key={menu.id} menu={menu} onSelect={close} />
        ))}
        <div className={styles.sheetFooter}>
          <NavAnchor
            link={navLinks.fourthAssessment}
            className={styles.compactLink}
            onSelect={close}
          >
            <LinkLabel link={navLinks.fourthAssessment} />
          </NavAnchor>
        </div>
      </div>
    </div>
  );
}

/* ---------- Header ---------- */

export default function Header() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Site">
        <Link
          className={styles.logoLink}
          href={navLinks.home.href}
          aria-label={navLinks.home.label}
        >
          <Icon className={styles.logo} variant="logoCalAdapt" />
        </Link>
        <DesktopNav />
        <div className={styles.actions}>
          <NavAnchor
            link={navLinks.fourthAssessment}
            className={clsx(styles.navItem, styles.quietLink)}
          >
            <LinkLabel link={navLinks.fourthAssessment} />
          </NavAnchor>
          <Button
            className={styles.cta}
            variant="accent"
            size="small"
            href={navLinks.climateMetricsMap.href}
          >
            Explore the map
          </Button>
          <MobileNav />
        </div>
      </nav>
    </header>
  );
}
