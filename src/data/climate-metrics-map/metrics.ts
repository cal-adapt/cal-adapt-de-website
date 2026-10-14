import { climateVariables } from "@/config/climate-variables";
import type { DataMethodsPageId } from "@/config/navigation";

export type MetricVariant = {
  mean: string;
  min_path?: string;
  max_path?: string;
  description: string;
  short_desc: string;
  variable: string;
  rescale: string;
  colormap: string;
  /** Legend tick interval (e.g. every 30 days); automatic when omitted. */
  legendTickStep?: number;
};

// Labels shown next to the min/mean/max values in the map click popup.
// Defaults to "Min*"/"Mean*"/"Max*" (true min/mean/max across models) when omitted.
// Metrics whose min_path/max_path point at ensemble quantiles rather than the
// literal min/max across models (e.g. q25/q75) must set this so the popup
// doesn't misrepresent the quantile range as a min/max.
type StatLabels = {
  min: string;
  mean: string;
  max: string;
};

export type Metric = {
  title: string;
  /** One-line description shown under the title in the metric dropdown. */
  summary: string;
  slug: string;
  abs: MetricVariant;
  del: MetricVariant;
  statLabels?: StatLabels;
  /** Fixed threshold the metric is calculated at, shown read-only in the controls,
   *  e.g. "95°F" or "99th percentile". */
  thresholdLabel: string;
  /** Extreme Heat tool `variable` with this metric at other thresholds; the controls
   *  link there from the threshold. */
  heatToolVariable?: "extreme-heat-days" | "warm-nights";
  /** Data methods page describing how this metric is calculated. */
  methodsPage: DataMethodsPageId;
};

const EXTREME_HEAT_BASE = "s3://cadcat/wrf/extreme-heat-tool/multimodel_gridded";

// Extreme Heat Days and Warm Nights share legend scales so the two maps compare
// directly. Absolute tops out near the 90th percentile of California grid cells at
// 3.0°C (142 days / 142 nights), leaving room to show coastal differences; delta
// near the 98th (45 / 48). Both are fixed across warming levels.

// Array order is dropdown order; the map refers to metrics by index.
export const metrics: Metric[] = [
  {
    title: climateVariables["extreme-heat-days"].label,
    summary: climateVariables["extreme-heat-days"].description,
    slug: "extreme-heat",
    abs: {
      mean: `${EXTREME_HEAT_BASE}/eh_days/mm4mean/ssp370/gwl/t2max_ge95F/d03`,
      min_path: `${EXTREME_HEAT_BASE}/eh_days/mm4min/ssp370/gwl/t2max_ge95F/d03`,
      max_path: `${EXTREME_HEAT_BASE}/eh_days/mm4max/ssp370/gwl/t2max_ge95F/d03`,
      description: "Mean number of days per year with maximum temperature above 95°F (# of days)",
      short_desc: "How many days during the year are expected to reach 95°F or hotter (# of days)",
      variable: "t2max_ge95F",
      rescale: "0,120",
      colormap: "cal-adapt-extreme-heat",
      legendTickStep: 30,
    },
    del: {
      mean: `${EXTREME_HEAT_BASE}/eh_days/mm4mean/ssp370/gwl_delta/t2max_ge95F/d03`,
      min_path: `${EXTREME_HEAT_BASE}/eh_days/mm4min/ssp370/gwl_delta/t2max_ge95F/d03`,
      max_path: `${EXTREME_HEAT_BASE}/eh_days/mm4max/ssp370/gwl_delta/t2max_ge95F/d03`,
      description:
        "Mean change in number of extreme heat days relative to a 0.8°C world (# of days)",
      short_desc:
        "Change in how many days during the year are expected to reach 95°F or hotter (# of days)",
      variable: "t2max_ge95F",
      rescale: "0,50",
      colormap: "cal-adapt-extreme-heat",
    },
    thresholdLabel: "95°F",
    heatToolVariable: "extreme-heat-days",
    methodsPage: "data-methods-extreme-heat-days",
  },
  {
    title: climateVariables["warm-nights"].label,
    summary: climateVariables["warm-nights"].description,
    slug: "warm-nights",
    abs: {
      mean: `${EXTREME_HEAT_BASE}/warm_nights/mm4mean/ssp370/gwl/t2min_ge70F/d03`,
      min_path: `${EXTREME_HEAT_BASE}/warm_nights/mm4min/ssp370/gwl/t2min_ge70F/d03`,
      max_path: `${EXTREME_HEAT_BASE}/warm_nights/mm4max/ssp370/gwl/t2min_ge70F/d03`,
      description:
        "Mean number of nights per year with minimum temperature above 70°F (# of nights)",
      short_desc:
        "How many nights during the year are expected to stay at 70°F or warmer (# of nights)",
      variable: "t2min_ge70F",
      rescale: "0,120",
      colormap: "cal-adapt-warm-nights",
      legendTickStep: 30,
    },
    del: {
      mean: `${EXTREME_HEAT_BASE}/warm_nights/mm4mean/ssp370/gwl_delta/t2min_ge70F/d03`,
      min_path: `${EXTREME_HEAT_BASE}/warm_nights/mm4min/ssp370/gwl_delta/t2min_ge70F/d03`,
      max_path: `${EXTREME_HEAT_BASE}/warm_nights/mm4max/ssp370/gwl_delta/t2min_ge70F/d03`,
      description: "Mean change in number of warm nights relative to a 0.8°C world (# of nights)",
      short_desc:
        "Change in how many nights during the year are expected to stay at 70°F or warmer (# of nights)",
      variable: "t2min_ge70F",
      rescale: "0,50",
      colormap: "cal-adapt-warm-nights",
    },
    thresholdLabel: "70°F",
    heatToolVariable: "warm-nights",
    methodsPage: "data-methods-extreme-heat-days",
  },
  {
    title: climateVariables["extreme-precipitation"].label,
    summary: climateVariables["extreme-precipitation"].description,
    slug: "extreme-precipitation",
    abs: {
      mean: "s3://cadcat/wrf/climate-metrics-map/mm4mean/ssp370/gwl/R99p/d03",
      min_path: "s3://cadcat/wrf/climate-metrics-map/mm4min/ssp370/gwl/R99p/d03",
      max_path: "s3://cadcat/wrf/climate-metrics-map/mm4max/ssp370/gwl/R99p/d03",
      description: "Absolute 99th percentile 1-day accumulated precipitation (mm)",
      short_desc: "How much precipitation will fall on really heavy precipitation days (mm)",
      variable: "R99p",
      rescale: "0,265",
      colormap: "Blues",
    },
    del: {
      mean: "s3://cadcat/wrf/climate-metrics-map/mm4mean/ssp370/gwl/R99pd/d03",
      min_path: "s3://cadcat/wrf/climate-metrics-map/mm4min/ssp370/gwl/R99pd/d03",
      max_path: "s3://cadcat/wrf/climate-metrics-map/mm4max/ssp370/gwl/R99pd/d03",
      description: "Absolute change in 99th percentile 1-day accumulated precipitation (mm)",
      short_desc:
        "Change in how much more precipitation will fall on really heavy precipitation days (mm)",
      variable: "R99pd",
      rescale: "-20,20",
      colormap: "BrBG",
    },
    thresholdLabel: "99th percentile",
    methodsPage: "data-methods-extreme-precipitation",
  },
  {
    title: climateVariables["fire-weather"].label,
    summary: climateVariables["fire-weather"].description,
    slug: "fire-weather",
    abs: {
      mean: "s3://cadcat/wrf/climate-metrics-map/mm4mean/ssp370/gwl/ffwige50/d03",
      min_path: "s3://cadcat/wrf/climate-metrics-map/mm4min/ssp370/gwl/ffwige50/d03",
      max_path: "s3://cadcat/wrf/climate-metrics-map/mm4max/ssp370/gwl/ffwige50/d03",
      description:
        "Absolute mean annual number of days with Fosberg Fire Weather Index (FFWI) value of 50 or higher (# of days)",
      short_desc: "How often the weather is conducive for fires in this area (# of days)",
      variable: "ffwige50",
      rescale: "0,365",
      colormap: "gist_heat_r",
    },
    del: {
      mean: "s3://cadcat/wrf/climate-metrics-map/mm4mean/ssp370/gwl/ffwige50d/d03",
      min_path: "s3://cadcat/wrf/climate-metrics-map/mm4min/ssp370/gwl/ffwige50d/d03",
      max_path: "s3://cadcat/wrf/climate-metrics-map/mm4max/ssp370/gwl/ffwige50d/d03",
      description:
        "Change in mean annual number of days with Fosberg Fire Weather Index (FFWI) value of 50 or higher (# of days)",
      short_desc: "Change in how often the weather is conducive for fires in this area (# of days)",
      variable: "ffwige50d",
      rescale: "-2,2",
      colormap: "PuOr_r",
    },
    thresholdLabel: "Fosberg Fire Weather Index ≥ 50",
    methodsPage: "data-methods-fire-weather",
  },
];
