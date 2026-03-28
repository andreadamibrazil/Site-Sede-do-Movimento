import type { Metadata } from "next";
import { sanityFetch } from "@/sanity/lib/live";
import { pageSeoQuery } from "@/lib/sanity/queries";
import type { SanityPageSeo } from "@/lib/sanity/types";
import { siteConfig } from "@/lib/constants/siteConfig";
import { urlFor } from "@/sanity/lib/image";

/**
 * Fetches per-page SEO settings from Sanity and merges with the provided
 * fallback values. Used in every static page's generateMetadata().
 *
 * @param pageId  - matches the `pageId` field in the `pageSeo` Sanity document
 * @param fallback - default title/description used when Sanity has no data
 */
export async function getPageMetadata(
  pageId: string,
  fallback: { title: string; description?: string }
): Promise<Metadata> {
  const { data } = await sanityFetch({ query: pageSeoQuery, params: { pageId } });
  const doc = data as SanityPageSeo | null;
  const seo = doc?.seo;

  const title = seo?.metaTitle ?? fallback.title;
  const description = seo?.metaDescription ?? fallback.description ?? siteConfig.description;

  const ogImageUrl = seo?.ogImage
    ? urlFor(seo.ogImage).width(1200).height(630).url()
    : undefined;

  return {
    title,
    description,
    keywords: seo?.keywords,
    robots: seo?.noIndex ? { index: false, follow: false } : undefined,
    alternates: seo?.canonicalUrl ? { canonical: seo.canonicalUrl } : undefined,
    openGraph: {
      title,
      description,
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
