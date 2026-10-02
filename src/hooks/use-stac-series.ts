import { useCallback, useEffect, useState } from "react";

export type StacSeriesStatus = "idle" | "loading" | "success" | "error";

interface FetchState<T> {
  status: StacSeriesStatus;
  data: T | null;
  errorMessage: string | null;
}

export interface UseStacSeriesResult<T> extends FetchState<T> {
  retry: () => void;
}

/**
 * Refetches whenever `key` changes. Build `key` only from the selections that
 * change the request, so display-only changes don't flash a loading state.
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
  // `retry()` bumps this to rerun the effect when `key` hasn't changed.
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
    // `fetchSeries` is a new closure every render; `key` decides when to refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, retryNonce]);

  const retry = useCallback(() => {
    setRetryNonce((n) => n + 1);
  }, []);

  return { ...result, retry };
}
