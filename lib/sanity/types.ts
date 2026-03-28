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
}

// ─── Turmas ──────────────────────────────────────────────────────────────────

export type TurmaStatus = "open" | "few" | "full" | "inactive";

export interface SanityTurma {
  _id: string;
  title: string;
  teacher?: string;
  modality?: string;
  ageGroup?: string;
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

export interface SanityGalleryPhoto {
  image: SanityImageSource;
  alt: string;
  caption?: string;
  title?: string;
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
