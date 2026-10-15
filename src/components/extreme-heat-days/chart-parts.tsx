// SVG pieces shared by the tool's charts, so every variable's chart has the
// same title block and global warming level axis.

import { getStringWidth, Text, useText } from "@visx/text";

import type { CSSProperties } from "react";

import {
  formatGlobalWarmingLevel,
  formatGlobalWarmingLevelName,
} from "@/lib/extreme-heat-days/format";

import styles from "./BarChart.module.scss";

const TITLE_TOP = 20;
const TITLE_LINE_HEIGHT = 22;
const SUBTITLE_GAP = 8;
const SUBTITLE_LINE_HEIGHT = 18;
const TITLE_BAND_BOTTOM = 8;
const TITLE_PADDING_X = 24;

export const X_AXIS_LABEL = "Global Warming Level (°C)";

// Should match CSS variable `--font-family-sans-serif`
const FONT_FAMILY = '"Inter", "Helvetica Neue", "Helvetica", "Arial", sans-serif';
const titleMeasureStyle: CSSProperties = { fontFamily: FONT_FAMILY, fontSize: 18, fontWeight: 600 };
const subtitleMeasureStyle: CSSProperties = {
  fontFamily: FONT_FAMILY,
  fontSize: 14,
  fontWeight: 400,
};
const tickMeasureStyle: CSSProperties = { fontFamily: FONT_FAMILY, fontSize: 12, fontWeight: 500 };
export const axisLabelMeasureStyle: CSSProperties = {
  fontFamily: FONT_FAMILY,
  fontSize: 13,
  fontWeight: 500,
};

export interface ChartHeadingLayout {
  /** Width the title and subtitle wrap within. */
  textWidth: number;
  subtitleTop: number;
  /** Height reserved at the top of the chart for the wrapped title and subtitle. */
  height: number;
}

/** Measures how the title and subtitle wrap at the chart's current width. */
export function useChartHeadingLayout(
  title: string,
  subtitle: string,
  width: number
): ChartHeadingLayout {
  const textWidth = Math.max(0, width - 2 * TITLE_PADDING_X);
  const titleLines = useText({ children: title, width: textWidth, style: titleMeasureStyle })
    .wordsByLines.length;
  const subtitleLines = useText({
    children: subtitle,
    width: textWidth,
    style: subtitleMeasureStyle,
  }).wordsByLines.length;
  const subtitleTop = TITLE_TOP + titleLines * TITLE_LINE_HEIGHT + SUBTITLE_GAP;
  const height = subtitleTop + subtitleLines * SUBTITLE_LINE_HEIGHT + TITLE_BAND_BOTTOM;
  return { textWidth, subtitleTop, height };
}

interface ChartHeadingProps {
  title: string;
  subtitle: string;
  /** Full chart width; the text is centered within it. */
  width: number;
  layout: ChartHeadingLayout;
}

/** Title and subtitle as SVG text, so they are included in PNG exports. */
export function ChartHeading({ title, subtitle, width, layout }: ChartHeadingProps) {
  return (
    <>
      <Text
        className={styles.chartTitle}
        x={width / 2}
        y={TITLE_TOP}
        width={layout.textWidth}
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
        y={layout.subtitleTop}
        width={layout.textWidth}
        lineHeight={SUBTITLE_LINE_HEIGHT}
        textAnchor="middle"
        verticalAnchor="start"
        style={subtitleMeasureStyle}
        aria-hidden="true"
      >
        {subtitle}
      </Text>
    </>
  );
}

export interface GlobalWarmingLevelTickFormat {
  label: (level: number) => string;
  /** Space below the plot needed for the tick labels and the x-axis title. */
  marginBottom: number;
}

const signedLevel = (level: number) => `+${formatGlobalWarmingLevel(level)}`;

// Longest first; charts use the first one whose words all fit under a column
const GLOBAL_WARMING_LEVEL_TICK_FORMATS: readonly GlobalWarmingLevelTickFormat[] = [
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

/** Picks the longest tick label format whose words each fit within `slotWidth`. */
export function pickGlobalWarmingLevelTickFormat(
  levels: readonly number[],
  slotWidth: number
): GlobalWarmingLevelTickFormat {
  return (
    GLOBAL_WARMING_LEVEL_TICK_FORMATS.find((format) =>
      levels.every((level) =>
        format
          .label(level)
          .split(" ")
          .every((word) => (getStringWidth(word, tickMeasureStyle) ?? 0) <= slotWidth)
      )
    ) ?? GLOBAL_WARMING_LEVEL_TICK_FORMATS[GLOBAL_WARMING_LEVEL_TICK_FORMATS.length - 1]
  );
}

interface GlobalWarmingLevelTickProps {
  level: number;
  /** Center of the tick's bar or column. */
  x: number;
  /** Top of the label. */
  y: number;
  /** Width the label wraps within. */
  width: number;
  /** Defaults to the longest format, e.g. "Mid-century (+2.0°C)". */
  format?: GlobalWarmingLevelTickFormat;
}

/** X-axis label for one warming level. */
export function GlobalWarmingLevelTick({
  level,
  x,
  y,
  width,
  format = GLOBAL_WARMING_LEVEL_TICK_FORMATS[0],
}: GlobalWarmingLevelTickProps) {
  return (
    <Text
      className={styles.tickLabel}
      x={x}
      y={y}
      width={width}
      textAnchor="middle"
      verticalAnchor="start"
      style={tickMeasureStyle}
      aria-hidden="true"
    >
      {format.label(level)}
    </Text>
  );
}
