"use client";

import { useId } from "react";

import clsx from "clsx";
import type { ReactNode } from "react";

import Divider from "@/components/common/ui/Divider";

import styles from "./StepLayout.module.scss";

export interface StepLayoutProps {
  title?: ReactNode;
  actions?: ReactNode;
  belowHeading?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/**
 * Layout shell for a single step of the data-download flow (Customize / Download), shown inside
 * `WorkspaceLayout`'s main slot. Children are typically `FormField` + `Input` / `Select` /
 * `Textarea` / `Checkbox` groups, or review cards.
 */
export default function StepLayout({
  title,
  actions,
  belowHeading,
  children,
  className,
}: StepLayoutProps) {
  const headingId = useId();
  const showHeadingRow = title != null || actions != null;
  const showStepIntro = showHeadingRow || belowHeading != null;

  return (
    <section
      className={clsx(styles.screen, className)}
      aria-labelledby={title != null ? headingId : undefined}
    >
      {showStepIntro ? (
        <div className={styles.stepIntro}>
          {showHeadingRow ? (
            <div className={styles.headingRow}>
              {title != null ? (
                <h2 className={styles.heading} id={headingId}>
                  {title}
                </h2>
              ) : (
                <div className={styles.headingPlaceholder} aria-hidden />
              )}
              {actions != null ? <div className={styles.headingActions}>{actions}</div> : null}
            </div>
          ) : null}
          {belowHeading != null ? <div className={styles.belowHeading}>{belowHeading}</div> : null}
        </div>
      ) : null}
      {belowHeading != null ? <Divider /> : null}
      <div className={styles.formStack}>{children}</div>
    </section>
  );
}
