import type { ExtremeHeatDaysSelections } from "./options";

export const CONTROL_TOOLTIPS: Record<keyof ExtremeHeatDaysSelections, string> = {
  climateVariable: "The type of climate data being displayed.",
  threshold: "The maximum temperature threshold used to determine an extreme heat day.",
  indicator:
    "An indicator is a parameter that describes the state or trend of a climate variable. Indicators may be represented by one or more metrics, each quantifying a different aspect of a climate hazard.",
  county:
    "Select a California county to view localized projections. Data is based on 3km grid cells within that county.",
};
