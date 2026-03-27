import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/studio/", "/api/"] },
    sitemap: "https://sededomovimento.com.br/sitemap.xml",
  };
}
