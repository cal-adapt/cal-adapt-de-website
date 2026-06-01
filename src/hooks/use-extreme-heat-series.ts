import { useCallback, useEffect, useState } from "react";

import type { ExtremeHeatDaysSelections } from "@/lib/extreme-heat-days/options";
import {
  type ExtremeHeatSeries,
  fetchExtremeHeatSeries,
  searchFiltersKey,
} from "@/lib/extreme-heat-days/series";

export type ExtremeHeatSeriesStatus = "idle" | "loading" | "success" | "error";

/** Storage shape; separate from the public result so the hook can keep `retry` outside of `useState` */
interface FetchState {
  status: ExtremeHeatSeriesStatus;
  data: ExtremeHeatSeries | null;
  errorMessage: string | null;
}

export interface UseExtremeHeatSeriesResult extends FetchState {
  /** Re-trigger the most recent fetch. Used by error-state "Retry" buttons;
   *  safe to call from any status - will issue a fresh request. */
  retry: () => void;
}

const initial: FetchState = {
  status: "idle",
  data: null,
  errorMessage: null,
};

/**
 * Fetch the parsed extreme heat series for the current selections, with a
 * small status state machine. Consistently handles cancellation, error capture,
 * and re-fetch semantics consistently.
 *
 * Re-fetches only when `searchFiltersKey(selections)` changes (currently:
 * `selections.county`). Threshold and indicator changes don't trigger network
 * since they're resolved client-side from `series.valuesByVariable`.
 *
 * Also exposes `retry()`, which re-runs the same request without changing selections.
 */
export function useExtremeHeatSeries(
  selections: ExtremeHeatDaysSelections
): UseExtremeHeatSeriesResult {
  const [result, setResult] = useState<FetchState>(initial);
  // Bumping this nonce re-triggers the effect even when `filtersKey` is
  // unchanged — the mechanism behind `retry()`. State (vs. ref) so the
  // useEffect dep array is honest about what causes a re-fetch.
  const [retryNonce, setRetryNonce] = useState(0);
  const filtersKey = searchFiltersKey(selections);

  useEffect(() => {
    let cancelled = false;

    setResult({ status: "loading", data: null, errorMessage: null });

    (async () => {
      try {
        const data = await fetchExtremeHeatSeries(selections);
        if (cancelled) return;
        setResult({ status: "success", data, errorMessage: null });
      } catch (error) {
        if (cancelled) return;
        setResult({
          status: "error",
          data: null,
          errorMessage:
            error instanceof Error ? error.message : "Failed to fetch extreme heat series",
        });
      }
    })();

    return () => {
      cancelled = true;
    };
    // `selections` is intentionally omitted from deps; `filtersKey` derives
    // from the subset of selections that actually affects the API call.
    // Including the full object would force a refetch on every threshold or
    // indicator change even though those produce identical requests.
    // `retryNonce` is included so `retry()` can re-run the same request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey, retryNonce]);

  const retry = useCallback(() => {
    setRetryNonce((n) => n + 1);
  }, []);

  return { ...result, retry };
}
