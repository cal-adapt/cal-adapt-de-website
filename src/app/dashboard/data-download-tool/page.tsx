import type { Metadata } from "next";

import { PACKAGE_RAIL_DISPLAY_ORDER } from "@/components/data-download-tool/packages";
import { SITE_TITLE } from "@/config/constants";
import { navLinks } from "@/data/navigation";
import { renderDataDownloadForPackage } from "@/lib/data-download-tool/renderDataDownloadForPackage";

export const metadata: Metadata = {
  title: `${navLinks.dataDownload.label} - ${SITE_TITLE}`,
};

export default async function DataDownloadPage() {
  return renderDataDownloadForPackage(PACKAGE_RAIL_DISPLAY_ORDER[0]);
}
