// Map colors are decided here, in the browser: the same color table drives
// both the tiles (sent to the tile server with each request) and the legend,
// so they always match.

import * as d3 from "d3";
import * as d3Chromatic from "d3-scale-chromatic";

// Steps for layers without `bins`: fine enough to look smooth, while keeping
// tile URLs short.
const SMOOTH_STEPS = 64;

/** Palettes defined by hex anchors (light → dark), blended smoothly between
 *  them. Any other colormap name is looked up in d3. */
export const HEX_COLORMAPS: Readonly<Record<string, readonly string[]>> = {
  // matplotlib's gist_heat_r (d3 doesn't include it)
  gist_heat_r: ["#ffffff", "#ffff00", "#ff4000", "#800000", "#000000"],
  // gist_heat_r's light half (white → yellow → orange-red) with the dark half
  // shifted toward purple: same weight, different hue at high values.
  "cal-adapt-extreme-heat": ["#ffffff", "#ffff00", "#ff4000", "#7a1a78", "#140024"],
  // Twilight: warm apricot → coral → magenta, settling into indigo and night
  // navy at the extremes (navy only at the dark end, so it doesn't read "cold").
  "cal-adapt-warm-nights": ["#ffffff", "#ffc46a", "#ff5a52", "#c01f7e", "#33167a", "#070822"],
};

/** Interpolator for a `HEX_COLORMAPS` name or a d3/matplotlib colormap name
 *  (e.g. "magma_r"), mapping t in [0, 1] to a CSS color. */
export function buildColorScale(colormap: string): (t: number) => string {
  const anchors = HEX_COLORMAPS[colormap];
  if (anchors) {
    const interpolate = d3.interpolateRgbBasis([...anchors]);
    return (t: number) => d3.rgb(interpolate(Math.min(1, Math.max(0, t)))).toString();
  }

  const colormapName = colormap.endsWith("_r") ? colormap.slice(0, -2) : colormap;
  const interpolatorKey =
    `interpolate${colormapName.charAt(0).toUpperCase()}${colormapName.slice(1)}` as keyof typeof d3Chromatic;
  let interpolator =
    (d3Chromatic[interpolatorKey] as (t: number) => string) || d3.interpolateInferno;

  // d3's PuOr already runs purple → orange, i.e. matplotlib's PuOr_r
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

// Stand-ins for -/+ infinity (the colormap is sent as JSON, which has no
// Infinity), so the first and last steps also catch values outside the range.
const BELOW_RANGE = -1e12;
const ABOVE_RANGE = 1e12;

/** "rgb(255, 128, 0)" → [255, 128, 0, 255] */
function toRgba(color: string): [number, number, number, number] {
  const { r, g, b } = d3.rgb(color);
  return [Math.round(r), Math.round(g), Math.round(b), 255];
}

/**
 * The color table sent to the tile server (its "intervals" colormap, as
 * JSON): one `[[from, to], rgba]` row per step, e.g. `[[0, 2], ...]`,
 * `[[2, 4], ...]` … for 2-day bins, in the data's own units.
 */
export function buildColorTable(
  colormap: string,
  min: number,
  max: number,
  bins: number = SMOOTH_STEPS
): string {
  const edges = binEdges(min, max, bins);
  const rows = binColors(colormap, bins).map((color, i) => {
    // First and last steps also catch values outside the range (e.g. > 30 days)
    const from = i === 0 ? BELOW_RANGE : edges[i];
    const to = i === bins - 1 ? ABOVE_RANGE : edges[i + 1];
    return [[from, to], toRgba(color)];
  });
  return JSON.stringify(rows);
}
