"use client";

import clsx from "clsx";
import { Octagon } from "lucide-react";
import type { CSSProperties } from "react";

import styles from "./OctagonAlertFilled.module.scss";

export interface OctagonAlertFilledProps {
  /** Pixel size (Lucide `size`). */
  size?: number;
  className?: string;
  title?: string;
}

/**
 * Filled red octagon with a visible white exclamation (Lucide `Octagon` + overlay mark).
 */
export default function OctagonAlertFilled({
  size = 14,
  className,
  title,
}: OctagonAlertFilledProps) {
  const sizePx = `${size}px`;
  const rootStyle: CSSProperties = {
    width: size,
    height: size,
    ["--oa-size" as string]: sizePx,
  };

  return (
    <span className={clsx(styles.root, className)} style={rootStyle} title={title}>
      <Octagon
        className={styles.oct}
        size={size}
        strokeWidth={2}
        fill="currentColor"
        stroke="currentColor"
        aria-hidden
        focusable="false"
      />
      <span className={styles.mark} aria-hidden>
        !
      </span>
    </span>
  );
}
