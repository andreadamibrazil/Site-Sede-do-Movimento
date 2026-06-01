# CLAUDE.md — Sede do Movimento

AI instruction file. Read before making any changes.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS (custom design system) |
| Animations | Framer Motion |
| CMS | Sanity v4.22 (headless) |
| Icons | Lucide React |
| Images | @sanity/image-url + next/image |
| Deploy | GitHub → Vercel (auto) |

---

## Absolute Rules

### NEVER do this
- Hardcode text that belongs in Sanity (titles, images, descriptions, links)
- Remove or rewrite GROQ queries in `lib/sanity/queries.ts`
- Delete or alter Sanity schema files in `sanity/schemaTypes/`
- Remove `SanityLive` from `app/layout.tsx`
- Remove `next/image` in favor of `<img>` tags
- Add inline styles that override Tailwind tokens
- Remove `ScrollReveal`, `framer-motion`, or animation wrappers
- Touch `components/analytics/GoogleTagManager.tsx` or `lib/analytics.ts` without explicit instruction
- Remove metadata exports from page files
- Break responsive layout (always mobile-first)

### ALWAYS do this
- Use `cn()` from `lib/utils/cn.ts` for conditional classNames
- Use `formatDate()` from `lib/utils/formatDate.ts` for dates
- Use Tailwind tokens from `tailwind.config.ts` (never raw hex values)
- Keep Server Components as default — only add `'use client'` when strictly needed
- Use `SanityImage` pattern with `imageUrl().url()` for all Sanity images
- Keep `alt` text on every image (SEO + accessibility)
- Export `metadata` from every page file

---

## Sensitive Files — Handle with Care

| File/Folder | Risk |
|---|---|
| `sanity/schemaTypes/` | Breaking changes affect CMS editor |
| `lib/sanity/queries.ts` | Broken queries = blank pages |
| `lib/sanity/types.ts` | Type mismatches crash build |
| `sanity/env.ts` | Env var changes break CMS connection |
| `sanity.config.ts` | Breaks Sanity Studio at `/studio` |
| `lib/analytics.ts` | Breaks event tracking |
| `components/analytics/` | Breaks GA4/GTM |
| `app/layout.tsx` | Affects entire site (fonts, metadata, live preview) |
| `app/robots.ts` | Affects SEO indexing |
| `app/sitemap.ts` | Affects SEO discovery |

---

## CMS-Driven Areas — Never Hardcode

| Area | Sanity Type | Query |
|---|---|---|
| Hero slides | `heroSlide` | `heroSlidesQuery` |
| Blog posts | `post` | `allPostsQuery`, `postBySlugQuery` |
| Photo galleries | `galleryAlbum` | `allGalleryAlbumsQuery`, `galleryAlbumBySlugQuery` |
| Videos | `videoEmbed` | `activeVideosQuery` |
| Classes (Turmas) | `turma` | `activeTurmasQuery`, `featuredTurmasQuery` |
| Performances | `espetaculo` | `allEspetaculosQuery` |
| Footer/Contact | `siteSettings` | `siteSettingsQuery` |
| Global SEO | `siteSettings.seo` | `siteSettingsQuery` |
| SEO por página | `pageSeo` | `pageSeoQuery` |

---

## Component Patterns

```tsx
// ✅ Correct: Server Component with Sanity data
import { sanityFetch } from '@/sanity/lib/live'
import { activeTurmasQuery } from '@/lib/sanity/queries'

export default async function Page() {
  const { data } = await sanityFetch({ query: activeTurmasQuery })
  return <TurmaGrid turmas={data} />
}

// ✅ Correct: Image from Sanity
import { imageUrl } from '@/sanity/lib/image'
<Image src={imageUrl(slide.image).url()} alt={slide.alt} fill />

// ✅ Correct: className merging
import { cn } from '@/lib/utils/cn'
<div className={cn('base-class', condition && 'conditional-class')} />

// ❌ Wrong: hardcoded CMS content
<h1>Sede do Movimento</h1>  // use siteSettings from Sanity

// ❌ Wrong: raw hex colors
<div style={{ color: '#6A00FF' }} />  // use text-brand-purple-600
```

---

## Environment Variables

```
NEXT_PUBLIC_SANITY_PROJECT_ID    # required
NEXT_PUBLIC_SANITY_DATASET       # required (production)
NEXT_PUBLIC_SANITY_API_VERSION   # optional (default: 2026-03-24)
NEXT_PUBLIC_GTM_ID               # optional — Google Tag Manager container ID (ex: GTM-XXXXXXX)
```

Never commit `.env.local`. It is gitignored.

---

## Deployment

- Push to `main` → Vercel auto-deploys
- Sanity Studio available at `/studio` (production + dev)
- CMS preview: real-time via `SanityLive` in root layout

---

## Brand Tokens (Tailwind)

```
Primary:   bg-brand-purple-600  (#6A00FF)  — hover: bg-brand-purple-700
Secondary: bg-brand-pink-500    (#FF4FD8)
Font:      font-sans (Plus Jakarta Sans, weights 300–800)
Gradient:  bg-gradient-brand / bg-gradient-cta / bg-gradient-dark / bg-gradient-tint / bg-gradient-hero / bg-gradient-card
Shadow:    shadow-brand-md / shadow-brand-glow
```

See full design system: `design-system.md` (inside `sede-do-movimento/`).

---

## Tamanho padrão de badges e tags (OBRIGATÓRIO)

Todo novo design deve usar estes tamanhos. Nunca usar `text-xs` ou padding menor que os abaixo para badges/tags visíveis ao usuário.

| Tipo | Classes obrigatórias |
|---|---|
| Badge de status (Disponível / Lotado / Vagas) | `text-sm font-semibold px-3 py-1.5 rounded-full` |
| Tag de informação (faixa etária, dia, modalidade) | `text-sm font-semibold px-4 py-1.5 rounded-full border` |
| Contador/meta (ex: "13 aulas") | `text-sm font-semibold px-4 py-1.5 rounded-full border border-gray-200` |
| Badge de destaque em card (ex: faixa etária em jornadas) | `text-sm font-bold px-4 py-2 rounded-full` |

**Por que:** tamanhos menores foram aprovados apenas em contextos tipográficos puros. Elementos interativos e informativos devem ser facilmente legíveis no mobile sem zoom.

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
|------|----------|
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- After modifying code files in this session, run `python3 -c "from graphify.watch import _rebuild_code; from pathlib import Path; _rebuild_code(Path('.'))"` to keep the graph current
