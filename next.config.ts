import type { NextConfig } from "next";

/**
 * All notice logic lives in the Python API (api/index.py).
 * On Vercel, /api/py/* is served by that Python function.
 * Locally, it is proxied to uvicorn on port 8000 (see `npm run dev`).
 */
const pythonApi = process.env.VERCEL ? "/api/" : "http://127.0.0.1:8000/api/py/:path*";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async rewrites() {
    return [{ source: "/api/py/:path*", destination: pythonApi }];
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
