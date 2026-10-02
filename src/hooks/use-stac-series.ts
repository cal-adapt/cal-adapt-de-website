import { useCallback, useEffect, useState } from "react";

export type StacSeriesStatus = "idle" | "loading" | "success" | "error";

/** Storage shape; separate from the public result so the hook can keep `retry` outside of `useState` */
interface FetchState<T> {
  status: StacSeriesStatus;
  data: T | null;
  errorMessage: string | null;
}

export interface UseStacSeriesResult<T> extends FetchState<T> {
  /** Re-trigger the most recent fetch. Used by error-state "Retry" buttons;
   *  safe to call from any status - will issue a fresh request. */
  retry: () => void;
}

/**
 * Fetch a chart series with a small status state machine that handles
 * cancellation, error capture, and re-fetch semantics.
 *
 * Re-fetches whenever `key` changes. Callers derive `key` from the subset of
 * their selections that selects a different STAC item/CSV, so selection changes
 * that only re-render already-fetched data don't trigger a loading state.
 */
export function useStacSeries<T>(
  key: string,
  fetchSeries: () => Promise<T>
): UseStacSeriesResult<T> {
  const [result, setResult] = useState<FetchState<T>>({
    status: "idle",
    data: null,
    errorMessage: null,
  });
  // Bumping this nonce re-triggers the effect even when `key` is unchanged —
  // the mechanism behind `retry()`. State (vs. ref) so the useEffect dep array
  // is honest about what causes a re-fetch.
  const [retryNonce, setRetryNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setResult({ status: "loading", data: null, errorMessage: null });

    (async () => {
      try {
        const data = await fetchSeries();
        if (cancelled) return;
        setResult({ status: "success", data, errorMessage: null });
      } catch (error) {
        if (cancelled) return;
        setResult({
          status: "error",
          data: null,
          errorMessage: error instanceof Error ? error.message : "Failed to fetch series",
        });
      }
    })();

    return () => {
      cancelled = true;
    };
    // `fetchSeries` is intentionally omitted: it closes over the caller's full
    // selections, while `key` covers only the subset that affects the request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, retryNonce]);

  const retry = useCallback(() => {
    setRetryNonce((n) => n + 1);
  }, []);

  return { ...result, retry };
}
