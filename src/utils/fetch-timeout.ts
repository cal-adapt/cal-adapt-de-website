/** Tool data requests that run longer than this are cancelled and surfaced as
 *  a timeout error with a retry action (MVP performance baseline). */
export const DATA_FETCH_TIMEOUT_MS = 7_000;

export class FetchTimeoutError extends Error {
  constructor(ms: number) {
    super(`Request timed out after ${ms / 1000} seconds`);
    this.name = "FetchTimeoutError";
  }
}

export interface TimeoutController {
  /** Pass to `fetch`/API calls so they're cancelled on timeout or `cancel()`. */
  signal: AbortSignal;
  /** True once the request was aborted because it hit the timeout (as opposed
   *  to being cancelled by `cancel()`). */
  timedOut: () => boolean;
  /** Clear the timer and abort any in-flight request, e.g. from a `useEffect`
   *  cleanup when selections change. Safe to call more than once. */
  cancel: () => void;
}

/**
 * Create an `AbortController` that aborts itself with a `FetchTimeoutError`
 * after `ms`. Checking `timedOut()` (rather than the thrown error) keeps
 * timeout detection independent of how each browser rejects aborted fetches.
 */
export function createTimeoutController(ms: number = DATA_FETCH_TIMEOUT_MS): TimeoutController {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new FetchTimeoutError(ms)), ms);
  return {
    signal: controller.signal,
    timedOut: () => controller.signal.reason instanceof FetchTimeoutError,
    cancel: () => {
      clearTimeout(timer);
      controller.abort();
    },
  };
}
