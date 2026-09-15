type MetricVariant = {
  mean: string;
  min_path?: string;
  max_path?: string;
  description: string;
  short_desc: string;
  variable: string;
  rescale: string;
  colormap: string;
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
  id: number;
  title: string;
  slug: string;
  abs: MetricVariant;
  // Not every metric has a precomputed delta (change-from-baseline) product yet.
  // Omit this to hide the "Delta" tab for a metric.
  del?: MetricVariant;
  statLabels?: StatLabels;
};

const EXTREME_HEAT_TOOL_BASE = "s3://cadcat/wrf/extreme-heat-tool/multimodel_gridded";

// eh_days/warm_nights ship as multi-model quantiles (median/q25/q75) rather
// than mean/min/max, so the map layer and popup use median as the central
// estimate and the 25th-75th percentile spread as the range.
const ENSEMBLE_QUANTILE_LABELS: StatLabels = {
  min: "25th percentile*",
  mean: "Median*",
  max: "75th percentile*",
};

export const metrics: Metric[] = [
  {
    id: 0,
    title: "Extreme Heat",
    slug: "extreme-heat",
    abs: {
      mean: `${EXTREME_HEAT_TOOL_BASE}/eh_days/mm4median/ssp370/gwl/t2max_ge99pctl/d03`,
      min_path: `${EXTREME_HEAT_TOOL_BASE}/eh_days/mm4q25/ssp370/gwl/t2max_ge99pctl/d03`,
      max_path: `${EXTREME_HEAT_TOOL_BASE}/eh_days/mm4q75/ssp370/gwl/t2max_ge99pctl/d03`,
      description:
        "Median number of days per year with maximum temperature above the local 99th-percentile threshold (# of days)",
      short_desc:
        "How many days during the year are expected to be very hot compared to the past (# of days)",
      variable: "t2max_ge99pctl",
      rescale: "0,70",
      colormap: "Reds",
    },
    del: {
      mean: `${EXTREME_HEAT_TOOL_BASE}/eh_days/mm4median/ssp370/gwl_delta/t2max_ge99pctl/d03`,
      min_path: `${EXTREME_HEAT_TOOL_BASE}/eh_days/mm4q25/ssp370/gwl_delta/t2max_ge99pctl/d03`,
      max_path: `${EXTREME_HEAT_TOOL_BASE}/eh_days/mm4q75/ssp370/gwl_delta/t2max_ge99pctl/d03`,
      description:
        "Median change in number of extreme heat days relative to a 0.8°C world (# of days)",
      short_desc:
        "Change in how many days during the year are expected to be very hot compared to the past (# of days)",
      variable: "t2max_ge99pctl",
      rescale: "0,70",
      colormap: "Reds",
    },
    statLabels: ENSEMBLE_QUANTILE_LABELS,
  },
  {
    id: 3,
    title: "Warm Nights",
    slug: "warm-nights",
    abs: {
      mean: `${EXTREME_HEAT_TOOL_BASE}/warm_nights/mm4median/ssp370/gwl/t2min_ge99pctl/d03`,
      min_path: `${EXTREME_HEAT_TOOL_BASE}/warm_nights/mm4q25/ssp370/gwl/t2min_ge99pctl/d03`,
      max_path: `${EXTREME_HEAT_TOOL_BASE}/warm_nights/mm4q75/ssp370/gwl/t2min_ge99pctl/d03`,
      description:
        "Median number of nights per year with minimum temperature above the local 99th-percentile threshold (# of nights)",
      short_desc:
        "How many nights during the year are expected to stay very warm compared to the past (# of nights)",
      variable: "t2min_ge99pctl",
      rescale: "0,75",
      colormap: "plasma",
    },
    del: {
      mean: `${EXTREME_HEAT_TOOL_BASE}/warm_nights/mm4median/ssp370/gwl_delta/t2min_ge99pctl/d03`,
      min_path: `${EXTREME_HEAT_TOOL_BASE}/warm_nights/mm4q25/ssp370/gwl_delta/t2min_ge99pctl/d03`,
      max_path: `${EXTREME_HEAT_TOOL_BASE}/warm_nights/mm4q75/ssp370/gwl_delta/t2min_ge99pctl/d03`,
      description: "Median change in number of warm nights relative to a 0.8°C world (# of nights)",
      short_desc:
        "Change in how many nights during the year are expected to stay very warm compared to the past (# of nights)",
      variable: "t2min_ge99pctl",
      rescale: "0,75",
      colormap: "plasma",
    },
    statLabels: ENSEMBLE_QUANTILE_LABELS,
  },
  {
    id: 1,
    title: "Extreme Precipitation",
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
  },
  {
    id: 2,
    title: "Fire Weather",
    slug: "fire-weather",
    abs: {
      mean: "s3://cadcat/wrf/climate-metrics-map/mm4mean/ssp370/gwl/ffwige50/d03",
      min_path: "s3://cadcat/wrf/climate-metrics-map/mm4min/ssp370/gwl/ffwige50/d03",
      max_path: "s3://cadcat/wrf/climate-metrics-map/mm4max/ssp370/gwl/ffwige50/d03",
      description:
        "Absolute median annual number of days with Fosberg Fire Weather Index (FFWI) value greater than 50 (# of days)",
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
        "Change in median annual number of days with Fosberg Fire Weather Index (FFWI) value greater than 50 (# of days)",
      short_desc: "Change in how often the weather is conducive for fires in this area (# of days)",
      variable: "ffwige50d",
      rescale: "-2,2",
      colormap: "PuOr_r",
    },
  },
];
