import { type ReactNode, useId } from "react";

import clsx from "clsx";

import styles from "./Callout.module.scss";

export type CalloutKind = "example" | "note" | "explore";

const KIND_LABEL: Record<CalloutKind, string> = {
  example: "Example",
  note: "Note",
  explore: "Explore the data",
};

export type CalloutVariant = "blue" | "grey";

/** Blue is reserved for calls to action; reading asides stay neutral. */
const DEFAULT_VARIANT: Record<CalloutKind, CalloutVariant> = {
  example: "grey",
  note: "grey",
  explore: "blue",
};

interface CalloutProps {
  kind: CalloutKind;
  /** Defaults to grey for `example`/`note` and blue for `explore`. */
  variant?: CalloutVariant;
  /** Overrides the eyebrow text, e.g. "Plain language example". Defaults to the kind's label. */
  label?: string;
  title?: string;
  /** Buttons or links shown below the body, e.g. a primary and secondary `Button`. */
  actions?: ReactNode;
  children: ReactNode;
}

/** An authored aside in the reading flow — a worked example, a scoping note, or
 * a prompt to explore a tool. Distinct from `Alert`, which reports app state. */
export default function Callout({
  kind,
  variant = DEFAULT_VARIANT[kind],
  label = KIND_LABEL[kind],
  title,
  actions,
  children,
}: CalloutProps) {
  const eyebrowId = useId();
  const titleId = useId();

  return (
    <aside
      className={clsx(styles.callout, styles[kind], styles[variant])}
      aria-labelledby={title ? titleId : eyebrowId}
    >
      <p id={eyebrowId} className={styles.eyebrow}>
        {label}
      </p>
      {title ? (
        <p id={titleId} className={styles.title}>
          {title}
        </p>
      ) : null}
      <div className={styles.body}>{children}</div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </aside>
  );
}
