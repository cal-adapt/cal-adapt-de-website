import type { Metadata } from "next";

import PageLayout from "@/components/dashboard/PageLayout";
import DataMethodsList from "@/components/data-methods/DataMethodsList";
import { SITE_TITLE } from "@/config/constants";
import { dataMethodsEntries } from "@/config/data-methods";
import { navLinks } from "@/config/navigation";

import styles from "./page.module.scss";

const INTRO =
  "Data methods explain how each climate variable in Cal-Adapt is calculated, from the original climate model output to the transformed data product that you see in our tools. Search for a variable or browse by topic to see the data used, the calculation steps, and what the results mean.";

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
