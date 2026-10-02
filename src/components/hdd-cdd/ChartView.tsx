"use client";

import ChartFrame from "@/components/common/charts/ChartFrame";
import type { StacChartViewProps } from "@/components/common/charts/withStacSeries";
import Alert from "@/components/common/ui/Alert";
import { formatViewTitle } from "@/lib/hdd-cdd/format";
import { getMetric, type HddCddSelections, regionLabelFor, SSP370 } from "@/lib/hdd-cdd/options";
import {
  hasHistoricalData,
  hasRenderableSeries,
  hasScenarioData,
  type HddCddSeries,
} from "@/lib/hdd-cdd/series";

import LineChart from "./LineChart";

export type ChartViewProps = StacChartViewProps<HddCddSelections, HddCddSeries>;

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
  const { climateVariable } = selections;
  const metric = getMetric(climateVariable);
  const title = formatViewTitle(selections);
  const locationLabel = regionLabelFor(selections);
  const scenarioLabel = SSP370.label;
  const hasScenario = hasScenarioData(series, climateVariable);
  const hasHistorical = hasHistoricalData(series, climateVariable);

  const partialWarning =
    hasScenario !== hasHistorical ? (
      <Alert severity="warning" ariaLabel="Incomplete scenario coverage">
        {hasScenario
          ? `Historical data is unavailable for ${locationLabel}; showing the ${scenarioLabel} projection only.`
          : `${scenarioLabel} projection data is unavailable for ${locationLabel}; showing historical data only.`}
      </Alert>
    ) : null;

  return (
    <ChartFrame
      status={status}
      hasData={hasRenderableSeries(series, climateVariable)}
      errorMessage={errorMessage}
      onRetry={onRetry}
      loadingLabel={`Loading ${metric.accessibleNoun} data`}
      errorContent={`We couldn't load ${metric.accessibleNoun} data for ${locationLabel}. Check your connection and try again.`}
      noDataContent={`No ${metric.accessibleNoun} data is available for ${locationLabel}. Try a different location.`}
      warningContent={partialWarning}
      chartContainerRef={chartContainerRef}
      id={id}
      labelledBy={labelledBy}
      ariaLabel={labelledBy ? undefined : title}
    >
      {series && (
        <LineChart
          rows={series.rows}
          climateVariable={climateVariable}
          locationLabel={locationLabel}
          title={title}
          scenarioLabel={scenarioLabel}
          scenarioColor={metric.color}
        />
      )}
    </ChartFrame>
  );
}
