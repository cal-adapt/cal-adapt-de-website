import type { MetadataRoute } from "next";

import { climateStories } from "@/config/climate-stories";
import { SITE_URL } from "@/config/constants";
import { featureFlags } from "@/config/feature-flags";
import { navGroups, navLinks } from "@/config/navigation";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: string[] = [navLinks.home.href, ...navGroups.tools.links.map((link) => link.href)];

  if (featureFlags.__FF_CLIMATE_STORIES__) {
    routes.push(navLinks.climateStories.href, ...climateStories.map((story) => story.href));
  }

  const staticRoutesSitemap = routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "/" ? 1 : 0.8,
  }));

  return [...staticRoutesSitemap];
}
