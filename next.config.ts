import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Issue 13 fix: Security headers — CSP, framing, content type sniffing, referrer
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking
          { key: "X-Frame-Options", value: "DENY" },
          // Prevent MIME-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Don't send full URL in Referer header to external sites
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Tell browsers to only use HTTPS for this site
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          // Basic Content-Security-Policy
          // Allows: same-origin scripts, Supabase WS, ntfy push (server-side only)
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-inline/eval in dev
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
              "frame-ancestors 'none'",
            ].join("; "),
          },
          // Disable browser features not needed by this app
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
