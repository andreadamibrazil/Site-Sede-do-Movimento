import { siteConfig } from "@/lib/constants/siteConfig";

interface Props {
  title: string;
  excerpt: string;
  publishedAt: string;
  authorName: string;
  slug: string;
  coverImageUrl?: string;
}

/**
 * Schema markup para posts do blog.
 * Tipo: Article
 * Melhora SEO de conteúdo e aumenta chance de ser citado por IAs
 * em respostas sobre dança, teatro e artes cênicas no Rio de Janeiro.
 *
 * Adicionado em app/blog/[slug]/page.tsx passando dados do Sanity.
 */
export default function BlogPostSchema({
  title,
  excerpt,
  publishedAt,
  authorName,
  slug,
  coverImageUrl,
}: Props) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: excerpt,
    datePublished: publishedAt,
    dateModified: publishedAt,
    url: `${siteConfig.url}/blog/${slug}`,
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
        url: `${siteConfig.url}/og-image.jpg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/blog/${slug}`,
    },
    ...(coverImageUrl && {
      image: {
        "@type": "ImageObject",
        url: coverImageUrl,
        width: 1200,
        height: 630,
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
