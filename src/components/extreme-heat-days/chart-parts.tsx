// SVG pieces shared by the tool's charts, so every variable's chart has the
// same title block and global warming level axis.

import { Text } from "@visx/text";

import type { CSSProperties } from "react";

import {
  formatGlobalWarmingLevel,
  formatGlobalWarmingLevelName,
} from "@/lib/extreme-heat-days/format";

import styles from "./BarChart.module.scss";

/** Height reserved at the top of a chart for the title and subtitle. */
export const TITLE_BAND = 76;
const TITLE_Y = 26;
const SUBTITLE_Y = 54;
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

interface ChartHeadingProps {
  title: string;
  subtitle: string;
  /** Full chart width; the text is centered and wraps within it. */
  width: number;
}

/** Title and subtitle as SVG text, so they are included in PNG exports. */
export function ChartHeading({ title, subtitle, width }: ChartHeadingProps) {
  const textWidth = Math.max(0, width - 2 * TITLE_PADDING_X);
  return (
    <>
      <Text
        className={styles.chartTitle}
        x={width / 2}
        y={TITLE_Y}
        width={textWidth}
        textAnchor="middle"
        verticalAnchor="middle"
        style={titleMeasureStyle}
        aria-hidden="true"
      >
        {title}
      </Text>
      <Text
        className={styles.chartSubtitle}
        x={width / 2}
        y={SUBTITLE_Y}
        width={textWidth}
        textAnchor="middle"
        verticalAnchor="middle"
        style={subtitleMeasureStyle}
        aria-hidden="true"
      >
        {subtitle}
      </Text>
    </>
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
}

/** X-axis label for one warming level, e.g. "Mid-century (+2.0°C)". */
export function GlobalWarmingLevelTick({ level, x, y, width }: GlobalWarmingLevelTickProps) {
  const name = formatGlobalWarmingLevelName(level);
  const temp = `+${formatGlobalWarmingLevel(level)}`;
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
      {name ? `${name} (${temp})` : temp}
    </Text>
  );
}
