import { SanityImageSource } from "@sanity/image-url/lib/types/types";

// ─── Sanity document types (retornados pelas queries GROQ) ───────────────────

export interface SanityHeroSlide {
  _id: string;
  title: string;
  image: SanityImageSource;
  alt: string;
  linkType: "none" | "page" | "section" | "external";
  internalPage?: string;
  section?: string;
  externalUrl?: string;
  order: number;
  active: boolean;
}

export interface SanityAuthor {
  name: string;
  photo?: SanityImageSource;
}

export interface SanityPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: SanityImageSource;
  author: SanityAuthor;
  publishedAt: string;
  category: string;
  tags: string[];
  readingTime: number;
  body?: unknown[];
}

export interface SanityEspetaculo {
  _id: string;
  title: string;
  slug: string;
  year: string;
  venue: string;
  description: string;
  coverImage?: SanityImageSource;
  featured: boolean;
}

// ─── SEO ─────────────────────────────────────────────────────────────────────

export interface SanitySeoFields {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: SanityImageSource;
  keywords?: string[];
  noIndex?: boolean;
  canonicalUrl?: string;
}

// ─── Site Settings ───────────────────────────────────────────────────────────

export interface SanitySiteSettings {
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  facebook?: string;
  googleMapsLink?: string;
  footerTagline?: string;
  seo?: SanitySeoFields;
  imagens?: {
    homeHistoria?: SanityImageSource;
    homeMissao?: SanityImageSource;
    homeMetodologia?: SanityImageSource;
    carlosFontinelle?: SanityImageSource;
    espacoFotos?: { image: SanityImageSource; alt?: string }[];
    apresentacaoFotos?: { image: SanityImageSource; alt?: string }[];
    parcerias?: { logo?: SanityImageSource; nome?: string; url?: string }[];
    atelierFigurinosFoto?: SanityImageSource;
  };
}

// ─── Turmas ──────────────────────────────────────────────────────────────────

export type TurmaStatus = "open" | "few" | "full" | "inactive";

export interface SanityTurma {
  _id: string;
  title: string;
  teacher?: string;
  modality?: string;
  ageGroup?: string;
  dayOfWeek?: string[];
  schedule?: string;
  duration?: string;
  description?: string;
  image?: SanityImageSource;
  availableSpots?: number;
  totalSpots?: number;
  status: TurmaStatus;
  featured?: boolean;
  order?: number;
}

// ─── Galeria ─────────────────────────────────────────────────────────────────

export interface SanityGalleryPhoto extends Record<string, unknown> {
  img: SanityImageSource;
  alt?: string;
  caption?: string;
}

export interface SanityGalleryAlbum {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  coverImage?: SanityImageSource;
  category?: string;
  year?: number;
  featured?: boolean;
  order?: number;
  photoCount?: number;
  photos?: SanityGalleryPhoto[];
}

// ─── Vídeos ──────────────────────────────────────────────────────────────────

export interface SanityVideoEmbed {
  _id: string;
  title: string;
  youtubeUrl: string;
  description?: string;
  thumbnail?: SanityImageSource;
  category?: string;
  featured?: boolean;
}

// ─── SEO por Página ──────────────────────────────────────────────────────────

export interface SanityPageSeo {
  seo?: SanitySeoFields;
}

// ─── Professores ─────────────────────────────────────────────────────────────

export interface SanityProfessor {
  _id: string;
  name: string;
  role: string;
  photo?: SanityImageSource;
  bio?: string;
  specialties?: string[];
  isDirector?: boolean;
  order?: number;
}
