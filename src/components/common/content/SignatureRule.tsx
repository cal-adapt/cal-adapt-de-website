import styles from "./SignatureRule.module.scss";

/** The site's signature accent: a blue → orange → red rule that draws in once
 * per page load. Uses the same OKLCH-interpolated scale as `mixSignatureColor`
 * (see src/lib/color/signature-scale.ts), so this and any Step tag colors on
 * the page stay visually in sync. */
export default function SignatureRule() {
  return <div className={styles.rule} aria-hidden="true" />;
}
