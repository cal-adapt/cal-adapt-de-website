import type { Metadata } from "next";

import { PACKAGE_RAIL_DISPLAY_ORDER } from "@/components/data-download-tool/packages";
import { SITE_TITLE } from "@/config/constants";
import { navLinks } from "@/config/navigation";

import DataDownloadToolPage from "./DataDownloadToolPage";

export const metadata: Metadata = {
  title: `${navLinks.dataDownload.label} - ${SITE_TITLE}`,
};

export default function Page() {
  return <DataDownloadToolPage packageId={PACKAGE_RAIL_DISPLAY_ORDER[0]} />;
}
