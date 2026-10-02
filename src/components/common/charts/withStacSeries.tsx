"use client";

import type { ComponentType, RefObject } from "react";

import { type StacSeriesStatus, useStacSeries } from "@/hooks/use-stac-series";

/**
 * Props shared by every tool `ChartView` backed by a STAC series. Everything
 * the chart displays (title, labels, colors) is derived from `selections`
 * inside the view, so callers never re-derive it.
 */
export interface StacChartViewProps<S, D> {
  selections: S;
  /** Loaded series for `selections`. `null` while loading/erroring/idle. */
  series: D | null;
  status: StacSeriesStatus;
  errorMessage: string | null;
  onRetry: () => void;
  /** Attached to the chart container so a Download button can find the SVG. */
  chartContainerRef?: RefObject<HTMLDivElement | null>;
  /** DOM id for ARIA tab/panel pairing. */
  id?: string;
  /** Tab id this panel is labeled by. */
  labelledBy?: string;
}

export interface StacSeriesChartProps<S> {
  selections: S;
}

/**
 * Binds a tool `ChartView` to its series fetcher, yielding a self-loading
 * chart that takes only `selections`. Must be called from a client module.
 */
export function withStacSeries<S, D>(
  ChartView: ComponentType<StacChartViewProps<S, D>>,
  fetchSeries: (selections: S) => Promise<D>,
  seriesKey: (selections: S) => string
): ComponentType<StacSeriesChartProps<S>> {
  function StacSeriesChart({ selections }: StacSeriesChartProps<S>) {
    const series = useStacSeries(seriesKey(selections), () => fetchSeries(selections));

    return (
      <ChartView
        selections={selections}
        series={series.data}
        status={series.status}
        errorMessage={series.errorMessage}
        onRetry={series.retry}
      />
    );
  }

  StacSeriesChart.displayName = `withStacSeries(${ChartView.displayName ?? ChartView.name})`;
  return StacSeriesChart;
}
