import Button from "@/components/common/ui/Button";

import styles from "./StoryToolCallout.module.scss";

interface StoryToolCalloutLink {
  href: string;
  label: string;
}

interface StoryToolCalloutProps {
  id?: string;
  title: string;
  body: string;
  primary: StoryToolCalloutLink;
  secondary?: StoryToolCalloutLink;
}

export default function StoryToolCallout({
  id = "tool-callout",
  title,
  body,
  primary,
  secondary,
}: StoryToolCalloutProps) {
  const headingId = `${id}-heading`;

  return (
    <aside id={id} className={styles.callout} aria-labelledby={headingId}>
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
