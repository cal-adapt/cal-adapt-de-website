import type { ReactNode } from "react";

import Link from "@/components/common/ui/Link";

import styles from "./StoryFigure.module.scss";

interface StoryFigureCaptionProps {
  caption?: string;
  source?: string;
  sourceHref?: string;
}

type StoryFigureProps = StoryFigureCaptionProps &
  (
    | { children: ReactNode; label?: never }
    | {
        /** Placeholder text shown until the figure has real content. */
        label: string;
        children?: never;
      }
  );

export default function StoryFigure({
  label,
  caption,
  source,
  sourceHref,
  children,
}: StoryFigureProps) {
  return (
    <figure className={styles.figure}>
      {children ?? (
        <div className={styles.placeholder} aria-hidden>
          <span className={styles.placeholderLabel}>{label}</span>
        </div>
      )}
      {caption || source ? (
        <figcaption className={styles.caption}>
          {caption ? <span>{caption}</span> : null}
          {source ? (
            sourceHref ? (
              <Link href={sourceHref} openInNewTab>
                Source: {source}
              </Link>
            ) : (
              <span>Source: {source}</span>
            )
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
