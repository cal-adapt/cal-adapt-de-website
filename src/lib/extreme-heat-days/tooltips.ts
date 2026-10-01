import type { ExtremeHeatDaysSelections } from "./options";

/** Static tooltips for controls where copy doesn't vary by metric.
 * The threshold tooltip is metric-specific and lives on each `HeatMetricConfig`. */
export const CONTROL_TOOLTIPS: Omit<
  Record<keyof ExtremeHeatDaysSelections, string>,
  "threshold" | "location"
> & { thresholdType: string } = {
  climateVariable: "The type of climate data being displayed.",
  spatialAggregation: "Region over which the data is aggregated",
  duration: "Consecutive days above the threshold that define a heat wave",
  thresholdType:
    "Relative uses a local temperature percentile (e.g. 98th) as the threshold, so it varies by location. Absolute uses a fixed temperature value applied everywhere.",
};
