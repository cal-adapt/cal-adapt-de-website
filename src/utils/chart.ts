/** Resolve a y-axis domain max from a set of plotted values, plus headroom
 *  so the tallest data point doesn't touch the top of the chart. Falls back
 *  to `fallbackMax` when there are no finite, positive values to derive a
 *  domain from. */
export function resolveYAxisMax(
  values: number[],
  { fallbackMax, headroomRatio }: { fallbackMax: number; headroomRatio: number }
): number {
  const max = Math.max(0, ...values.filter(Number.isFinite));
  return max > 0 ? max * (1 + headroomRatio) : fallbackMax;
}

/** Resolve a y-axis domain min from a set of plotted values, with headroom
 *  below the smallest value so it doesn't sit right on the chart floor.
 *  Never goes below zero, since these metrics can't be negative. */
export function resolveYAxisMin(
  values: number[],
  { headroomRatio }: { headroomRatio: number }
): number {
  const finiteValues = values.filter(Number.isFinite);
  if (finiteValues.length === 0) return 0;
  const min = Math.min(...finiteValues);
  return Math.max(0, min * (1 - headroomRatio));
}
