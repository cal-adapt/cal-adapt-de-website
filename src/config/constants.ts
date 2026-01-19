import { toKebabCase } from "@/utils/string";

export const SITE_TITLE = "Cal-Adapt";
export const SITE_DESCRIPTION =
  "Cal-Adapt delivers critical climate data and cutting-edge tools to empower communities, researchers, and decision-makers to take action now.";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.AWS_BRANCH && process.env.AWS_APP_ID
    ? `https://${toKebabCase(process.env.AWS_BRANCH)}.${process.env.AWS_APP_ID}.amplifyapp.com`
    : "http://localhost:3000");
