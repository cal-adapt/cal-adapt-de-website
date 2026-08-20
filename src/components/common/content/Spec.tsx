import type { ReactNode } from "react";

import styles from "./Specs.module.scss";

interface SpecProps {
  label: string;
  children: ReactNode;
}

export default function Spec({ label, children }: SpecProps) {
  return (
    <div className={styles.row}>
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.value}>{children}</dd>
    </div>
  );
}
