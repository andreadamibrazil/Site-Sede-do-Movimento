import { siteConfig } from "@/lib/constants/siteConfig";

interface Props {
  title: string;
  excerpt?: string;
  publishedAt?: string;
  authorName: string;
  slug: string;
  coverImageUrl?: string;
}

export default function BlogPostSchema({ title, excerpt, publishedAt, authorName, slug, coverImageUrl }: Props) {
  const url = `${siteConfig.url}/blog/${slug}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    ...(excerpt && { description: excerpt }),
    ...(publishedAt && { datePublished: publishedAt }),
    ...(coverImageUrl && { image: { "@type": "ImageObject", url: coverImageUrl, width: 1200, height: 525 } }),
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/icon.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    url,
    inLanguage: "pt-BR",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
