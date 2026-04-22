import DataDownload from "@/components/data-download-tool/DataDownload";

import { getPackageAdapter } from "./packages/registry";
import { loadDataDownloadWorkspace } from "./workspace/load";
import type { PackageId } from "./types";

/** Server-only: load STAC workspace for a catalog package and render the download tool. */
export async function renderDataDownloadForPackage(packageId: PackageId) {
  const collectionId = getPackageAdapter(packageId).stacCollectionId;
  const workspace = await loadDataDownloadWorkspace(collectionId);
  return <DataDownload key={workspace.collectionId} workspace={workspace} />;
}
