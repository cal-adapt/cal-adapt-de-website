"use client";

import { type ReactNode, type RefObject, useEffect } from "react";

import Alert from "@/components/common/ui/Alert";
import Button from "@/components/common/ui/Button";
import LoadingSpinner from "@/components/common/ui/LoadingSpinner";
import type { StacSeriesStatus } from "@/hooks/use-stac-series";

import styles from "./ChartFrame.module.scss";

const DEFAULT_SOURCE =
  "Source: Cal-Adapt. Data: WRF Downscaled CMIP6 Climate Projections (UCLA), WRF Derived Products (Cal-Adapt).";

export interface ChartFrameProps {
  status: StacSeriesStatus;
  /** True when the loaded series has enough data to plot `children`. */
  hasData: boolean;
  errorMessage: string | null;
  /** Re-trigger the data fetch; wired to the error-state "Retry" button. */
  onRetry: () => void;
  loadingLabel: string;
  /** Shown on fetch failure. */
  errorContent: ReactNode;
  /** Shown when the fetch succeeded but there is nothing to plot. */
  noDataContent: ReactNode;
  /** Optional caveat shown alongside a plotted chart (e.g. partial coverage). */
  warningContent?: ReactNode;
  source?: string;
  /** Attached to the chart container div so a Download button can locate the
   *  SVG via a single `querySelector("svg")`. */
  chartContainerRef?: RefObject<HTMLDivElement | null>;
  /** DOM id for ARIA tab/panel pairing. */
  id?: string;
  /** Tab id this panel is labeled by. Renders as a `tabpanel` only when set. */
  labelledBy?: string;
  ariaLabel?: string;
  /** The chart; rendered only when `hasData`. */
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
