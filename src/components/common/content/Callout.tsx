import type { ReactNode } from "react";

import Icon from "@/components/common/ui/Icon";

import styles from "./Callout.module.scss";

interface CalloutProps {
  title: string;
  children: ReactNode;
}

/** A boxed aside — a plain-language example or a scoping note — matching the
 * "note" callout style used on the Cal-Adapt guidance site (icon + title band). */
export default function Callout({ title, children }: CalloutProps) {
  return (
    <div className={styles.callout}>
      <div className={styles.header}>
        <Icon variant="alertInfo" className={styles.icon} aria-hidden />
        <p className={styles.title}>{title}</p>
      </div>
      <div className={styles.body}>{children}</div>
    </div>
  );
}
