import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ClimateStoryLayout from "@/components/climate-stories/ClimateStoryLayout";
import ExtremeHeatStory, {
  extremeHeatHeadings,
} from "@/components/climate-stories/ExtremeHeatStory";
import Container from "@/components/common/layout/Container";
import { getClimateStory } from "@/config/climate-stories";
import { SITE_TITLE } from "@/config/constants";
import { navLinks } from "@/config/navigation";

const STORY = getClimateStory("extreme-heat");

export const metadata: Metadata = {
  title: `${STORY?.title ?? "Extreme Heat"} - ${navLinks.climateStories.label} - ${SITE_TITLE}`,
};

export default function ExtremeHeatStoryPage() {
  if (STORY == null) {
    notFound();
  }

  return (
    <Container align="start" spacing="page">
      <ClimateStoryLayout story={STORY} headings={extremeHeatHeadings}>
        <ExtremeHeatStory story={STORY} />
      </ClimateStoryLayout>
    </Container>
  );
}
