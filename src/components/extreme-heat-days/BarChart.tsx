"use client";

import { useId, useMemo } from "react";

import { scaleBand, scaleLinear } from "d3";

import {
  colorForGlobalWarmingLevel,
  formatDaysPerYear,
  formatGlobalWarmingLevel,
} from "@/lib/extreme-heat-days/format";

import styles from "./BarChart.module.scss";

// The SVG scales to its container via `viewBox` + `preserveAspectRatio="xMidYMid meet"`
const VIEWBOX = { width: 800, height: 420 } as const;
const MARGIN = { top: 24, right: 24, bottom: 64, left: 72 } as const;
const PLOT = {
  width: VIEWBOX.width - MARGIN.left - MARGIN.right,
  height: VIEWBOX.height - MARGIN.top - MARGIN.bottom,
} as const;

const Y_AXIS_LABEL = "Number of Extreme Heat Days per Year";
const X_AXIS_LABEL = "Global Warming Level (°C)";

// Per spec, y-axis is 0–365 days in a year; therefore, bar heights are not rescaled.
const Y_AXIS_MAX_DAYS = 365;
const Y_TICK_COUNT = 5;

/**
 * Build the d3 scales + tick configuration for the chart. Memoized on the
 * global-warming-level domain so a re-render with the same data doesn't rebuild
 * scales unnecessarily.
 */
function useChartScales(globalWarmingLevels: readonly number[]) {
  return useMemo(() => {
    // Fixed domain — `nice()` would drift the upper bound off 365.
    const yScale = scaleLinear().domain([0, Y_AXIS_MAX_DAYS]).range([PLOT.height, 0]);

    const xScale = scaleBand<number>()
      .domain(globalWarmingLevels as number[])
      .range([0, PLOT.width])
      .padding(0.3);

    // d3 picks integer step sizes for [0, 365] (e.g. 0/100/200/300) and formats them
    return {
      xScale,
      yScale,
      yTicks: yScale.ticks(Y_TICK_COUNT),
      yTickFormat: yScale.tickFormat(Y_TICK_COUNT),
    };
  }, [globalWarmingLevels]);
}

export interface BarChartProps {
  globalWarmingLevels: number[];
  values: number[];
  thresholdLabel: string;
  county: string;
}

/**
 * Pure SVG bar chart; stateless and self-contained. `ChartView` owns loading/error/empty states.
 */
export default function BarChart({
  globalWarmingLevels,
  values,
  thresholdLabel,
  county,
}: BarChartProps) {
  const titleId = useId();
  const descId = useId();
  const { xScale, yScale, yTicks, yTickFormat } = useChartScales(globalWarmingLevels);

  const accessibleDescription =
    `Bar chart of extreme heat days per year for ${county} County across ` +
    `global warming levels of ${globalWarmingLevels.map(formatGlobalWarmingLevel).join(", ")}, ` +
    `where an extreme heat day reaches a maximum temperature of ${thresholdLabel} or higher. ` +
    `Values: ${globalWarmingLevels
      .map(
        (level, i) => `${formatGlobalWarmingLevel(level)} → ${formatDaysPerYear(values[i])} days`
      )
      .join("; ")}.`;

  return (
    <svg
      className={styles.chart}
      viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <title id={titleId}>Extreme heat days per year by global warming level</title>
      <desc id={descId}>{accessibleDescription}</desc>

      <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
        <YAxis ticks={yTicks} yScale={yScale} formatTick={yTickFormat} />
        <Bars
          globalWarmingLevels={globalWarmingLevels}
          values={values}
          xScale={xScale}
          yScale={yScale}
          thresholdLabel={thresholdLabel}
        />
        <XAxis globalWarmingLevels={globalWarmingLevels} xScale={xScale} />
      </g>

      <text
        className={styles.axisLabel}
        x={MARGIN.left + PLOT.width / 2}
        y={VIEWBOX.height - 12}
        textAnchor="middle"
      >
        {X_AXIS_LABEL}
      </text>
      <text
        className={styles.axisLabel}
        // Rotated label sits in the left gutter, vertically centered on the
        // plot area.
        transform={`translate(20, ${MARGIN.top + PLOT.height / 2}) rotate(-90)`}
        textAnchor="middle"
      >
        {Y_AXIS_LABEL}
      </text>
    </svg>
  );
}

interface YAxisProps {
  ticks: number[];
  yScale: ReturnType<typeof scaleLinear<number, number>>;
  formatTick: (tick: number) => string;
}

function YAxis({ ticks, yScale, formatTick }: YAxisProps) {
  return (
    <g aria-hidden="true">
      {ticks.map((tick) => {
        const y = yScale(tick);
        return (
          <g key={tick} transform={`translate(0, ${y})`}>
            <line className={styles.gridline} x1={0} x2={PLOT.width} y1={0} y2={0} />
            <text className={styles.tickLabel} x={-12} y={0} textAnchor="end" dy="0.32em">
              {formatTick(tick)}
            </text>
          </g>
        );
      })}
    </g>
  );
}

interface XAxisProps {
  globalWarmingLevels: readonly number[];
  xScale: ReturnType<typeof scaleBand<number>>;
}

function XAxis({ globalWarmingLevels, xScale }: XAxisProps) {
  const bandwidth = xScale.bandwidth();
  return (
    <g aria-hidden="true" transform={`translate(0, ${PLOT.height})`}>
      <line className={styles.axisLine} x1={0} x2={PLOT.width} y1={0} y2={0} />
      {globalWarmingLevels.map((level) => {
        const x = (xScale(level) ?? 0) + bandwidth / 2;
        return (
          <text key={level} className={styles.tickLabel} x={x} y={20} textAnchor="middle">
            {formatGlobalWarmingLevel(level)}
          </text>
        );
      })}
    </g>
  );
}

interface BarsProps {
  globalWarmingLevels: number[];
  values: number[];
  xScale: ReturnType<typeof scaleBand<number>>;
  yScale: ReturnType<typeof scaleLinear<number, number>>;
  thresholdLabel: string;
}

function Bars({ globalWarmingLevels, values, xScale, yScale, thresholdLabel }: BarsProps) {
  const bandwidth = xScale.bandwidth();
  return (
    <g>
      {globalWarmingLevels.map((level, i) => {
        const value = values[i];
        if (!Number.isFinite(value)) return null;
        const x = xScale(level) ?? 0;
        const y = yScale(value);
        const height = Math.max(0, PLOT.height - y);
        return (
          <rect
            key={level}
            className={styles.bar}
            x={x}
            y={y}
            width={bandwidth}
            height={height}
            fill={colorForGlobalWarmingLevel(level)}
          >
            <title>{`${formatGlobalWarmingLevel(level)}: ${formatDaysPerYear(value)} days ≥ ${thresholdLabel} per year`}</title>
          </rect>
        );
      })}
    </g>
  );
}
