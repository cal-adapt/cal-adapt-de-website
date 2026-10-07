"use client";

import ChartView from "@/components/extreme-heat-days/ChartView";
import { useStacSeries } from "@/hooks/use-stac-series";
import type { ExtremeHeatDaysSelections } from "@/lib/extreme-heat-days/options";
import { fetchExtremeHeatSeries, searchFiltersKey } from "@/lib/extreme-heat-days/series";

export default function ExtremeHeatChart({
  selections,
}: {
  selections: ExtremeHeatDaysSelections;
}) {
  const series = useStacSeries(searchFiltersKey(selections), (signal) =>
    fetchExtremeHeatSeries(selections, { signal })
  );
  return <ChartView selections={selections} series={series} />;
}
