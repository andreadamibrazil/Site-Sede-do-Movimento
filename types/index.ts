export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
  isExternal?: boolean;
  badge?: string;
}

export interface MediaAsset {
  type: "image" | "video";
  src: string;
  alt?: string;
  posterSrc?: string;
  priority?: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio?: string;
  specialties?: string[];
  photo?: string;
}

export interface Modality {
  id: string;
  name: string;
  description: string;
  ageGroups: string[];
  icon: string;
  color: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  author: { name: string; avatar?: string };
  publishedAt: string;
  tags: string[];
  category: string;
  readingTime: number;
  content?: string;
}

export interface Stat {
  value: string;
  label: string;
  suffix?: string;
}

export interface TimelineEntry {
  year: string;
  title: string;
  description: string;
  imageSrc?: string;
}

export interface Photo {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface Video {
  id: string;
  title: string;
  thumbnailSrc?: string;
  youtubeId: string;
  duration?: string;
  category?: string;
}

export interface Espetaculo {
  year: string;
  title: string;
  venue: string;
  description?: string;
  bannerSrc?: string;
  slug: string;
}

export interface FooterColumn {
  title: string;
  links: { label: string; href: string; isExternal?: boolean }[];
}

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "cta";
export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";
