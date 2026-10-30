import type { ReactNode } from "react";

import styles from "./ShownIn.module.scss";

/** A row of buttons linking to the tools and climate stories a dataset appears in. */
export default function ShownIn({ children }: { children: ReactNode }) {
  return <div className={styles.row}>{children}</div>;
}
