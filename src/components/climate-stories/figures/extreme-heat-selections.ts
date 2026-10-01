import {
  DEFAULT_SELECTIONS,
  type ExtremeHeatDaysSelections,
  HEAT_METRICS,
  isAllowedThreshold,
  locationOptionsFor,
  SPATIAL_AGGREGATIONS,
} from "@/lib/extreme-heat-days/options";
import { selectionsToSearchParams } from "@/lib/extreme-heat-days/search-params";

/**
 * Fill in tool defaults and reject values the tool doesn't offer, so a typo fails
 * at build time instead of rendering a "no data" chart in the story.
 */
export function extremeHeatSelections(
  overrides: Partial<ExtremeHeatDaysSelections>
): ExtremeHeatDaysSelections {
  const selections = { ...DEFAULT_SELECTIONS, ...overrides };
  const { climateVariable, threshold, spatialAggregation, location } = selections;

  if (!Object.hasOwn(HEAT_METRICS, climateVariable)) {
    throw new Error(`Unknown extreme heat climate variable: "${climateVariable}"`);
  }
  if (!isAllowedThreshold(threshold, climateVariable)) {
    throw new Error(`Threshold "${threshold}" is not allowed for "${climateVariable}"`);
  }
  if (!Object.hasOwn(SPATIAL_AGGREGATIONS, spatialAggregation)) {
    throw new Error(`Unknown spatial aggregation: "${spatialAggregation}"`);
  }
  if (!locationOptionsFor(spatialAggregation).some((option) => option.value === location)) {
    throw new Error(`Location "${location}" is not available for "${spatialAggregation}"`);
  }

  return selections;
}

/** Tool href that opens with the same selections as a story chart. */
export function extremeHeatToolHref(toolHref: string, selections: ExtremeHeatDaysSelections) {
  const query = selectionsToSearchParams(selections).toString();
  return query ? `${toolHref}?${query}` : toolHref;
}
