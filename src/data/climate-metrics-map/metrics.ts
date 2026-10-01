export type MetricVariant = {
  mean: string;
  min_path?: string;
  max_path?: string;
  description: string;
  short_desc: string;
  variable: string;
  rescale: string;
  colormap: string;
  /** Show this layer as `bins` equal-width color steps across `rescale`
   *  instead of a continuous gradient. */
  bins?: number;
  /** Label legend ticks only at multiples of this value (e.g. every 6 days). */
  legendLabelStep?: number;
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
  del: MetricVariant;
  statLabels?: StatLabels;
};

const EXTREME_HEAT_BASE = "s3://cadcat/wrf/extreme-heat-tool/multimodel_gridded";

export const metrics: Metric[] = [
  {
    id: 0,
    title: "Extreme Heat",
    slug: "extreme-heat",
    abs: {
      mean: `${EXTREME_HEAT_BASE}/eh_days/mm4mean/ssp370/gwl/t2max_ge99pctl/d03`,
      min_path: `${EXTREME_HEAT_BASE}/eh_days/mm4min/ssp370/gwl/t2max_ge99pctl/d03`,
      max_path: `${EXTREME_HEAT_BASE}/eh_days/mm4max/ssp370/gwl/t2max_ge99pctl/d03`,
      description:
        "Mean number of days per year with maximum temperature above the local 99th-percentile threshold (# of days)",
      short_desc:
        "How many days during the year are expected to be very hot compared to the past (# of days)",
      variable: "t2max_ge99pctl",
      rescale: "0,30",
      colormap: "cal-adapt-extreme-heat",
      bins: 15,
      legendLabelStep: 6,
    },
    del: {
      mean: `${EXTREME_HEAT_BASE}/eh_days/mm4mean/ssp370/gwl_delta/t2max_ge99pctl/d03`,
      min_path: `${EXTREME_HEAT_BASE}/eh_days/mm4min/ssp370/gwl_delta/t2max_ge99pctl/d03`,
      max_path: `${EXTREME_HEAT_BASE}/eh_days/mm4max/ssp370/gwl_delta/t2max_ge99pctl/d03`,
      description:
        "Mean change in number of extreme heat days relative to a 0.8°C world (# of days)",
      short_desc:
        "Change in how many days during the year are expected to be very hot compared to the past (# of days)",
      variable: "t2max_ge99pctl",
      rescale: "0,30",
      colormap: "cal-adapt-extreme-heat",
      bins: 15,
      legendLabelStep: 6,
    },
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
  {
    id: 3,
    title: "Warm Nights",
    slug: "warm-nights",
    abs: {
      mean: `${EXTREME_HEAT_BASE}/warm_nights/mm4mean/ssp370/gwl/t2min_ge99pctl/d03`,
      min_path: `${EXTREME_HEAT_BASE}/warm_nights/mm4min/ssp370/gwl/t2min_ge99pctl/d03`,
      max_path: `${EXTREME_HEAT_BASE}/warm_nights/mm4max/ssp370/gwl/t2min_ge99pctl/d03`,
      description:
        "Mean number of nights per year with minimum temperature above the local 99th-percentile threshold (# of nights)",
      short_desc:
        "How many nights during the year are expected to stay very warm compared to the past (# of nights)",
      variable: "t2min_ge99pctl",
      rescale: "0,30",
      colormap: "cal-adapt-warm-nights",
      bins: 15,
      legendLabelStep: 6,
    },
    del: {
      mean: `${EXTREME_HEAT_BASE}/warm_nights/mm4mean/ssp370/gwl_delta/t2min_ge99pctl/d03`,
      min_path: `${EXTREME_HEAT_BASE}/warm_nights/mm4min/ssp370/gwl_delta/t2min_ge99pctl/d03`,
      max_path: `${EXTREME_HEAT_BASE}/warm_nights/mm4max/ssp370/gwl_delta/t2min_ge99pctl/d03`,
      description: "Mean change in number of warm nights relative to a 0.8°C world (# of nights)",
      short_desc:
        "Change in how many nights during the year are expected to stay very warm compared to the past (# of nights)",
      variable: "t2min_ge99pctl",
      rescale: "0,30",
      colormap: "cal-adapt-warm-nights",
      bins: 15,
      legendLabelStep: 6,
    },
  },
];
