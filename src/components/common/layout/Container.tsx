"use client";

import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

import styles from "./Container.module.scss";

export type ContainerWidth = "global" | "content" | "fullbleed";

export type ContainerSpacing = "page" | "section" | "none";

/** `center` — max-width block is centered (`margin-inline: auto`). `start` — block aligns to the start (left in LTR). */
export type ContainerAlign = "center" | "start";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  width?: ContainerWidth;
  spacing?: ContainerSpacing;
  align?: ContainerAlign;
  children?: ReactNode;
}

export default function Container({
  width = "global",
  spacing = "none",
  align = "center",
  className,
  children,
  ...rest
}: ContainerProps) {
  return (
    <div
      className={clsx(
        styles.container,
        styles[spacing],
        align === "start" && styles.alignStart,
        className
      )}
      {...rest}
    >
      <div className={clsx(styles.inner, styles[width])}>{children}</div>
    </div>
  );
}
