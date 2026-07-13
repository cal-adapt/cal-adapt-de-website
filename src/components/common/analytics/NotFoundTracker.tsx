"use client";

import { useEffect } from "react";

import { analytics } from "@/lib/analytics";

/**
 * Reports the attempted URL to Google Analytics when the 404 page renders.
 */
export default function NotFoundTracker() {
  useEffect(() => {
    // TODO: Future consideration: Sanitize URL before sending to GA
    const attemptedUrl = window.location.pathname + window.location.search;
    analytics.trackPageNotFound(attemptedUrl, document.referrer || undefined);
  }, []);

  return null;
}
