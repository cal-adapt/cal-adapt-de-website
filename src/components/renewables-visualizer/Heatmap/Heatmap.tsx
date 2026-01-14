"use client";

import { useState } from "react";

import * as d3 from "d3";

import { ColorLegend } from "./ColorLegend";
import MapTooltip from "./MapTooltip";
import Renderer from "./Renderer";

import styles from "./Heatmap.module.scss";

const colorSwitchLabel = {
  inputProps: { "aria-label": "Color Palette switch" },
};

const MARGIN = { top: 10, right: 10, bottom: 30, left: 30 };

type HeatmapProps = {
  width: number;
  height: number;
  data: any;
  currentColorMap: string;
  isColorRev: boolean;
  gwlSelected: number;
};

export type InteractionData = {
  xLabel: string;
  yLabel: string;
  xPos: number;
  yPos: number;
  value: number;
};

export default function Heatmap({
  width,
  height,
  data,
  currentColorMap,
  isColorRev,
  gwlSelected,
}: HeatmapProps) {
  // cell that is being hovered, for tooltips
  const [hoveredCell, setHoveredCell] = useState<InteractionData | null>(null);

  // Flatten data and filter out undefined values
  const flatData: number[] = data?.data[gwlSelected]
    .flat()
    .filter((d: number | undefined): d is number => d !== undefined);
  const min = (d3.min(flatData) as number | null) ?? 0;
  const max = (d3.max(flatData) as number | null) ?? 1;

  // TEMP: To try out different color maps

  const interpolatorKey =
    `interpolate${currentColorMap.charAt(0).toUpperCase() + currentColorMap.slice(1)}` as keyof typeof d3;
  const interpolator = (d3[interpolatorKey] as (t: number) => string) || d3.interpolateOranges;

  const colorScale = d3
    .scaleSequential<string>()
    .domain([min, max])
    .interpolator(isColorRev ? (t) => interpolator(1 - t) : interpolator);

  // Fallback to prevent colorScale errors**
  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ position: "relative" }}>
      <Renderer
        width={width}
        height={height}
        data={data}
        gwlSelected={gwlSelected}
        setHoveredCell={setHoveredCell}
        colorScale={colorScale}
      />
      <MapTooltip interactionData={hoveredCell} width={width} height={height} />
      <div className={styles.colorLegend} style={{ width: width }}>
        <ColorLegend width={405} height={100} colorScale={colorScale} min={min} max={max} />
      </div>
    </div>
  );
}
