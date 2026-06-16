import { MetadataRoute } from "next";
import { sanityFetch } from "@/sanity/lib/live";
import { postSlugsQuery, allGalleryAlbumsQuery } from "@/lib/sanity/queries";
import type { SanityGalleryAlbum } from "@/lib/sanity/types";

const BASE_URL = "https://sededomovimento.art";

type ChangeFrequency = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

interface RouteEntry {
  path: string;
  changeFrequency: ChangeFrequency;
  priority: number;
}

const routes: RouteEntry[] = [
  // Página principal
  { path: "/", changeFrequency: "daily", priority: 1.0 },

  // Blog (alta frequência de conteúdo novo)
  { path: "/blog", changeFrequency: "daily", priority: 0.9 },

  // A Escola — seções principais
  { path: "/a-escola", changeFrequency: "weekly", priority: 0.85 },
  { path: "/a-escola/apresentacao", changeFrequency: "monthly", priority: 0.8 },
  { path: "/a-escola/historia-e-estrutura", changeFrequency: "monthly", priority: 0.8 },
  { path: "/a-escola/espetaculos", changeFrequency: "weekly", priority: 0.85 },
  { path: "/a-escola/resultados", changeFrequency: "monthly", priority: 0.75 },
  { path: "/a-escola/parcerias", changeFrequency: "monthly", priority: 0.7 },
  { path: "/a-escola/projeto-social", changeFrequency: "monthly", priority: 0.75 },

  // Ensino — seções principais (alta relevância para busca)
  { path: "/ensino", changeFrequency: "weekly", priority: 0.9 },
  { path: "/ensino/modalidades", changeFrequency: "monthly", priority: 0.85 },
  { path: "/ensino/horarios", changeFrequency: "weekly", priority: 0.9 },
  { path: "/ensino/equipe", changeFrequency: "monthly", priority: 0.8 },
  { path: "/ensino/metodologia", changeFrequency: "monthly", priority: 0.75 },
  { path: "/ensino/formacao-infantil", changeFrequency: "monthly", priority: 0.8 },
  { path: "/ensino/jornadas-artisticas", changeFrequency: "weekly", priority: 0.75 },
  { path: "/ensino/eventos-extras", changeFrequency: "weekly", priority: 0.75 },
  { path: "/ensino/estrutura-pedagogica", changeFrequency: "monthly", priority: 0.7 },

  // Galerias
  { path: "/galerias", changeFrequency: "weekly", priority: 0.8 },
  { path: "/galerias/fotos", changeFrequency: "weekly", priority: 0.8 },
  { path: "/galerias/videos", changeFrequency: "weekly", priority: 0.75 },
  { path: "/galerias/youtube", changeFrequency: "weekly", priority: 0.75 },

  // Universo Sede
  { path: "/companhia-profissional", changeFrequency: "monthly", priority: 0.75 },
  { path: "/produtora", changeFrequency: "monthly", priority: 0.7 },
  { path: "/audiovisual", changeFrequency: "monthly", priority: 0.7 },
  { path: "/atelier", changeFrequency: "monthly", priority: 0.7 },

  // Contato
  { path: "/contato", changeFrequency: "monthly", priority: 0.75 },
  { path: "/contato/trabalhe-conosco", changeFrequency: "monthly", priority: 0.65 },
  { path: "/contato/ouvidoria", changeFrequency: "monthly", priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ data: rawPostSlugs }, { data: rawAlbums }] = await Promise.all([
    sanityFetch({ query: postSlugsQuery }),
    sanityFetch({ query: allGalleryAlbumsQuery }),
  ]);

  const postSlugs = rawPostSlugs as { slug: string; _updatedAt?: string }[];
  const albums = rawAlbums as (SanityGalleryAlbum & { _updatedAt?: string })[];

  const staticRoutes: MetadataRoute.Sitemap = routes.map(({ path, changeFrequency, priority }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));

  const blogRoutes: MetadataRoute.Sitemap = postSlugs
    .filter((p) => !!p.slug)
    .map(({ slug, _updatedAt }) => ({
      url: `${BASE_URL}/blog/${slug}`,
      lastModified: _updatedAt ? new Date(_updatedAt) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  const albumRoutes: MetadataRoute.Sitemap = albums
    .filter((a) => !!a.slug)
    .map(({ slug, _updatedAt }) => ({
      url: `${BASE_URL}/galerias/fotos/${slug}`,
      lastModified: _updatedAt ? new Date(_updatedAt) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.65,
    }));

  return [...staticRoutes, ...blogRoutes, ...albumRoutes];
}
