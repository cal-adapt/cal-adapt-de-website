// MapLegend
// Renders a D3-based horizontal color legend for a climate raster map layer.
// Supports dynamic colormap interpolation (including reversed) and shows scale ticks.

"use client";

import React, { useEffect, useRef } from "react";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import * as d3 from "d3";
import * as d3Chromatic from "d3-scale-chromatic";

type MapLegendProps = {
  colormap: string;
  min: number;
  max: number;
  width?: number;
  height?: number;
  title?: string;
};

const LEGEND_MARGIN = { top: 20, right: 0, bottom: 20, left: 0 };
const LABEL_MARGIN = 40; // adjust this value to make more space for the tick text

export const MapLegend = ({
  colormap,
  min,
  max,
  width = 521, // adjust this value to make more space for the legend label
  height = 124,
  title,
}: MapLegendProps) => {
  // Normalize reversed colormap names
  const colormapName = colormap.endsWith("_r") ? colormap.slice(0, -2) : colormap;

  // Reference to the canvas element
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate actual drawing width and height
  const boundsWidth = width - LEGEND_MARGIN.right - LEGEND_MARGIN.left - 2 * LABEL_MARGIN;
  const boundsHeight = 24;

  // Create the x-scale for tick positioning
  const xScale = d3
    .scaleLinear()
    .range([LABEL_MARGIN, boundsWidth + LABEL_MARGIN])
    .domain([min, max]);

  // Colormap handling
  // Custom fallback for 'gist_heat' colormap
  const gistHeatInterpolator = d3
    .scaleSequential(
      d3.interpolateRgbBasis([
        "#FFFFFF", // White
        "#FFFF00", // Yellow
        "#FF4000", // Orange-red
        "#800000", // Dark red
        "#000000", // Black
      ])
    )
    .domain([0, 1]); // Normalize the input domain from 0 to 1

  let colorScale;

  // Handle fallback or reversed colormap
  if (colormapName == "gist_heat") {
    colorScale = d3.scaleSequential<string>().domain([min, max]).interpolator(gistHeatInterpolator);
  } else {
    const interpolatorKey = `interpolate${colormapName}` as keyof typeof d3Chromatic;
    let interpolator = (d3Chromatic[interpolatorKey] as (t: number) => string) || undefined;

    // Fallback to default colormap if invalid
    if (!interpolator) {
      console.error(`Interpolator for ${colormapName} not found in d3`);
      interpolator = d3.interpolateInferno; // Fallback to a default interpolator
    }

    // Reverse the interpolator manually if colormap ends with "_r"
    if (colormap.endsWith("_r")) {
      const originalInterpolator = interpolator;

      if (colormap == "PuOr_r") {
        interpolator = (t: number) => {
          return originalInterpolator(t);
        };
      } else {
        interpolator = (t: number) => {
          return originalInterpolator(1 - t);
        };
      }
    }

    colorScale = d3.scaleSequential<string>().domain([min, max]).interpolator(interpolator);
  }

  // Generate tick marks
  const ticks = [min, ...xScale.ticks(4), max];
  const allTicks = ticks.map((tick, idx) => {
    const isMin = tick === min;
    const isMax = tick === max;
    const tickLabel = isMin ? `Below ${tick}` : isMax ? `Above ${tick}` : `${tick}`;
    return (
      <React.Fragment key={`tick-${idx}`}>
        <line x1={xScale(tick)} x2={xScale(tick)} y1={0} y2={boundsHeight + 10} stroke="black" />
        <text x={xScale(tick)} y={boundsHeight + 20} fontSize={12} textAnchor="middle" dx={0}>
          {tickLabel}
        </text>
      </React.Fragment>
    );
  });

  // Effect: Draw color scale to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!context) return;

    for (let i = 0; i < boundsWidth; i++) {
      context.fillStyle = colorScale(min + (max - min) * (i / boundsWidth));
      context.fillRect(i + LABEL_MARGIN, 0, 1, boundsHeight);
    }
  }, [width, height, colorScale, min, max, boundsWidth, boundsHeight]);

  return (
    <Paper
      sx={{
        backgroundColor: "white",
        padding: 2,
        boxShadow: 0,
        borderRadius: 1,
        margin: "0 auto", // Center the Paper component
      }}
    >
      <Box style={{ position: "relative", display: "flex", justifyContent: "center" }}>
        <canvas
          ref={canvasRef}
          width={boundsWidth + 2 * LABEL_MARGIN}
          height={boundsHeight}
          aria-label={`Legend for ${title ?? "color scale"} from ${min} to ${max}`}
        />
        <svg
          width={boundsWidth + 2 * LABEL_MARGIN}
          height={boundsHeight + 30}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          {allTicks}
        </svg>
      </Box>
      <Typography variant="subtitle2" sx={{ mt: 3, textAlign: "center" }}>
        {title}
      </Typography>
    </Paper>
  );
};
