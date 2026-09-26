import type { NextConfig } from "next";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/bhashini/:path*",
        destination: `${BACKEND_URL}/api/bhashini/:path*`,
      },
      {
        source: "/api/clinical/:path*",
        destination: `${BACKEND_URL}/api/clinical/:path*`,
      },
    ];
  },
};

export default nextConfig;
