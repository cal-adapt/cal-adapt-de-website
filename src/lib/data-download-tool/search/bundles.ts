import type { CountyItem } from "@/lib/cal-adapt-api";

import { getPackageAdapterByKind } from "../packages/registry";
import type { CustomizeFormKind, CustomizeSelections, DownloadBundle } from "../types";

/**
 * Maps STAC item features to UI bundles by delegating to the package adapter for `kind`.
 */
export function mapStacItemsToDownloadBundles(
  features: CountyItem[],
  selections: CustomizeSelections,
  kind: CustomizeFormKind
): { bundles: DownloadBundle[]; totalBytes: number; allHrefs: string[] } {
  return getPackageAdapterByKind(kind).mapItemsToBundles(features, selections);
}
