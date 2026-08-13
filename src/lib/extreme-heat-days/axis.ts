/** Axis max used when a data-derived domain can't be computed (no fixed max and
 *  no finite values). */
export const Y_AXIS_FALLBACK_MAX = 10;

/** Round `value` up to a "nice" axis maximum */
export function niceCeil(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return Y_AXIS_FALLBACK_MAX;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude;
  const niceNormalized =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10;
  return niceNormalized * magnitude;
}

/** Gridline/tick values from 0 to `max` every `step` (inclusive of `max` when it
 *  lands on the step). Returns `undefined` when no positive step is given so the
 *  caller falls back to visx's automatic tick count. */
export function buildTickValues(max: number, step?: number): number[] | undefined {
  if (!step || step <= 0 || !Number.isFinite(max) || max <= 0) return undefined;
  const ticks: number[] = [];
  for (let value = 0; value <= max + 1e-9; value += step) {
    ticks.push(Math.round(value * 1e6) / 1e6);
  }
  return ticks;
}
