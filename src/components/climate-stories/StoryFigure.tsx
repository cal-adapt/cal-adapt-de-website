import ArrowOutwardOutlinedIcon from "@mui/icons-material/ArrowOutwardOutlined";

import type { ReactNode } from "react";

import Button from "@/components/common/ui/Button";
import Link from "@/components/common/ui/Link";
import ToolButton from "@/components/common/ui/ToolButton";
import type { NavLink } from "@/config/navigation";

import styles from "./StoryFigure.module.scss";

/** A tool the figure can be explored in. */
export interface StoryFigureToolLink {
  /** Supplies the label and icon. */
  navLink: NavLink;
  /** Link to the tool, opened on the figure's selections. */
  href: string;
}

/** Further reading on another site, e.g. a blog post. */
export interface StoryFigureRelatedLink {
  label: string;
  href: string;
}

interface StoryFigureCaptionProps {
  caption?: string;
  source?: string;
  sourceHref?: string;
  /** Shown above the figure's top right corner as "Open in" buttons. */
  toolLinks?: readonly StoryFigureToolLink[];
  /** Shown below `toolLinks` as "Read more" buttons. */
  relatedLinks?: readonly StoryFigureRelatedLink[];
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
  toolLinks = [],
  relatedLinks = [],
  children,
}: StoryFigureProps) {
  return (
    <figure className={styles.figure}>
      {toolLinks.length > 0 ? (
        <div className={styles.linkRow}>
          <span className={styles.linkRowLabel}>Open in</span>
          {toolLinks.map(({ navLink, href }) => (
            <ToolButton key={href} navLink={navLink} href={href} />
          ))}
        </div>
      ) : null}
      {relatedLinks.length > 0 ? (
        <div className={styles.linkRow}>
          <span className={styles.linkRowLabel}>Read more</span>
          {relatedLinks.map(({ label: linkLabel, href }) => (
            <Button
              key={href}
              variant="outline"
              size="compact"
              href={href}
              prefix={<ArrowOutwardOutlinedIcon />}
            >
              {linkLabel}
            </Button>
          ))}
        </div>
      ) : null}
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
