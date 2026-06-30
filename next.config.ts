import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  sassOptions: {
    loadPaths: [path.join(process.cwd(), "styles")],
  },
  images: {
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
