import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@web-generator/fashion-atelier-v1"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
