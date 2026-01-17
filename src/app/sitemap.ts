import type { MetadataRoute } from "next";

import { SITE_URL } from "@/config/constants";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  const routes: string[] = [
    "", // Home page
    "/dashboard/data-download-tool",
    "/dashboard/data-explorer",
    "/dashboard/renewables-visualizer",
  ];

  const staticRoutesSitemap = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  return [...staticRoutesSitemap];
}
