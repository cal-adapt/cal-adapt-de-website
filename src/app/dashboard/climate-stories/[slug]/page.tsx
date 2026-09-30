import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ClimateStoryLayout from "@/components/climate-stories/ClimateStoryLayout";
import { getClimateStoryPage } from "@/components/climate-stories/story-pages";
import Container from "@/components/common/layout/Container";
import { climateStories, getClimateStory } from "@/config/climate-stories";
import { SITE_TITLE } from "@/config/constants";
import { navLinks } from "@/config/navigation";

interface ClimateStoryPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return climateStories.map((story) => ({ slug: story.slug }));
}

export async function generateMetadata({ params }: ClimateStoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = getClimateStory(slug);
  const title = story?.title ?? navLinks.climateStories.label;

  return {
    title: `${title} - ${navLinks.climateStories.label} - ${SITE_TITLE}`,
    description: story?.summary,
  };
}

export default async function ClimateStoryPage({ params }: ClimateStoryPageProps) {
  const { slug } = await params;
  const story = getClimateStory(slug);
  const page = getClimateStoryPage(slug);

  if (story == null || page == null) {
    notFound();
  }

  const { Body, sections } = page;

  return (
    <Container align="start" spacing="page">
      <ClimateStoryLayout story={story} sections={sections}>
        <Body story={story} />
      </ClimateStoryLayout>
    </Container>
  );
}
