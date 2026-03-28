# PROJECT_ARCHITECTURE.md — Sede do Movimento

> Site institucional: escola de artes cênicas, dança e audiovisual — Rio de Janeiro.

---

## Directory Map

```
sede-do-movimento/
├── app/                          # Next.js App Router (pages + API)
│   ├── layout.tsx                # Root: font, metadata, SanityLive, SiteShell
│   ├── page.tsx                  # Homepage (10 sections)
│   ├── globals.css               # Tailwind base + custom globals
│   ├── robots.ts                 # SEO: robots.txt generation
│   ├── sitemap.ts                # SEO: sitemap.xml generation
│   ├── studio/[[...tool]]/       # Sanity Studio (excluded from SiteShell)
│   ├── a-escola/                 # School section (7 routes)
│   ├── ensino/                   # Teaching section (8 routes)
│   ├── galerias/                 # Gallery hub + fotos/videos/youtube
│   ├── blog/                     # Blog list + [slug] detail
│   ├── companhia-profissional/   # Professional company
│   ├── produtora/                # Production company
│   ├── audiovisual/              # Audiovisual unit
│   ├── atelier/                  # Atelier Fontinelle
│   └── contato/                  # Contact + ouvidoria + trabalhe-conosco
│
├── components/
│   ├── layout/
│   │   ├── SiteShell.tsx         # Wraps all pages; skips /studio
│   │   ├── SiteHeader.tsx        # Fixed nav, scroll-aware, mobile drawer
│   │   ├── SiteFooter.tsx        # Footer grid, newsletter, socials
│   │   └── (SanityLive)          # Real-time CMS preview — from @/sanity/lib/live, rendered in app/layout.tsx
│   ├── sections/                 # Full-width page sections (data-aware)
│   │   ├── HeroSlider.tsx        # Client: animated hero carousel
│   │   ├── HeroSliderServer.tsx  # Server: fetches slides, passes to client
│   │   ├── HeroSection.tsx       # Static hero variant
│   │   ├── PageHero.tsx          # Interior page hero with breadcrumbs
│   │   ├── BlogPostCard.tsx      # Blog card (list + featured variants)
│   │   ├── EspetaculoCard.tsx    # Performance card
│   │   ├── PhotoGallery.tsx      # Masonry/grid photo display
│   │   ├── TeamGrid.tsx          # Teacher/team grid
│   │   ├── StatsSection.tsx      # Animated counters
│   │   ├── TimelineSection.tsx   # School history timeline
│   │   └── ContactForm.tsx       # Contact form (client)
│   ├── ui/                       # Primitive, reusable UI components
│   │   ├── Button.tsx            # Brand button (variants: primary/secondary/ghost)
│   │   ├── SectionTitle.tsx      # Heading + subtitle block
│   │   ├── ScrollReveal.tsx      # Framer Motion scroll wrapper
│   │   ├── Badge.tsx             # Status/category badge
│   │   ├── Tag.tsx               # Text tag pill
│   │   ├── Tabs.tsx              # Tab switcher (client)
│   │   ├── Accordion.tsx         # Collapsible FAQ (client)
│   │   ├── GalleryViewer.tsx     # Lightbox viewer (client)
│   │   ├── YouTubeEmbed.tsx      # Lazy YouTube iframe
│   │   └── PlaceholderImage.tsx  # Dev placeholder (replace with Sanity images)
│   └── analytics/
│       └── GoogleTagManager.tsx  # GTM script injection
│
├── lib/
│   ├── sanity/
│   │   ├── queries.ts            # All GROQ queries (source of truth)
│   │   ├── types.ts              # TypeScript interfaces for Sanity documents
│   │   └── index.ts              # Re-exports sanity/lib client helpers
│   ├── constants/
│   │   ├── siteConfig.ts         # URLs, contacts, social links (fallbacks)
│   │   ├── navigation.ts         # Nav structure (labels, hrefs, children)
│   │   ├── mockData.ts           # Dev-only mock data
│   │   └── slides.ts             # Static slide fallback
│   ├── utils/
│   │   ├── cn.ts                 # clsx + tailwind-merge
│   │   ├── formatDate.ts         # pt-BR date formatting
│   │   └── blurDataUrl.ts        # Base64 blur placeholder
│   └── analytics.ts              # GA4 + GTM event helpers
│
├── sanity/                       # ⚠️ CMS layer — handle with care
│   ├── env.ts                    # Reads NEXT_PUBLIC_SANITY_* env vars
│   ├── lib/
│   │   ├── client.ts             # Sanity client (read + preview)
│   │   ├── image.ts              # imageUrl() builder
│   │   └── live.ts               # SanityLive + sanityFetch
│   ├── schemaTypes/              # ⚠️ Content model — changes affect editor
│   │   ├── heroSlide.ts
│   │   ├── post.ts
│   │   ├── author.ts
│   │   ├── espetaculo.ts
│   │   ├── turma.ts
│   │   ├── galleryAlbum.ts
│   │   ├── videoEmbed.ts
│   │   ├── siteSettings.ts
│   │   ├── seoObject.ts
│   │   └── index.ts
│   └── structure.ts              # Studio desk structure (sidebar layout)
│
├── types/
│   └── index.ts                  # Global TS types (non-Sanity)
│
├── public/
│   └── images/                   # Static assets (logos, OG fallback)
│       ├── LogoBranco.png
│       └── LogoPreto.png
│
├── tailwind.config.ts            # Brand tokens, custom utilities
├── next.config.mjs               # Image domains (cdn.sanity.io)
├── sanity.config.ts              # Studio config (Vision + Structure plugins)
├── sanity.cli.ts                 # CLI config for `sanity deploy`
├── tsconfig.json                 # Path aliases (@/ → root)
└── .env.local                    # ⚠️ gitignored — never commit
```

---

## Data Flow

```
Sanity CMS (cloud)
       │
       ▼
sanityFetch() — lib/sanity/live.ts
       │
       ▼
Server Component (app/**/page.tsx)
       │
       ├─→ passes typed props to Client Components
       └─→ renders HTML (SSR / ISR)

SanityLive (app/layout.tsx)
       │
       └─→ WebSocket → real-time preview in Studio
```

---

## Routing

| Route | Source | CMS Data |
|---|---|---|
| `/` | `app/page.tsx` | heroSlides, posts, espetaculos, galleryAlbums |
| `/a-escola` | `app/a-escola/page.tsx` | siteSettings |
| `/ensino` | `app/ensino/page.tsx` | turmas |
| `/ensino/horarios` | `app/ensino/horarios/page.tsx` | activeTurmas |
| `/galerias/fotos` | `app/galerias/fotos/page.tsx` | allGalleryAlbums |
| `/galerias/fotos/[slug]` | `app/galerias/fotos/[albumSlug]/page.tsx` | galleryAlbumBySlug |
| `/galerias/videos` | `app/galerias/videos/page.tsx` | activeVideos |
| `/blog` | `app/blog/page.tsx` | allPosts |
| `/blog/[slug]` | `app/blog/[slug]/page.tsx` | postBySlug |
| `/studio` | `app/studio/[[...tool]]/page.tsx` | Sanity Studio UI |

---

## Key Patterns

### Server Component (default)
```tsx
import { sanityFetch } from '@/sanity/lib/live'
import { activeTurmasQuery } from '@/lib/sanity/queries'
import type { SanityTurma } from '@/lib/sanity/types'

export default async function Page() {
  const { data } = await sanityFetch<SanityTurma[]>({ query: activeTurmasQuery })
  return <TurmaList items={data} />
}
```

### Client Component (only when needed)
```tsx
'use client'
// Use for: useState, useEffect, onClick, framer-motion in viewport
```

### Sanity Image
```tsx
import { imageUrl } from '@/sanity/lib/image'
<Image
  src={imageUrl(doc.coverImage).width(800).url()}
  alt={doc.coverImage.alt}
  fill
/>
```

---

## External Integrations

| Service | Purpose | Config |
|---|---|---|
| Sanity Cloud | Headless CMS v4.22 | `sanity.config.ts`, `sanity/env.ts` |
| Vercel | Hosting + CI/CD | Auto from GitHub main |
| Google Analytics 4 | User analytics | `lib/analytics.ts` |
| Google Tag Manager | Tag management | `components/analytics/GoogleTagManager.tsx` |
| WhatsApp API | Lead capture | `siteConfig.social.whatsapp` |
