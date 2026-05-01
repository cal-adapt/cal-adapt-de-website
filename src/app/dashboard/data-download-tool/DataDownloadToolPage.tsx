import DataDownload from "@/components/data-download-tool/DataDownload";
import {
  getPackageAdapter,
  loadDataDownloadWorkspace,
  type PackageId,
} from "@/lib/data-download-tool";

interface DataDownloadToolPageProps {
  packageId: PackageId;
}

/** Server-only: loads the STAC workspace for a package and renders the tool page. */
export default async function DataDownloadToolPage({ packageId }: DataDownloadToolPageProps) {
  const collectionId = getPackageAdapter(packageId).stacCollectionId;
  const workspace = await loadDataDownloadWorkspace(collectionId);
  return <DataDownload key={workspace.collectionId} workspace={workspace} />;
}
