import { type ReactNode, useId } from "react";

import clsx from "clsx";

import styles from "./Panel.module.scss";

interface PanelProps {
  eyebrow: string;
  /** `nav` for wayfinding such as a table of contents; `aside` for page-level summaries. */
  as?: "aside" | "nav";
  className?: string;
  children: ReactNode;
}

/** A neutral, labelled box for page structure and wayfinding. Deliberately quieter
 * than `Callout`, which is reserved for authored asides in the reading flow. */
export default function Panel({ eyebrow, as: Element = "aside", className, children }: PanelProps) {
  const eyebrowId = useId();

  return (
    <Element className={clsx(styles.panel, className)} aria-labelledby={eyebrowId}>
      <p id={eyebrowId} className={styles.eyebrow}>
        {eyebrow}
      </p>
      {children}
    </Element>
  );
}
