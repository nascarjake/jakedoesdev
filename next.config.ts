import type { NextConfig } from "next";

// Keep the production build rooted at the custom domain. Set this only for a
// deliberate preview deployed beneath a repository subpath.
const pagesBasePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // GitHub Pages keeps its static export. The Cloudflare Worker build retains
  // server routing so D1, R2, Access, and Workers AI endpoints remain live.
  output: process.env.npm_lifecycle_event === "build:pages" ? "export" : undefined,
  trailingSlash: true,
  basePath: pagesBasePath,
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
