import type { Metadata } from "next";

import { SITE_TITLE } from "@/config/constants";
import { navLinks } from "@/data/navigation";
import { renderDataDownloadForPackage } from "@/lib/data-download-tool/renderDataDownloadForPackage";

export const metadata: Metadata = {
  title: `${navLinks.dataDownload.label} - ${SITE_TITLE}`,
};

export default async function DataDownloadLoca2CountyPage() {
  return renderDataDownloadForPackage("loca2-county");
}
