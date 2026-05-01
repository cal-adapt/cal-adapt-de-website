"use client";

import clsx from "clsx";

import styles from "./Divider.module.scss";

export interface DividerProps {
  className?: string;
  /** Decorative rule (default). Set `false` for a meaningful section break. */
  decorative?: boolean;
}

/** Horizontal rule using design-system border color. */
export default function Divider({ className, decorative = true }: DividerProps) {
  return (
    <hr
      className={clsx(styles.root, className)}
      role={decorative ? "presentation" : "separator"}
      aria-hidden={decorative ? true : undefined}
      {...(!decorative ? { "aria-orientation": "horizontal" as const } : {})}
    />
  );
}
