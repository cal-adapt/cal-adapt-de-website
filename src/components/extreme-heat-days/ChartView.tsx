"use client";

import ChartFrame, { type StacChartViewProps } from "@/components/common/charts/ChartFrame";
import { resolveYAxisMax } from "@/lib/extreme-heat-days/axis";
import { hasRenderableChartData, type HeatChartData } from "@/lib/extreme-heat-days/chart-data";
import {
  formatSeasonDescription,
  formatThresholdLabel,
  formatViewSubtitle,
  formatViewTitle,
} from "@/lib/extreme-heat-days/format";
import {
  type ExtremeHeatDaysSelections,
  getHeatMetric,
  regionLabelFor,
} from "@/lib/extreme-heat-days/options";

import BarChart from "./BarChart";
import Heatmap from "./Heatmap";

export type ChartViewProps = StacChartViewProps<ExtremeHeatDaysSelections, HeatChartData>;

export default function ChartView({
  selections,
  series: { data, status, errorMessage, timedOut, retry },
  chartContainerRef,
  id,
  labelledBy,
}: ChartViewProps) {
  const metric = getHeatMetric(selections.climateVariable);
  const title = formatViewTitle(selections);
  const subtitle = formatViewSubtitle(selections);
  const locationLabel = regionLabelFor(selections);
  const thresholdLabel = formatThresholdLabel(selections.threshold);

  return (
    <ChartFrame
      status={status}
      hasData={hasRenderableChartData(data)}
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
      {/* Render from the loaded data's kind: for one render after a variable
          switch, `data` still belongs to the previous variable. */}
      {data?.kind === "bar" && metric.chartKind === "bar" && (
        <BarChart
          globalWarmingLevels={data.series.globalWarmingLevels}
          values={data.series.median}
          title={title}
          subtitle={subtitle}
          yAxisLabel={metric.yAxisLabel}
          yAxisMax={resolveYAxisMax(data.series.median)}
          valueUnit={metric.valueUnit}
        />
      )}
      {data?.kind === "heatmap" && metric.chartKind === "heatmap" && (
        <Heatmap
          globalWarmingLevels={data.season.globalWarmingLevels}
          frequencyPercent={data.season.frequencyPercent}
          title={title}
          subtitle={subtitle}
          description={formatSeasonDescription(selections, data.season)}
        />
      )}
    </ChartFrame>
  );
}
