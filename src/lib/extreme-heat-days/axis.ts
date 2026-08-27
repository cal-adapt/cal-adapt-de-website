/** Axis max used when there are no finite, positive values to derive a domain
 *  from. */
export const Y_AXIS_FALLBACK_MAX = 10;

/** Headroom added above the max value, as a fraction of it, so the tallest
 *  bar doesn't touch the top of the chart. */
const Y_AXIS_HEADROOM_RATIO = 0.2;

/**
 * Resolve the y-axis domain max for the currently displayed series: the max
 * across every value passed in (typically that location's own plotted values
 * at every global warming level) plus headroom, so the tallest bar doesn't
 * touch the axis top. Unique per threshold *and* per location -- a mild
 * location's chart should show its own real scale, not a boundary-type-wide
 * ceiling set by some other region.
 */
export function resolveYAxisMax(values: number[]): number {
  const max = Math.max(0, ...values.filter(Number.isFinite));
  return max > 0 ? max * (1 + Y_AXIS_HEADROOM_RATIO) : Y_AXIS_FALLBACK_MAX;
}
