/** @type {import('next').NextConfig} */

// Content-Security-Policy built from the site's actual external dependencies:
// GTM, Google Analytics, Microsoft Clarity, Vercel Analytics/SpeedInsights,
// Sanity CDN + live WebSocket, Google Fonts, YouTube thumbnails.
// Note: 'unsafe-inline' is required by Next.js hydration scripts and GTM;
// 'unsafe-eval' is required by some Next.js internals in production builds.
const ContentSecurityPolicy = [
  "default-src 'self'",
  [
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://*.clarity.ms",
    "https://va.vercel-scripts.com",
    "https://*.sanity-cdn.com",  // Sanity Studio bridge + modules
  ].join(" "),
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  [
    "img-src 'self' data: blob:",
    "https://cdn.sanity.io",
    "https://img.youtube.com",
    "https://i.ytimg.com",
    "https://www.google-analytics.com",
    "https://www.googletagmanager.com",
    "https://lh3.googleusercontent.com",  // Google profile photos in Studio
  ].join(" "),
  [
    "connect-src 'self'",
    "https://*.sanity.io",
    "wss://*.sanity.io",
    "https://sanity-cdn.com",            // Sanity module registry
    "https://*.sanity-cdn.com",
    "https://www.google-analytics.com",
    "https://region1.google-analytics.com",
    "https://*.clarity.ms",
    "https://vitals.vercel-insights.com",
    "https://va.vercel-scripts.com",
  ].join(" "),
  // 'self' needed so Studio can iframe /api/draft-mode/enable on same domain
  "frame-src 'self' https://www.youtube.com https://www.instagram.com https://www.googletagmanager.com https://*.sanity.io",
  "media-src 'self' https://cdn.sanity.io blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self' https://*.sanity.io",
].join("; ");

const securityHeaders = [
  // Prevent browsers from doing MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Control referrer information sent with requests
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Restrict access to browser features
  { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=()" },
  // Enable DNS prefetching for performance
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Full CSP
  { key: "Content-Security-Policy", value: ContentSecurityPolicy },
];

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/vi/**",
      },
    ],
  },
  async headers() {
    return [
      {
        // Studio routes: no CSP restriction — Sanity Studio manages its own security
        source: "/studio(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "frame-ancestors", value: "'self' https://*.sanity.io" },
        ],
      },
      {
        // All other routes: full CSP
        source: "/((?!studio).*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
