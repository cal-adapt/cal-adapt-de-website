import type { CSSProperties, ReactNode } from "react";

import { mixSignatureColor } from "@/lib/color/signature-scale";

import styles from "./Step.module.scss";

interface StepProps {
  n: number;
  /** Total steps in the sequence — used to place this step along the page's
   * warming-stripes gradient, matching the TOC dots. */
  totalSteps: number;
  title: string;
  children: ReactNode;
}

/** A numbered stage in the methodology pipeline. Renders its own heading and id
 * directly, so it's used in place of a markdown `###` heading for methods steps. */
export default function Step({ n, totalSteps, title, children }: StepProps) {
  const id = `step-${n}`;
  const tagColor = mixSignatureColor(totalSteps > 1 ? (n - 1) / (totalSteps - 1) : 0);

  return (
    <section className={styles.step} aria-labelledby={id}>
      <h3 id={id} className={styles.title}>
        <span
          className={styles.tag}
          style={{ "--tag-color": tagColor } as CSSProperties}
          aria-hidden="true"
        >
          {n}:
        </span>{" "}
        {title}
      </h3>
      <div className={styles.body}>{children}</div>
    </section>
  );
}
