import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Hide the floating Next.js tech badge in `next dev`
  devIndicators: false,
  // Dev-only: allow the app to hydrate when opened via an IP or a tunnelled
  // preview host (Next 16 blocks cross-origin /_next/* requests by default).
  // Allow preview / tunnel hosts when briefly using `next dev`.
  // For public sharing, prefer `npm run build` + production start (no HMR).
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "*.e2b.app",
    "fcitwork.dpdns.org",
    "*.dpdns.org",
  ],
};

export default nextConfig;
