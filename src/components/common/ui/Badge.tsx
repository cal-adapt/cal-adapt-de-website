"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

import styles from "./Badge.module.scss";

export interface BadgeProps {
  children: ReactNode;
  className?: string;
  /** For live regions when content updates (e.g. selection counts). */
  "aria-live"?: "off" | "polite" | "assertive";
}

/** Compact pill for labels, filters, and metadata (e.g. “3 selected”). */
export default function Badge({ children, className, "aria-live": ariaLive }: BadgeProps) {
  return (
    <span className={clsx(styles.root, className)} aria-live={ariaLive}>
      {children}
    </span>
  );
}
