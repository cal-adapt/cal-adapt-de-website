import React, { useMemo, useEffect } from "react";
import * as d3 from "d3";
import { InteractionData } from "./Heatmap";

const MARGIN = { top: 0, right: 15, bottom: 65, left: 115 };

import { lookupValue, monthsLookupTable } from "@/lib/lookup-tables";

type RendererProps = {
  width: number;
  height: number;
  data: any;
  gwlSelected: number;
  setHoveredCell: (hoveredCell: InteractionData | null) => void;
  colorScale: d3.ScaleSequential<string>;
};

export default function Renderer({
  width,
  height,
  data,
  setHoveredCell,
  colorScale,
  gwlSelected,
}: RendererProps) {
  // bounds = area inside the axis
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  // groups

  // all x values
  const allXGroups = useMemo(() => data.coords.year.data, [data]);

  // all y values
  const allYGroups = useMemo(() => data.coords.month.data, [data]);

  // values for each square
  //const flatData: number[] = data.data.flat()

  // generate flat heatmap data
  const dataArr = data.data[gwlSelected];

  const heatmapData = allYGroups.flatMap((month: number, yIdx: number) =>
    allXGroups.map((year: number, xIdx: number) => ({
      x: year,
      y: month,
      value: dataArr[yIdx][xIdx],
    })),
  );

  // scales
  const xScale = useMemo(() => {
    return d3
      .scaleBand<number>()
      .range([-15, boundsWidth])
      .domain(allXGroups)
      .padding(0.01);
  }, [boundsWidth, allXGroups]);

  const yScale = useMemo(() => {
    return d3
      .scaleBand<number>()
      .range([boundsHeight, 0])
      .domain(allYGroups)
      .padding(0.01);
  }, [boundsHeight, allYGroups]);

  // Create x-axis labels (for years)
  const xLabels = allXGroups.map((year: number, i: number) => {
    const xPos = xScale(year) ?? 0;

    if (
      (year && Number(year) % 5 == 0) ||
      Number(year) == 0 ||
      Number(year) == 14
    ) {
      return (
        <text
          key={i}
          x={xPos + xScale.bandwidth() / 2}
          y={boundsHeight + 30}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {year}
        </text>
      );
    }
  });

  // Create y-axis labels (for months)
  const yLabels = allYGroups.map((month: number, i: number) => {
    const yPos = yScale(month) ?? 0;

    return (
      <text
        key={i}
        x={-20}
        y={yPos + yScale.bandwidth() / 2}
        textAnchor="end"
        dominantBaseline="middle"
      >
        {lookupValue(month, monthsLookupTable)}
      </text>
    );
  });

  const allRects = heatmapData.map(
    (d: { x: number; y: number; value: number }, i: number) => {
      const x = xScale(d.x) ?? 0;
      const y = yScale(d.y) ?? 0;

      return (
        <rect
          key={i}
          x={x}
          y={y}
          width={xScale.bandwidth()}
          height={yScale.bandwidth()}
          fill={colorScale(d.value)}
          stroke="white"
          onMouseEnter={() => {
            setHoveredCell({
              xLabel: `${d.x}`,
              yLabel: lookupValue(String(d.y), monthsLookupTable) ?? "Unknown",
              xPos: x + xScale.bandwidth() / 2 + MARGIN.left,
              yPos: y + yScale.bandwidth() / 2 + MARGIN.top,
              value: Math.round(d.value * 100) / 100,
            });
          }}
          onMouseLeave={() => setHoveredCell(null)}
          cursor="pointer"
        />
      );
    },
  );

  return (
    <div className="heatmap">
      <svg width={width} height={height}>
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
        >
          {allRects}
          {xLabels.map((label: React.ReactElement<any> | null, i: number) =>
            label
              ? React.cloneElement(label, {
                y: boundsHeight + 60,
              })
              : null,
          )}
          <text
            x={boundsWidth / 2}
            y={boundsHeight + 30}
            textAnchor="middle"
            fontSize="1rem"
            fontWeight="bold"
          >
            Years from reaching GWL
          </text>
          {yLabels}
        </g>
      </svg>
    </div>
  );
}

