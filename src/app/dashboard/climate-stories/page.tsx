import type { Metadata } from "next";

import StoryCard from "@/components/climate-stories/StoryCard";
import PageLayout from "@/components/dashboard/PageLayout";
import { climateStoryCatalog } from "@/config/climate-stories";
import { SITE_TITLE } from "@/config/constants";
import { navLinks } from "@/config/navigation";

import styles from "./page.module.scss";

const INTRO = [
  "Climate stories explain how climate change is expected to affect California. Each story looks at how conditions are projected to change and why those changes matter for the energy sector and communities. Short explanations and interactive visuals help you see what the science says and explore what it could mean for your own community.",
  "Every story is built on Cal-Adapt’s climate projections and links to the tools and data behind each figure. That means you can start with a statewide overview and then dive into the details of your county. Whether you work in planning, research, or policy, or you’re simply curious, Climate stories are a great way to begin exploring climate change impacts in California.",
];

export const metadata: Metadata = {
  title: `${navLinks.climateStories.label} - ${SITE_TITLE}`,
  description: INTRO[0],
};

export default function ClimateStoriesPage() {
  return (
    <PageLayout title={navLinks.climateStories.label} citationTitle={false}>
      <div className={styles.intro}>
        {INTRO.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <ul className={styles.grid}>
        {climateStoryCatalog.map((story) => (
          <li key={story.id}>
            <StoryCard story={story} />
          </li>
        ))}
      </ul>
    </PageLayout>
  );
}
