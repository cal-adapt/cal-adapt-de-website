import type { Metadata } from "next";

import DataDownload from "@/components/data-download-tool/DataDownloadTool";
import { SITE_TITLE } from "@/config/constants";
import { navLinks } from "@/data/navigation";

export const metadata: Metadata = {
  title: `${navLinks.dataDownload.label} - ${SITE_TITLE}`,
};

async function getData() {
  const res = await fetch("https://stac.cal-adapt.org/collections/loca2-mon-county");

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  return res.json();
}

export default async function DataDownloadPage() {
  const data: any = await getData();

  return <DataDownload data={data} />;
}
