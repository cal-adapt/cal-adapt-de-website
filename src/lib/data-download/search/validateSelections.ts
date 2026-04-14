import type { CustomizeFormKind, CustomizeSelections } from "../types";

/** STAC search requires at least one value in each dimension we filter on. */
export function hasCompleteStacSearchSelections(
  selections: CustomizeSelections,
  kind: CustomizeFormKind
): boolean {
  if (kind === "standard-met-year") {
    return (
      selections.counties.length > 0 &&
      selections.variables.length > 0 &&
      selections.percentiles.length > 0 &&
      selections.timePeriods.length > 0
    );
  }
  if (kind === "typical-met-year") {
    return (
      selections.counties.length > 0 &&
      selections.timePeriods.length > 0 &&
      selections.models.length > 0
    );
  }

  return (
    selections.counties.length > 0 &&
    selections.models.length > 0 &&
    selections.scenarios.length > 0 &&
    selections.variables.length > 0
  );
}
