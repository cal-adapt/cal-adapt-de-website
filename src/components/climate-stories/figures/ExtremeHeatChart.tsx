"use client";

import ChartView from "@/components/extreme-heat-days/ChartView";
import { useStacSeries } from "@/hooks/use-stac-series";
import { fetchHeatChartData } from "@/lib/extreme-heat-days/chart-data";
import type { ExtremeHeatDaysSelections } from "@/lib/extreme-heat-days/options";
import { searchFiltersKey } from "@/lib/extreme-heat-days/series";

export default function ExtremeHeatChart({
  selections,
}: {
  selections: ExtremeHeatDaysSelections;
}) {
  const series = useStacSeries(searchFiltersKey(selections), (signal) =>
    fetchHeatChartData(selections, { signal })
  );
  return <ChartView selections={selections} series={series} />;
}
