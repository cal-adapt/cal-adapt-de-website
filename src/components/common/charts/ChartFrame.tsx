"use client";

import { type ReactNode, type RefObject, useEffect } from "react";

import Alert from "@/components/common/ui/Alert";
import Button from "@/components/common/ui/Button";
import LoadingSpinner from "@/components/common/ui/LoadingSpinner";
import type { StacSeriesStatus, UseStacSeriesResult } from "@/hooks/use-stac-series";

import styles from "./ChartFrame.module.scss";

const DEFAULT_SOURCE =
  "Source: Cal-Adapt. Data: WRF Downscaled CMIP6 Climate Projections (UCLA), WRF Derived Products (Cal-Adapt).";

/** Tool chart views derive their title, labels, and colors from `selections`. */
export interface StacChartViewProps<S, D> {
  selections: S;
  series: UseStacSeriesResult<D>;
  chartContainerRef?: RefObject<HTMLDivElement | null>;
  id?: string;
  labelledBy?: string;
}

export interface ChartFrameProps {
  status: StacSeriesStatus;
  /** When false, a successful load shows `noDataContent` instead of the chart. */
  hasData: boolean;
  errorMessage: string | null;
  onRetry: () => void;
  loadingLabel: string;
  errorContent: ReactNode;
  noDataContent: ReactNode;
  /** Shown under the chart, e.g. for partial data coverage. */
  warningContent?: ReactNode;
  source?: string;
  /** Chart downloads find the SVG with `querySelector("svg")` on this element. */
  chartContainerRef?: RefObject<HTMLDivElement | null>;
  id?: string;
  /** Tab id. When set, the frame renders as a `tabpanel`. */
  labelledBy?: string;
  ariaLabel?: string;
  children: ReactNode;
}

export default function ChartFrame({
  status,
  hasData,
  errorMessage,
  onRetry,
  loadingLabel,
  errorContent,
  noDataContent,
  warningContent,
  source = DEFAULT_SOURCE,
  chartContainerRef,
  id,
  labelledBy,
  ariaLabel,
  children,
}: ChartFrameProps) {
  const isLoading = status === "loading";
  const isSuccess = status === "success";

  useEffect(() => {
    if (status === "error" && errorMessage) {
      console.error("[chart] fetch failed:", errorMessage);
    }
  }, [status, errorMessage]);

  return (
    <section
      id={id}
      className={styles.root}
      role={labelledBy ? "tabpanel" : undefined}
      aria-labelledby={labelledBy}
      aria-label={ariaLabel}
      aria-busy={isLoading}
    >
      <div ref={chartContainerRef} className={styles.surface}>
        {isSuccess && hasData && children}
        {isLoading && (
          <div className={styles.loadingState}>
            <LoadingSpinner label={loadingLabel} />
          </div>
        )}
      </div>

      {status === "error" && (
        <Alert
          severity="error"
          action={
            <Button type="button" variant="primary" size="small" onClick={onRetry}>
              Retry
            </Button>
          }
        >
          {errorContent}
        </Alert>
      )}

      {isSuccess && !hasData && (
        <Alert severity="info" ariaLabel="No data available">
          {noDataContent}
        </Alert>
      )}

      {isSuccess && hasData && warningContent}

      {isSuccess && hasData && <p className={styles.source}>{source}</p>}
    </section>
  );
}
