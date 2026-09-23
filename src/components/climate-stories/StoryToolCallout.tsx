import { useId } from "react";

import Button from "@/components/common/ui/Button";

import styles from "./StoryToolCallout.module.scss";

interface StoryToolCalloutLink {
  href: string;
  label: string;
}

interface StoryToolCalloutProps {
  title: string;
  body: string;
  primary: StoryToolCalloutLink;
  secondary?: StoryToolCalloutLink;
}

export default function StoryToolCallout({
  title,
  body,
  primary,
  secondary,
}: StoryToolCalloutProps) {
  const headingId = useId();

  return (
    <aside className={styles.callout} aria-labelledby={headingId}>
      <p className={styles.kicker}>Callout</p>
      <p id={headingId} className={styles.title}>
        {title}
      </p>
      <p className={styles.body}>{body}</p>
      <div className={styles.actions}>
        <Button href={primary.href} variant="primary" size="small">
          {primary.label}
        </Button>
        {secondary ? (
          <Button href={secondary.href} variant="secondary" size="small">
            {secondary.label}
          </Button>
        ) : null}
      </div>
    </aside>
  );
}
