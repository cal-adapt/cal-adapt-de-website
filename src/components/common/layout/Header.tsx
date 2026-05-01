"use client";

import React, { useState } from "react";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuIcon from "@mui/icons-material/Menu";
import SpaceDashboardIcon from "@mui/icons-material/SpaceDashboard";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import Button from "@/components/common/ui/Button";
import Icon from "@/components/common/ui/Icon";
import Link from "@/components/common/ui/Link";
import { isNavGroup, navGroups, type NavItem, type NavLink, navLinks } from "@/config/navigation";
import { analytics } from "@/lib/analytics";
import { isExternalUrl } from "@/utils/url";

import styles from "./Header.module.scss";

const navIcons: Record<string, React.ReactElement> = {
  "fourth-assessment": <ArrowBackIcon />,
  tools: <SpaceDashboardIcon />,
};

const navItems = {
  left: [navLinks.fourthAssessment],
  right: [navLinks.guidance, navLinks.data, navGroups.tools],
};

const mobileNavItems: NavLink[] = [navLinks.fourthAssessment, navLinks.guidance, navLinks.data];

function trackLinkClick(label: string, href: string) {
  if (isExternalUrl(href)) {
    analytics.trackExternalLink(href, label);
  }
}

function HeaderNavLink({ item }: { item: NavLink }) {
  const icon = navIcons[item.id];

  return (
    <Link
      className={styles.navItem}
      href={item.href}
      onClick={() => trackLinkClick(item.label, item.href)}
    >
      {icon}
      {item.label}
    </Link>
  );
}

function HeaderNavGroup({ item }: { item: NavItem & { links: NavLink[] } }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const icon = navIcons[item.id];

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button className={styles.navItem} onClick={handleOpen}>
        {icon}
        {item.label}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        disableScrollLock
      >
        {item.links.map((link) => (
          <MenuItem
            key={link.id}
            className={styles.menuItem}
            component="a"
            href={link.href}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noopener noreferrer" : undefined}
            aria-label={`Go to ${link.label}`}
            onClick={handleClose}
          >
            {link.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

function HeaderNavItem({ item }: { item: NavItem }) {
  if (isNavGroup(item)) {
    return <HeaderNavGroup item={item} />;
  }
  return <HeaderNavLink item={item} />;
}

function MobileNav() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className={styles.mobile}>
      <IconButton
        size="large"
        aria-label="mobile menu"
        aria-controls="mobile-menu"
        aria-haspopup="true"
        onClick={handleOpen}
        sx={{ color: "var(--color-white)" }}
      >
        <MenuIcon />
      </IconButton>
      <Menu
        disableScrollLock
        id="mobile-menu"
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        keepMounted
      >
        {mobileNavItems.map((item) => (
          <MenuItem
            key={item.id}
            className={styles.menuItem}
            onClick={() => {
              trackLinkClick(item.label, item.href);
              handleClose();
            }}
            component="a"
            href={item.href}
            target={item.external ? "_blank" : undefined}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}

export default function Header() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <MobileNav />
        <div className={styles.desktop}>
          <div className={styles.left}>
            {navItems.left.map((item) => (
              <HeaderNavItem key={item.id} item={item} />
            ))}
          </div>
          <div className={styles.right}>
            {navItems.right.map((item) => (
              <HeaderNavItem key={item.id} item={item} />
            ))}
          </div>
        </div>
        <div className={styles.logoWrapper}>
          <Link
            className={styles.navItem}
            href={navLinks.home.href}
            aria-label={navLinks.home.label}
          >
            <Icon className={styles.logo} variant="logoCalAdapt" />
          </Link>
        </div>
      </nav>
    </header>
  );
}
