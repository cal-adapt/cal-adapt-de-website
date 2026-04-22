import type { CustomizeFormKind, PackageId } from "../types";

import { loca2CountyPackage } from "./loca2-county";
import { standardYearPackage } from "./standard-year";
import type { PackageAdapter } from "./types";
import { typicalMetYearPackage } from "./typical-met-year";

/**
 * Registry of every Data Download package. Ordering here does NOT drive UI order
 * (the rail uses `PACKAGE_RAIL_DISPLAY_ORDER` in components). Add a new package by
 * creating an adapter module and appending it here.
 */
export const PACKAGE_ADAPTERS: readonly PackageAdapter[] = [
  loca2CountyPackage,
  typicalMetYearPackage,
  standardYearPackage,
];

/**
 * Compile-time guard: every `PackageId` must have an adapter. If you add a new id to
 * `PackageId` without registering it here, this declaration will fail to type-check.
 */
const _byId: Record<PackageId, PackageAdapter> = Object.fromEntries(
  PACKAGE_ADAPTERS.map((a) => [a.id, a])
) as Record<PackageId, PackageAdapter>;
const _byKind: Record<CustomizeFormKind, PackageAdapter> = Object.fromEntries(
  PACKAGE_ADAPTERS.map((a) => [a.kind, a])
) as Record<CustomizeFormKind, PackageAdapter>;
const _byStacCollectionId: Record<string, PackageAdapter> = Object.fromEntries(
  PACKAGE_ADAPTERS.map((a) => [a.stacCollectionId, a])
);

export function getPackageAdapter(id: PackageId): PackageAdapter {
  const adapter = _byId[id];
  if (adapter == null) {
    throw new Error(`[data-download] No package adapter registered for id "${id}".`);
  }
  return adapter;
}

export function getPackageAdapterByKind(kind: CustomizeFormKind): PackageAdapter {
  const adapter = _byKind[kind];
  if (adapter == null) {
    throw new Error(`[data-download] No package adapter registered for kind "${kind}".`);
  }
  return adapter;
}

export function getPackageAdapterByStacCollectionId(collectionId: string): PackageAdapter {
  const adapter = _byStacCollectionId[collectionId];
  if (adapter == null) {
    throw new Error(
      `[data-download] No package adapter registered for STAC collection "${collectionId}". ` +
        `Add an adapter module under src/lib/data-download-tool/packages/ and register it in registry.ts.`
    );
  }
  return adapter;
}

/** Read-only view of which STAC collection ids are backed by v2 PgSTAC (used by the HTTP client). */
export const STAC_API_V2_HOST_COLLECTION_IDS: ReadonlySet<string> = new Set(
  PACKAGE_ADAPTERS.filter((a) => a.useStacV2).map((a) => a.stacCollectionId)
);
