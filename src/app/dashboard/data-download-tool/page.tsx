import React from "react";

import DataDownload from "@/components/data-download-tool/DataDownloadTool";

import "@/styles/dashboard/data-download-tool.scss";

async function getData() {
  const res = await fetch("https://stac.cal-adapt.org/collections/loca2-mon-county");

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  return res.json();
}

export default async function DataDownloadWrapper() {
  const data: any = await getData();

  return <DataDownload data={data}></DataDownload>;
}
