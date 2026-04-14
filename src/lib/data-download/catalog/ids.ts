import type { PackageId } from "../types";

/** Current STAC id for LOCA2 county-gridded downloads (v2 API). */
export const LOCA2_COUNTY_STAC_COLLECTION_ID = "loca2-county" as const;

/**
 * Maps STAC collection IDs to our catalog `PackageId` for shared UI (rail, defaults copy).
 * Add new rows here when additional collections (TMY, Standard Year, …) are wired to the API.
 */
export const STAC_COLLECTION_TO_CATALOG_PACKAGE: Partial<Record<string, PackageId>> = {
  [LOCA2_COUNTY_STAC_COLLECTION_ID]: "county-gridded",
  /** V2 — Standard Meteorological Year (8760 profiles, station CSV). */
  "standard-met-year": "standard-year-profile",
  /** V2 — Typical Meteorological Year (same queryables-driven customize flow as SMY). */
  "typical-met-year": "tmy-profile",
};

/** Maps catalog package → STAC collection id (API). */
export const CATALOG_PACKAGE_TO_STAC_COLLECTION: Record<PackageId, string> = {
  "county-gridded": LOCA2_COUNTY_STAC_COLLECTION_ID,
  "standard-year-profile": "standard-met-year",
  "tmy-profile": "typical-met-year",
};

/**
 * Collections whose `getCollection` / `search` traffic goes to STAC API v2 (`STAC_API_V2_BASE_URL`).
 * All Data Download packages use this host; v1 (`STAC_API_BASE_URL`) remains for ad-hoc / legacy IDs.
 */
export const STAC_API_V2_HOST_COLLECTION_IDS = new Set<string>([
  LOCA2_COUNTY_STAC_COLLECTION_ID,
  "standard-met-year",
  "typical-met-year",
]);

const V2_STATION_PROFILE_COLLECTION_IDS = new Set<string>([
  "standard-met-year",
  "typical-met-year",
]);

/** Collections that use `/queryables` + the Standard Met Year customize layout (station CSV profile). */
export function isV2StationProfileCollection(collectionId: string): boolean {
  return V2_STATION_PROFILE_COLLECTION_IDS.has(collectionId);
}

export function stacCollectionIdForPackage(packageId: PackageId): string {
  return CATALOG_PACKAGE_TO_STAC_COLLECTION[packageId];
}

export function catalogPackageIdForStacCollection(collectionId: string): PackageId {
  const id = STAC_COLLECTION_TO_CATALOG_PACKAGE[collectionId];
  if (id == null) {
    throw new Error(
      `[data-download] No catalog mapping for STAC collection "${collectionId}". ` +
        `Extend STAC_COLLECTION_TO_CATALOG_PACKAGE in catalog/ids.ts.`
    );
  }
  return id;
}
