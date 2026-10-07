import { useCallback, useEffect, useState } from "react";

import { createTimeoutController } from "@/utils/fetch-timeout";

export type StacSeriesStatus = "idle" | "loading" | "success" | "error";

interface FetchState<T> {
  status: StacSeriesStatus;
  data: T | null;
  errorMessage: string | null;
  /** True when the error was the request exceeding the data fetch timeout. */
  timedOut: boolean;
}

export interface UseStacSeriesResult<T> extends FetchState<T> {
  retry: () => void;
}

/**
 * Refetches whenever `key` changes. Build `key` only from the selections that
 * change the request, so display-only changes don't flash a loading state.
 * Pass `signal` through to the fetch so it's cancelled on timeout or when
 * `key` changes mid-request.
 */
export function useStacSeries<T>(
  key: string,
  fetchSeries: (signal: AbortSignal) => Promise<T>
): UseStacSeriesResult<T> {
  const [result, setResult] = useState<FetchState<T>>({
    status: "idle",
    data: null,
    errorMessage: null,
    timedOut: false,
  });
  // `retry()` bumps this to rerun the effect when `key` hasn't changed.
  const [retryNonce, setRetryNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const request = createTimeoutController();

    setResult({ status: "loading", data: null, errorMessage: null, timedOut: false });

    (async () => {
      try {
        const data = await fetchSeries(request.signal);
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
              : "Failed to fetch series",
          timedOut,
        });
      }
    })();

    return () => {
      cancelled = true;
      request.cancel();
    };
    // `fetchSeries` is a new closure every render; `key` decides when to refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, retryNonce]);

  const retry = useCallback(() => {
    setRetryNonce((n) => n + 1);
  }, []);

  return { ...result, retry };
}
