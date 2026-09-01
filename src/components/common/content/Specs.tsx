import type { ReactNode } from "react";

import styles from "./Specs.module.scss";

interface SpecsProps {
  children: ReactNode;
}

/** A boxed spec sheet for dataset metadata — pairs of `Spec` label/value rows. */
export default function Specs({ children }: SpecsProps) {
  return <dl className={styles.specs}>{children}</dl>;
}
