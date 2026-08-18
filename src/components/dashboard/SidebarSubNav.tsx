"use client";

import { useSearchParams } from "next/navigation";

import clsx from "clsx";

import Link from "@/components/common/ui/Link";
import type { NavLink } from "@/config/navigation";
import { normalizePath } from "@/utils/url";

import styles from "./DashboardSidebar.module.scss";

interface SidebarSubNavProps {
  links: readonly NavLink[];
  activePath: string | null;
}

/** `query` (e.g. "?variable=warm-nights") is appended to each link */
export function SubNavLinks({ links, activePath, query }: SidebarSubNavProps & { query: string }) {
  return (
    <div className={styles.subNav}>
      {links.map((child) => {
        const childSelected = activePath === normalizePath(child.href);

        return (
          <Link
            key={child.id}
            href={`${child.href}${query}`}
            className={clsx(styles.subNavLink, childSelected && styles.subNavSelected)}
            aria-current={childSelected ? "page" : undefined}
          >
            {child.label}
          </Link>
        );
      })}
    </div>
  );
}

/**
 * Sub-navigation for the active tool. Child links carry the current query string
 * so URL-encoded tool selections persist through sub-page navigation.
 */
export default function SidebarSubNav({ links, activePath }: SidebarSubNavProps) {
  const search = useSearchParams().toString();

  return <SubNavLinks links={links} activePath={activePath} query={search ? `?${search}` : ""} />;
}
