import { PACKAGE_ADAPTERS, type PackageId } from "@/lib/data-download-tool";

export type { PackageId };

/** Left rail section heading (above the package list). */
export const PACKAGE_RAIL_SECTION_TITLE = "Select a package preset from the options listed below.";

/**
 * Visual order in the package rail (design / UX order, independent of adapter registration order).
 */
export const PACKAGE_RAIL_DISPLAY_ORDER: readonly PackageId[] = [
  "typical-met-year",
  "standard-year",
  "xmy-persist",
  "xmy-shock",
  "loca2-county",
] as const;

export type FlowStep = "customize" | "download";

export interface DownloadPackage {
  id: PackageId;
  title: string;
  /** One-line blurb in the package rail. */
  listDescription: string;
}

/** Rail-view packages derived directly from the lib-level adapter registry. */
export const DOWNLOAD_PACKAGES: DownloadPackage[] = PACKAGE_ADAPTERS.map((adapter) => ({
  id: adapter.id,
  title: adapter.rail.title,
  listDescription: adapter.rail.listDescription,
}));

export function getPackage(id: PackageId): DownloadPackage {
  const found = DOWNLOAD_PACKAGES.find((p) => p.id === id);
  if (found == null) {
    throw new Error(`Unknown package id: ${id}`);
  }
  return found;
}
