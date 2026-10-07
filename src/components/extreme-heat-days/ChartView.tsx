"use client";

import ChartFrame, { type StacChartViewProps } from "@/components/common/charts/ChartFrame";
import { resolveYAxisMax } from "@/lib/extreme-heat-days/axis";
import {
  formatDurationLabel,
  formatThresholdLabel,
  formatViewSubtitle,
  formatViewTitle,
} from "@/lib/extreme-heat-days/format";
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
  series: { data: series, status, errorMessage, timedOut, retry },
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
      onRetry={retry}
      loadingLabel={`Loading ${metric.accessibleNoun} data`}
      errorContent={
        timedOut
          ? `Loading ${metric.accessibleNoun} data for ${locationLabel} is taking longer than expected. Try again.`
          : `We couldn't load ${metric.accessibleNoun} data for ${locationLabel}. Check your connection and try again.`
      }
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
          subtitle={formatViewSubtitle(selections)}
          yAxisLabel={metric.yAxisLabel}
          yAxisMax={resolveYAxisMax(series.median)}
          accessibleNoun={metric.accessibleNoun}
          tempExtremum={tempExtremum}
          valueUnit={metric.valueUnit}
          durationLabel={metric.usesDuration ? formatDurationLabel(selections.duration) : undefined}
        />
      )}
    </ChartFrame>
  );
}
