"use client";

import { useReportWebVitals } from "next/web-vitals";

import { reportWebVitals } from "@/lib/analytics";

/**
 * Web Vitals tracking and integration with Google Analytics
 */
export default function WebVitals() {
  useReportWebVitals((metric) => {
    reportWebVitals(metric);
  });
  return null;
}
