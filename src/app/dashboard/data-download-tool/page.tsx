import type { Metadata } from "next";

import DataDownload from "@/components/data-download-tool/DataDownload";
import { PACKAGE_RAIL_DISPLAY_ORDER } from "@/components/data-download-tool/packages";
import { SITE_TITLE } from "@/config/constants";
import { navLinks } from "@/data/navigation";
import { loadDataDownloadWorkspace, stacCollectionIdForPackage } from "@/lib/data-download-tool";

export const metadata: Metadata = {
  title: `${navLinks.dataDownload.label} - ${SITE_TITLE}`,
};

export default async function DataDownloadPage() {
  const defaultPackageId = PACKAGE_RAIL_DISPLAY_ORDER[0];
  const collectionId = stacCollectionIdForPackage(defaultPackageId);
  const workspace = await loadDataDownloadWorkspace(collectionId);

  return <DataDownload key={workspace.collectionId} workspace={workspace} />;
}
