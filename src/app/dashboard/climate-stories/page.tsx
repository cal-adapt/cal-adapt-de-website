import type { Metadata } from "next";

import StoryCard from "@/components/climate-stories/StoryCard";
import PageLayout from "@/components/dashboard/PageLayout";
import { climateStories } from "@/config/climate-stories";
import { SITE_TITLE } from "@/config/constants";
import { navLinks } from "@/config/navigation";

import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: `${navLinks.climateStories.label} - ${SITE_TITLE}`,
};

const INTRO =
  "Climate stories are narrative-focused pages that connect climate variables to hazards within specific sectors. These pages are written to further define and contextualize metrics found within each Climate Tool. Climate Stories contain interactive visualizations that allow users to quickly identify climate trends across California.";

export default function ClimateStoriesPage() {
  return (
    <PageLayout title={navLinks.climateStories.label}>
      <p className={styles.intro}>{INTRO}</p>
      <ul className={styles.grid}>
        {climateStories.map((story) => (
          <li key={story.id}>
            <StoryCard story={story} />
          </li>
        ))}
      </ul>
    </PageLayout>
  );
}
