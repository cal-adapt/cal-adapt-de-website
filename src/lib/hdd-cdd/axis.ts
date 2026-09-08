import { resolveYAxisMax as resolveYAxisMaxShared } from "@/utils/chart";

/** Axis max used when there are no finite, positive values to derive a domain
 *  from. */
export const Y_AXIS_FALLBACK_MAX = 100;

/** Headroom added above the max value, as a fraction of it, so the envelope
 *  doesn't touch the top of the chart. */
const Y_AXIS_HEADROOM_RATIO = 0.1;

/** Resolve the y-axis domain max from the currently visible values (the
 *  envelope upper bound, not just the mean), plus headroom. */
export function resolveYAxisMax(values: number[]): number {
  return resolveYAxisMaxShared(values, {
    fallbackMax: Y_AXIS_FALLBACK_MAX,
    headroomRatio: Y_AXIS_HEADROOM_RATIO,
  });
}
