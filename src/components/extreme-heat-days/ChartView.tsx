"use client";

import { type RefObject, useEffect } from "react";

import Alert from "@/components/common/ui/Alert";
import Button from "@/components/common/ui/Button";
import LoadingSpinner from "@/components/common/ui/LoadingSpinner";
import type { ExtremeHeatSeriesStatus } from "@/hooks/use-extreme-heat-series";
import { resolveYAxisMax } from "@/lib/extreme-heat-days/axis";
import { formatThresholdLabel } from "@/lib/extreme-heat-days/format";
import { getHeatMetric } from "@/lib/extreme-heat-days/options";
import { type ExtremeHeatSeries, hasRenderableSeries } from "@/lib/extreme-heat-days/series";

import BarChart from "./BarChart";

import styles from "./ChartView.module.scss";

export interface ChartViewProps {
  /**  Owned by the parent so the chart and table views are consistently labeled. */
  title: string;
  /** Loaded series for the current location. `null` while loading/erroring/idle. */
  series: ExtremeHeatSeries | null;
  status: ExtremeHeatSeriesStatus;
  errorMessage: string | null;
  /** Re-trigger the data fetch; wired to the error-state "Retry" button. */
  onRetry: () => void;
  /** Selected climate variable; drives metric-specific chart labels/copy. */
  climateVariable: string;
  /** Current threshold selection; used for labels and no-data copy. */
  threshold: string;
  locationLabel: string;
  /** DOM id for ARIA tab/panel pairing. */
  id: string;
  /** Tab id this panel is labeled by (for `aria-labelledby`). */
  labelledBy: string;
  /** Attached to the chart container div so the parent's Download button can
   *  locate the SVG via a single `querySelector("svg")`. */
  chartContainerRef?: RefObject<HTMLDivElement | null>;
}

export default function ChartView({
  title,
  series,
  status,
  errorMessage,
  onRetry,
  climateVariable,
  threshold,
  locationLabel,
  id,
  labelledBy,
  chartContainerRef,
}: ChartViewProps) {
  const isLoading = status === "loading";

  useEffect(() => {
    if (status === "error" && errorMessage) {
      console.error("[extreme-heat-days] fetch failed:", errorMessage);
    }
  }, [status, errorMessage]);

  const metric = getHeatMetric(climateVariable);
  const hasRenderableData = hasRenderableSeries(series);

  const showErrorAlert = status === "error";
  const showNoDataAlert = status === "success" && !hasRenderableData;
  const showSourceCitation = status === "success" && hasRenderableData;

  const thresholdLabel = formatThresholdLabel(threshold);
  const tempExtremum = metric.tempStat === "t2max" ? "maximum" : "minimum";

  return (
    <section
      id={id}
      className={styles.root}
      role="tabpanel"
      aria-labelledby={labelledBy}
      aria-busy={isLoading}
    >
      <div ref={chartContainerRef} className={styles.surface}>
        {hasRenderableData && series && (
          <BarChart
            globalWarmingLevels={series.globalWarmingLevels}
            values={series.median}
            thresholdLabel={thresholdLabel}
            locationLabel={locationLabel}
            title={title}
            yAxisLabel={metric.yAxisLabel}
            yAxisMax={resolveYAxisMax([...series.median, ...series.p10, ...series.p90])}
            accessibleNoun={metric.accessibleNoun}
            tempExtremum={tempExtremum}
            valueUnit={metric.valueUnit}
          />
        )}
        {isLoading && (
          <div className={styles.loadingState}>
            <LoadingSpinner label={`Loading ${metric.accessibleNoun} data`} />
          </div>
        )}
      </div>

      {showErrorAlert && (
        <Alert
          severity="error"
          action={
            <Button type="button" variant="primary" size="small" onClick={onRetry}>
              Retry
            </Button>
          }
        >
          We couldn&apos;t load {metric.accessibleNoun} data for {locationLabel}. Check your
          connection and try again.
        </Alert>
      )}

      {showNoDataAlert && (
        <Alert severity="info" ariaLabel="No data available">
          No {metric.accessibleNoun} data is available for {locationLabel} at {thresholdLabel}. Try
          a different location or threshold.
        </Alert>
      )}

      {showSourceCitation && (
        <p className={styles.sourceCitation}>
          Source: Cal-Adapt. Data: WRF Downscaled CMIP6 Climate Projections (UCLA), WRF Derived
          Products (Cal-Adapt).
        </p>
      )}
    </section>
  );
}
