"use client";

import LoadingSpinner from "@/components/common/ui/LoadingSpinner";

import styles from "./TableView.module.scss";

export interface TableViewProps {
  isLoading?: boolean;
  /** DOM id for ARIA tab/panel pairing. */
  id: string;
  /** Tab id this panel is labeled by (for `aria-labelledby`). */
  labelledBy: string;
}

export default function TableView({ isLoading = false, id, labelledBy }: TableViewProps) {
  return (
    <section
      id={id}
      className={styles.root}
      role="tabpanel"
      aria-labelledby={labelledBy}
      aria-busy={isLoading}
    >
      <div className={styles.body}>
        {isLoading ? (
          <LoadingSpinner label="Loading extreme heat days data" />
        ) : (
          <div className={styles.placeholder}>FPO: Table</div>
        )}
      </div>
    </section>
  );
}
