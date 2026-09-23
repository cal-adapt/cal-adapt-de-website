import clsx from "clsx";
import type { ReactNode } from "react";

import Badge from "@/components/common/ui/Badge";
import Link from "@/components/common/ui/Link";
import type { ClimateStoryEntry } from "@/config/climate-stories";

import styles from "./StoryCard.module.scss";

interface StoryCardContentProps {
  story: ClimateStoryEntry;
  badge?: ReactNode;
  footer?: ReactNode;
}

function StoryCardContent({ story, badge, footer }: StoryCardContentProps) {
  return (
    <>
      <div className={styles.thumbnail} aria-hidden>
        <span className={styles.thumbnailLabel}>[FPO: Figure]</span>
      </div>
      <div className={styles.body}>
        <div className={styles.meta}>
          <span className={styles.hazard}>{story.hazard}</span>
          {badge}
        </div>
        <h2 className={styles.title}>{story.title}</h2>
        <p className={styles.summary}>{story.summary}</p>
        {footer ? <p className={styles.updated}>{footer}</p> : null}
      </div>
    </>
  );
}

interface StoryCardProps {
  story: ClimateStoryEntry;
}

export default function StoryCard({ story }: StoryCardProps) {
  switch (story.status) {
    case "published":
      return (
        <Link
          className={styles.card}
          href={story.href}
          aria-label={`${story.title}: ${story.summary}`}
        >
          <StoryCardContent
            story={story}
            badge={story.isNew ? <Badge variant="blue">NEW</Badge> : null}
            footer={`Last updated: ${story.lastUpdated}`}
          />
        </Link>
      );
    case "coming-soon":
      return (
        <div className={clsx(styles.card, styles.upcoming)}>
          <StoryCardContent story={story} badge={<Badge>COMING SOON</Badge>} />
        </div>
      );
    default: {
      const unhandled: never = story;
      throw new Error(`Unhandled climate story status: ${JSON.stringify(unhandled)}`);
    }
  }
}
