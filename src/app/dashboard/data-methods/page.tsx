import type { Metadata } from "next";

import PageLayout from "@/components/dashboard/PageLayout";
import DataMethodsList from "@/components/data-methods/DataMethodsList";
import { SITE_TITLE } from "@/config/constants";
import { dataMethodsEntries } from "@/config/data-methods";
import { navLinks } from "@/config/navigation";

import styles from "./page.module.scss";

const INTRO =
  "Find out how each climate variable in the Cal-Adapt tools is calculated. Search for a variable to open its data methods.";

export const metadata: Metadata = {
  title: `${navLinks.dataMethods.label} - ${SITE_TITLE}`,
  description: INTRO,
};

export default function DataMethodsPage() {
  return (
    <PageLayout title={navLinks.dataMethods.label} citationTitle={false}>
      <p className={styles.intro}>{INTRO}</p>
      <DataMethodsList entries={dataMethodsEntries} />
    </PageLayout>
  );
}
