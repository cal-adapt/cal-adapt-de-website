// MapLegend
// Renders a D3-based horizontal color legend for a climate raster map layer.
// Supports dynamic colormap interpolation (including reversed) and shows scale ticks.

"use client";

import * as d3 from "d3";

import { binColors, binEdges, buildColorScale } from "./colormap";

import styles from "./MapLegend.module.scss";

type MapLegendProps = {
  colormap: string;
  min: number;
  max: number;
  title?: string;
  /** Draw `bins` solid color steps instead of a smooth gradient. */
  bins?: number;
  /** Label only ticks at multiples of this value (other ticks are drawn
   *  shorter, without a label). Labels every tick when omitted. */
  labelStep?: number;
};

const LABEL_MARGIN = 40;
const BAR_HEIGHT = 24;
const BAR_WIDTH = 520;
const POINT_INSET = 10;
const NUM_GRADIENT_STOPS = 32;

export default function MapLegend({ colormap, min, max, title, bins, labelStep }: MapLegendProps) {
  const boundsWidth = BAR_WIDTH - 2 * LABEL_MARGIN;
  const totalWidth = boundsWidth + 2 * LABEL_MARGIN + 2 * POINT_INSET;

  const xScale = d3
    .scaleLinear()
    .range([LABEL_MARGIN, LABEL_MARGIN + boundsWidth])
    .domain([min, max]);

  // Tick step scales with the range so wide-ranging metrics (e.g. HDD/CDD,
  // in the thousands) don't cram dozens of ticks into one legend bar.
  let tickValues: number[];
  const valueRange = max - min;

  if (bins) {
    // Ticks on the bin edges, so each color step is labelled
    tickValues = binEdges(min, max, bins);
  } else if (min >= 0 && valueRange >= 100) {
    const step = d3.tickStep(min, max, 8);
    const start = Math.ceil(min / step) * step;
    const values: number[] = [];
    for (let v = start; v <= max; v += step) {
      values.push(v);
    }

    // Ensure 0 is included if min is 0
    if (min === 0 && (values.length === 0 || values[0] !== 0)) {
      values.unshift(0);
    }
    tickValues = values;
  } else {
    const niceScale = d3.scaleLinear().domain([min, max]).nice(6);
    tickValues = niceScale.ticks(6).filter((t) => t >= min && t <= max);
  }

  const colorScale = buildColorScale(colormap);

  // Bar geometry: hexagon with left and right points outward
  const xLeft = LABEL_MARGIN - POINT_INSET;
  const xRight = LABEL_MARGIN + boundsWidth + POINT_INSET;
  const xBarLeft = LABEL_MARGIN;
  const xBarRight = LABEL_MARGIN + boundsWidth;
  const midY = BAR_HEIGHT / 2;

  const pathD = [
    `M ${xLeft} ${midY}`,
    `L ${xBarLeft} 0`,
    `L ${xBarRight} 0`,
    `L ${xRight} ${midY}`,
    `L ${xBarRight} ${BAR_HEIGHT}`,
    `L ${xBarLeft} ${BAR_HEIGHT}`,
    "Z",
  ].join(" ");

  const gradientId = `legend-gradient-${colormap}-${min}-${max}-${bins ?? 0}`.replace(
    /[^a-z0-9-]/gi,
    "-"
  );

  // The gradient spans the full shape (including the pointed ends), so map the
  // bar's own [min, max] span into gradient offsets.
  const barStart = (xBarLeft - xLeft) / (xRight - xLeft);
  const barEnd = (xBarRight - xLeft) / (xRight - xLeft);
  const gradientStops = bins
    ? // Two stops per bin edge with the same offset make hard color steps
      binColors(colormap, bins).flatMap((color, i) => {
        const from = i === 0 ? 0 : barStart + ((barEnd - barStart) * i) / bins;
        const to = i === bins - 1 ? 1 : barStart + ((barEnd - barStart) * (i + 1)) / bins;
        return [
          <stop key={`${i}-from`} offset={from} stopColor={color} />,
          <stop key={`${i}-to`} offset={to} stopColor={color} />,
        ];
      })
    : Array.from({ length: NUM_GRADIENT_STOPS + 1 }, (_, i) => {
        const t = i / NUM_GRADIENT_STOPS;
        return <stop key={i} offset={t} stopColor={colorScale(t)} />;
      });

  const range = max - min;
  const formatTick = (value: number) => {
    const precision = range >= 10 ? 0 : range >= 1 ? 1 : 2;
    return precision === 0 ? Math.round(value) : Number(value.toFixed(precision));
  };
  const tickLabels = tickValues.map((value) => ({
    value,
    label: labelStep == null || value % labelStep === 0 ? `${formatTick(value)}` : null,
  }));

  return (
    <div className={styles.mapLegend}>
      <div className={styles.colorbar}>
        <svg
          width={totalWidth}
          height={BAR_HEIGHT + 30}
          aria-label={`Legend for ${title ?? "color scale"} from ${min} to ${max}`}
        >
          <defs>
            <linearGradient
              id={gradientId}
              x1={xLeft}
              y1={0}
              x2={xRight}
              y2={0}
              gradientUnits="userSpaceOnUse"
            >
              {gradientStops}
            </linearGradient>
          </defs>
          <path d={pathD} fill={`url(#${gradientId})`} stroke="black" strokeWidth={1} />
          {tickLabels.map(({ value, label }, idx) => {
            const x = xScale(value);
            return (
              <g key={idx}>
                {/* Unlabelled ticks are shorter, so the labelled ones stand out */}
                <line
                  x1={x}
                  y1={0}
                  x2={x}
                  y2={label ? BAR_HEIGHT + 10 : BAR_HEIGHT + 4}
                  stroke="black"
                />
                {label && (
                  <text x={x} y={BAR_HEIGHT + 20} fontSize={12} textAnchor="middle" fill="black">
                    {label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      {title && <p className={styles.title}>{title}</p>}
    </div>
  );
}
