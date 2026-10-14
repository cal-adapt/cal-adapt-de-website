import type { ReactNode } from "react";

import styles from "./Specs.module.scss";

interface SpecsProps {
  /** Optional heading shown as a band across the top of the box. */
  title?: string;
  children: ReactNode;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** A boxed spec sheet for dataset metadata — pairs of `Spec` label/value rows. */
export default function Specs({ title, children }: SpecsProps) {
  const titleId = title ? slugify(title) : undefined;

  return (
    <div className={styles.specs}>
      {title ? (
        <h3 id={titleId} className={styles.title}>
          {title}
        </h3>
      ) : null}
      <dl className={styles.rows} aria-labelledby={titleId}>
        {children}
      </dl>
    </div>
  );
}
