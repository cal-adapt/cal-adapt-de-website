import type { Metadata } from "next";

import PageLayout from "@/components/dashboard/PageLayout";
import GlossaryList from "@/components/glossary/GlossaryList";
import { SITE_TITLE } from "@/config/constants";
import { glossaryEntries } from "@/config/glossary";
import { navLinks } from "@/config/navigation";

import styles from "./page.module.scss";

const INTRO = "Definitions of the climate terms used across the Cal-Adapt tools.";

export const metadata: Metadata = {
  title: `${navLinks.glossary.label} - ${SITE_TITLE}`,
  description: INTRO,
};

export default function GlossaryPage() {
  return (
    <PageLayout title={navLinks.glossary.label} citationTitle={false}>
      <p className={styles.intro}>{INTRO}</p>
      <GlossaryList entries={glossaryEntries} />
    </PageLayout>
  );
}
