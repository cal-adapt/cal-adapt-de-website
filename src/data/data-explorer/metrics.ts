export type Metric = {
  id: number;
  title: string;
  slug: string;
  abs: {
    mean: string;
    min_path?: string;
    max_path?: string;
    description: string;
    short_desc: string;
    variable: string;
    rescale: string;
    colormap: string;
  };
  del: {
    mean: string;
    min_path?: string;
    max_path?: string;
    description: string;
    short_desc: string;
    variable: string;
    rescale: string;
    colormap: string;
  };
};

export const metrics: Metric[] = [
  {
    id: 0,
    title: "Extreme Heat",
    slug: "extreme-heat",
    abs: {
      mean: "s3://cadcat/wrf/cae/mm4mean/ssp370/gwl/TX99p/d03",
      min_path: "s3://cadcat/wrf/cae/mm4min/ssp370/gwl/TX99p/d03",
      max_path: "s3://cadcat/wrf/cae/mm4max/ssp370/gwl/TX99p/d03",
      description: "Mean number of extreme heat days",
      short_desc: "How many days during the year are expected to be very hot compared to the past",
      variable: "TX99p",
      rescale: "0,50",
      colormap: "Reds",
    },
    del: {
      mean: "s3://cadcat/wrf/cae/mm4mean/ssp370/gwl/TX99pd/d03",
      min_path: "s3://cadcat/wrf/cae/mm4min/ssp370/gwl/TX99pd/d03",
      max_path: "s3://cadcat/wrf/cae/mm4max/ssp370/gwl/TX99pd/d03",
      description: "Mean annual change in number of extreme heat days",
      short_desc:
        "Change in how many days during the year are expected to be very hot compared to the past",
      variable: "TX99pd",
      rescale: "-30,30",
      colormap: "RdBu_r",
    },
  },
  {
    id: 1,
    title: "Extreme Precipitation",
    slug: "extreme-precipitation",
    abs: {
      mean: "s3://cadcat/wrf/cae/mm4mean/ssp370/gwl/R99p/d03",
      min_path: "s3://cadcat/wrf/cae/mm4min/ssp370/gwl/R99p/d03",
      max_path: "s3://cadcat/wrf/cae/mm4max/ssp370/gwl/R99p/d03",
      description: "Absolute 99th percentile 1-day accumulated precipitation (in mm)",
      short_desc: "How much precipitation will fall on really heavy precipitation days (in mm)",
      variable: "R99p",
      rescale: "0,265",
      colormap: "Blues",
    },
    del: {
      mean: "s3://cadcat/wrf/cae/mm4mean/ssp370/gwl/R99pd/d03",
      min_path: "s3://cadcat/wrf/cae/mm4min/ssp370/gwl/R99pd/d03",
      max_path: "s3://cadcat/wrf/cae/mm4max/ssp370/gwl/R99pd/d03",
      description: "Absolute change in 99th percentile 1-day accumulated precipitation (in mm)",
      short_desc:
        "Change in how much more precipitation will fall on really heavy precipitation days (in mm)",
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
      mean: "s3://cadcat/wrf/cae/mm4mean/ssp370/gwl/ffwige50/d03",
      min_path: "s3://cadcat/wrf/cae/mm4min/ssp370/gwl/ffwige50/d03",
      max_path: "s3://cadcat/wrf/cae/mm4max/ssp370/gwl/ffwige50/d03",
      description:
        "Absolute median annual number of days with Fosberg Fire Weather Index (FFWI) value greater than 50",
      short_desc: "How often the weather is conducive for fires in this area",
      variable: "ffwige50",
      rescale: "0,365",
      colormap: "gist_heat_r",
    },
    del: {
      mean: "s3://cadcat/wrf/cae/mm4mean/ssp370/gwl/ffwige50d/d03",
      min_path: "s3://cadcat/wrf/cae/mm4min/ssp370/gwl/ffwige50d/d03",
      max_path: "s3://cadcat/wrf/cae/mm4max/ssp370/gwl/ffwige50d/d03",
      description:
        "Change in median annual number of days with Fosberg Fire Weather Index (FFWI) value greater than 50",
      short_desc: "Change in how often the weather is conducive for fires in this area",
      variable: "ffwige50d",
      rescale: "-2,2",
      colormap: "PuOr_r",
    },
  },
];
