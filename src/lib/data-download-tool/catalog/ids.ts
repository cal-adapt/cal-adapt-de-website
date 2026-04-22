import { getPackageAdapter, STAC_API_V2_HOST_COLLECTION_IDS } from "../packages/registry";
import type { PackageId } from "../types";

export { STAC_API_V2_HOST_COLLECTION_IDS };

export function stacCollectionIdForPackage(packageId: PackageId): string {
  return getPackageAdapter(packageId).stacCollectionId;
}
