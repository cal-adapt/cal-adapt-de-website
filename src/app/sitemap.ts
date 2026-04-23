import type { MetadataRoute } from "next";

import { SITE_URL } from "@/config/constants";
import { navGroups, navLinks } from "@/config/navigation";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: string[] = [navLinks.home.href, ...navGroups.tools.links.map((link) => link.href)];

  const staticRoutesSitemap = routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "/" ? 1 : 0.8,
  }));

  return [...staticRoutesSitemap];
}
