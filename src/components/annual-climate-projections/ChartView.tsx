"use client";

import ChartFrame, { type StacChartViewProps } from "@/components/common/charts/ChartFrame";
import { formatViewTitle } from "@/lib/annual-climate-projections/format";
import {
  type AnnualClimateProjectionsSelections,
  ENSEMBLES,
  getVariable,
  regionLabelFor,
} from "@/lib/annual-climate-projections/options";
import { type AnnualSeries, hasRenderableSeries } from "@/lib/annual-climate-projections/series";

import LineChart from "./LineChart";

export type ChartViewProps = StacChartViewProps<
  AnnualClimateProjectionsSelections,
  AnnualSeries
> & {
  showSimulations: boolean;
};

export default function ChartView({
  selections,
  series: { data: series, status, errorMessage, timedOut, retry },
  chartContainerRef,
  showSimulations,
  id,
  labelledBy,
}: ChartViewProps) {
  const variable = getVariable(selections.climateVariable);
  const title = formatViewTitle(selections);
  const locationLabel = regionLabelFor(selections);
  const noun = variable.label.toLowerCase();

  return (
    <ChartFrame
      status={status}
      hasData={hasRenderableSeries(series)}
      errorMessage={errorMessage}
      onRetry={retry}
      loadingLabel={`Loading ${noun} data`}
      errorContent={
        timedOut
          ? `Loading ${noun} data for ${locationLabel} is taking longer than expected. Try again.`
          : `We couldn't load ${noun} data for ${locationLabel}. Check your connection and try again.`
      }
      source={ENSEMBLES[selections.ensemble].chartSource}
      noDataContent={`No ${noun} data is available for ${locationLabel}. Try a different location.`}
      chartContainerRef={chartContainerRef}
      id={id}
      labelledBy={labelledBy}
      ariaLabel={labelledBy ? undefined : title}
    >
      {series && (
        <LineChart
          rows={series.rows}
          simulationNames={series.simulationNames}
          observed={series.observed}
          showSimulations={showSimulations}
          locationLabel={locationLabel}
          title={title}
          yAxisLabel={variable.yAxisLabel}
          unit={variable.unit}
        />
      )}
    </ChartFrame>
  );
}
