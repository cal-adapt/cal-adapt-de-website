"use client";

import { type RefObject, useEffect } from "react";

import Alert from "@/components/common/ui/Alert";
import Button from "@/components/common/ui/Button";
import LoadingSpinner from "@/components/common/ui/LoadingSpinner";
import type { ExtremeHeatSeriesStatus } from "@/hooks/use-extreme-heat-series";
import { formatThresholdLabel } from "@/lib/extreme-heat-days/format";
import {
  type ExtremeHeatSeries,
  hasRenderableSeries,
  valuesForThreshold,
} from "@/lib/extreme-heat-days/series";

import BarChart from "./BarChart";

import styles from "./ChartView.module.scss";

export interface ChartViewProps {
  /**  Owned by the parent so the chart and table views are consistently labeled. */
  title: string;
  /** Loaded series for the current county. `null` while loading/erroring/idle. */
  series: ExtremeHeatSeries | null;
  status: ExtremeHeatSeriesStatus;
  errorMessage: string | null;
  /** Re-trigger the data fetch; wired to the error-state "Retry" button. */
  onRetry: () => void;
  /** Current threshold selection; picks which CSV column to render. */
  threshold: string;
  /** County label for accessible chart description; falls back to `series.county`
   *  if present, but kept as a prop so loading/empty states can still name the
   *  selection. */
  county: string;
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
  threshold,
  county,
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

  const values = series ? valuesForThreshold(series, threshold) : null;
  const hasRenderableData = hasRenderableSeries(series, threshold);

  const showErrorAlert = status === "error";
  const showNoDataAlert = status === "success" && !hasRenderableData;
  const showSourceCitation = status === "success" && hasRenderableData;

  const thresholdLabel = formatThresholdLabel(threshold);
  const countyLabel = series?.county || county;

  return (
    <section
      id={id}
      className={styles.root}
      role="tabpanel"
      aria-labelledby={labelledBy}
      aria-busy={isLoading}
    >
      <div ref={chartContainerRef} className={styles.surface}>
        <div className={styles.titleBlock}>
          <h2 className={styles.title}>{title}</h2>
        </div>
        {hasRenderableData && series && values && (
          <BarChart
            globalWarmingLevels={series.globalWarmingLevels}
            values={values}
            thresholdLabel={thresholdLabel}
            county={countyLabel}
          />
        )}
        {isLoading && (
          <div className={styles.loadingState}>
            <LoadingSpinner label="Loading extreme heat days data" />
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
          We couldn&apos;t load extreme heat days data for {countyLabel} County. Check your
          connection and try again.
        </Alert>
      )}

      {showNoDataAlert && (
        <Alert severity="info" ariaLabel="No data available">
          No extreme heat days data is available for {countyLabel} County at {thresholdLabel}. Try a
          different county or threshold.
        </Alert>
      )}

      {showSourceCitation && (
        <p className={styles.sourceCitation}>TODO: Add source citation copy</p>
      )}
    </section>
  );
}
