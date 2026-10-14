import type { MetadataRoute } from "next";

import { SITE_URL } from "@/config/constants";
import { enabledNavSections, type NavLink, navLinks } from "@/config/navigation";

export const dynamic = "force-static";

/** A link's own route plus its child pages' routes. */
function linkRoutes(link: NavLink): string[] {
  return [link.href, ...(link.children ?? []).map((child) => child.href)];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const navRoutes = enabledNavSections
    .flatMap((section) => section.links)
    .filter((link) => !link.external)
    .flatMap(linkRoutes);
  const routes = [...new Set([navLinks.home.href, ...navRoutes])];

  const staticRoutesSitemap = routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "/" ? 1 : 0.8,
  }));

  return [...staticRoutesSitemap];
}
