import MuiBreadcrumbs from "@mui/material/Breadcrumbs";
import MuiLink from "@mui/material/Link";
import Typography from "@mui/material/Typography";

import clsx from "clsx";

import type { NavLink } from "@/config/navigation";

import styles from "./DashboardAppBar2.module.scss";

export interface DashboardAppBar2Props {
  page: NavLink;
  /** Active nested page (e.g. "Methods"), shown as the final breadcrumb when present. */
  subPage?: NavLink;
  className?: string;
}

export default function DashboardAppBar2({ page, subPage, className }: DashboardAppBar2Props) {
  return (
    <header className={clsx(styles.appbar, className)}>
      <div className={styles.left}>
        <MuiBreadcrumbs aria-label="breadcrumb">
          <MuiLink underline="hover" color="inherit" href="/">
            Cal-Adapt
          </MuiLink>
          {subPage ? (
            <MuiLink underline="hover" color="inherit" href={page.href}>
              {page.label}
            </MuiLink>
          ) : (
            <Typography color="text.primary">{page.label}</Typography>
          )}
          {subPage && <Typography color="text.primary">{subPage.label}</Typography>}
        </MuiBreadcrumbs>
      </div>
    </header>
  );
}
