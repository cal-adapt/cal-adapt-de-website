import {
  resolveYAxisMax as resolveYAxisMaxShared,
  resolveYAxisMin as resolveYAxisMinShared,
} from "@/utils/chart";

/** Axis max used when there are no finite, positive values. */
const Y_AXIS_FALLBACK_MAX = 100;

/** Headroom above the max and below the min, as a fraction of the value. */
const Y_AXIS_HEADROOM_RATIO = 0.05;

export function resolveYAxisMax(values: number[]): number {
  return resolveYAxisMaxShared(values, {
    fallbackMax: Y_AXIS_FALLBACK_MAX,
    headroomRatio: Y_AXIS_HEADROOM_RATIO,
  });
}

export function resolveYAxisMin(values: number[]): number {
  return resolveYAxisMinShared(values, { headroomRatio: Y_AXIS_HEADROOM_RATIO });
}
