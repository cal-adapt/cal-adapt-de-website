"use client";

import MapboxMap from "@/components/climate-metrics-map/MapboxMap";
import MapLegend from "@/components/climate-metrics-map/MapLegend";
import ChartFrame from "@/components/common/charts/ChartFrame";
import { metrics } from "@/data/climate-metrics-map/metrics";
import { useStacSeries } from "@/hooks/use-stac-series";
import { calAdaptApi } from "@/lib/cal-adapt-api";
import type { ClimateMetricsMapSelections } from "@/lib/climate-metrics-map/options";

import styles from "./ClimateMetricsMapChart.module.scss";

export default function ClimateMetricsMapChart({
  selections,
}: {
  selections: ClimateMetricsMapSelections;
}) {
  const metricIndex = metrics.findIndex((metric) => metric.slug === selections.metric);
  const metric = metrics[metricIndex];
  const layer = metric[selections.valueType];
  const [legendMin, legendMax] = layer.rescale.split(",").map(Number);

  const gwlList = useStacSeries(`${layer.mean}|${layer.variable}`, () =>
    calAdaptApi.map.getGwlInfo(layer.mean, layer.variable)
  );
  const gwlIndex = gwlList.data?.indexOf(selections.gwl) ?? -1;

  const title = `${selections.valueType === "del" ? "Change in " : ""}${metric.title} at ${selections.gwl}°C Global Warming Level`;

  return (
    <ChartFrame
      status={gwlList.status}
      hasData={gwlIndex >= 0}
      errorMessage={gwlList.errorMessage}
      onRetry={gwlList.retry}
      loadingLabel="Loading map"
      errorContent={
        gwlList.timedOut
          ? "The map is taking too long to load. Please try again."
          : "We couldn't load the map. Please try again."
      }
      noDataContent={`This map isn't available at ${selections.gwl}°C global warming.`}
      ariaLabel={title}
    >
      <p className={styles.title}>{title}</p>
      <div className={styles.mapArea}>
        <div className={styles.map}>
          <MapboxMap
            embedded
            metrics={metrics}
            metricSelected={metricIndex}
            valueType={selections.valueType}
            globalWarmingLevels={gwlList.data ?? []}
            gwlSelected={gwlIndex}
          />
        </div>
        <div className={styles.legend}>
          <MapLegend
            colormap={layer.colormap}
            min={legendMin}
            max={legendMax}
            bins={layer.bins}
            labelStep={layer.legendLabelStep}
            title={layer.description}
            fill
          />
        </div>
      </div>
    </ChartFrame>
  );
}
