import type { ReactNode } from "react";

import LabelValue from "./LabelValue";

import styles from "./LabelValueGrid.module.scss";

export interface LabelValueGridRow {
  label: string;
  value: string;
  hint?: ReactNode;
}

export interface LabelValueGridProps {
  rows: LabelValueGridRow[];
}

export default function LabelValueGrid({ rows }: LabelValueGridProps) {
  return (
    <div className={styles.grid}>
      {rows.map((row) => (
        <div key={row.label} className={styles.cell}>
          <LabelValue label={row.label} value={row.value} hint={row.hint} />
        </div>
      ))}
    </div>
  );
}
