export interface ReadableSearchParams {
  get(key: string): string | null;
}

/**
 * Read a query param and validate it against a set of allowed values, falling
 * back to `fallback` when the param is missing or not in the set.
 */
export function readEnumParam<T extends string>(
  params: ReadableSearchParams,
  key: string,
  allowed: readonly T[],
  fallback: T
): T {
  const raw = params.get(key);
  return raw !== null && (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback;
}
