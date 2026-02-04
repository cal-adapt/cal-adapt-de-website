import styles from "./LoadingSpinner.module.scss";

const SPINNER_DOT_COUNT = 12;

export interface LoadingSpinnerProps {
  label?: string;
}

export default function LoadingSpinner({ label = "Loading" }: LoadingSpinnerProps) {
  return (
    <div className={styles.loadingSpinner} role="status" aria-label={label} aria-live="polite">
      {Array.from({ length: SPINNER_DOT_COUNT }, (_, i) => (
        <div className={styles.dot} key={i} aria-hidden="true" />
      ))}
      <span className="sr-only">{label}</span>
    </div>
  );
}
