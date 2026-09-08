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
