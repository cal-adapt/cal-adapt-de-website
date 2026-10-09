// The tool's variables come in two chart shapes. This picks the right fetch
// for the selected variable and tags the result, so the view renders from what
// was actually loaded rather than from the current selection.

import { type ExtremeHeatDaysSelections, getHeatMetric } from "./options";
import { type ExtremeHeatSeason, fetchExtremeHeatSeason, hasRenderableSeason } from "./season";
import {
  type ExtremeHeatSeries,
  fetchExtremeHeatSeries,
  type FetchSeriesOptions,
  hasRenderableSeries,
} from "./series";

export type HeatChartData =
  | { kind: "bar"; series: ExtremeHeatSeries }
  | { kind: "heatmap"; season: ExtremeHeatSeason };

export async function fetchHeatChartData(
  selections: ExtremeHeatDaysSelections,
  options: FetchSeriesOptions = {}
): Promise<HeatChartData> {
  const { chartKind } = getHeatMetric(selections.climateVariable);
  switch (chartKind) {
    case "bar":
      return { kind: "bar", series: await fetchExtremeHeatSeries(selections, options) };
    case "heatmap":
      return { kind: "heatmap", season: await fetchExtremeHeatSeason(selections, options) };
    default: {
      const _exhaustive: never = chartKind;
      return _exhaustive;
    }
  }
}

/** True when `data` has enough to plot. */
export function hasRenderableChartData(data: HeatChartData | null): boolean {
  if (!data) return false;
  return data.kind === "bar" ? hasRenderableSeries(data.series) : hasRenderableSeason(data.season);
}
