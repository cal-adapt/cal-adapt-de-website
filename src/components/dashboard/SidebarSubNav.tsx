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
  persistQuery?: boolean;
}

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

/** Appends the current query string to child hrefs unless `persistQuery` is false. */
export default function SidebarSubNav({
  links,
  activePath,
  persistQuery = true,
}: SidebarSubNavProps) {
  const search = useSearchParams().toString();
  const query = persistQuery && search ? `?${search}` : "";

  return <SubNavLinks links={links} activePath={activePath} query={query} />;
}
