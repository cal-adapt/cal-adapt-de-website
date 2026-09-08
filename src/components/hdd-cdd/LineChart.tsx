"use client";

import { type CSSProperties, useId, useMemo, useState } from "react";

import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridRows } from "@visx/grid";
import { Group } from "@visx/group";
import { useParentSize } from "@visx/responsive";
import { scaleLinear } from "@visx/scale";
import { Area, LinePath } from "@visx/shape";
import { getStringWidth, Text } from "@visx/text";

import { bisector } from "d3";

import { resolveYAxisMax } from "@/lib/hdd-cdd/axis";
import { formatDegreeDays, HISTORICAL_COLOR } from "@/lib/hdd-cdd/format";
import { getMetric } from "@/lib/hdd-cdd/options";
import {
  type HddCddYearRow,
  historicalRows,
  LAST_HISTORICAL_YEAR,
  scenarioRows,
} from "@/lib/hdd-cdd/series";

import styles from "./LineChart.module.scss";

const TITLE_BAND = 52;
const MARGIN = { top: 16, right: 24, bottom: 56, left: 86 } as const;

const X_AXIS_LABEL = "Year";
const Y_TICK_COUNT = 5;
const X_TICK_COUNT = 8;

const TITLE_PADDING_X = 24;

// Should match CSS variable `--font-family-sans-serif`
const FONT_FAMILY = '"Inter", "Helvetica Neue", "Helvetica", "Arial", sans-serif';
const titleMeasureStyle: CSSProperties = { fontFamily: FONT_FAMILY, fontSize: 18, fontWeight: 600 };
const LEGEND_TEXT_STYLE = { fontFamily: FONT_FAMILY, fontSize: "12px", fontWeight: 600 };

// Legend layout constants (all in SVG so it's included in PNG export, unlike
// an HTML overlay which `exportSvgAsPng` -- which only grabs the <svg>
// element -- would silently drop).
const LEGEND_SWATCH_WIDTH = 16;
const LEGEND_SWATCH_TEXT_GAP = 6;
const LEGEND_ITEM_GAP = 20;
const LEGEND_ROW_HEIGHT = 22;
const LEGEND_TOP_PADDING = 8;
// Vertical center of a legend row's swatch (half the band swatch height) --
// the text label is centered on this same line so swatch and label align.
const LEGEND_SWATCH_CENTER_Y = 6;

interface HoveredPoint {
  x: number;
  year: number;
  historical: HddCddYearRow | null;
  scenario: HddCddYearRow | null;
}

type LegendSwatchKind = "band" | "line" | "dashed";

interface LegendVisibility {
  histRange: boolean;
  histMean: boolean;
  scenarioRange: boolean;
  scenarioMean: boolean;
  baseline: boolean;
}

const INITIAL_LEGEND_VISIBILITY: LegendVisibility = {
  histRange: true,
  histMean: true,
  scenarioRange: true,
  scenarioMean: true,
  baseline: true,
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

type LinearScale = ReturnType<typeof scaleLinear<number>>;

const bisectYear = bisector<HddCddYearRow, number>((d) => d.year).left;

export interface LineChartProps {
  rows: HddCddYearRow[];
  metric: string;
  locationLabel: string;
  title: string;
  scenarioLabel: string;
  scenarioColor: string;
}

export default function LineChart({
  rows,
  metric,
  locationLabel,
  title,
  scenarioLabel,
  scenarioColor,
}: LineChartProps) {
  const titleId = useId();
  const descId = useId();
  const { parentRef, width, height } = useParentSize({ debounceTime: 0 });
  const [hovered, setHovered] = useState<HoveredPoint | null>(null);
  // Each legend row toggles only its own artist -- independent of the others.
  const [visibility, setVisibility] = useState<LegendVisibility>(INITIAL_LEGEND_VISIBILITY);
  const toggleVisibility = (key: keyof LegendVisibility) =>
    setVisibility((v) => ({ ...v, [key]: !v[key] }));

  const metricConfig = getMetric(metric);
  const meanKey = metric === "hdd" ? "hddMean" : "cddMean";
  const minKey = metric === "hdd" ? "hddMin" : "cddMin";
  const maxKey = metric === "hdd" ? "hddMax" : "cddMax";

  const historical = useMemo(() => historicalRows(rows), [rows]);
  const scenario = useMemo(() => scenarioRows(rows), [rows]);

  const { minYear, maxYear } = useMemo(() => {
    if (rows.length === 0) return { minYear: 1981, maxYear: 2099 };
    const years = rows.map((r) => r.year);
    return { minYear: Math.min(...years), maxYear: Math.max(...years) };
  }, [rows]);

  // Flat reference line: the average of the historical annual means
  // (1981-LAST_HISTORICAL_YEAR), drawn across the full chart so the
  // historical baseline can be compared against future years at a glance.
  const historicalMeanBaseline = useMemo(() => {
    const finiteMeans = historical.map((r) => r[meanKey]).filter(Number.isFinite);
    if (finiteMeans.length === 0) return null;
    return finiteMeans.reduce((sum, v) => sum + v, 0) / finiteMeans.length;
  }, [historical, meanKey]);

  const plotWidth = Math.max(0, width - MARGIN.left - MARGIN.right);

  const legendItemDefs: LegendItemDef[] = useMemo(
    () => [
      {
        key: "histRange",
        label: "Historical model range",
        swatch: "band",
        color: HISTORICAL_COLOR,
        active: visibility.histRange,
      },
      {
        key: "histMean",
        label: "Historical mean",
        swatch: "line",
        color: HISTORICAL_COLOR,
        active: visibility.histMean,
      },
      {
        key: "scenarioRange",
        label: `${scenarioLabel} model range`,
        swatch: "band",
        color: scenarioColor,
        active: visibility.scenarioRange,
      },
      {
        key: "scenarioMean",
        label: `${scenarioLabel} multi-model mean`,
        swatch: "line",
        color: scenarioColor,
        active: visibility.scenarioMean,
      },
      {
        key: "baseline",
        label: `Historical mean (${minYear}-${LAST_HISTORICAL_YEAR})`,
        swatch: "dashed",
        color: "#000000",
        active: visibility.baseline,
      },
    ],
    [visibility, scenarioLabel, scenarioColor, minYear]
  );

  // Greedy-wrap the legend items into rows that fit `plotWidth`, centering
  // each row. `getStringWidth` is memoized by @visx/text itself.
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
    // Center each row within maxRowWidth.
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

  // Fixed axis domain from the full dataset, independent of which legend
  // items are currently toggled on -- so toggling series on/off doesn't
  // rescale the chart, making it easier to compare what's being shown/hidden.
  const allValues = useMemo(() => {
    const values: number[] = [];
    for (const r of rows) {
      values.push(r[maxKey], r[meanKey]);
    }
    if (historicalMeanBaseline !== null) {
      values.push(historicalMeanBaseline);
    }
    return values;
  }, [rows, maxKey, meanKey, historicalMeanBaseline]);

  const { xScale, yScale } = useMemo(() => {
    return {
      xScale: scaleLinear<number>({ domain: [minYear, maxYear], range: [0, plotWidth] }),
      yScale: scaleLinear<number>({
        domain: [0, resolveYAxisMax(allValues)],
        range: [plotHeight, 0],
      }),
    };
  }, [minYear, maxYear, plotWidth, plotHeight, allValues]);

  const hasSize = width > 0 && height > 0;

  const handleMouseMove = (event: React.MouseEvent<SVGRectElement>) => {
    if (rows.length === 0) return;
    const svgRect = event.currentTarget.getBoundingClientRect();
    const localX = event.clientX - svgRect.left;
    const year = xScale.invert(localX);
    const index = bisectYear(rows, year);
    const row = rows[Math.min(Math.max(index, 0), rows.length - 1)];
    if (!row) return;

    setHovered({
      x: xScale(row.year),
      year: row.year,
      historical: row.year <= LAST_HISTORICAL_YEAR ? row : null,
      scenario: row.year > LAST_HISTORICAL_YEAR ? row : null,
    });
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

  const accessibleDescription =
    `Line chart of annual ${metricConfig.accessibleNoun} for ${locationLabel} from ${minYear} to ${maxYear}, ` +
    `with a historical mean and range through ${LAST_HISTORICAL_YEAR}, a ${scenarioLabel} projected mean ` +
    `and model range from ${LAST_HISTORICAL_YEAR + 1} onward, and a dashed reference line for the ` +
    `historical average.`;

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

              {visibility.histRange && (
                <Envelope
                  data={historical}
                  xScale={xScale}
                  yScale={yScale}
                  minKey={minKey}
                  maxKey={maxKey}
                  className={styles.envelopeHistorical}
                />
              )}
              {visibility.histMean && (
                <MeanLine
                  data={historical}
                  xScale={xScale}
                  yScale={yScale}
                  meanKey={meanKey}
                  className={styles.lineHistorical}
                />
              )}
              {visibility.baseline && historicalMeanBaseline !== null && (
                <line
                  className={styles.historicalBaseline}
                  x1={0}
                  x2={plotWidth}
                  y1={yScale(historicalMeanBaseline)}
                  y2={yScale(historicalMeanBaseline)}
                />
              )}

              {visibility.scenarioRange && (
                <Envelope
                  data={scenario}
                  xScale={xScale}
                  yScale={yScale}
                  minKey={minKey}
                  maxKey={maxKey}
                  className={styles.envelopeScenario}
                  fill={scenarioColor}
                />
              )}
              {visibility.scenarioMean && (
                <MeanLine
                  data={scenario}
                  xScale={xScale}
                  yScale={yScale}
                  meanKey={meanKey}
                  className={styles.lineScenario}
                  stroke={scenarioColor}
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
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHovered(null)}
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
              {metricConfig.yAxisLabel}
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

          {hovered && (hovered.historical || hovered.scenario) && (
            <div
              className={styles.tooltip}
              style={{ left: MARGIN.left + hovered.x, top: TITLE_BAND + MARGIN.top }}
              role="presentation"
            >
              <div className={styles.tooltipYear}>{hovered.year}</div>
              <div className={styles.tooltipLocation}>{locationLabel}</div>
              {hovered.historical && (
                <TooltipRow
                  label="Historical"
                  color={HISTORICAL_COLOR}
                  row={hovered.historical}
                  meanKey={meanKey}
                  minKey={minKey}
                  maxKey={maxKey}
                />
              )}
              {hovered.scenario && (
                <TooltipRow
                  label={scenarioLabel}
                  color={scenarioColor}
                  row={hovered.scenario}
                  meanKey={meanKey}
                  minKey={minKey}
                  maxKey={maxKey}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface EnvelopeProps {
  data: HddCddYearRow[];
  xScale: LinearScale;
  yScale: LinearScale;
  minKey: "hddMin" | "cddMin";
  maxKey: "hddMax" | "cddMax";
  className: string;
  fill?: string;
}

function Envelope({ data, xScale, yScale, minKey, maxKey, className, fill }: EnvelopeProps) {
  if (data.length === 0) return null;
  return (
    <Area
      data={data}
      x={(d) => xScale(d.year)}
      y0={(d) => yScale(d[minKey])}
      y1={(d) => yScale(d[maxKey])}
      fill={fill}
      className={className}
      defined={(d) => Number.isFinite(d[minKey]) && Number.isFinite(d[maxKey])}
    />
  );
}

interface MeanLineProps {
  data: HddCddYearRow[];
  xScale: LinearScale;
  yScale: LinearScale;
  meanKey: "hddMean" | "cddMean";
  className: string;
  stroke?: string;
}

function MeanLine({ data, xScale, yScale, meanKey, className, stroke }: MeanLineProps) {
  if (data.length === 0) return null;
  return (
    <LinePath
      data={data}
      x={(d) => xScale(d.year)}
      y={(d) => yScale(d[meanKey])}
      stroke={stroke}
      className={className}
      defined={(d) => Number.isFinite(d[meanKey])}
    />
  );
}

interface LegendSwatchProps {
  kind: LegendSwatchKind;
  color: string;
}

function LegendSwatch({ kind, color }: LegendSwatchProps) {
  switch (kind) {
    case "band":
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
    case "line":
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
    case "dashed":
      return (
        <line
          className={styles.legendSwatchDashed}
          x1={0}
          x2={LEGEND_SWATCH_WIDTH}
          y1={LEGEND_SWATCH_CENTER_Y}
          y2={LEGEND_SWATCH_CENTER_Y}
        />
      );
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

interface TooltipRowProps {
  label: string;
  color: string;
  row: HddCddYearRow;
  meanKey: "hddMean" | "cddMean";
  minKey: "hddMin" | "cddMin";
  maxKey: "hddMax" | "cddMax";
}

function TooltipRow({ label, color, row, meanKey, minKey, maxKey }: TooltipRowProps) {
  return (
    <div className={styles.tooltipRow}>
      <span
        className={styles.tooltipSwatch}
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      <span className={styles.tooltipLabel}>{label}</span>
      <span className={styles.tooltipValues}>
        mean {formatDegreeDays(row[meanKey])} · min {formatDegreeDays(row[minKey])} · max{" "}
        {formatDegreeDays(row[maxKey])}
      </span>
    </div>
  );
}
