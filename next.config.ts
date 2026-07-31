import type { NextConfig } from "next";

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
