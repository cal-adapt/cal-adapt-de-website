"use client";

import { type CSSProperties, useId, useMemo, useState } from "react";

import { AxisLeft } from "@visx/axis";
import { GridRows } from "@visx/grid";
import { Group } from "@visx/group";
import { useParentSize } from "@visx/responsive";
import { scaleBand, scaleLinear } from "@visx/scale";
import { BarRounded } from "@visx/shape";
import { getStringWidth, Text, useText } from "@visx/text";

import { motion, useReducedMotion } from "motion/react";

import {
  colorForGlobalWarmingLevel,
  formatDaysPerYear,
  formatGlobalWarmingLevel,
  formatGlobalWarmingLevelName,
} from "@/lib/extreme-heat-days/format";

import styles from "./BarChart.module.scss";

const TITLE_TOP = 20;
const TITLE_LINE_HEIGHT = 22;
const SUBTITLE_GAP = 8;
const SUBTITLE_LINE_HEIGHT = 18;
const TITLE_BAND_BOTTOM = 8;
const MARGIN = { top: 24, right: 24, left: 86 } as const;

const X_AXIS_LABEL = "Global Warming Level (°C)";

const Y_TICK_COUNT = 5;

const BAR_GROW_DURATION = 0.5;
const BAR_CORNER_RADIUS = 3;

const TITLE_PADDING_X = 24;
const X_TICK_OFFSET = 8;
const X_TICK_GAP = 6;

const signedLevel = (level: number) => `+${formatGlobalWarmingLevel(level)}`;

// Longest first; the chart uses the first one whose words all fit under a bar
const X_TICK_FORMATS: { label: (level: number) => string; marginBottom: number }[] = [
  {
    label: (level) => {
      const name = formatGlobalWarmingLevelName(level);
      return name ? `${name} (${signedLevel(level)})` : signedLevel(level);
    },
    marginBottom: 78,
  },
  { label: signedLevel, marginBottom: 52 },
  { label: formatGlobalWarmingLevel, marginBottom: 52 },
];

// Should match CSS variable `--font-family-sans-serif`
const FONT_FAMILY = '"Inter", "Helvetica Neue", "Helvetica", "Arial", sans-serif';
const titleMeasureStyle: CSSProperties = { fontFamily: FONT_FAMILY, fontSize: 18, fontWeight: 600 };
const subtitleMeasureStyle: CSSProperties = {
  fontFamily: FONT_FAMILY,
  fontSize: 14,
  fontWeight: 400,
};
const tickMeasureStyle: CSSProperties = { fontFamily: FONT_FAMILY, fontSize: 12, fontWeight: 500 };
const axisLabelMeasureStyle: CSSProperties = {
  fontFamily: FONT_FAMILY,
  fontSize: 13,
  fontWeight: 500,
};

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

  const textWidth = Math.max(0, width - 2 * TITLE_PADDING_X);
  const titleLines = useText({ children: title, width: textWidth, style: titleMeasureStyle })
    .wordsByLines.length;
  const subtitleLines = useText({
    children: subtitle,
    width: textWidth,
    style: subtitleMeasureStyle,
  }).wordsByLines.length;
  const subtitleTop = TITLE_TOP + titleLines * TITLE_LINE_HEIGHT + SUBTITLE_GAP;
  const titleBand = subtitleTop + subtitleLines * SUBTITLE_LINE_HEIGHT + TITLE_BAND_BOTTOM;

  const plotWidth = Math.max(0, width - MARGIN.left - MARGIN.right);
  const xScale = useMemo(
    () => scaleBand<number>({ domain: globalWarmingLevels, range: [0, plotWidth], padding: 0.3 }),
    [globalWarmingLevels, plotWidth]
  );
  const bandwidth = xScale.bandwidth();

  const tickSlotWidth = xScale.step() - X_TICK_GAP;
  const xTickFormat =
    X_TICK_FORMATS.find((format) =>
      globalWarmingLevels.every((level) =>
        format
          .label(level)
          .split(" ")
          .every((word) => (getStringWidth(word, tickMeasureStyle) ?? 0) <= tickSlotWidth)
      )
    ) ?? X_TICK_FORMATS[X_TICK_FORMATS.length - 1];

  const plotHeight = Math.max(0, height - titleBand - MARGIN.top - xTickFormat.marginBottom);
  const yScale = useMemo(
    () => scaleLinear<number>({ domain: [0, yAxisMax], range: [plotHeight, 0] }),
    [plotHeight, yAxisMax]
  );

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

          <Text
            className={styles.chartTitle}
            x={width / 2}
            y={TITLE_TOP}
            width={textWidth}
            lineHeight={TITLE_LINE_HEIGHT}
            textAnchor="middle"
            verticalAnchor="start"
            style={titleMeasureStyle}
            aria-hidden="true"
          >
            {title}
          </Text>
          <Text
            className={styles.chartSubtitle}
            x={width / 2}
            y={subtitleTop}
            width={textWidth}
            lineHeight={SUBTITLE_LINE_HEIGHT}
            textAnchor="middle"
            verticalAnchor="start"
            style={subtitleMeasureStyle}
            aria-hidden="true"
          >
            {subtitle}
          </Text>

          <Group left={MARGIN.left} top={titleBand + MARGIN.top}>
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
                  y: titleBand + MARGIN.top + y,
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
              <Text
                key={level}
                className={styles.tickLabel}
                x={(xScale(level) ?? 0) + bandwidth / 2}
                y={plotHeight + X_TICK_OFFSET}
                width={bandwidth}
                textAnchor="middle"
                verticalAnchor="start"
                style={tickMeasureStyle}
                aria-hidden="true"
              >
                {xTickFormat.label(level)}
              </Text>
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
            y={titleBand + MARGIN.top + plotHeight / 2}
            width={plotHeight}
            angle={-90}
            textAnchor="middle"
            verticalAnchor="middle"
            style={axisLabelMeasureStyle}
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
