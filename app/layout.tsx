import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import SiteShell from "@/components/layout/SiteShell";
import { SanityLive } from "@/sanity/lib/live";
import GoogleTagManager from "@/components/analytics/GoogleTagManager";
import OrganizationSchema from "@/components/schema/OrganizationSchema";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { sanityFetch } from "@/sanity/lib/live";
import { siteSettingsQuery } from "@/lib/sanity/queries";
import type { SanitySiteSettings } from "@/lib/sanity/types";
import { urlFor } from "@/sanity/lib/image";
import { siteConfig } from "@/lib/constants/siteConfig";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "";

export async function generateMetadata(): Promise<Metadata> {
  const { data: settings } = await sanityFetch({ query: siteSettingsQuery });
  const s = settings as SanitySiteSettings | null;
  const seo = s?.seo;

  const title = seo?.metaTitle ?? `${siteConfig.name} — ${siteConfig.tagline}`;
  const description = seo?.metaDescription ?? siteConfig.description;
  const keywords = seo?.keywords ?? ["escola de dança", "teatro", "música", "artes cênicas", "Rio de Janeiro", "formação artística"];
  const ogImageUrl = seo?.ogImage ? urlFor(seo.ogImage).width(1200).height(630).url() : undefined;
  const noIndex = seo?.noIndex ?? false;
  const canonical = seo?.canonicalUrl ?? siteConfig.url;

  return {
    title: {
      default: title,
      template: `%s | ${siteConfig.name}`,
    },
    description,
    keywords,
    metadataBase: new URL(siteConfig.url),
    alternates: { canonical },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "pt_BR",
      url: canonical,
      siteName: siteConfig.name,
      ...(ogImageUrl && {
        images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImageUrl && { images: [ogImageUrl] }),
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={jakarta.variable}>
      <body className="font-sans antialiased">
        {GTM_ID && <GoogleTagManager gtmId={GTM_ID} />}
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+"w2zts1zjgq"+"?ref=bwt";y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script","w2zts1zjgq");`,
          }}
        />
        <OrganizationSchema />
        <SiteShell>{children}</SiteShell>
        <SanityLive />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
