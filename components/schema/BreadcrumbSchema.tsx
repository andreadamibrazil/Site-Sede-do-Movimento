import { siteConfig } from "@/lib/constants/siteConfig";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface Props {
  items: BreadcrumbItem[];
}

/**
 * Schema markup para breadcrumbs.
 * Tipo: BreadcrumbList
 * Usar nas páginas que já têm breadcrumb visual no PageHero.
 * Melhora a exibição nos resultados do Google (mostra o caminho da página).
 *
 * Uso:
 *   <BreadcrumbSchema items={[
 *     { label: "A Escola", href: "/a-escola" },
 *     { label: "Espetáculos" },
 *   ]} />
 */
export default function BreadcrumbSchema({ items }: Props) {
  const allItems = [{ label: "Início", href: "/" }, ...items];

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: allItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href ? `${siteConfig.url}${item.href}` : undefined,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
