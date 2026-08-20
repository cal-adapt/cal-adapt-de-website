import styles from "./SectionDivider.module.scss";

interface SectionDividerProps {
  label?: string;
}

/** Marks a register shift in the document — the gradient rule picks up the
 * blue-to-red scale used for the page's table of contents and warming levels. */
export default function SectionDivider({ label }: SectionDividerProps) {
  return (
    <div className={styles.divider} role="presentation">
      <span className={styles.rule} aria-hidden="true" />
      {label ? <p className={styles.label}>{label}</p> : null}
    </div>
  );
}
