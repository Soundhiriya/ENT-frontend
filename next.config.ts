import type { NextConfig } from "next";

// R2 endpoint/public-url host aren't exposed to the frontend as env vars
// today (only NEXT_PUBLIC_API_URL is) — image requests go through
// NEXT_PUBLIC_API_URL is the API origin; the R2 hosts below cover both the
// legacy public bucket URL pattern and the S3-compatible presigned-URL host,
// since presigned endoscopy image URLs are now served directly from R2.
const apiOrigin = process.env.NEXT_PUBLIC_API_URL || "";

// React's development build uses eval() to reconstruct call stacks across the
// server/client boundary. Production React never does, so 'unsafe-eval' is
// added in dev only and the deployed CSP stays strict.
const isDev = process.env.NODE_ENV !== "production";

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://*.r2.dev https://*.r2.cloudflarestorage.com`,
  `connect-src 'self' ${apiOrigin}`.trim(),
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            // camera=(self) — endoscopy capture needs getUserMedia from our own
            // origin; an empty allowlist blocks it before the user is prompted.
            value: "camera=(self), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
