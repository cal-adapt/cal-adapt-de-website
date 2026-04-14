import DataDownload from "@/components/data-download/DataDownload";

import { stacCollectionIdForPackage } from "./catalog/ids";
import { loadDataDownloadWorkspace } from "./workspace/load";
import type { PackageId } from "./types";

/** Server-only: load STAC workspace for a catalog package and render the download tool. */
export async function renderDataDownloadForPackage(packageId: PackageId) {
  const collectionId = stacCollectionIdForPackage(packageId);
  const workspace = await loadDataDownloadWorkspace(collectionId);
  return <DataDownload key={workspace.collectionId} workspace={workspace} />;
}
