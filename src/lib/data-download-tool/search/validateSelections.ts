import { getPackageAdapterByKind } from "../packages/registry";
import type { CustomizeFormKind, CustomizeSelections } from "../types";

/** STAC search requires at least one value in each dimension we filter on. */
export function hasCompleteStacSearchSelections(
  selections: CustomizeSelections,
  kind: CustomizeFormKind
): boolean {
  return getPackageAdapterByKind(kind).validateSelections(selections);
}
