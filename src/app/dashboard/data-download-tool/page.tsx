import type { Metadata } from "next";

import DataDownload from "@/components/data-download-tool/DataDownloadTool";
import { SITE_TITLE } from "@/config/constants";
import { navLinks } from "@/data/navigation";
import { calAdaptApi } from "@/lib/cal-adapt-api";

export const metadata: Metadata = {
  title: `${navLinks.dataDownload.label} - ${SITE_TITLE}`,
};

export default async function DataDownloadPage() {
  const data = await calAdaptApi.stac.getCollection("loca2-mon-county");

  return <DataDownload data={data} />;
}
