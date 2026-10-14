"use client";

import { type KeyboardEvent, memo, type MouseEvent, useId, useMemo, useState } from "react";

import { useParentSize } from "@visx/responsive";
import { Text } from "@visx/text";

import { interpolatePlasma } from "d3";

import {
  formatFrequencyPercent,
  formatGlobalWarmingLevel,
  formatNoLeapDate,
} from "@/lib/extreme-heat-days/format";
import { DAYS_IN_YEAR } from "@/lib/extreme-heat-days/season";

import { ChartHeading, GlobalWarmingLevelTick, TITLE_BAND, X_AXIS_LABEL } from "./chart-parts";

import chartStyles from "./BarChart.module.scss";
import styles from "./Heatmap.module.scss";

const MARGIN = { top: 24, right: 112, bottom: 78, left: 86 } as const;

const Y_AXIS_LABEL = "Day of Year";
const LEGEND_TITLE = "Years exceeding threshold (%)";
const MISSING_CUE = "Hatched = no data";

// The first day of every other month on the no-leap calendar, plus the last day.
const DAY_TICKS: readonly number[] = [1, 60, 121, 182, 244, 305, 365];

const PERCENT_MAX = 100;
const LEGEND_TICKS: readonly number[] = [0, 20, 40, 60, 80, 100];
const LEGEND_GAP = 20;
const LEGEND_WIDTH = 14;
// Plasma is not a straight line through RGB, so the legend needs enough stops
// to follow it.
const LEGEND_STOPS = 21;

const PAGE_STEP_DAYS = 30;

const X_TICK_OFFSET = 8;

/** Fixed 0-100% scale, so colors mean the same thing for every selection. */
function colorForPercent(value: number): string {
  return interpolatePlasma(Math.min(1, Math.max(0, value / PERCENT_MAX)));
}

/** Top edge of a day's row; day 1 sits at the bottom of the plot. */
function yForDay(dayOfYear: number, rowHeight: number): number {
  return (DAYS_IN_YEAR - dayOfYear) * rowHeight;
}

interface Column {
  x: number;
  width: number;
}

interface ActiveCell {
  levelIndex: number;
  dayOfYear: number;
}

interface CellsProps {
  columns: readonly Column[];
  frequencyPercent: readonly (readonly number[])[];
  missingFill: string;
  rowHeight: number;
}

/**
 * The colored cells. Consecutive days with the same value are drawn as one
 * rectangle, which looks identical and keeps the element count down. Memoized
 * so hovering doesn't redraw them.
 */
const Cells = memo(function Cells({
  columns,
  frequencyPercent,
  missingFill,
  rowHeight,
}: CellsProps) {
  return (
    <g className={styles.cells} aria-hidden="true">
      {columns.map((column, levelIndex) => {
        const days = frequencyPercent[levelIndex] ?? [];
        const rects = [];
        let runStart = 0;
        for (let i = 1; i <= days.length; i++) {
          const sameAsRunStart =
            i < days.length &&
            (days[i] === days[runStart] || isMissingPair(days[i], days[runStart]));
          if (sameAsRunStart) continue;
          const value = days[runStart];
          rects.push(
            <rect
              key={runStart}
              x={column.x}
              y={yForDay(i, rowHeight)}
              width={column.width}
              height={(i - runStart) * rowHeight}
              fill={Number.isFinite(value) ? colorForPercent(value) : missingFill}
            />
          );
          runStart = i;
        }
        return <g key={levelIndex}>{rects}</g>;
      })}
    </g>
  );
});

function isMissingPair(a: number, b: number): boolean {
  return !Number.isFinite(a) && !Number.isFinite(b);
}

export interface HeatmapProps {
  globalWarmingLevels: number[];
  /** Percent of years, as `frequencyPercent[levelIndex][dayOfYear - 1]`; NaN where missing. */
  frequencyPercent: number[][];
  /** Rendered as SVG text to include in PNG exports; also the chart's accessible name. */
  title: string;
  /** Rendered under the title (also exported), e.g. the statistic and threshold. */
  subtitle: string;
  /** Text alternative describing the selection and the broad seasonal pattern. */
  description: string;
}

export default function Heatmap({
  globalWarmingLevels,
  frequencyPercent,
  title,
  subtitle,
  description,
}: HeatmapProps) {
  const titleId = useId();
  const descId = useId();
  const announcementId = useId();
  // useId output isn't safe inside `url(#…)` references.
  const defsId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const gradientId = `ehs-legend-${defsId}`;
  const missingPatternId = `ehs-missing-${defsId}`;
  const { parentRef, width, height } = useParentSize({ debounceTime: 0 });
  const [activeCell, setActiveCell] = useState<ActiveCell | null>(null);

  const plotWidth = Math.max(0, width - MARGIN.left - MARGIN.right);
  // The chart shares the bar chart's box, so a day's row is usually under a
  // pixel tall.
  const plotHeight = Math.max(0, height - TITLE_BAND - MARGIN.top - MARGIN.bottom);
  const rowHeight = plotHeight / DAYS_IN_YEAR;
  const levelCount = globalWarmingLevels.length;

  // Whole-pixel column edges, so neighbouring columns meet without a seam.
  const columns = useMemo<Column[]>(() => {
    const edge = (i: number) => Math.round((i * plotWidth) / levelCount);
    return Array.from({ length: levelCount }, (_, i) => ({
      x: edge(i),
      width: edge(i + 1) - edge(i),
    }));
  }, [levelCount, plotWidth]);

  const hasMissing = useMemo(
    () => frequencyPercent.some((days) => days.some((v) => !Number.isFinite(v))),
    [frequencyPercent]
  );

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const { offsetX, offsetY } = event.nativeEvent;
    const levelIndex = columns.findIndex((column) => offsetX < column.x + column.width);
    const dayOfYear = DAYS_IN_YEAR - Math.floor(offsetY / rowHeight);
    if (levelIndex < 0 || dayOfYear < 1 || dayOfYear > DAYS_IN_YEAR) return;
    if (activeCell?.levelIndex === levelIndex && activeCell.dayOfYear === dayOfYear) return;
    setActiveCell({ levelIndex, dayOfYear });
  };

  // Left/right compares the same day across warming levels; up/down follows
  // the day of year (up is later, matching the axis).
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = activeCell ?? { levelIndex: 0, dayOfYear: 1 };
    const moves: Record<string, ActiveCell> = {
      ArrowLeft: { ...current, levelIndex: current.levelIndex - 1 },
      ArrowRight: { ...current, levelIndex: current.levelIndex + 1 },
      ArrowUp: { ...current, dayOfYear: current.dayOfYear + 1 },
      ArrowDown: { ...current, dayOfYear: current.dayOfYear - 1 },
      PageUp: { ...current, dayOfYear: current.dayOfYear + PAGE_STEP_DAYS },
      PageDown: { ...current, dayOfYear: current.dayOfYear - PAGE_STEP_DAYS },
      Home: { ...current, dayOfYear: 1 },
      End: { ...current, dayOfYear: DAYS_IN_YEAR },
    };
    const next = moves[event.key];
    if (!next) return;
    event.preventDefault();
    setActiveCell({
      levelIndex: Math.min(levelCount - 1, Math.max(0, next.levelIndex)),
      dayOfYear: Math.min(DAYS_IN_YEAR, Math.max(1, next.dayOfYear)),
    });
  };

  const active =
    activeCell && columns[activeCell.levelIndex]
      ? {
          column: columns[activeCell.levelIndex],
          y: yForDay(activeCell.dayOfYear, rowHeight),
          level: formatGlobalWarmingLevel(globalWarmingLevels[activeCell.levelIndex]),
          dayOfYear: activeCell.dayOfYear,
          date: formatNoLeapDate(activeCell.dayOfYear),
          value: frequencyPercent[activeCell.levelIndex]?.[activeCell.dayOfYear - 1] ?? NaN,
        }
      : null;

  const hasSize = width > 0 && plotHeight > 0 && levelCount > 0;
  const legendX = MARGIN.left + plotWidth + LEGEND_GAP;
  const plotTop = TITLE_BAND + MARGIN.top;

  return (
    <div ref={parentRef} className={chartStyles.chartContainer}>
      {hasSize && (
        <svg
          className={chartStyles.chart}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-labelledby={titleId}
          aria-describedby={descId}
        >
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>

          <defs>
            <linearGradient id={gradientId} x1="0" y1="1" x2="0" y2="0">
              {Array.from({ length: LEGEND_STOPS }, (_, i) => {
                const t = i / (LEGEND_STOPS - 1);
                return <stop key={i} offset={t} stopColor={interpolatePlasma(t)} />;
              })}
            </linearGradient>
            <pattern id={missingPatternId} width={6} height={6} patternUnits="userSpaceOnUse">
              <rect className={styles.missingBackground} width={6} height={6} />
              <path className={styles.missingHatch} d="M0 6 L6 0" />
            </pattern>
          </defs>

          <ChartHeading title={title} subtitle={subtitle} width={width} />

          <g transform={`translate(${MARGIN.left}, ${plotTop})`}>
            <Cells
              columns={columns}
              frequencyPercent={frequencyPercent}
              missingFill={`url(#${missingPatternId})`}
              rowHeight={rowHeight}
            />

            {DAY_TICKS.map((day) => (
              <text
                key={day}
                className={chartStyles.tickLabel}
                x={-12}
                y={yForDay(day, rowHeight) + rowHeight / 2}
                dy="0.32em"
                textAnchor="end"
                aria-hidden="true"
              >
                {day}
              </text>
            ))}

            {globalWarmingLevels.map((level, i) => (
              <GlobalWarmingLevelTick
                key={level}
                level={level}
                x={columns[i].x + columns[i].width / 2}
                y={plotHeight + X_TICK_OFFSET}
                width={columns[i].width}
              />
            ))}

            {active && (
              <g aria-hidden="true">
                <rect
                  className={styles.activeCellOuter}
                  x={active.column.x - 1.5}
                  y={active.y - 2.5}
                  width={active.column.width + 3}
                  height={rowHeight + 5}
                />
                <rect
                  className={styles.activeCellInner}
                  x={active.column.x - 0.5}
                  y={active.y - 1.5}
                  width={active.column.width + 1}
                  height={rowHeight + 3}
                />
              </g>
            )}
          </g>

          <g transform={`translate(${legendX}, ${plotTop})`} aria-hidden="true">
            <rect width={LEGEND_WIDTH} height={plotHeight} fill={`url(#${gradientId})`} />
            {LEGEND_TICKS.map((tick) => (
              <text
                key={tick}
                className={chartStyles.tickLabel}
                x={LEGEND_WIDTH + 6}
                y={plotHeight * (1 - tick / PERCENT_MAX)}
                dy="0.32em"
              >
                {tick}
              </text>
            ))}
          </g>
          <Text
            className={chartStyles.axisLabel}
            x={legendX + LEGEND_WIDTH + 48}
            y={plotTop + plotHeight / 2}
            angle={-90}
            textAnchor="middle"
            verticalAnchor="middle"
          >
            {LEGEND_TITLE}
          </Text>
          {hasMissing && (
            <Text
              className={chartStyles.tickLabel}
              x={width - 8}
              y={height - 8}
              textAnchor="end"
              verticalAnchor="end"
            >
              {MISSING_CUE}
            </Text>
          )}

          <Text
            className={chartStyles.axisLabel}
            x={MARGIN.left + plotWidth / 2}
            y={height - 8}
            textAnchor="middle"
            verticalAnchor="end"
          >
            {X_AXIS_LABEL}
          </Text>
          <Text
            className={chartStyles.axisLabel}
            x={20}
            y={plotTop + plotHeight / 2}
            angle={-90}
            textAnchor="middle"
            verticalAnchor="middle"
          >
            {Y_AXIS_LABEL}
          </Text>
        </svg>
      )}
      {hasSize && (
        // One focus stop for the whole grid; arrow keys move between cells.
        <div
          className={styles.cellGrid}
          style={{ left: MARGIN.left, top: plotTop, width: plotWidth, height: plotHeight }}
          role="application"
          tabIndex={0}
          aria-label={`${title}. Use the arrow keys to move between days and global warming levels.`}
          aria-describedby={announcementId}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setActiveCell(null)}
          onFocus={() => setActiveCell((cell) => cell ?? { levelIndex: 0, dayOfYear: 1 })}
          onBlur={() => setActiveCell(null)}
          onKeyDown={handleKeyDown}
        />
      )}
      <div id={announcementId} className="sr-only" aria-live="polite">
        {active &&
          `Global warming level ${active.level}, day ${active.dayOfYear}, ${active.date}: ` +
            (Number.isFinite(active.value)
              ? `threshold exceeded in ${formatFrequencyPercent(active.value)} of years`
              : "no data")}
      </div>
      {active && (
        <div
          className={`${chartStyles.tooltip} ${styles.tooltip}`}
          style={{
            left: MARGIN.left + active.column.x + active.column.width / 2,
            top: plotTop + active.y,
          }}
          role="presentation"
        >
          <span>
            {Number.isFinite(active.value)
              ? `${formatFrequencyPercent(active.value)} of years`
              : "No data"}
          </span>
          <span className={styles.tooltipDetail}>
            {active.date} (day {active.dayOfYear}) · +{active.level}
          </span>
        </div>
      )}
    </div>
  );
}
