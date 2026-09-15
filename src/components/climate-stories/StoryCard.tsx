import Badge from "@/components/common/ui/Badge";
import Link from "@/components/common/ui/Link";
import type { ClimateStory } from "@/config/climate-stories";

import styles from "./StoryCard.module.scss";

interface StoryCardProps {
  story: ClimateStory;
}

export default function StoryCard({ story }: StoryCardProps) {
  return (
    <Link className={styles.card} href={story.href} aria-label={`${story.title}: ${story.summary}`}>
      <div className={styles.thumbnail} aria-hidden>
        <span className={styles.thumbnailLabel}>[FPO: Figure]</span>
      </div>
      <div className={styles.body}>
        <div className={styles.meta}>
          <span className={styles.hazard}>{story.hazard}</span>
          {story.isNew ? <Badge variant="blue">NEW</Badge> : null}
        </div>
        <h2 className={styles.title}>{story.title}</h2>
        <p className={styles.summary}>{story.summary}</p>
        <p className={styles.updated}>Last updated: {story.lastUpdated}</p>
      </div>
    </Link>
  );
}
