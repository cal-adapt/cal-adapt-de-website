import { toKebabCase } from "@/utils/string";

export const SITE_TITLE = "Cal-Adapt";

export const SITE_DESCRIPTION =
  "Cal-Adapt delivers critical climate data and cutting-edge tools to empower communities, researchers, and decision-makers to take action now.";

export const FEEDBACK_URL = "https://forms.gle/PS7i5MYzF6ixdiq28";

export const ANALYTICS_ENGINE_URL = "https://analytics.cal-adapt.org";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.AWS_BRANCH && process.env.AWS_APP_ID
    ? `https://${toKebabCase(process.env.AWS_BRANCH)}.${process.env.AWS_APP_ID}.amplifyapp.com`
    : "http://localhost:3000");

export const MAP_API_BASE_URL = "https://map.cal-adapt.org";

export const STAC_API_BASE_URL = "https://stac.cal-adapt.org";
