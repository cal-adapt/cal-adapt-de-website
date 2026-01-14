/**
 * Standardized implementation of Google Analytics 4 using @next/third-parties
 */

import { sendGAEvent } from "@next/third-parties/google";

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-XXXXXXXXXX";

/**
 * Check if GA should be enabled; disable in development environment
 */
export const isAnalyticsEnabled = (): boolean => {
  return Boolean(GA_MEASUREMENT_ID) && GA_MEASUREMENT_ID !== "G-XXXXXXXXXX";
};

export interface WebVitalsMetric {
  id: string;
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  label?: string;
  attribution?: Record<string, unknown>;
}

export interface GAEvent {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, unknown>;
}

/**
 * Reports Web Vitals metrics to Google Analytics
 */
export function reportWebVitals(metric: WebVitalsMetric): void {
  if (!isAnalyticsEnabled()) {
    if (process.env.NODE_ENV === "development") {
      console.info("Web Vitals (dev):", metric);
    }
    return;
  }

  // Only report actual web vitals metrics
  if (metric.label !== "web-vital") {
    return;
  }

  // Prepare metric value based on type
  // CLS needs to be multiplied by 1000 for analytics
  const value = Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value);

  sendGAEvent({
    event_name: "web_vitals",
    event_category: "Web Vitals",
    event_label: metric.name,
    value: value,
    metric_id: metric.id,
    metric_rating: metric.rating,
    metric_delta: metric.delta,
    custom_parameters: metric.attribution || {},
  });
}

/**
 * Sends custom events to Google Analytics
 */
export function trackEvent(event: GAEvent): void {
  if (!isAnalyticsEnabled()) {
    return;
  }
  sendGAEvent({
    event_name: event.action,
    event_category: event.category || "engagement",
    event_label: event.label,
    value: event.value,
    custom_parameters: event.custom_parameters,
  });
}

/**
 * Common event trackers for user interactions
 */
export const analytics = {
  trackExternalLink: (url: string, text?: string) => {
    trackEvent({
      action: "click_external_link",
      category: "engagement",
      label: url,
      custom_parameters: {
        link_text: text,
        link_url: url,
      },
    });
  },
  trackDownload: (filename: string, fileType?: string) => {
    trackEvent({
      action: "download",
      category: "engagement",
      label: filename,
      custom_parameters: {
        file_name: filename,
        file_type: fileType,
      },
    });
  },
  trackFormSubmission: (formName: string, success: boolean = true) => {
    trackEvent({
      action: "form_submission",
      category: "engagement",
      label: formName,
      value: success ? 1 : 0,
      custom_parameters: {
        form_name: formName,
        submission_success: success,
      },
    });
  },
};

/**
 * Type definitions for gtag (for backward compatibility if needed)
 */
declare global {
  interface Window {
    gtag?: (command: string, targetId: string, config?: Record<string, unknown>) => void;
  }
}
