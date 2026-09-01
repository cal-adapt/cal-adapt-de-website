import type { ReactNode } from "react";

import styles from "./StatGrid.module.scss";

interface StatGridProps {
  children: ReactNode;
}

/** Row layout for a set of `Stat` callouts. */
export default function StatGrid({ children }: StatGridProps) {
  return <div className={styles.grid}>{children}</div>;
}
