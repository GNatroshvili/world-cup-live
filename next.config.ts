import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  sassOptions: {
    // Allows `@use "abstracts" as *;` from any .module.scss without deep relative paths.
    loadPaths: [path.join(process.cwd(), "styles")],
  },
  images: {
    // ESPN serves team crests; TheSportsDB serves badges/banners/thumbnails.
    remotePatterns: [
      { protocol: "https", hostname: "a.espncdn.com", pathname: "/**" },
      { protocol: "https", hostname: "a1.espncdn.com", pathname: "/**" },
      { protocol: "https", hostname: "a2.espncdn.com", pathname: "/**" },
      { protocol: "https", hostname: "r2.thesportsdb.com", pathname: "/**" },
      { protocol: "https", hostname: "www.thesportsdb.com", pathname: "/**" },
      { protocol: "https", hostname: "thesportsdb.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
