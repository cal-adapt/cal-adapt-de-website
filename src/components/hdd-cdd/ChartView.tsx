"use client";

import { type RefObject, useEffect } from "react";

import Alert from "@/components/common/ui/Alert";
import Button from "@/components/common/ui/Button";
import LoadingSpinner from "@/components/common/ui/LoadingSpinner";
import type { HddCddSeriesStatus } from "@/hooks/use-hdd-cdd-series";
import { getMetric } from "@/lib/hdd-cdd/options";
import {
  hasHistoricalData,
  hasRenderableSeries,
  hasScenarioData,
  type HddCddSeries,
} from "@/lib/hdd-cdd/series";

import LineChart from "./LineChart";

import styles from "./ChartView.module.scss";

export interface ChartViewProps {
  title: string;
  /** Loaded series for the current location. `null` while loading/erroring/idle. */
  series: HddCddSeries | null;
  status: HddCddSeriesStatus;
  errorMessage: string | null;
  /** Re-trigger the data fetch; wired to the error-state "Retry" button. */
  onRetry: () => void;
  metric: string;
  locationLabel: string;
  scenarioLabel: string;
  scenarioColor: string;
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
  metric,
  locationLabel,
  scenarioLabel,
  scenarioColor,
  chartContainerRef,
}: ChartViewProps) {
  const isLoading = status === "loading";

  useEffect(() => {
    if (status === "error" && errorMessage) {
      console.error("[hdd-cdd] fetch failed:", errorMessage);
    }
  }, [status, errorMessage]);

  const metricConfig = getMetric(metric);
  const hasRenderableData = hasRenderableSeries(series, metric);

  const showErrorAlert = status === "error";
  const showNoDataAlert = status === "success" && !hasRenderableData;
  const showSourceCitation = status === "success" && hasRenderableData;

  const showPartialWarning =
    status === "success" &&
    hasRenderableData &&
    hasHistoricalData(series, metric) !== hasScenarioData(series, metric);

  return (
    <section className={styles.root} aria-label={title} aria-busy={isLoading}>
      <div ref={chartContainerRef} className={styles.surface}>
        {hasRenderableData && series && (
          <LineChart
            rows={series.rows}
            metric={metric}
            locationLabel={locationLabel}
            title={title}
            scenarioLabel={scenarioLabel}
            scenarioColor={scenarioColor}
          />
        )}
        {isLoading && (
          <div className={styles.loadingState}>
            <LoadingSpinner label={`Loading ${metricConfig.accessibleNoun} data`} />
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
          We couldn&apos;t load {metricConfig.accessibleNoun} data for {locationLabel}. Check your
          connection and try again.
        </Alert>
      )}

      {showNoDataAlert && (
        <Alert severity="info" ariaLabel="No data available">
          No {metricConfig.accessibleNoun} data is available for {locationLabel}. Try a different
          location.
        </Alert>
      )}

      {showPartialWarning && (
        <Alert severity="warning" ariaLabel="Incomplete scenario coverage">
          {hasScenarioData(series, metric)
            ? `Historical data is unavailable for ${locationLabel}; showing the ${scenarioLabel} projection only.`
            : `${scenarioLabel} projection data is unavailable for ${locationLabel}; showing historical data only.`}
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
