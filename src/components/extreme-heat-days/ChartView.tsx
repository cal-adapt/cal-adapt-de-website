"use client";

import ChartFrame from "@/components/common/charts/ChartFrame";
import type { StacChartViewProps } from "@/components/common/charts/withStacSeries";
import { resolveYAxisMax } from "@/lib/extreme-heat-days/axis";
import { formatThresholdLabel, formatViewTitle } from "@/lib/extreme-heat-days/format";
import {
  type ExtremeHeatDaysSelections,
  getHeatMetric,
  regionLabelFor,
} from "@/lib/extreme-heat-days/options";
import { type ExtremeHeatSeries, hasRenderableSeries } from "@/lib/extreme-heat-days/series";

import BarChart from "./BarChart";

export type ChartViewProps = StacChartViewProps<ExtremeHeatDaysSelections, ExtremeHeatSeries>;

export default function ChartView({
  selections,
  series,
  status,
  errorMessage,
  onRetry,
  chartContainerRef,
  id,
  labelledBy,
}: ChartViewProps) {
  const metric = getHeatMetric(selections.climateVariable);
  const title = formatViewTitle(selections);
  const locationLabel = regionLabelFor(selections);
  const thresholdLabel = formatThresholdLabel(selections.threshold);
  const tempExtremum = metric.tempStat === "t2max" ? "maximum" : "minimum";

  return (
    <ChartFrame
      status={status}
      hasData={hasRenderableSeries(series)}
      errorMessage={errorMessage}
      onRetry={onRetry}
      loadingLabel={`Loading ${metric.accessibleNoun} data`}
      errorContent={`We couldn't load ${metric.accessibleNoun} data for ${locationLabel}. Check your connection and try again.`}
      noDataContent={`No ${metric.accessibleNoun} data is available for ${locationLabel} at ${thresholdLabel}. Try a different location or threshold.`}
      chartContainerRef={chartContainerRef}
      id={id}
      labelledBy={labelledBy}
      ariaLabel={labelledBy ? undefined : title}
    >
      {series && (
        <BarChart
          globalWarmingLevels={series.globalWarmingLevels}
          values={series.median}
          thresholdLabel={thresholdLabel}
          locationLabel={locationLabel}
          title={title}
          yAxisLabel={metric.yAxisLabel}
          yAxisMax={resolveYAxisMax(series.median)}
          accessibleNoun={metric.accessibleNoun}
          tempExtremum={tempExtremum}
          valueUnit={metric.valueUnit}
        />
      )}
    </ChartFrame>
  );
}
