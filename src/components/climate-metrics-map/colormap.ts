// Colormap helpers shared by the map legend and the tile requests, so a
// stepped (binned) layer's tile colors match its legend exactly.

import * as d3 from "d3";
import * as d3Chromatic from "d3-scale-chromatic";

/**
 * Cal-Adapt colormaps: anchor colors (light → dark) blended with the same
 * smooth B-spline as `gist_heat`. The tile server doesn't know these names,
 * so layers using them must set `bins` (their tiles are sent as intervals);
 * metrics.test.ts enforces this.
 */
export const CUSTOM_COLORMAPS: Readonly<Record<string, readonly string[]>> = {
  // gist_heat_r's light half (white → yellow → orange-red) with the dark half
  // shifted toward purple: same weight, different hue at high values.
  "cal-adapt-extreme-heat": ["#ffffff", "#ffff00", "#ff4000", "#7a1a78", "#140024"],
  // Twilight: warm apricot → coral → magenta, settling into indigo and night
  // navy at the extremes (navy only at the dark end, so it doesn't read "cold").
  "cal-adapt-warm-nights": ["#ffffff", "#ffc46a", "#ff5a52", "#c01f7e", "#33167a", "#070822"],
};

/** Interpolator for a `CUSTOM_COLORMAPS` name or a matplotlib-style colormap
 *  name (e.g. "gist_heat_r"), mapping t in [0, 1] to a CSS color. */
export function buildColorScale(colormap: string): (t: number) => string {
  const anchors = CUSTOM_COLORMAPS[colormap];
  if (anchors) {
    const interpolate = d3.interpolateRgbBasis([...anchors]);
    return (t: number) => d3.rgb(interpolate(Math.min(1, Math.max(0, t)))).toString();
  }

  const colormapName = colormap.endsWith("_r") ? colormap.slice(0, -2) : colormap;

  const gistHeatInterpolator = d3
    .scaleSequential(
      d3.interpolateRgbBasis(["#FFFFFF", "#FFFF00", "#FF4000", "#800000", "#000000"])
    )
    .domain([0, 1]);

  if (colormapName === "gist_heat") {
    return (t: number) => gistHeatInterpolator(t) ?? "#888";
  }

  const interpolatorKey =
    `interpolate${colormapName.charAt(0).toUpperCase()}${colormapName.slice(1)}` as keyof typeof d3Chromatic;
  let interpolator =
    (d3Chromatic[interpolatorKey] as (t: number) => string) || d3.interpolateInferno;

  if (colormap.endsWith("_r") && colormap !== "PuOr_r") {
    const orig = interpolator;
    interpolator = (t: number) => orig(1 - t);
  }

  return interpolator;
}

/** `bins + 1` evenly spaced edges from `min` to `max`. */
export function binEdges(min: number, max: number, bins: number): number[] {
  return Array.from({ length: bins + 1 }, (_, i) => min + ((max - min) * i) / bins);
}

/** One color per bin: the colormap sampled at each bin's midpoint. */
export function binColors(colormap: string, bins: number): string[] {
  const scale = buildColorScale(colormap);
  return Array.from({ length: bins }, (_, i) => scale((i + 0.5) / bins));
}

// Open-ended outer bins so values beyond [min, max] still get the end colors.
const OPEN_END = 1e12;

/**
 * TiTiler "intervals" colormap (JSON) that paints each of `bins` equal-width
 * ranges between `min` and `max` a single color, in raw data units — so the
 * tile request must not also send `rescale`.
 */
export function buildIntervalColormap(
  colormap: string,
  min: number,
  max: number,
  bins: number
): string {
  const edges = binEdges(min, max, bins);
  const intervals = binColors(colormap, bins).map((color, i) => {
    const lower = i === 0 ? -OPEN_END : edges[i];
    const upper = i === bins - 1 ? OPEN_END : edges[i + 1];
    const { r, g, b } = d3.rgb(color);
    return [
      [lower, upper],
      [Math.round(r), Math.round(g), Math.round(b), 255],
    ];
  });
  return JSON.stringify(intervals);
}
