import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createTimeoutController, DATA_FETCH_TIMEOUT_MS, FetchTimeoutError } from "./fetch-timeout";

describe("createTimeoutController", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("aborts with a FetchTimeoutError once the timeout elapses", () => {
    const request = createTimeoutController();

    vi.advanceTimersByTime(DATA_FETCH_TIMEOUT_MS - 1);
    expect(request.signal.aborted).toBe(false);
    expect(request.timedOut()).toBe(false);

    vi.advanceTimersByTime(1);
    expect(request.signal.aborted).toBe(true);
    expect(request.signal.reason).toBeInstanceOf(FetchTimeoutError);
    expect(request.timedOut()).toBe(true);
  });

  it("does not report a timeout when cancelled first", () => {
    const request = createTimeoutController();

    request.cancel();
    vi.advanceTimersByTime(DATA_FETCH_TIMEOUT_MS);

    expect(request.signal.aborted).toBe(true);
    expect(request.timedOut()).toBe(false);
  });

  it("respects a custom timeout", () => {
    const request = createTimeoutController(100);

    vi.advanceTimersByTime(100);

    expect(request.timedOut()).toBe(true);
  });
});
