import type { NextConfig } from "next";

// Keep the production build rooted at the custom domain. Set this only for a
// deliberate preview deployed beneath a repository subpath.
const pagesBasePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: pagesBasePath,
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
