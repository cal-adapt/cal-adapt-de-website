import Link from "@/components/common/ui/Link";

import styles from "./StoryFigure.module.scss";

interface StoryFigureProps {
  label: string;
  caption?: string;
  source?: string;
  sourceHref?: string;
}

export default function StoryFigure({ label, caption, source, sourceHref }: StoryFigureProps) {
  return (
    <figure className={styles.figure}>
      <div className={styles.placeholder} aria-hidden>
        <span className={styles.placeholderLabel}>{label}</span>
      </div>
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
