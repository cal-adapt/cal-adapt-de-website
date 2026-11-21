"use client";

import { type CSSProperties, useId, useLayoutEffect, useMemo, useRef, useState } from "react";

import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridRows } from "@visx/grid";
import { Group } from "@visx/group";
import { useParentSize } from "@visx/responsive";
import { scaleLinear } from "@visx/scale";
import { Area, LinePath } from "@visx/shape";
import { getStringWidth, Text } from "@visx/text";

import { bisector } from "d3";

import { resolveYAxisMax, resolveYAxisMin } from "@/lib/annual-climate-projections/axis";
import { CHART_COLORS, formatValue } from "@/lib/annual-climate-projections/format";
import type { AnnualYearRow, ObservedYearRow } from "@/lib/annual-climate-projections/series";

import styles from "./LineChart.module.scss";

const TITLE_BAND = 52;
const MARGIN = { top: 16, right: 24, bottom: 56, left: 86 } as const;

const X_AXIS_LABEL = "Year";
const Y_TICK_COUNT = 5;
const X_TICK_COUNT = 8;
/** The data ends in 2099; the axis runs to 2100 so it ends on a round year. */
const AXIS_END_YEAR = 2100;

const TITLE_PADDING_X = 24;

// Should match CSS variable `--font-family-sans-serif`
const FONT_FAMILY = '"Inter", "Helvetica Neue", "Helvetica", "Arial", sans-serif';
const titleMeasureStyle: CSSProperties = { fontFamily: FONT_FAMILY, fontSize: 18, fontWeight: 600 };
const LEGEND_TEXT_STYLE = { fontFamily: FONT_FAMILY, fontSize: "12px", fontWeight: 600 };

// Legend lives in the SVG so it's included in the PNG export.
const LEGEND_SWATCH_WIDTH = 16;
const LEGEND_SWATCH_TEXT_GAP = 6;
const LEGEND_ITEM_GAP = 20;
const LEGEND_ROW_HEIGHT = 22;
const LEGEND_TOP_PADDING = 8;
const LEGEND_SWATCH_CENTER_Y = 6;

interface HoveredPoint {
  x: number;
  row: AnnualYearRow;
  observed: ObservedYearRow | null;
}

type LegendSwatchKind = "band" | "line";

interface LegendVisibility {
  range: boolean;
  mean: boolean;
  observed: boolean;
  simulations: boolean;
}

const INITIAL_LEGEND_VISIBILITY: LegendVisibility = {
  range: true,
  mean: true,
  observed: true,
  simulations: true,
};

interface LegendItemDef {
  key: keyof LegendVisibility;
  label: string;
  swatch: LegendSwatchKind;
  color: string;
  active: boolean;
}

interface LaidOutLegendItem extends LegendItemDef {
  x: number;
  width: number;
  row: number;
}

const bisectYear = bisector<AnnualYearRow, number>((d) => d.year).left;

export interface LineChartProps {
  rows: AnnualYearRow[];
  simulationNames: string[];
  observed: ObservedYearRow[];
  /** Draw a line per simulation (advanced view). */
  showSimulations: boolean;
  locationLabel: string;
  title: string;
  yAxisLabel: string;
  unit: string;
}

export default function LineChart({
  rows,
  simulationNames,
  observed,
  showSimulations,
  locationLabel,
  title,
  yAxisLabel,
  unit,
}: LineChartProps) {
  const titleId = useId();
  const descId = useId();
  const { parentRef, width, height } = useParentSize({ debounceTime: 0 });
  const [hovered, setHovered] = useState<HoveredPoint | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipWidth, setTooltipWidth] = useState(0);
  const [visibility, setVisibility] = useState<LegendVisibility>(INITIAL_LEGEND_VISIBILITY);
  const toggleVisibility = (key: keyof LegendVisibility) =>
    setVisibility((v) => ({ ...v, [key]: !v[key] }));

  const hasObserved = observed.length > 0;
  const minYear = rows.length > 0 ? Math.min(rows[0].year, observed[0]?.year ?? Infinity) : 1981;

  const observedByYear = useMemo(() => new Map(observed.map((row) => [row.year, row])), [observed]);

  const plotWidth = Math.max(0, width - MARGIN.left - MARGIN.right);

  const legendItemDefs: LegendItemDef[] = useMemo(() => {
    const items: LegendItemDef[] = [
      {
        key: "range",
        label: "Model range",
        swatch: "band",
        color: CHART_COLORS.range,
        active: visibility.range,
      },
      {
        key: "mean",
        label: "Model mean",
        swatch: "line",
        color: CHART_COLORS.mean,
        active: visibility.mean,
      },
    ];
    if (hasObserved) {
      items.push({
        key: "observed",
        label: "Observed",
        swatch: "line",
        color: CHART_COLORS.observed,
        active: visibility.observed,
      });
    }
    if (showSimulations) {
      items.push({
        key: "simulations",
        label: "Individual models",
        swatch: "line",
        color: CHART_COLORS.simulations,
        active: visibility.simulations,
      });
    }
    return items;
  }, [visibility, hasObserved, showSimulations]);

  // Greedy-wrap the legend items into rows that fit `plotWidth`, centering each row.
  const legendRows: LaidOutLegendItem[][] = useMemo(() => {
    const maxRowWidth = Math.max(plotWidth, 200);
    const laidOutRows: LaidOutLegendItem[][] = [];
    let currentRow: LaidOutLegendItem[] = [];
    let currentRowWidth = 0;
    for (const item of legendItemDefs) {
      const textWidth = getStringWidth(item.label, LEGEND_TEXT_STYLE) ?? item.label.length * 7;
      const itemWidth = LEGEND_SWATCH_WIDTH + LEGEND_SWATCH_TEXT_GAP + textWidth;
      const neededWidth =
        currentRow.length === 0 ? itemWidth : currentRowWidth + LEGEND_ITEM_GAP + itemWidth;
      if (currentRow.length > 0 && neededWidth > maxRowWidth) {
        laidOutRows.push(currentRow);
        currentRow = [];
        currentRowWidth = 0;
      }
      const x = currentRow.length === 0 ? 0 : currentRowWidth + LEGEND_ITEM_GAP;
      currentRow.push({ ...item, x, width: itemWidth, row: laidOutRows.length });
      currentRowWidth = x + itemWidth;
    }
    if (currentRow.length > 0) laidOutRows.push(currentRow);
    for (const row of laidOutRows) {
      const rowWidth = row.length > 0 ? row[row.length - 1].x + row[row.length - 1].width : 0;
      const offset = (maxRowWidth - rowWidth) / 2;
      for (const item of row) item.x += offset;
    }
    return laidOutRows;
  }, [legendItemDefs, plotWidth]);

  const legendHeight =
    legendRows.length > 0 ? LEGEND_TOP_PADDING + legendRows.length * LEGEND_ROW_HEIGHT : 0;

  const plotHeight = Math.max(0, height - TITLE_BAND - legendHeight - MARGIN.top - MARGIN.bottom);
  const legendTop = TITLE_BAND + MARGIN.top + plotHeight + MARGIN.bottom + LEGEND_TOP_PADDING;

  // Fixed axis domain from all the data, so toggling series doesn't rescale the chart.
  const allValues = useMemo(() => {
    const values: number[] = [];
    for (const r of rows) values.push(r.min, r.mean, r.max);
    for (const o of observed) values.push(o.value);
    return values;
  }, [rows, observed]);

  const { xScale, yScale } = useMemo(
    () => ({
      xScale: scaleLinear<number>({ domain: [minYear, AXIS_END_YEAR], range: [0, plotWidth] }),
      yScale: scaleLinear<number>({
        domain: [resolveYAxisMin(allValues), resolveYAxisMax(allValues)],
        range: [plotHeight, 0],
      }),
    }),
    [minYear, plotWidth, plotHeight, allValues]
  );

  const hasSize = width > 0 && height > 0;

  useLayoutEffect(() => {
    if (tooltipRef.current) setTooltipWidth(tooltipRef.current.offsetWidth);
  }, [hovered]);

  const tooltipLeft = hovered
    ? Math.max(0, Math.min(MARGIN.left + hovered.x - tooltipWidth / 2, width - tooltipWidth))
    : 0;

  const handlePointerMove = (event: React.PointerEvent<SVGRectElement>) => {
    if (rows.length === 0) return;
    const svgRect = event.currentTarget.getBoundingClientRect();
    const year = Math.round(xScale.invert(event.clientX - svgRect.left));
    const index = bisectYear(rows, year);
    const row = rows[Math.min(Math.max(index, 0), rows.length - 1)];
    if (!row) return;
    setHovered({ x: xScale(row.year), row, observed: observedByYear.get(row.year) ?? null });
  };

  const handleLegendKeyDown = (
    event: React.KeyboardEvent<SVGGElement>,
    key: keyof LegendVisibility
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleVisibility(key);
    }
  };

  const lastYear = rows.length > 0 ? rows[rows.length - 1].year : AXIS_END_YEAR;
  const accessibleDescription =
    `Line chart of ${title.toLowerCase()} from ${minYear} to ${lastYear}, with the model mean ` +
    `and model range` +
    (hasObserved
      ? `, and observed values from ${observed[0].year} to ${observed[observed.length - 1].year}.`
      : ".");

  const xOf = (d: { year: number }) => xScale(d.year);

  return (
    <div ref={parentRef} className={styles.chartContainer}>
      {hasSize && (
        <>
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
              y={TITLE_BAND / 2}
              width={Math.max(0, width - 2 * TITLE_PADDING_X)}
              textAnchor="middle"
              verticalAnchor="middle"
              style={titleMeasureStyle}
              aria-hidden="true"
            >
              {title}
            </Text>

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
              <AxisBottom
                top={plotHeight}
                scale={xScale}
                numTicks={X_TICK_COUNT}
                tickFormat={(value) => String(value)}
                axisLineClassName={styles.axisLine}
                tickLength={0}
                hideTicks
                tickLabelProps={() => ({
                  className: styles.tickLabel,
                  textAnchor: "middle",
                  dy: "0.9em",
                })}
              />

              {visibility.range && (
                <Area
                  data={rows}
                  x={xOf}
                  y0={(d) => yScale(d.min)}
                  y1={(d) => yScale(d.max)}
                  fill={CHART_COLORS.range}
                  className={styles.envelope}
                  defined={(d) => Number.isFinite(d.min) && Number.isFinite(d.max)}
                />
              )}
              {showSimulations &&
                visibility.simulations &&
                simulationNames.map((name) => (
                  <LinePath
                    key={name}
                    data={rows}
                    x={xOf}
                    y={(d) => yScale(d.simulations[name])}
                    stroke={CHART_COLORS.simulations}
                    className={styles.lineSimulation}
                    defined={(d) => Number.isFinite(d.simulations[name])}
                  />
                ))}
              {visibility.mean && (
                <LinePath
                  data={rows}
                  x={xOf}
                  y={(d) => yScale(d.mean)}
                  stroke={CHART_COLORS.mean}
                  className={styles.line}
                  defined={(d) => Number.isFinite(d.mean)}
                />
              )}
              {hasObserved && visibility.observed && (
                <LinePath
                  data={observed}
                  x={xOf}
                  y={(d) => yScale(d.value)}
                  stroke={CHART_COLORS.observed}
                  className={styles.lineObserved}
                  defined={(d) => Number.isFinite(d.value)}
                />
              )}

              {hovered && (
                <line
                  className={styles.hoverGuide}
                  x1={hovered.x}
                  x2={hovered.x}
                  y1={0}
                  y2={plotHeight}
                  aria-hidden="true"
                />
              )}

              <rect
                x={0}
                y={0}
                width={plotWidth}
                height={plotHeight}
                fill="transparent"
                className={styles.hoverTarget}
                onPointerDown={handlePointerMove}
                onPointerMove={handlePointerMove}
                // Touch keeps the tooltip after lifting the finger, so it can be read
                onPointerLeave={(event) => {
                  if (event.pointerType === "mouse") setHovered(null);
                }}
                onPointerCancel={() => setHovered(null)}
              />
            </Group>

            <Text
              className={styles.axisLabel}
              x={MARGIN.left + plotWidth / 2}
              y={TITLE_BAND + MARGIN.top + plotHeight + MARGIN.bottom - 6}
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

            <g role="group" aria-label="Series visibility">
              {legendRows.map((row) =>
                row.map((item) => (
                  <g
                    key={item.key}
                    className={styles.legendGroup}
                    transform={`translate(${MARGIN.left + item.x}, ${legendTop + item.row * LEGEND_ROW_HEIGHT})`}
                    role="button"
                    tabIndex={0}
                    aria-pressed={item.active}
                    aria-label={item.label}
                    onClick={() => toggleVisibility(item.key)}
                    onKeyDown={(e) => handleLegendKeyDown(e, item.key)}
                  >
                    <LegendSwatch kind={item.swatch} color={item.color} />
                    <text
                      className={styles.legendLabel}
                      data-active={item.active}
                      x={LEGEND_SWATCH_WIDTH + LEGEND_SWATCH_TEXT_GAP}
                      y={LEGEND_SWATCH_CENTER_Y}
                      dy="0.32em"
                    >
                      {item.label}
                    </text>
                  </g>
                ))
              )}
            </g>
          </svg>

          {hovered && (
            <div
              ref={tooltipRef}
              className={styles.tooltip}
              style={{ left: tooltipLeft, top: TITLE_BAND + MARGIN.top }}
              role="presentation"
            >
              <div className={styles.tooltipYear}>{hovered.row.year}</div>
              <div className={styles.tooltipLocation}>{locationLabel}</div>
              <div className={styles.tooltipRow}>
                <span
                  className={styles.tooltipSwatch}
                  style={{ backgroundColor: CHART_COLORS.mean }}
                  aria-hidden="true"
                />
                <span className={styles.tooltipLabel}>Models</span>
                <span className={styles.tooltipValues}>
                  mean {formatValue(hovered.row.mean, unit)} · min{" "}
                  {formatValue(hovered.row.min, unit)} · max {formatValue(hovered.row.max, unit)}
                </span>
              </div>
              {hovered.observed && (
                <div className={styles.tooltipRow}>
                  <span
                    className={styles.tooltipSwatch}
                    style={{ backgroundColor: CHART_COLORS.observed }}
                    aria-hidden="true"
                  />
                  <span className={styles.tooltipLabel}>Observed</span>
                  <span className={styles.tooltipValues}>
                    {formatValue(hovered.observed.value, unit)}
                  </span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function LegendSwatch({ kind, color }: { kind: LegendSwatchKind; color: string }) {
  if (kind === "band") {
    return (
      <rect
        className={styles.legendSwatchBand}
        x={0}
        y={0}
        width={LEGEND_SWATCH_WIDTH}
        height={12}
        fill={color}
      />
    );
  }
  return (
    <line
      className={styles.legendSwatchLine}
      x1={0}
      x2={LEGEND_SWATCH_WIDTH}
      y1={LEGEND_SWATCH_CENTER_Y}
      y2={LEGEND_SWATCH_CENTER_Y}
      stroke={color}
    />
  );
}
