"use client";

import ChartView from "@/components/extreme-heat-days/ChartView";
import { useExtremeHeatSeries } from "@/hooks/use-extreme-heat-series";
import { formatViewTitle } from "@/lib/extreme-heat-days/format";
import { type ExtremeHeatDaysSelections, regionLabelFor } from "@/lib/extreme-heat-days/options";

interface ExtremeHeatChartProps {
  selections: ExtremeHeatDaysSelections;
}

export default function ExtremeHeatChart({ selections }: ExtremeHeatChartProps) {
  const series = useExtremeHeatSeries(selections);

  return (
    <ChartView
      title={formatViewTitle(selections)}
      series={series.data}
      status={series.status}
      errorMessage={series.errorMessage}
      onRetry={series.retry}
      climateVariable={selections.climateVariable}
      threshold={selections.threshold}
      locationLabel={regionLabelFor(selections)}
    />
  );
}
