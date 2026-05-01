import type { Metadata } from "next";

import { SITE_TITLE } from "@/config/constants";
import { navLinks } from "@/config/navigation";

import DataDownloadToolPage from "../DataDownloadToolPage";

export const metadata: Metadata = {
  title: `${navLinks.dataDownload.label} - ${SITE_TITLE}`,
};

export default function Page() {
  return <DataDownloadToolPage packageId="typical-met-year" />;
}
