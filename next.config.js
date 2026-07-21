const createMDX = require("@next/mdx");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  // Allow `.mdx` files to be treated as pages/routes alongside JS/TS files.
  pageExtensions: ["js", "jsx", "ts", "tsx", "mdx"],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
};

const withMDX = createMDX({
  options: {
    // Plugins must be referenced by string name (not imported functions) so they
    // work with Turbopack, which can't pass JS functions to its Rust pipeline.
    // Any options passed must be JSON-serializable for the same reason.
    remarkPlugins: ["remark-gfm"],
    rehypePlugins: [
      [
        "rehype-citation",
        {
          bibliography: "public/references.bib",
          csl: "public/citation-style-apa.csl",
          linkCitations: true,
        },
      ],
    ],
  },
});

module.exports = withMDX(nextConfig);
