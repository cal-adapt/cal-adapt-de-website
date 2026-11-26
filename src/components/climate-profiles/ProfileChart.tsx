"use client";

import { useId, useMemo, useState } from "react";

import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridRows } from "@visx/grid";
import { Group } from "@visx/group";
import { useParentSize } from "@visx/responsive";
import { scaleLinear } from "@visx/scale";
import { LinePath } from "@visx/shape";
import { getStringWidth, Text } from "@visx/text";

import { extent } from "d3";

import { formatHour, formatMonth, formatValue } from "@/lib/climate-profiles/format";
import { MONTH_LABELS } from "@/lib/climate-profiles/options";
import { hourOfYear, HOURS_PER_YEAR } from "@/lib/climate-profiles/profiles";

import styles from "./ProfileChart.module.scss";

// Title, subtitle and key are drawn inside the SVG so the PNG export includes them.
const TITLE_BAND = 52;
const TITLE_PADDING_X = 24;
const X_AXIS_HEIGHT = 32;
const KEY_HEIGHT = 28;
const MARGIN = {
  top: TITLE_BAND,
  right: 24,
  bottom: X_AXIS_HEIGHT + KEY_HEIGHT,
  left: 64,
} as const;
const Y_TICK_COUNT = 6;
const LINE_WIDTH = 0.75;
const SWATCH_WIDTH = 16;
const KEY_GAP = 20;
const KEY_TEXT_STYLE = { fontSize: "12px", fontWeight: 600 };
const MONTH_STARTS = MONTH_LABELS.map((_, i) => hourOfYear(i + 1, 1, 0));

export interface ChartSeries {
  id: string;
  label: string;
  color: string;
  /** 8760 hourly values, indexed by hour of year. Drawn in array order, so the last is on top. */
  values: number[];
}

export interface ProfileChartProps {
  series: ChartSeries[];
  units: string;
  yAxisLabel: string;
  title: string;
  subtitle: string;
}

export default function ProfileChart({
  series,
  units,
  yAxisLabel,
  title,
  subtitle,
}: ProfileChartProps) {
  const titleId = useId();
  const { parentRef, width, height } = useParentSize({ debounceTime: 0 });
  const [hoverHour, setHoverHour] = useState<number | null>(null);

  const plotWidth = Math.max(0, width - MARGIN.left - MARGIN.right);
  const plotHeight = Math.max(0, height - MARGIN.top - MARGIN.bottom);

  const { xScale, yScale } = useMemo(() => {
    const values = extent(series.flatMap((s) => s.values).filter(Number.isFinite)) as [
      number,
      number,
    ];
    return {
      xScale: scaleLinear<number>({ domain: [0, HOURS_PER_YEAR - 1], range: [0, plotWidth] }),
      yScale: scaleLinear<number>({
        domain: values[0] == null ? [0, 1] : values,
        range: [plotHeight, 0],
        nice: true,
      }),
    };
  }, [series, plotWidth, plotHeight]);

  const handlePointerMove = (event: React.PointerEvent<SVGRectElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const hour = Math.round(xScale.invert(event.clientX - rect.left));
    setHoverHour(Math.min(Math.max(hour, 0), HOURS_PER_YEAR - 1));
  };

  const hoverX = hoverHour != null ? xScale(hoverHour) : 0;
  // Left edge of each key item (swatch, gap, label, gap), centered under the plot.
  const keyOffsets = useMemo(() => {
    const widths = series.map(
      (s) => SWATCH_WIDTH + 6 + (getStringWidth(s.label, KEY_TEXT_STYLE) ?? 80) + KEY_GAP
    );
    const total = widths.reduce((sum, w) => sum + w, 0) - KEY_GAP;
    const start = Math.max(0, (plotWidth - total) / 2);
    return widths.map((_, i) => start + widths.slice(0, i).reduce((sum, w) => sum + w, 0));
  }, [series, plotWidth]);
  const keyY = plotHeight + X_AXIS_HEIGHT + KEY_HEIGHT / 2;

  return (
    <div className={styles.root}>
      <div ref={parentRef} className={styles.chartContainer}>
        {width > 0 && height > 0 && (
          <svg width={width} height={height} role="img" aria-labelledby={titleId}>
            <title id={titleId}>{`${title}. ${subtitle}`}</title>
            <Text
              className={styles.title}
              x={width / 2}
              y={18}
              width={Math.max(0, width - 2 * TITLE_PADDING_X)}
              textAnchor="middle"
              verticalAnchor="middle"
            >
              {title}
            </Text>
            <text className={styles.subtitle} x={width / 2} y={40} textAnchor="middle">
              {subtitle}
            </text>
            <Group left={MARGIN.left} top={MARGIN.top}>
              {series.map((s, i) => {
                return (
                  <g key={s.id} transform={`translate(${keyOffsets[i]}, ${keyY})`}>
                    <line x1={0} x2={SWATCH_WIDTH} stroke={s.color} strokeWidth={3} />
                    <text
                      className={styles.keyLabel}
                      x={SWATCH_WIDTH + 6}
                      dy="0.35em"
                      style={KEY_TEXT_STYLE}
                    >
                      {s.label}
                    </text>
                  </g>
                );
              })}

              <GridRows
                className={styles.grid}
                scale={yScale}
                width={plotWidth}
                numTicks={Y_TICK_COUNT}
              />
              <AxisLeft
                scale={yScale}
                numTicks={Y_TICK_COUNT}
                hideAxisLine
                hideTicks
                label={yAxisLabel}
                labelClassName={styles.axisLabel}
                labelOffset={36}
                tickLabelProps={() => ({
                  className: styles.tickLabel,
                  dx: -6,
                  dy: "0.32em",
                  textAnchor: "end",
                })}
              />
              <AxisBottom
                top={plotHeight}
                scale={xScale}
                tickValues={MONTH_STARTS}
                tickFormat={(h) => formatMonth(Number(h))}
                axisLineClassName={styles.axisLine}
                hideTicks
                tickLabelProps={() => ({
                  className: styles.tickLabel,
                  textAnchor: "start",
                  dy: "0.9em",
                })}
              />

              {series.map((s) => (
                <LinePath
                  key={s.id}
                  data={s.values}
                  x={(_, h) => xScale(h)}
                  y={(v) => yScale(v)}
                  defined={(v) => Number.isFinite(v)}
                  stroke={s.color}
                  strokeWidth={LINE_WIDTH}
                  className={styles.line}
                />
              ))}

              {hoverHour != null && (
                <line
                  className={styles.hoverGuide}
                  x1={hoverX}
                  x2={hoverX}
                  y1={0}
                  y2={plotHeight}
                />
              )}
              <rect
                width={plotWidth}
                height={plotHeight}
                fill="transparent"
                onPointerMove={handlePointerMove}
                onPointerLeave={() => setHoverHour(null)}
              />
            </Group>
          </svg>
        )}

        {hoverHour != null && (
          <div
            className={styles.tooltip}
            style={{
              top: MARGIN.top,
              left: MARGIN.left + hoverX,
              transform:
                hoverX > plotWidth / 2 ? "translateX(calc(-100% - 12px))" : "translateX(12px)",
            }}
          >
            <div className={styles.tooltipTitle}>{formatHour(hoverHour)}</div>
            {series.map((s) => (
              <div key={s.id} className={styles.tooltipRow}>
                <span className={styles.swatch} style={{ background: s.color }} aria-hidden />
                <span className={styles.tooltipLabel}>{s.label}</span>
                <span className={styles.tooltipValue}>
                  {formatValue(s.values[hoverHour] ?? NaN, units)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
