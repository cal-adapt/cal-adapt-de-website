import { Suspense } from "react";

import MuiBreadcrumbs from "@mui/material/Breadcrumbs";
import MuiLink from "@mui/material/Link";
import Typography from "@mui/material/Typography";

import clsx from "clsx";

import type { NavLink } from "@/config/navigation";

import BreadcrumbToolLink from "./BreadcrumbToolLink";

import styles from "./DashboardAppBar.module.scss";

export interface DashboardAppBarProps {
  page: NavLink;
  subPage?: NavLink;
  className?: string;
}

export default function DashboardAppBar({ page, subPage, className }: DashboardAppBarProps) {
  return (
    <header className={clsx(styles.appbar, className)}>
      <div className={styles.left}>
        <MuiBreadcrumbs aria-label="breadcrumb">
          <MuiLink underline="hover" color="inherit" href="/">
            Cal-Adapt
          </MuiLink>
          {subPage ? (
            <Suspense
              fallback={
                <MuiLink underline="hover" color="inherit" href={page.href}>
                  {page.label}
                </MuiLink>
              }
            >
              <BreadcrumbToolLink href={page.href} label={page.label} />
            </Suspense>
          ) : (
            <Typography color="text.primary">{page.label}</Typography>
          )}
          {subPage && <Typography color="text.primary">{subPage.label}</Typography>}
        </MuiBreadcrumbs>
      </div>
    </header>
  );
}
