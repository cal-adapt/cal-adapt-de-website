import { useId } from "react";

import type { ReactNode } from "react";

import styles from "./InterpretSection.module.scss";

interface InterpretSectionProps {
  title: string;
  children: ReactNode;
}

/** A "how to interpret this X" section — a bordered-off block with a title,
 * used under a chart or tool to explain what it shows. */
export default function InterpretSection({ title, children }: InterpretSectionProps) {
  const headingId = useId();

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.title}>
        {title}
      </h2>
      {children}
    </section>
  );
}
