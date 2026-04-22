import {
  getPackageAdapter,
  getPackageAdapterByKind,
  getPackageAdapterByStacCollectionId,
  PACKAGE_ADAPTERS,
  STAC_API_V2_HOST_COLLECTION_IDS,
} from "../packages/registry";
import type { CustomizeFormKind, PackageId } from "../types";

export { STAC_API_V2_HOST_COLLECTION_IDS };

/** Current STAC id for LOCA2 county-gridded downloads (v2 API). */
export const LOCA2_COUNTY_STAC_COLLECTION_ID = "loca2-county" as const;

export function stacCollectionIdForPackage(packageId: PackageId): string {
  return getPackageAdapter(packageId).stacCollectionId;
}

export function catalogPackageIdForStacCollection(collectionId: string): PackageId {
  return getPackageAdapterByStacCollectionId(collectionId).id;
}

/**
 * Whether a collection uses the station-profile customize layout (climate profiles).
 * Drives `filters.ts` fallbacks and legacy helpers — prefer reading `kind` off the adapter.
 */
export function isV2StationProfileCollection(collectionId: string): boolean {
  const adapter = PACKAGE_ADAPTERS.find((a) => a.stacCollectionId === collectionId);
  if (adapter == null) {
    return false;
  }
  const kind: CustomizeFormKind = adapter.kind;
  return kind === "standard-year" || kind === "typical-met-year";
}
