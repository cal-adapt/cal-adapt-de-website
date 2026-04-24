"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

import styles from "./WorkspaceLayout.module.scss";

export interface WorkspaceLayoutProps {
  /** Persistent left rail (package list). Stays visible while step content changes. */
  packageRail: ReactNode;
  /** Main workspace: View / Customize / Download screens. */
  children: ReactNode;
  className?: string;
}

/**
 * Two-column shell: fixed-width package rail + flexible main region. Matches Pencil flow
 * (View → Customize → Download) where the package list remains on the left.
 */
export default function WorkspaceLayout({
  packageRail,
  children,
  className,
}: WorkspaceLayoutProps) {
  return (
    <div className={clsx(styles.workspace, className)}>
      <aside className={styles.rail}>{packageRail}</aside>
      <div className={styles.main}>{children}</div>
    </div>
  );
}
