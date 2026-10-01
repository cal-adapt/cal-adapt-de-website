import {
  resolveYAxisMax as resolveYAxisMaxShared,
  resolveYAxisMin as resolveYAxisMinShared,
} from "@/utils/chart";

/** Axis max used when there are no finite, positive values to derive a domain
 *  from. */
export const Y_AXIS_FALLBACK_MAX = 100;

/** Headroom added above the max value (and below the min value), as a
 *  fraction of it, so the envelope doesn't touch the top or bottom of the
 *  chart. */
const Y_AXIS_HEADROOM_RATIO = 0.1;

/** Resolve the y-axis domain max from the currently visible values (the
 *  envelope upper bound, not just the mean), plus headroom. */
export function resolveYAxisMax(values: number[]): number {
  return resolveYAxisMaxShared(values, {
    fallbackMax: Y_AXIS_FALLBACK_MAX,
    headroomRatio: Y_AXIS_HEADROOM_RATIO,
  });
}

/** Resolve the y-axis domain min from the currently visible values (the
 *  envelope lower bound, not just the mean), so the chart auto-scales to the
 *  data instead of always starting at zero. Never goes below zero. */
export function resolveYAxisMin(values: number[]): number {
  return resolveYAxisMinShared(values, { headroomRatio: Y_AXIS_HEADROOM_RATIO });
}
