"use client";

import { useId, useMemo, useState } from "react";

import { AxisLeft } from "@visx/axis";
import { GridRows } from "@visx/grid";
import { Group } from "@visx/group";
import { useParentSize } from "@visx/responsive";
import { scaleBand, scaleLinear } from "@visx/scale";
import { BarRounded } from "@visx/shape";
import { Text } from "@visx/text";

import { motion, useReducedMotion } from "motion/react";

import {
  colorForGlobalWarmingLevel,
  formatDaysPerYear,
  formatGlobalWarmingLevel,
} from "@/lib/extreme-heat-days/format";

import { ChartHeading, GlobalWarmingLevelTick, TITLE_BAND, X_AXIS_LABEL } from "./chart-parts";

import styles from "./BarChart.module.scss";

const MARGIN = { top: 24, right: 24, bottom: 78, left: 86 } as const;

const Y_TICK_COUNT = 5;

const BAR_GROW_DURATION = 0.5;
const BAR_CORNER_RADIUS = 3;

const X_TICK_OFFSET = 8;

interface HoveredBar {
  /** Center x of the bar. */
  x: number;
  /** Top y of the bar. */
  y: number;
  /** Tooltip text, e.g. "48.3 days". */
  label: string;
}

export interface BarChartProps {
  globalWarmingLevels: number[];
  values: number[];
  /** Rendered as SVG text to include in PNG exports; also the chart's accessible name. */
  title: string;
  /** Rendered under the title (also exported), e.g. the threshold and duration. */
  subtitle: string;
  /** Y-axis title */
  yAxisLabel: string;
  /** Y-axis domain max, already resolved by the caller (see resolveYAxisMax) */
  yAxisMax: number;
  /** Unit for bar values/tooltips */
  valueUnit: string;
}

export default function BarChart({
  globalWarmingLevels,
  values,
  title,
  subtitle,
  yAxisLabel,
  yAxisMax,
  valueUnit,
}: BarChartProps) {
  const titleId = useId();
  const descId = useId();
  const reduceMotion = useReducedMotion();
  const { parentRef, width, height } = useParentSize({ debounceTime: 0 });
  const [hoveredBar, setHoveredBar] = useState<HoveredBar | null>(null);

  const plotWidth = Math.max(0, width - MARGIN.left - MARGIN.right);
  const plotHeight = Math.max(0, height - TITLE_BAND - MARGIN.top - MARGIN.bottom);

  const { xScale, yScale } = useMemo(() => {
    return {
      yScale: scaleLinear<number>({ domain: [0, yAxisMax], range: [plotHeight, 0] }),
      xScale: scaleBand<number>({
        domain: globalWarmingLevels,
        range: [0, plotWidth],
        padding: 0.3,
      }),
    };
  }, [globalWarmingLevels, plotWidth, plotHeight, yAxisMax]);

  const bandwidth = xScale.bandwidth();

  // Re-grow bars only when the data changes: keying each bar by the values
  // remounts it on a threshold/location switch (replaying the grow) but leaves it
  // untouched on resize
  const valuesKey = values.join(",");

  const accessibleDescription =
    `Bar chart. ${subtitle}, by global warming level ` +
    `(${globalWarmingLevels.map(formatGlobalWarmingLevel).join(", ")}). ` +
    `Values: ${globalWarmingLevels
      .map(
        (level, i) =>
          `${formatGlobalWarmingLevel(level)} → ${formatDaysPerYear(values[i])} ${valueUnit}`
      )
      .join("; ")}.`;

  const hasSize = width > 0 && height > 0;

  return (
    <div ref={parentRef} className={styles.chartContainer}>
      {hasSize && (
        <svg
          className={styles.chart}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-labelledby={titleId}
          aria-describedby={descId}
        >
          <title id={titleId}>{title}</title>
          <desc id={descId}>{accessibleDescription}</desc>

          <ChartHeading title={title} subtitle={subtitle} width={width} />

          <Group left={MARGIN.left} top={TITLE_BAND + MARGIN.top}>
            <GridRows
              className={styles.grid}
              scale={yScale}
              width={plotWidth}
              numTicks={Y_TICK_COUNT}
            />
            <AxisLeft
              scale={yScale}
              numTicks={Y_TICK_COUNT}
              tickLength={0}
              hideAxisLine
              hideTicks
              tickLabelProps={() => ({
                className: styles.tickLabel,
                dx: -12,
                dy: "0.32em",
                textAnchor: "end",
              })}
            />

            {globalWarmingLevels.map((level, i) => {
              const value = values[i];
              if (!Number.isFinite(value)) return null;

              const x = xScale(level) ?? 0;
              const y = yScale(value);
              const barHeight = Math.max(0, plotHeight - y);
              const radius = Math.min(BAR_CORNER_RADIUS, bandwidth / 2, barHeight);
              const label = `${formatDaysPerYear(value)} ${valueUnit}`;
              // Offsets convert plot-group coords to the container-pixel coords
              // the tooltip overlay is positioned in
              const showTooltip = () =>
                setHoveredBar({
                  x: MARGIN.left + x + bandwidth / 2,
                  y: TITLE_BAND + MARGIN.top + y,
                  label,
                });
              const hideTooltip = () => setHoveredBar(null);

              return (
                <motion.g
                  key={`${level}-${valuesKey}`}
                  style={{ transformBox: "fill-box", originX: 0.5, originY: 1 }}
                  initial={reduceMotion ? false : { scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: reduceMotion ? 0 : BAR_GROW_DURATION, ease: "easeOut" }}
                  onMouseEnter={showTooltip}
                  onMouseLeave={hideTooltip}
                  onFocus={showTooltip}
                  onBlur={hideTooltip}
                  tabIndex={0}
                >
                  <BarRounded
                    className={styles.bar}
                    x={x}
                    y={y}
                    width={bandwidth}
                    height={barHeight}
                    radius={radius}
                    top
                    fill={colorForGlobalWarmingLevel(level)}
                  />
                </motion.g>
              );
            })}

            <line
              className={styles.axisLine}
              x1={0}
              x2={plotWidth}
              y1={plotHeight}
              y2={plotHeight}
              aria-hidden="true"
            />
            {globalWarmingLevels.map((level) => (
              <GlobalWarmingLevelTick
                key={level}
                level={level}
                x={(xScale(level) ?? 0) + bandwidth / 2}
                y={plotHeight + X_TICK_OFFSET}
                width={bandwidth}
              />
            ))}
          </Group>

          <Text
            className={styles.axisLabel}
            x={MARGIN.left + plotWidth / 2}
            y={height - 8}
            textAnchor="middle"
            verticalAnchor="end"
          >
            {X_AXIS_LABEL}
          </Text>
          <Text
            className={styles.axisLabel}
            x={20}
            y={TITLE_BAND + MARGIN.top + plotHeight / 2}
            angle={-90}
            textAnchor="middle"
            verticalAnchor="middle"
          >
            {yAxisLabel}
          </Text>
        </svg>
      )}
      {hoveredBar && (
        <div
          className={styles.tooltip}
          style={{ left: hoveredBar.x, top: hoveredBar.y }}
          role="presentation"
        >
          {hoveredBar.label}
        </div>
      )}
    </div>
  );
}
