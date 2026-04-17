import type { ItemSearchFilters } from "@/lib/cal-adapt-api";

import { getPackageAdapterByStacCollectionId } from "../packages/registry";
import type { CustomizeSelections } from "../types";

/**
 * Builds STAC `/search` CQL2 filter fragments for a given collection by delegating to
 * that package's adapter.
 */
export function buildItemSearchFilters(
  collectionId: string,
  selections: CustomizeSelections
): ItemSearchFilters {
  return getPackageAdapterByStacCollectionId(collectionId).buildSearchFilters(selections);
}
