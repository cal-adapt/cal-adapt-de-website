import type { Metadata } from "next";

import ContentCard, { type ContentCardProps } from "@/components/common/ui/ContentCard";
import PageLayout from "@/components/dashboard/PageLayout";
import { SITE_TITLE } from "@/config/constants";
import { navLinks } from "@/config/navigation";

import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: `${navLinks.dataMethods.label} - ${SITE_TITLE}`,
};

const METHODS: (ContentCardProps & { id: string })[] = [
  {
    id: "extreme-heat",
    href: `${navLinks.dataMethods.href}/extreme-heat`,
    eyebrow: "Heat",
    title: "Extreme Heat Days & Warm Nights",
    summary:
      "How extreme heat days and warm nights are defined, and how they were calculated from raw climate model output to the values shown in the Extreme Heat tool.",
  },
  {
    id: "renewables",
    href: `${navLinks.dataMethods.href}/renewables`,
    eyebrow: "Energy",
    title: "Renewables",
    summary:
      "How solar and wind resource droughts are defined, and the simulations, system designs and land use exclusions behind the Renewables Visualizer.",
  },
];

export default function DataMethodsPage() {
  return (
    <PageLayout title={navLinks.dataMethods.label} citationTitle={false}>
      <ul className={styles.grid}>
        {METHODS.map(({ id, ...card }) => (
          <li key={id}>
            <ContentCard {...card} />
          </li>
        ))}
      </ul>
    </PageLayout>
  );
}
