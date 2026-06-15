import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  sassOptions: {
    // Allows `@use "abstracts" as *;` from any .module.scss without deep relative paths.
    loadPaths: [path.join(process.cwd(), "styles")],
  },
  images: {
    // TheSportsDB serves badges/banners/thumbnails from these hosts.
    remotePatterns: [
      { protocol: "https", hostname: "r2.thesportsdb.com", pathname: "/**" },
      { protocol: "https", hostname: "www.thesportsdb.com", pathname: "/**" },
      { protocol: "https", hostname: "thesportsdb.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
