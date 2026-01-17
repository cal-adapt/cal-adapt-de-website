import type { MetadataRoute } from "next";

import { SITE_URL } from "@/config/constants";

export const dynamic = "force-static";

const noIndexPaths = [
  "/api/", // Next.js API routes
];

export default function robots(): MetadataRoute.Robots {
  // If this is not a production environment, disallow all requests
  if (process.env.NODE_ENV !== "production") {
    return {
      rules: [
        {
          userAgent: "*",
          disallow: "*",
        },
      ],
    };
  }

  return {
    rules: [
      ...noIndexPaths.map((path) => ({
        userAgent: "*",
        disallow: path,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
