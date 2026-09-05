import type { NextConfig } from "next";

// API origin used by the frontend.
// Falls back to the local API during development if the environment
// variable is not defined.
const apiOrigin =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// React's development build uses eval() for development tooling.
// Keep unsafe-eval out of the production CSP.
const isDev = process.env.NODE_ENV !== "production";

const contentSecurityPolicy = [
  "default-src 'self'",

  // Next.js / React scripts
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,

  // Next.js inline styles + Google Fonts CSS
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",

  // Google Fonts font files
  "font-src 'self' https://fonts.gstatic.com",

  // Images from the app, browser blobs, and Cloudflare R2
  "img-src 'self' data: blob: https://*.r2.dev https://*.r2.cloudflarestorage.com",

  // Frontend API requests
  `connect-src 'self' ${apiOrigin}`,

  // Prevent this application from being embedded in an iframe
  "frame-ancestors 'none'",

  // Prevent <base> tag injection
  "base-uri 'self'",

  // Only allow forms to submit to this application
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  output: "standalone",

  async headers() {
    return [
      {
        source: "/:path*",

        headers: [
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy,
          },

          {
            key: "X-Frame-Options",
            value: "DENY",
          },

          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },

          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },

          {
            key: "Strict-Transport-Security",
            value:
              "max-age=63072000; includeSubDomains; preload",
          },

          {
            key: "Permissions-Policy",
            // Camera is required by the endoscopy capture functionality.
            value:
              "camera=(self), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;