import { useCallback, useEffect, useState } from "react";

import type { HddCddSelections } from "@/lib/hdd-cdd/options";
import { fetchHddCddSeries, type HddCddSeries, searchFiltersKey } from "@/lib/hdd-cdd/series";
import { createTimeoutController } from "@/utils/fetch-timeout";

export type HddCddSeriesStatus = "idle" | "loading" | "success" | "error";

/** Storage shape; separate from the public result so the hook can keep `retry` outside of `useState` */
interface FetchState {
  status: HddCddSeriesStatus;
  data: HddCddSeries | null;
  errorMessage: string | null;
  /** True when the error was the request exceeding the data fetch timeout. */
  timedOut: boolean;
}

export interface UseHddCddSeriesResult extends FetchState {
  /** Re-trigger the most recent fetch. Used by error-state "Retry" buttons;
   *  safe to call from any status - will issue a fresh request. */
  retry: () => void;
}

const initial: FetchState = {
  status: "idle",
  data: null,
  errorMessage: null,
  timedOut: false,
};

/**
 * Fetch the parsed HDD/CDD series for the current selections, with a small
 * status state machine that handles cancellation, a request timeout
 * (`DATA_FETCH_TIMEOUT_MS`), error capture, and re-fetch semantics.
 *
 * Re-fetches whenever `searchFiltersKey(selections)` changes — spatial
 * aggregation and location select a different STAC item/CSV. Metric and
 * visible-SSP toggles don't affect the fetch (both metrics and the only
 * available scenario live in one CSV), so switching those re-renders from
 * already-fetched data with no loading state.
 *
 * Also exposes `retry()`, which re-runs the same request without changing selections.
 */
export function useHddCddSeries(selections: HddCddSelections): UseHddCddSeriesResult {
  const [result, setResult] = useState<FetchState>(initial);
  // Bumping this nonce re-triggers the effect even when `filtersKey` is
  // unchanged — the mechanism behind `retry()`. State (vs. ref) so the
  // useEffect dep array is honest about what causes a re-fetch.
  const [retryNonce, setRetryNonce] = useState(0);
  const filtersKey = searchFiltersKey(selections);

  useEffect(() => {
    let cancelled = false;
    // Cancels the request after DATA_FETCH_TIMEOUT_MS, or on cleanup when the
    // selections change before it finishes.
    const request = createTimeoutController();

    setResult({ status: "loading", data: null, errorMessage: null, timedOut: false });

    (async () => {
      try {
        const data = await fetchHddCddSeries(selections, { signal: request.signal });
        if (cancelled) return;
        setResult({ status: "success", data, errorMessage: null, timedOut: false });
      } catch (error) {
        if (cancelled) return;
        const timedOut = request.timedOut();
        setResult({
          status: "error",
          data: null,
          errorMessage: timedOut
            ? "Request timed out"
            : error instanceof Error
              ? error.message
              : "Failed to fetch HDD/CDD series",
          timedOut,
        });
      }
    })();

    return () => {
      cancelled = true;
      request.cancel();
    };
    // `selections` is intentionally omitted from deps; `filtersKey` derives
    // from the subset of selections that actually affects the API call
    // (spatial aggregation + location). `retryNonce` is included so `retry()`
    // can re-run the same request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey, retryNonce]);

  const retry = useCallback(() => {
    setRetryNonce((n) => n + 1);
  }, []);

  return { ...result, retry };
}
