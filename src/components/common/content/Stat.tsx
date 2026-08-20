import type { ReactNode } from "react";

import Icon, { type IconVariant } from "@/components/common/ui/Icon";

import styles from "./Stat.module.scss";

interface StatProps {
  icon: IconVariant;
  label: string;
  children: ReactNode;
}

/** A single impact callout. The label carries the emphasis — what happened —
 * with the icon as the color accent; supporting figures stay inline in the
 * body copy rather than being pulled out as a separate headline number. */
export default function Stat({ icon, label, children }: StatProps) {
  return (
    <figure className={styles.stat}>
      <Icon variant={icon} className={styles.icon} aria-hidden />
      <figcaption>
        <p className={styles.label}>{label}</p>
        <div className={styles.body}>{children}</div>
      </figcaption>
    </figure>
  );
}
