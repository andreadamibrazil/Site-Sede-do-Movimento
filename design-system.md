# Sede do Movimento — Complete Design System Specification

**Version:** 1.0.0
**Date:** 2026-03-23
**Stack:** Next.js 14, TypeScript, Tailwind CSS, Framer Motion
**Language:** UI text in Brazilian Portuguese / Tokens in English

---

## 1. COLOR SYSTEM

### 1.1 Primary Purple Scale

All values are fixed. The base is `#6A00FF`.

| Token | Hex | Usage |
|---|---|---|
| `color-purple-50` | `#F3E8FF` | Tinted backgrounds, hover fills |
| `color-purple-100` | `#E9D5FF` | Subtle section backgrounds |
| `color-purple-200` | `#D8B4FE` | Disabled state fills |
| `color-purple-300` | `#C084FC` | Decorative borders, dividers |
| `color-purple-400` | `#A855F7` | Secondary accents |
| `color-purple-500` | `#8B00FF` | Mid-range variant |
| `color-purple-600` | `#6A00FF` | PRIMARY (base) |
| `color-purple-700` | `#5A00D6` | PRIMARY HOVER |
| `color-purple-800` | `#4400A3` | Active/pressed states |
| `color-purple-900` | `#2E0070` | Dark text on light purple bg |
| `color-purple-950` | `#1A0040` | Deepest purple, dark mode surfaces |

### 1.2 Secondary Purple Scale

Base is `#9B5CFF`.

| Token | Hex | Usage |
|---|---|---|
| `color-secondary-50` | `#F5EEFF` | Very light secondary tint |
| `color-secondary-100` | `#EAD9FF` | Card hover backgrounds |
| `color-secondary-200` | `#D4B3FF` | Borders, dividers |
| `color-secondary-300` | `#BA85FF` | Icons, decorative |
| `color-secondary-400` | `#A86EFF` | Mid accent |
| `color-secondary-500` | `#9B5CFF` | SECONDARY BASE |
| `color-secondary-600` | `#8444F0` | Secondary hover |
| `color-secondary-700` | `#6D2EDB` | Secondary active |
| `color-secondary-800` | `#5520B0` | Deep secondary |
| `color-secondary-900` | `#3A1280` | Darkest secondary |

### 1.3 Accent Pink Scale

Base is `#FF4FD8`.

| Token | Hex | Usage |
|---|---|---|
| `color-pink-50` | `#FFF0FB` | Lightest pink tint |
| `color-pink-100` | `#FFD6F5` | Badge backgrounds |
| `color-pink-200` | `#FFB3ED` | Decorative fills |
| `color-pink-300` | `#FF80E1` | Hover on pink elements |
| `color-pink-400` | `#FF66DC` | Mid accent |
| `color-pink-500` | `#FF4FD8` | ACCENT BASE |
| `color-pink-600` | `#E638C0` | Accent hover |
| `color-pink-700` | `#C020A0` | Accent active |
| `color-pink-800` | `#960078` | Deep accent |
| `color-pink-900` | `#640050` | Darkest accent |

### 1.4 Semantic Color Tokens

**Success**
| Token | Value |
|---|---|
| `color-success-bg` | `#ECFDF5` |
| `color-success-border` | `#6EE7B7` |
| `color-success-text` | `#065F46` |
| `color-success-icon` | `#10B981` |
| `color-success-solid` | `#059669` |

**Warning**
| Token | Value |
|---|---|
| `color-warning-bg` | `#FFFBEB` |
| `color-warning-border` | `#FCD34D` |
| `color-warning-text` | `#92400E` |
| `color-warning-icon` | `#F59E0B` |
| `color-warning-solid` | `#D97706` |

**Error**
| Token | Value |
|---|---|
| `color-error-bg` | `#FEF2F2` |
| `color-error-border` | `#FCA5A5` |
| `color-error-text` | `#991B1B` |
| `color-error-icon` | `#EF4444` |
| `color-error-solid` | `#DC2626` |

**Info**
| Token | Value |
|---|---|
| `color-info-bg` | `#EFF6FF` |
| `color-info-border` | `#93C5FD` |
| `color-info-text` | `#1E40AF` |
| `color-info-icon` | `#3B82F6` |
| `color-info-solid` | `#2563EB` |

### 1.5 Neutral / Surface Tokens

| Token | Value | Usage |
|---|---|---|
| `color-bg` | `#FFFFFF` | Page background |
| `color-surface` | `#F7F7FB` | Card, panel, input backgrounds |
| `color-surface-raised` | `#FFFFFF` | Elevated cards (with shadow) |
| `color-text-primary` | `#111111` | Body, headings |
| `color-text-secondary` | `#6B6B6B` | Subtitles, captions, metadata |
| `color-text-disabled` | `#ABABAB` | Disabled states |
| `color-text-on-dark` | `#FFFFFF` | Text on dark/purple backgrounds |
| `color-text-on-dark-muted` | `rgba(255,255,255,0.7)` | Secondary text on dark |
| `color-border` | `#E8E8EF` | Default borders |
| `color-border-strong` | `#D0D0DF` | Emphasized borders |
| `color-border-focus` | `#6A00FF` | Focus rings |
| `color-light-purple` | `#EFE7FF` | Section tint backgrounds |

### 1.6 Overlay / Scrim Colors

| Token | Value | Usage |
|---|---|---|
| `color-scrim-light` | `rgba(0,0,0,0.3)` | Light image overlays |
| `color-scrim-medium` | `rgba(0,0,0,0.5)` | Modal backdrops |
| `color-scrim-heavy` | `rgba(0,0,0,0.75)` | Lightbox, video overlay |
| `color-scrim-purple` | `rgba(106,0,255,0.6)` | Purple-tinted hero overlays |
| `color-scrim-purple-heavy` | `rgba(106,0,255,0.85)` | Dark purple overlays |
| `color-scrim-gradient-hero` | `linear-gradient(to bottom, rgba(26,0,64,0.7) 0%, rgba(106,0,255,0.4) 100%)` | Hero image overlay |

### 1.7 Gradient Definitions

**Hero Gradient (Primary)**
```
background: linear-gradient(135deg, #6A00FF 0%, #FF4FD8 100%)
```
Usage: Hero section CTA button, hero background tint.

**Hero Gradient (Overlay)**
```
background: linear-gradient(to bottom right, rgba(106,0,255,0.9) 0%, rgba(155,92,255,0.7) 50%, rgba(255,79,216,0.5) 100%)
```
Usage: Full-screen hero with image behind.

**Card Accent Gradient**
```
background: linear-gradient(135deg, #9B5CFF 0%, #6A00FF 100%)
```
Usage: Featured course cards, stat card backgrounds.

**Subtle Tint Gradient (Section Background)**
```
background: linear-gradient(180deg, #FFFFFF 0%, #EFE7FF 100%)
```
Usage: Alternating section backgrounds.

**CTA Button Gradient**
```
background: linear-gradient(90deg, #6A00FF 0%, #9B5CFF 50%, #FF4FD8 100%)
background-size: 200% 100%
```
Usage: Hero CTA button, animates on hover by shifting background-position.

**Dark Section Gradient**
```
background: linear-gradient(135deg, #1A0040 0%, #2E0070 60%, #4400A3 100%)
```
Usage: Footer, dark testimonial sections.

**Text Gradient (Display Headings)**
```
background: linear-gradient(90deg, #6A00FF 0%, #FF4FD8 100%)
-webkit-background-clip: text
-webkit-text-fill-color: transparent
```
Usage: Hero H1 word-level accent, stats numbers.

### 1.8 Dark Mode Future-Proof Tokens

Token naming convention uses semantic purpose. When dark mode is implemented, only the token values change, never the token names.

| Light Token Value | Dark Token Value | Semantic Token Name |
|---|---|---|
| `#FFFFFF` | `#0D0020` | `--color-bg` |
| `#F7F7FB` | `#1A0040` | `--color-surface` |
| `#111111` | `#F5F0FF` | `--color-text-primary` |
| `#6B6B6B` | `#A89CC8` | `--color-text-secondary` |
| `#E8E8EF` | `#2E1A55` | `--color-border` |
| `#6A00FF` | `#9B5CFF` | `--color-brand-primary` |
| `#EFE7FF` | `#2E0070` | `--color-brand-subtle` |

### 1.9 Token Naming Convention

Structure: `color-{category}-{variant}`

Categories: `purple`, `secondary`, `pink`, `success`, `warning`, `error`, `info`, `bg`, `surface`, `text`, `border`, `scrim`

In Tailwind config, these map to: `colors.brand.purple.DEFAULT`, `colors.brand.purple.hover`, `colors.accent.pink.DEFAULT`, etc.

CSS custom properties pattern: `--color-brand-primary: #6A00FF`

---

## 2. TYPOGRAPHY SYSTEM

### 2.1 Font Loading

Font: **Plus Jakarta Sans** via `next/font/google`.

Weights to load: `300`, `400`, `500`, `600`, `700`, `800`

Subsets: `latin`, `latin-ext` (for Portuguese characters: ã, ç, ê, etc.)

Display strategy: `swap`

Variable font axis: `wght` — load as variable font `300..800` for optimal performance.

### 2.2 Font Weight Semantic Tokens

| Token | Value | CSS Variable | Usage |
|---|---|---|---|
| `font-light` | `300` | `--font-light` | Long prose, fine print |
| `font-regular` | `400` | `--font-regular` | Body text default |
| `font-medium` | `500` | `--font-medium` | UI labels, nav links |
| `font-semibold` | `600` | `--font-semibold` | Subheadings, card titles, buttons |
| `font-bold` | `700` | `--font-bold` | Section headings (H3–H4) |
| `font-extrabold` | `800` | `--font-extrabold` | Display, H1, H2 |

### 2.3 Display Text (Hero / Oversized)

Used only for hero H1 and landmark statements.

| Property | Desktop | Mobile |
|---|---|---|
| font-size | `80px` / `5rem` | `48px` / `3rem` |
| line-height | `1.05` | `1.1` |
| letter-spacing | `-0.03em` | `-0.02em` |
| font-weight | `800` | `800` |
| color | gradient or `#111111` | gradient or `#111111` |

### 2.4 Heading Scale

#### H1
| Property | Desktop | Mobile |
|---|---|---|
| font-size | `56px` / `3.5rem` | `36px` / `2.25rem` |
| line-height | `1.1` | `1.15` |
| letter-spacing | `-0.025em` | `-0.02em` |
| font-weight | `800` | `800` |
| Usage | Page hero title, main section title | Same |

#### H2
| Property | Desktop | Mobile |
|---|---|---|
| font-size | `40px` / `2.5rem` | `28px` / `1.75rem` |
| line-height | `1.2` | `1.25` |
| letter-spacing | `-0.02em` | `-0.015em` |
| font-weight | `700` | `700` |
| Usage | Section titles | Same |

#### H3
| Property | Desktop | Mobile |
|---|---|---|
| font-size | `28px` / `1.75rem` | `22px` / `1.375rem` |
| line-height | `1.3` | `1.3` |
| letter-spacing | `-0.015em` | `-0.01em` |
| font-weight | `700` | `700` |
| Usage | Card titles, subsection headers | Same |

#### H4
| Property | Desktop | Mobile |
|---|---|---|
| font-size | `22px` / `1.375rem` | `18px` / `1.125rem` |
| line-height | `1.35` | `1.35` |
| letter-spacing | `-0.01em` | `0` |
| font-weight | `600` | `600` |
| Usage | FAQ headers, accordion titles, team names | Same |

#### H5
| Property | Desktop | Mobile |
|---|---|---|
| font-size | `18px` / `1.125rem` | `16px` / `1rem` |
| line-height | `1.4` | `1.4` |
| letter-spacing | `0` | `0` |
| font-weight | `600` | `600` |
| Usage | Widget titles, footer section labels | Same |

#### H6
| Property | Desktop | Mobile |
|---|---|---|
| font-size | `16px` / `1rem` | `15px` / `0.9375rem` |
| line-height | `1.5` | `1.5` |
| letter-spacing | `0.01em` | `0.01em` |
| font-weight | `600` | `600` |
| Usage | Small labels, metadata titles | Same |

### 2.5 Body Text Scale

#### body-lg
| Property | Value |
|---|---|
| font-size | `18px` / `1.125rem` |
| line-height | `1.7` |
| letter-spacing | `0` |
| font-weight | `400` |
| Usage | Lead paragraph, intro text |

#### body-md
| Property | Value |
|---|---|
| font-size | `16px` / `1rem` |
| line-height | `1.65` |
| letter-spacing | `0` |
| font-weight | `400` |
| Usage | Default body, card descriptions |

#### body-sm
| Property | Value |
|---|---|
| font-size | `14px` / `0.875rem` |
| line-height | `1.6` |
| letter-spacing | `0.01em` |
| font-weight | `400` |
| Usage | Secondary info, metadata, event details |

#### body-xs
| Property | Value |
|---|---|
| font-size | `12px` / `0.75rem` |
| line-height | `1.5` |
| letter-spacing | `0.02em` |
| font-weight | `400` |
| Usage | Fine print, timestamps, footnotes |

### 2.6 Lead / Intro Paragraph

| Property | Desktop | Mobile |
|---|---|---|
| font-size | `20px` / `1.25rem` | `17px` / `1.0625rem` |
| line-height | `1.75` | `1.7` |
| letter-spacing | `0` | `0` |
| font-weight | `400` | `400` |
| color | `#6B6B6B` | `#6B6B6B` |
| max-width | `680px` | `100%` |
| Usage | Section subtitle below H2, hero subtitle |

### 2.7 Label / UI Text Scale

#### label-lg
`14px` / `0.875rem`, weight `600`, letter-spacing `0.04em`, uppercase

#### label-md
`12px` / `0.75rem`, weight `600`, letter-spacing `0.06em`, uppercase

#### label-sm
`11px` / `0.6875rem`, weight `600`, letter-spacing `0.08em`, uppercase

#### caption
`12px` / `0.75rem`, weight `400`, letter-spacing `0.01em`, color `#6B6B6B`

#### eyebrow (section pre-label)
`12px` / `0.75rem`, weight `700`, letter-spacing `0.12em`, uppercase, color `#6A00FF`

### 2.8 Blog / Article Prose

These apply inside `.prose` containers (article body).

| Element | Value |
|---|---|
| font-size | `17px` / `1.0625rem` |
| line-height | `1.8` |
| font-weight | `400` |
| max-width | `720px` |
| color | `#111111` |
| paragraph spacing | `1.5em` bottom margin |
| link color | `#6A00FF`, underline on hover |
| blockquote | Left border `4px solid #9B5CFF`, padding-left `24px`, italic, color `#6B6B6B` |
| code inline | Background `#EFE7FF`, color `#6A00FF`, font `JetBrains Mono`, size `0.9em`, padding `2px 6px`, radius `4px` |

### 2.9 Line Height Tokens

| Token | Value | Usage |
|---|---|---|
| `leading-tight` | `1.1` | Display, H1 |
| `leading-snug` | `1.2` | H2, H3 |
| `leading-normal` | `1.4` | H4, H5 |
| `leading-relaxed` | `1.6` | Body text |
| `leading-loose` | `1.8` | Prose, long-form |
| `leading-ui` | `1.0` | Buttons, badges (single line) |

### 2.10 Letter Spacing Tokens

| Token | Value | Usage |
|---|---|---|
| `tracking-tighter` | `-0.03em` | Display text |
| `tracking-tight` | `-0.02em` | H1, H2 |
| `tracking-snug` | `-0.01em` | H3, H4 |
| `tracking-normal` | `0` | Body |
| `tracking-wide` | `0.04em` | Labels |
| `tracking-wider` | `0.08em` | Small labels |
| `tracking-widest` | `0.12em` | Eyebrows |

---

## 3. SPACING SYSTEM

### 3.1 8px Grid Token Scale

Base unit: `8px`. All spacing is a multiple of 4px minimum, preferring 8px increments.

| Token | px | rem | Usage |
|---|---|---|---|
| `space-0` | `0px` | `0` | Reset |
| `space-0.5` | `2px` | `0.125rem` | Fine gaps, hairlines |
| `space-1` | `4px` | `0.25rem` | Tight spacing, icon gap |
| `space-2` | `8px` | `0.5rem` | Chip padding, small gap |
| `space-3` | `12px` | `0.75rem` | Input horizontal padding |
| `space-4` | `16px` | `1rem` | Base unit, default gaps |
| `space-5` | `20px` | `1.25rem` | Card padding sm |
| `space-6` | `24px` | `1.5rem` | Card padding default |
| `space-7` | `28px` | `1.75rem` | Comfortable spacing |
| `space-8` | `32px` | `2rem` | Section element gap |
| `space-10` | `40px` | `2.5rem` | Button vertical spacing |
| `space-12` | `48px` | `3rem` | Component separation |
| `space-14` | `56px` | `3.5rem` | Large gap |
| `space-16` | `64px` | `4rem` | Section padding sm |
| `space-20` | `80px` | `5rem` | Section padding md |
| `space-24` | `96px` | `6rem` | Section padding lg |
| `space-28` | `112px` | `7rem` | Section padding xl |
| `space-32` | `128px` | `8rem` | Section padding 2xl |

### 3.2 Section Vertical Spacing

| Token | Desktop | Tablet | Mobile |
|---|---|---|---|
| `section-xs` | `48px` | `40px` | `32px` |
| `section-sm` | `64px` | `56px` | `48px` |
| `section-md` | `96px` | `80px` | `64px` |
| `section-lg` | `128px` | `96px` | `80px` |
| `section-xl` | `160px` | `128px` | `96px` |
| `section-2xl` | `200px` | `160px` | `112px` |

Top and bottom padding on each section uses these values. `section-md` is the default.

### 3.3 Component Internal Padding Conventions

| Component | Horizontal | Vertical |
|---|---|---|
| Card (default) | `24px` | `24px` |
| Card (compact) | `16px` | `16px` |
| Card (spacious) | `32px` | `32px` |
| Button (lg) | `32px` | `16px` |
| Button (md) | `24px` | `12px` |
| Button (sm) | `16px` | `8px` |
| Button (xs) | `12px` | `6px` |
| Input (md) | `16px` | `12px` |
| Badge (sm) | `8px` | `2px` |
| Badge (md) | `12px` | `4px` |
| Dropdown item | `16px` | `10px` |
| Nav link | `16px` | `8px` |

### 3.4 Container Max-Widths

| Token | Max-width | Usage |
|---|---|---|
| `container-xs` | `480px` | Forms, modals |
| `container-sm` | `640px` | Prose, blog content |
| `container-md` | `768px` | Narrow layouts |
| `container-lg` | `1024px` | Default sections |
| `container-xl` | `1280px` | Wide layouts, grids |
| `container-2xl` | `1440px` | Full-width sections |
| `container-full` | `100%` | Edge-to-edge |

### 3.5 Container Horizontal Padding Per Breakpoint

| Breakpoint | px | rem |
|---|---|---|
| Mobile (< 640px) | `16px` | `1rem` |
| Tablet (640–1023px) | `24px` | `1.5rem` |
| Desktop small (1024–1279px) | `40px` | `2.5rem` |
| Desktop (1280–1439px) | `48px` | `3rem` |
| Desktop wide (≥ 1440px) | `80px` | `5rem` |

Default page container: `max-width: 1280px`, centered, with breakpoint padding above.

### 3.6 Grid Gap Conventions

| Context | Column gap | Row gap |
|---|---|---|
| Card grids | `24px` | `24px` |
| Card grids (tight) | `16px` | `16px` |
| Gallery grid | `8px` | `8px` |
| Gallery grid (lg) | `12px` | `12px` |
| Form fields | `0` | `20px` |
| Icon-text rows | `12px` | — |
| Nav items | `4px` | — |
| Footer columns | `48px` | `32px` |

---

## 4. BORDER & RADIUS SYSTEM

### 4.1 Border Radius Scale

| Token | Value | Usage |
|---|---|---|
| `radius-none` | `0px` | Sharp edges (dividers, full-width images) |
| `radius-xs` | `4px` | Badges, chips, small tags |
| `radius-sm` | `8px` | Inputs, small buttons, dropdowns |
| `radius-md` | `12px` | Cards (compact), tooltips |
| `radius-lg` | `16px` | Cards (default), panels |
| `radius-xl` | `20px` | Feature cards, hero cards |
| `radius-2xl` | `24px` | Large modal dialogs |
| `radius-3xl` | `32px` | Oversized decorative cards |
| `radius-full` | `9999px` | Buttons (pill), avatars, badges, tags |

### 4.2 Component Radius Assignment

| Component | Radius Token | Value |
|---|---|---|
| Primary / CTA buttons | `radius-full` | `9999px` |
| Secondary / Ghost buttons | `radius-full` | `9999px` |
| Icon buttons | `radius-full` | `9999px` |
| XS / SM buttons | `radius-sm` | `8px` |
| Text inputs | `radius-sm` | `8px` |
| Textarea | `radius-sm` | `8px` |
| Select | `radius-sm` | `8px` |
| Dropdown menu | `radius-lg` | `16px` |
| Gallery cards | `radius-lg` | `16px` |
| Teacher cards | `radius-xl` | `20px` |
| Event cards | `radius-xl` | `20px` |
| Course cards | `radius-xl` | `20px` |
| Blog cards | `radius-lg` | `16px` |
| Stats cards | `radius-xl` | `20px` |
| Hero section (rounded bottom edge) | `radius-3xl` | `32px` |
| Avatar / profile photo | `radius-full` | `9999px` |
| Badges | `radius-xs` | `4px` |
| Tags (pill) | `radius-full` | `9999px` |
| Accordions | `radius-lg` | `16px` |
| Modal dialogs | `radius-2xl` | `24px` |
| Partner logo cards | `radius-md` | `12px` |
| Navbar (mobile drawer) | `radius-xl` on right edge | `20px` |
| Scroll indicator | `radius-full` | `9999px` |

### 4.3 Border Width Tokens

| Token | Value | Usage |
|---|---|---|
| `border-0` | `0px` | Borderless |
| `border-1` | `1px` | Default borders, inputs, cards |
| `border-2` | `2px` | Focus rings inner, active indicators |
| `border-4` | `4px` | Accent borders, blockquotes |
| `border-8` | `8px` | Timeline connector nodes |

### 4.4 Border Color Tokens

| Token | Value | Usage |
|---|---|---|
| `border-default` | `#E8E8EF` | Default input/card borders |
| `border-strong` | `#D0D0DF` | Emphasized borders |
| `border-focus` | `#6A00FF` | Input focus, focus rings |
| `border-error` | `#EF4444` | Error state inputs |
| `border-success` | `#10B981` | Success state inputs |
| `border-accent` | `#9B5CFF` | Accent decorative borders |
| `border-transparent` | `transparent` | Ghost buttons |

### 4.5 Focus Ring Specification

All interactive elements must have a visible focus ring for accessibility.

**Default focus ring:**
- `outline: 3px solid #6A00FF`
- `outline-offset: 2px`
- `border-radius`: inherits component radius

**On dark backgrounds:**
- `outline: 3px solid #FFFFFF`
- `outline-offset: 2px`

**Focus ring for inputs (inner approach):**
- `box-shadow: 0 0 0 3px rgba(106,0,255,0.25)`
- `border-color: #6A00FF`

Never remove focus rings. Use `focus-visible` pseudo-class to suppress on mouse click only.

Tailwind: `focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-purple-600 focus-visible:ring-offset-2`

---

## 5. SHADOW SYSTEM

### 5.1 Shadow Scale

| Token | CSS Value | Usage |
|---|---|---|
| `shadow-none` | `none` | Flat elements |
| `shadow-xs` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift, badges |
| `shadow-sm` | `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)` | Inputs, small cards |
| `shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.06)` | Default card shadow |
| `shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.06)` | Hover card state |
| `shadow-xl` | `0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.06)` | Modals, elevated panels |
| `shadow-2xl` | `0 25px 50px -12px rgba(0,0,0,0.25)` | Lightbox, hero cards |
| `shadow-inner` | `inset 0 2px 4px rgba(0,0,0,0.06)` | Pressed states, inputs |

### 5.2 Brand Shadows (Purple-Tinted Glow)

| Token | CSS Value | Usage |
|---|---|---|
| `shadow-brand-sm` | `0 4px 14px rgba(106,0,255,0.25)` | CTA button default |
| `shadow-brand-md` | `0 8px 25px rgba(106,0,255,0.35)` | CTA button hover |
| `shadow-brand-lg` | `0 12px 40px rgba(106,0,255,0.45)` | Hero CTA, featured card hover |
| `shadow-brand-glow` | `0 0 40px rgba(106,0,255,0.3), 0 0 80px rgba(155,92,255,0.2)` | Decorative glow effect |
| `shadow-pink-sm` | `0 4px 14px rgba(255,79,216,0.25)` | Accent pink hover |
| `shadow-pink-md` | `0 8px 25px rgba(255,79,216,0.35)` | Pink CTA hover |

### 5.3 Hover Shadow Transitions

All shadow transitions use:
```
transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1), transform 300ms cubic-bezier(0.4, 0, 0.2, 1)
```

Standard card hover: `shadow-md` → `shadow-lg` + `translateY(-4px)`
CTA button hover: `shadow-brand-sm` → `shadow-brand-md`
Featured card hover: `shadow-md` → `shadow-brand-lg` + `translateY(-6px)`

---

## 6. BUTTON SYSTEM

### 6.1 Button Sizes

| Size | Height | H-Padding | V-Padding | Font-size | Font-weight | Radius | Min-width |
|---|---|---|---|---|---|---|---|
| `btn-xs` | `28px` | `12px` | `4px` | `12px` | `600` | `8px` | `64px` |
| `btn-sm` | `36px` | `16px` | `8px` | `14px` | `600` | `9999px` | `80px` |
| `btn-md` | `44px` | `24px` | `12px` | `15px` | `600` | `9999px` | `120px` |
| `btn-lg` | `52px` | `32px` | `14px` | `16px` | `700` | `9999px` | `160px` |
| `btn-xl` | `60px` | `40px` | `18px` | `18px` | `700` | `9999px` | `200px` |

Letter spacing on all buttons: `0.01em`

### 6.2 Primary Button

Base color: `#6A00FF`. Always pill-shaped (radius-full).

| State | Background | Border | Text | Shadow | Transform |
|---|---|---|---|---|---|
| Default | `#6A00FF` | none | `#FFFFFF` | `shadow-brand-sm` | none |
| Hover | `#5A00D6` | none | `#FFFFFF` | `shadow-brand-md` | `translateY(-1px)` |
| Active / Pressed | `#4400A3` | none | `#FFFFFF` | `shadow-inner` | `translateY(0)` |
| Focus | `#6A00FF` | none | `#FFFFFF` | `0 0 0 3px rgba(106,0,255,0.35)` | none |
| Disabled | `#D8B4FE` | none | `rgba(255,255,255,0.6)` | none | none |
| Loading | `#5A00D6` | none | transparent (spinner visible) | `shadow-brand-sm` | none |

Transition: `background-color 200ms ease, box-shadow 300ms ease, transform 200ms ease`

### 6.3 Secondary Button

Softer, using secondary purple.

| State | Background | Border | Text | Shadow | Transform |
|---|---|---|---|---|---|
| Default | `#9B5CFF` | none | `#FFFFFF` | `0 4px 14px rgba(155,92,255,0.3)` | none |
| Hover | `#8444F0` | none | `#FFFFFF` | `0 8px 20px rgba(155,92,255,0.4)` | `translateY(-1px)` |
| Active | `#6D2EDB` | none | `#FFFFFF` | shadow-inner | `translateY(0)` |
| Focus | `#9B5CFF` | none | `#FFFFFF` | `0 0 0 3px rgba(155,92,255,0.35)` | none |
| Disabled | `#D8B4FE` | none | `rgba(255,255,255,0.5)` | none | none |

### 6.4 Ghost Button

Transparent fill, purple text.

| State | Background | Border | Text | Shadow |
|---|---|---|---|---|
| Default | `transparent` | `2px solid #6A00FF` | `#6A00FF` | none |
| Hover | `#EFE7FF` | `2px solid #6A00FF` | `#5A00D6` | none |
| Active | `#E9D5FF` | `2px solid #4400A3` | `#4400A3` | none |
| Focus | `transparent` | `2px solid #6A00FF` | `#6A00FF` | `0 0 0 3px rgba(106,0,255,0.25)` |
| Disabled | `transparent` | `2px solid #D8B4FE` | `#D8B4FE` | none |

### 6.5 Outline Button

Similar to ghost but on dark backgrounds.

| State | Background | Border | Text | Shadow |
|---|---|---|---|---|
| Default | `transparent` | `2px solid rgba(255,255,255,0.6)` | `#FFFFFF` | none |
| Hover | `rgba(255,255,255,0.1)` | `2px solid #FFFFFF` | `#FFFFFF` | none |
| Active | `rgba(255,255,255,0.2)` | `2px solid #FFFFFF` | `#FFFFFF` | none |
| Focus | `transparent` | `2px solid #FFFFFF` | `#FFFFFF` | `0 0 0 3px rgba(255,255,255,0.4)` |
| Disabled | `transparent` | `2px solid rgba(255,255,255,0.25)` | `rgba(255,255,255,0.35)` | none |

### 6.6 CTA Button (Hero, Large, Gradient)

Used only in hero sections and primary landing CTAs.

| State | Background | Text | Shadow | Transform |
|---|---|---|---|---|
| Default | `linear-gradient(90deg, #6A00FF 0%, #9B5CFF 50%, #FF4FD8 100%)` at `bg-size: 200% 100%`, `bg-pos: 0%` | `#FFFFFF` | `shadow-brand-md` | none |
| Hover | Same gradient, `bg-pos: 100%` shift | `#FFFFFF` | `shadow-brand-lg` | `translateY(-2px) scale(1.02)` |
| Active | Same gradient, `bg-pos: 50%` | `#FFFFFF` | `shadow-brand-sm` | `translateY(0) scale(0.99)` |
| Focus | Same gradient | `#FFFFFF` | `0 0 0 4px rgba(106,0,255,0.4)` | none |
| Disabled | `linear-gradient(90deg, #C084FC 0%, #D8B4FE 100%)` | `rgba(255,255,255,0.5)` | none | none |

Dimensions: height `56px`, horizontal padding `40px`, font-size `17px`, font-weight `700`, radius `9999px`.

Background-position transition: `background-position 500ms ease, box-shadow 300ms ease, transform 200ms ease`.

### 6.7 Icon Button

Square or circular, icon only.

| State | Background | Border | Icon color |
|---|---|---|---|
| Default (ghost) | `transparent` | none | `#6B6B6B` |
| Hover | `#EFE7FF` | none | `#6A00FF` |
| Active | `#E9D5FF` | none | `#4400A3` |
| Focus | `transparent` | none | `#6A00FF` |

Sizes: `sm`: `32px × 32px`, icon `16px` | `md`: `40px × 40px`, icon `20px` | `lg`: `48px × 48px`, icon `24px`

Radius: `radius-full` for round, `radius-sm` for square variant.

### 6.8 Button with Icon

Left icon: icon `20px` + gap `8px` + label
Right icon: label + gap `8px` + icon `20px`

Icon inherits button text color. Icon size for `btn-lg`/`btn-xl`: `20px`. For `btn-sm`: `16px`.

### 6.9 Loading State

Spinner is a `20px` circular element with:
- `border: 2px solid rgba(255,255,255,0.3)`
- `border-top-color: #FFFFFF`
- Animation: `spin 700ms linear infinite`
- Positioned left of where text was, or centered if icon-only
- Button text: `opacity: 0` (hidden but layout preserved)
- Button: `cursor: not-allowed`, `pointer-events: none`

### 6.10 Full-Width Button

Add `width: 100%` to any button variant. Justify content: center.

---

## 7. CARD SYSTEM

### 7.1 Base Card

| Property | Value |
|---|---|
| background | `#FFFFFF` |
| border | `1px solid #E8E8EF` |
| border-radius | `16px` (radius-lg) |
| padding | `24px` |
| box-shadow | `shadow-md` |
| overflow | `hidden` |
| transition | `box-shadow 300ms ease, transform 300ms ease` |
| hover box-shadow | `shadow-lg` |
| hover transform | `translateY(-4px)` |

### 7.2 Gallery Card

| Property | Value |
|---|---|
| Aspect ratio | `4/3` |
| Border-radius | `16px` |
| overflow | `hidden` |
| Image | `object-fit: cover`, `width: 100%`, `height: 100%` |
| Overlay (default) | `rgba(0,0,0,0)` — transparent |
| Overlay (hover) | `rgba(26,0,64,0.65)` — dark purple |
| Overlay transition | `background-color 300ms ease` |
| Caption | Appears on hover from bottom: `translateY(0)` from `translateY(100%)`, white, `14px`, weight `500`, padding `16px` |
| Expand icon | `Lucide Expand` icon, `24px`, white, appears center on hover, `opacity: 0 → 1`, `scale: 0.8 → 1` |
| Hover border | `2px solid rgba(155,92,255,0.5)` |
| Hover shadow | `shadow-brand-sm` |

### 7.3 Teacher / Team Card

| Property | Value |
|---|---|
| Width | `280px` (desktop), `100%` (mobile) |
| Border-radius | `20px` (radius-xl) |
| Background | `#FFFFFF` |
| Shadow | `shadow-md` |
| Photo container | `width: 100%`, `aspect-ratio: 1/1`, `overflow: hidden`, photo fills with `object-fit: cover`, `object-position: top center` |
| Photo radius | `radius-xl` on top, `0` on bottom |
| Name | H4 style, `#111111`, weight `700`, `margin-top: 16px`, `padding: 0 20px` |
| Role | `body-sm`, `#6A00FF`, weight `600`, uppercase, `letter-spacing: 0.06em`, `padding: 4px 20px` |
| Bio reveal | On hover: second layer `position: absolute, inset: 0`, background `rgba(106,0,255,0.92)`, `body-sm` white text, `padding: 24px`, slides in from bottom via `translateY(100%) → translateY(0)`, `300ms ease` |
| Bio text | `14px`, `#FFFFFF`, `line-height: 1.6` |
| Card padding bottom | `20px` |

### 7.4 Event Card

| Property | Value |
|---|---|
| Width | Full column width |
| Border-radius | `20px` |
| Overflow | `hidden` |
| Image | `aspect-ratio: 16/9`, `object-fit: cover` |
| Date badge | Absolute, top-left `16px, 16px`, background `#6A00FF`, white, padding `8px 12px`, radius `8px`, font `12px/700/letter-spacing 0.04em`, date stacked: day number `20px/800` above month `11px/700` |
| Category tag | Absolute, top-right `16px, 16px`, background `rgba(255,79,216,0.9)`, white, `label-sm`, radius-full |
| Content area | `padding: 20px 24px 24px` |
| Title | H4 style, weight `700`, `margin-bottom: 8px`, 2-line clamp |
| Location | `body-sm`, icon `Lucide MapPin` `16px` `#9B5CFF` + text `#6B6B6B`, `margin-bottom: 8px` |
| Date/time text | `body-sm`, icon `Lucide Clock` `16px` `#9B5CFF` + text `#6B6B6B` |
| CTA | Ghost button `btn-sm`, `margin-top: 16px`, full-width |
| Hover | `translateY(-4px)`, `shadow-lg` |

### 7.5 Course / Modality Card

| Property | Value |
|---|---|
| Border-radius | `20px` |
| Background | `#FFFFFF` (default) or `linear-gradient(135deg, #6A00FF 0%, #9B5CFF 100%)` (featured variant) |
| Icon area | Centered, `64px × 64px` circle, background `#EFE7FF` (or `rgba(255,255,255,0.15)` on dark), icon `32px Lucide`, `#6A00FF` (or `#FFFFFF` on dark) |
| Title | H3 style, `margin-top: 16px` |
| Age group badge | `label-sm`, background `#EFE7FF`, color `#6A00FF`, radius-full, padding `4px 12px` |
| Schedule info | `body-sm`, icon `Lucide Calendar`, `#6B6B6B` |
| Description | `body-sm`, max 3 lines clamp, `margin: 8px 0 16px` |
| CTA | Primary `btn-sm` (on white) or outline `btn-sm` (on dark gradient) |
| Padding | `28px 24px` |
| Hover | `translateY(-6px)`, `shadow-brand-lg` on featured, `shadow-lg` on default |

### 7.6 Blog Post Card

| Property | Value |
|---|---|
| Border-radius | `16px` |
| Image | `aspect-ratio: 16/9`, `object-fit: cover`, top of card |
| Category tag | Below image, `label-sm`, color `#6A00FF`, uppercase |
| Title | H4 style, 2-line clamp, `margin: 8px 0` |
| Excerpt | `body-sm`, `#6B6B6B`, 3-line clamp, `margin-bottom: 12px` |
| Author row | `body-xs`, avatar `24px` circle + author name `#111111/500` + ` · ` + date + ` · ` + read time |
| Padding | `20px` (content area only) |
| Hover | `translateY(-4px)`, `shadow-lg` |
| Category colors | Dança: `#6A00FF` | Teatro: `#FF4FD8` | Música: `#F59E0B` | Outros: `#10B981` |

### 7.7 Partner / Logo Card

| Property | Value |
|---|---|
| Width | `160px` (desktop), `140px` (mobile) |
| Height | `80px` |
| Background | `#F7F7FB` |
| Border | `1px solid #E8E8EF` |
| Border-radius | `12px` |
| Padding | `16px 24px` |
| Logo | `max-width: 100%`, `max-height: 40px`, `object-fit: contain`, `filter: grayscale(100%)` default |
| Hover | `filter: grayscale(0%)`, `shadow-md`, `border-color: #D8B4FE` |
| Transition | `filter 300ms ease, box-shadow 300ms ease` |

### 7.8 Stats Card

| Property | Value |
|---|---|
| Width | Flex item, min `180px` |
| Background | `#FFFFFF` or `linear-gradient(135deg, #6A00FF 0%, #9B5CFF 100%)` (dark variant) |
| Border-radius | `20px` |
| Padding | `32px 28px` |
| Shadow | `shadow-md` |
| Icon | `48px × 48px` circle, background `#EFE7FF` (light) or `rgba(255,255,255,0.15)` (dark), icon `Lucide 24px` |
| Number | `56px` display size, weight `800`, gradient text (`#6A00FF → #FF4FD8`) on light variant, white on dark |
| Label | `body-sm`, `#6B6B6B` (light) or `rgba(255,255,255,0.8)` (dark), `margin-top: 4px` |
| Hover | `translateY(-4px)`, `shadow-brand-sm` (light), `shadow-xl` (dark) |

---

## 8. FORM SYSTEM

### 8.1 Text Input

Height: `48px`. Font: Plus Jakarta Sans `15px/400`. Radius: `8px`.

| State | Background | Border | Text | Placeholder | Shadow |
|---|---|---|---|---|---|
| Default | `#FFFFFF` | `1px solid #E8E8EF` | `#111111` | `#ABABAB` | `shadow-xs` |
| Focus | `#FFFFFF` | `1px solid #6A00FF` | `#111111` | `#ABABAB` | `0 0 0 3px rgba(106,0,255,0.15)` |
| Hover (not focus) | `#FFFFFF` | `1px solid #D0D0DF` | `#111111` | `#ABABAB` | `shadow-xs` |
| Error | `#FEF2F2` | `1px solid #EF4444` | `#111111` | `#ABABAB` | `0 0 0 3px rgba(239,68,68,0.15)` |
| Success | `#ECFDF5` | `1px solid #10B981` | `#111111` | `#ABABAB` | `0 0 0 3px rgba(16,185,129,0.15)` |
| Disabled | `#F7F7FB` | `1px solid #E8E8EF` | `#ABABAB` | `#ABABAB` | none |

Padding: `16px` horizontal, `12px` vertical.
Transition: `border-color 200ms ease, box-shadow 200ms ease`

For input with icon: `padding-left: 44px` (icon `20px` at `left: 14px`).

### 8.2 Textarea

Same states as text input. Min-height `120px`. Resize: `vertical` only. Padding: `16px`. `line-height: 1.6`. Radius same `8px`.

### 8.3 Select

Same visual as text input. Has `Lucide ChevronDown` icon `20px` `#6B6B6B` at `right: 16px`, center-vertical. `padding-right: 44px`. `cursor: pointer`. On focus same focus ring as input.

### 8.4 Checkbox

Size: `20px × 20px`. Radius: `6px`.

| State | Background | Border | Checkmark |
|---|---|---|---|
| Unchecked | `#FFFFFF` | `2px solid #E8E8EF` | — |
| Unchecked Hover | `#EFE7FF` | `2px solid #9B5CFF` | — |
| Checked | `#6A00FF` | `2px solid #6A00FF` | `Lucide Check` white, `14px` |
| Indeterminate | `#6A00FF` | `2px solid #6A00FF` | Dash `12px × 2px` white centered |
| Disabled Unchecked | `#F7F7FB` | `2px solid #E8E8EF` | — |
| Disabled Checked | `#D8B4FE` | `2px solid #D8B4FE` | White check |

Focus: `0 0 0 3px rgba(106,0,255,0.25)` ring around element.
Label: `body-md`, `#111111`, `margin-left: 10px`. Label and checkbox vertically center-aligned.

### 8.5 Radio Button

Size: `20px × 20px`. Radius: `9999px`.

| State | Outer ring | Inner dot |
|---|---|---|
| Unselected | `2px solid #E8E8EF` | — |
| Unselected Hover | `2px solid #9B5CFF` | — |
| Selected | `2px solid #6A00FF` | `10px × 10px` dot `#6A00FF` centered |
| Disabled | `2px solid #E8E8EF` | — |
| Disabled Selected | `2px solid #D8B4FE` | `10px × 10px` `#D8B4FE` |

### 8.6 File Upload Zone

Default state:
- Border: `2px dashed #D0D0DF`
- Background: `#F7F7FB`
- Border-radius: `12px`
- Padding: `48px 24px`
- Center-aligned content: `Lucide UploadCloud` `40px` `#9B5CFF` + text "Arraste aqui ou clique para selecionar" (`body-md`, `#6B6B6B`) + sub-text "PNG, JPG ou PDF • Max 10MB" (`body-xs`, `#ABABAB`)

Drag-over state:
- Border: `2px dashed #6A00FF`
- Background: `#EFE7FF`
- Icon color: `#6A00FF`

Uploaded state:
- Border: `2px solid #10B981`
- Background: `#ECFDF5`
- Shows filename + filesize + `Lucide CheckCircle` `#10B981` + remove button

### 8.7 Form Labels

```
font-size: 14px (0.875rem)
font-weight: 600
color: #111111
line-height: 1.4
margin-bottom: 6px
```

Required indicator: `*` in `#EF4444`, `margin-left: 2px`.

### 8.8 Helper Text

```
font-size: 13px (0.8125rem)
font-weight: 400
color: #6B6B6B
margin-top: 6px
line-height: 1.4
```

### 8.9 Error Message

```
font-size: 13px
font-weight: 500
color: #DC2626
margin-top: 6px
display: flex; align-items: center; gap: 4px
icon: Lucide AlertCircle 14px #DC2626
```

### 8.10 Success Message

Same as error but `color: #059669` and `icon: Lucide CheckCircle 14px #059669`.

### 8.11 Form Group Spacing

Vertical gap between form groups (label + input + helper): `20px`.
Horizontal gap in side-by-side fields: `16px`.
Form section title (H5): `margin-bottom: 16px`, `padding-bottom: 12px`, `border-bottom: 1px solid #E8E8EF`.
Submit button area: `margin-top: 32px`.

---

## 9. NAVBAR SYSTEM

### 9.1 Desktop Navbar

| Property | Value |
|---|---|
| Height | `72px` |
| Background (default/top) | `transparent` |
| Background (scrolled) | `rgba(255,255,255,0.95)` with `backdrop-filter: blur(12px)` |
| Background (scrolled dark page) | `rgba(26,0,64,0.95)` with `backdrop-filter: blur(12px)` |
| Border-bottom (scrolled) | `1px solid rgba(232,232,239,0.8)` |
| Position | `fixed`, `top: 0`, `z-index: 100` |
| Width | `100%` |
| Padding | `0 80px` (max-width container) |
| Transition | `background-color 300ms ease, border-color 300ms ease, box-shadow 300ms ease` |
| Shadow (scrolled) | `0 1px 20px rgba(0,0,0,0.08)` |

Logo area:
- Height: `36px` (auto width)
- Margin-right: `48px`

Nav links:
- Font: `15px`, weight `500`, `letter-spacing: 0.01em`
- Color (transparent bg): `#FFFFFF` (on dark hero) or `#111111` (on light)
- Color (scrolled): `#111111`
- Hover color: `#6A00FF`
- Gap between items: `4px`
- Padding per item: `8px 12px`
- Radius: `8px`
- Hover background: `#EFE7FF`
- Transition: `color 200ms ease, background-color 200ms ease`

Active link:
- Color: `#6A00FF`, weight `600`
- Underline: `2px solid #6A00FF` at bottom, offset `4px`, width `100%` minus padding (or a centered dot `4px × 4px` round below)

CTA button in navbar:
- Variant: Primary `btn-md`
- Margin-left: `24px`

Scroll threshold for style change: `20px` from top.

### 9.2 Mobile Navbar

| Property | Value |
|---|---|
| Height | `60px` |
| Background | `rgba(255,255,255,0.95)` always (simplify for mobile) |
| Border-bottom | `1px solid #E8E8EF` |
| Logo | `28px` height |
| Hamburger | `Lucide Menu` `24px` `#111111`, `44px × 44px` touch target |

Hamburger → Close animation:
- Open: `Lucide Menu` → `Lucide X`, cross-fade `200ms`
- Alternatively: 3-line animated bars: top rotates `45deg`, middle fades, bottom rotates `-45deg`

Drawer:
- Width: `100vw` (full screen on mobile) or `320px` (tablet)
- Background: `#FFFFFF`
- Position: `fixed`, `inset: 0` (full screen) or `top: 0, right: 0, bottom: 0`
- Z-index: `200`
- Entry animation: `translateX(100%) → translateX(0)`, `350ms cubic-bezier(0.4,0,0.2,1)`
- Exit animation: `translateX(0) → translateX(100%)`, `300ms ease`
- Backdrop (partial): `rgba(0,0,0,0.4)` on left, click to close

Drawer contents:
- Logo + close button at top, `padding: 20px`
- Nav links: `body-lg` (17px), weight `500`, full width, `padding: 14px 24px`, border-bottom `1px solid #E8E8EF` on each
- Active link: background `#EFE7FF`, color `#6A00FF`, left border `3px solid #6A00FF`
- CTA button: full-width Primary, `margin: 24px`

### 9.3 Dropdown Menu

| Property | Value |
|---|---|
| Width | `220px` min, `280px` max |
| Background | `#FFFFFF` |
| Border | `1px solid #E8E8EF` |
| Border-radius | `16px` |
| Shadow | `shadow-xl` |
| Padding | `8px` |
| Z-index | `150` |
| Entry animation | `opacity: 0 → 1`, `translateY(-8px) → translateY(0)`, `200ms ease-out` |
| Item padding | `10px 16px` |
| Item radius | `8px` |
| Item font | `14px`, weight `500`, `#111111` |
| Item hover | background `#EFE7FF`, color `#6A00FF` |
| Item icon | `Lucide 16px` left, `#9B5CFF` default, `#6A00FF` hover |
| Separator | `1px solid #E8E8EF`, `margin: 4px 8px` |

### 9.4 Z-Index Convention

| Layer | z-index | Usage |
|---|---|---|
| `z-base` | `1` | Default |
| `z-raised` | `10` | Cards on hover |
| `z-dropdown` | `50` | Dropdowns, tooltips |
| `z-sticky` | `80` | Sticky elements |
| `z-navbar` | `100` | Navbar |
| `z-drawer` | `200` | Mobile drawer |
| `z-modal` | `300` | Modals |
| `z-toast` | `400` | Toast notifications |
| `z-lightbox` | `500` | Lightbox overlay |

---

## 10. FOOTER SYSTEM

### 10.1 Layout

| Property | Value |
|---|---|
| Background | `linear-gradient(135deg, #1A0040 0%, #2E0070 60%, #4400A3 100%)` |
| Text color base | `rgba(255,255,255,0.8)` |
| Padding top | `80px` |
| Padding bottom | `40px` |
| Container max-width | `1280px` |
| Grid | 4 columns, desktop: `2fr 1fr 1fr 1fr`, tablet: `2-column`, mobile: `1-column` |
| Column gap | `48px` |
| Row gap | `40px` |

### 10.2 Logo Area (Column 1)

- Logo version: white/light, `140px` wide
- Below logo: tagline `body-sm`, `rgba(255,255,255,0.65)`, max-width `240px`, `margin-top: 12px`
- Social icons: `margin-top: 24px`, row gap `12px` (see section 10.4)
- Address/contact block: `margin-top: 20px`, `body-sm`, icon `Lucide 16px rgba(255,255,255,0.5)` + text `rgba(255,255,255,0.7)`

### 10.3 Navigation Link Style

Column label (H6): `white`, weight `700`, `letter-spacing: 0.06em`, uppercase, `font-size: 12px`, `margin-bottom: 16px`

Link items:
```
font-size: 14px
font-weight: 400
color: rgba(255,255,255,0.65)
padding: 4px 0
display: block
transition: color 200ms ease
```
Hover: `color: #FFFFFF`, optional `padding-left: 4px` shift (subtle slide-right on hover, `transition: padding 200ms ease`).

### 10.4 Social Icons

Size: `40px × 40px` circle each.
Background: `rgba(255,255,255,0.1)`
Border: `1px solid rgba(255,255,255,0.15)`
Icon: `Lucide` or brand SVG `20px` white
Border-radius: `9999px`

Hover:
- Instagram: background `linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)`
- YouTube: background `#FF0000`
- Facebook: background `#1877F2`
- TikTok: background `#000000`
- WhatsApp: background `#25D366`

Hover transition: `background 300ms ease`, `transform: scale(1.1)`

### 10.5 Newsletter Input

Inline input + button row:

Input:
- Height `44px`, background `rgba(255,255,255,0.1)`, border `1px solid rgba(255,255,255,0.2)`, radius-full, padding `0 16px`, color white, placeholder `rgba(255,255,255,0.5)`, `font-size: 14px`
- Focus: border `rgba(255,255,255,0.6)`, background `rgba(255,255,255,0.15)`

Button: Primary `btn-sm`, `margin-left: -1px` (overlap), text "Assinar".

### 10.6 Divider

`1px solid rgba(255,255,255,0.1)`, `margin: 40px 0 24px`.

### 10.7 Legal / Copyright Bar

Layout: flex, `justify-content: space-between`, `flex-wrap: wrap`, `gap: 12px`.

Text: `body-xs` `12px`, `rgba(255,255,255,0.45)`.

Left: `© 2026 Sede do Movimento. Todos os direitos reservados.`

Right: links "Política de Privacidade · Termos de Uso", same size, `rgba(255,255,255,0.55)`, hover `white`.

---

## 11. HERO SECTION SYSTEM

### 11.1 Full-Screen Hero

| Property | Value |
|---|---|
| Min-height | `100vh` |
| Display | `flex`, `align-items: center` |
| Position | `relative`, `overflow: hidden` |
| Background image | `object-fit: cover`, `object-position: center`, `position: absolute, inset: 0, z-index: 0` |
| Overlay | `position: absolute, inset: 0, z-index: 1`, `background: linear-gradient(to bottom right, rgba(26,0,64,0.85) 0%, rgba(106,0,255,0.55) 60%, rgba(255,79,216,0.2) 100%)` |
| Content | `position: relative, z-index: 2`, container with `max-width: 800px` |

### 11.2 Text Hierarchy

**Eyebrow label:**
```
font-size: 12px
font-weight: 700
letter-spacing: 0.14em
text-transform: uppercase
color: #FF4FD8
margin-bottom: 16px
display: flex; align-items: center; gap: 8px
prefix: 2px × 20px vertical bar #FF4FD8
```

**H1 (main headline):**
- Desktop: `56px–80px` display scale, weight `800`, white, `line-height: 1.05`, `letter-spacing: -0.03em`
- Mobile: `40px`, weight `800`, white
- Key word(s) can use gradient text: `linear-gradient(90deg, #FFFFFF 0%, #FF4FD8 100%)` or `#FF4FD8` solid accent

**Subtitle / Lead:**
- Desktop: `20px`, weight `400`, `rgba(255,255,255,0.8)`, `line-height: 1.7`, max-width `580px`, `margin-top: 20px`
- Mobile: `16px`, same color

**CTA Row:**
- `margin-top: 36px`, flex row, `gap: 16px`, `flex-wrap: wrap`
- Primary: CTA gradient button `btn-xl` / "Conheça as Turmas"
- Secondary: Outline button `btn-lg` / "Saiba Mais"

### 11.3 Overlay Gradient

Full-screen image hero: `linear-gradient(135deg, rgba(26,0,64,0.9) 0%, rgba(106,0,255,0.6) 50%, rgba(0,0,0,0.3) 100%)`

Split layout (text left, image right): no overlay needed; left side gradient: `linear-gradient(90deg, #1A0040 0%, #2E0070 100%)`

### 11.4 Scroll Indicator

```
position: absolute
bottom: 40px
left: 50%
transform: translateX(-50%)
display: flex; flex-direction: column; align-items: center; gap: 8px
```

Element: `40px × 60px` pill border `2px solid rgba(255,255,255,0.4)`, radius-full, with inner dot `8px × 8px` white circle animating `translateY(-8px) → translateY(8px)` with `ease-in-out 1.5s infinite`.

Below: text "Role para baixo", `body-xs`, `rgba(255,255,255,0.5)`.

### 11.5 Background Media

**Image:**
- Use `next/image` with `fill`, `priority`, `quality: 90`
- Provide multiple sizes for srcset
- Ensure `alt` describes scene

**Video (background):**
- `<video autoPlay muted loop playsInline>`
- Poster image as fallback
- Respect `prefers-reduced-motion`: pause video, show poster only
- Overlay still applies

### 11.6 Content Alignment

- Default: left-aligned on desktop, centered on mobile
- Center variant: `text-align: center`, CTA row `justify-content: center`, max-width `760px` centered
- Content positioned at vertical center (`align-items: center`) with optional `padding-top: 72px` to account for navbar height

### 11.7 Mobile Behavior

- Min-height: `100svh` (use `svh` for mobile browser chrome)
- Background image: `object-position: 60% center` (favor subject, adjust per image)
- H1: `40px`, `line-height: 1.1`
- CTAs: stacked vertically, full-width, `gap: 12px`
- Scroll indicator: hide on screens `< 640px` if space is tight

---

## 12. SECTION SYSTEM

### 12.1 Section Title Treatment

Standard section header follows this hierarchy:

1. **Eyebrow** — `label-md` uppercase, `#6A00FF`, `letter-spacing: 0.12em`, `margin-bottom: 12px`
2. **H2 heading** — `40px desktop / 28px mobile`, weight `800`, `#111111`, `margin-bottom: 16px`
3. **Subtitle / Lead** — `20px desktop / 16px mobile`, weight `400`, `#6B6B6B`, `line-height: 1.7`, max-width `600px`

Alignment variants:
- `align-left`: eyebrow + H2 + subtitle left-aligned. CTA on H2 right side (flex space-between).
- `align-center`: all centered, used for standalone sections with no sibling CTA.
- `align-split`: H2 left + subtitle right, desktop only, using a 2-column grid `gap: 48px`.

Header margin-bottom before content: `48px desktop / 36px mobile`.

### 12.2 Section Padding Per Screen Size

Default sections use `section-md` (96px/80px/64px). Use these modifiers:

| Section type | Desktop | Tablet | Mobile |
|---|---|---|---|
| Tight (inline sections) | `64px` | `56px` | `48px` |
| Default | `96px` | `80px` | `64px` |
| Feature/hero sections | `128px` | `96px` | `80px` |
| Landmark (about, manifesto) | `160px` | `128px` | `96px` |

### 12.3 Background Variants

| Variant | Background | Text | Notes |
|---|---|---|---|
| `bg-white` | `#FFFFFF` | `#111111` | Default |
| `bg-surface` | `#F7F7FB` | `#111111` | Alternating sections |
| `bg-tint` | `#EFE7FF` | `#111111` | Light purple tint, highlight sections |
| `bg-gradient` | `linear-gradient(180deg, #FFFFFF 0%, #EFE7FF 100%)` | `#111111` | Subtle fade |
| `bg-dark` | `linear-gradient(135deg, #1A0040 0%, #2E0070 100%)` | `#FFFFFF` | Dark sections |
| `bg-brand` | `#6A00FF` | `#FFFFFF` | Bold brand CTA sections |
| `bg-brand-gradient` | `linear-gradient(135deg, #6A00FF 0%, #FF4FD8 100%)` | `#FFFFFF` | Vibrant CTA banner |

### 12.4 Section Dividers

**Wave:** `<svg>` wave shape, `height: 60px`, color matches next section's background. Placed at section bottom, `position: absolute, bottom: -1px`. Smooth organic transition.

**Slant:** `clip-path: polygon(0 0, 100% 0, 100% 80%, 0 100%)` on section, or `skewY(-2deg)` with content `skewY(2deg)` to compensate.

**Straight:** Simple `1px solid #E8E8EF` (for light sections) or `1px solid rgba(255,255,255,0.1)` (dark sections).

**None:** Default — sections stack flush, background change provides visual separation.

---

## 13. GALLERY SYSTEM

### 13.1 Grid Layout

| Breakpoint | Columns | Gap |
|---|---|---|
| Mobile (< 640px) | `2` | `8px` |
| Tablet (640–1023px) | `3` | `10px` |
| Desktop (1024–1279px) | `4` | `12px` |
| Desktop wide (≥ 1280px) | `5` | `12px` |

Featured layout variant: First item spans `2 × 2`, rest are `1 × 1` (masonry-style using CSS Grid areas).

### 13.2 Photo Thumbnail

| Property | Value |
|---|---|
| Aspect ratio | `1/1` (square default) or `4/3` (landscape) |
| Border-radius | `12px` |
| overflow | `hidden` |
| Image | `object-fit: cover`, `width: 100%`, `height: 100%` |
| Cursor | `pointer` |

### 13.3 Hover State

| Property | Value |
|---|---|
| Image scale | `1.0 → 1.08` |
| Overlay | `rgba(0,0,0,0) → rgba(26,0,64,0.65)` |
| Icon | `Lucide ZoomIn` `28px` white, center, `opacity: 0 → 1`, `scale: 0.7 → 1` |
| Border | `2px solid rgba(155,92,255,0.6)` |
| Transition | `transform 350ms cubic-bezier(0.4,0,0.2,1)`, `opacity 300ms ease` |

### 13.4 Album Card

| Property | Value |
|---|---|
| Border-radius | `16px` |
| Cover image | `aspect-ratio: 4/3`, `object-fit: cover` |
| Photo count badge | Absolute `bottom: 12px right: 12px`, background `rgba(0,0,0,0.65)`, white, `12px/600`, `Lucide Image 14px` + count, padding `4px 10px`, radius-full |
| Album title | `H4`, `margin-top: 12px`, weight `700` |
| Date | `body-xs`, `#6B6B6B`, `margin-top: 4px` |
| Hover | `translateY(-4px)`, `shadow-lg`, cover image scale `1.05` |

### 13.5 Lightbox Overlay

| Property | Value |
|---|---|
| Background | `rgba(10,0,30,0.95)` |
| Backdrop-filter | `blur(4px)` |
| Z-index | `500` |
| Image max-width | `90vw` |
| Image max-height | `85vh` |
| Image border-radius | `12px` |
| Image shadow | `shadow-2xl` |
| Entry animation | `opacity: 0 → 1, scale: 0.95 → 1`, `300ms ease-out` |

Controls:
- Close: `Lucide X` `28px`, white, `position: fixed top: 24px right: 24px`, `48px × 48px` touch target
- Prev/Next arrows: `Lucide ChevronLeft/Right` `36px`, white, vertically centered on image sides, `48px × 48px` target, hover background `rgba(255,255,255,0.1)` round
- Keyboard: `Escape`, `ArrowLeft`, `ArrowRight`

Caption:
```
position: fixed, bottom: 24px, left: 50%, transform: translateX(-50%)
background: rgba(0,0,0,0.6), backdrop-filter: blur(8px)
color: #FFFFFF, font-size: 14px, font-weight: 400
padding: 8px 20px, border-radius: 9999px
max-width: 600px, text-align: center
```

Counter: `position: fixed, top: 24px, left: 50%, transform: translateX(-50%)`, same capsule style, "3 / 24".

### 13.6 Video Thumbnail

Same as photo but:
- Play button: `72px × 72px` circle, background `rgba(106,0,255,0.85)`, `Lucide Play` `32px` white (offset `2px` right for visual centering)
- Hover: play circle background → `#6A00FF`, `scale: 1.1`
- Duration badge: bottom-right, same style as photo count badge

---

## 14. TIMELINE SYSTEM

### 14.1 Connector Line

| Property | Value |
|---|---|
| Width | `2px` |
| Color (default) | `#E8E8EF` |
| Color (active/past) | `linear-gradient(to bottom, #6A00FF, #9B5CFF)` |
| Position | Vertically centered, running through all nodes |
| Pattern | Solid for past events, `dashed` for future |
| Dash pattern | `stroke-dasharray: 6 4` |

### 14.2 Node / Dot

| Property | Value |
|---|---|
| Size | `16px × 16px` |
| Background | `#FFFFFF` |
| Border | `3px solid #6A00FF` |
| Border-radius | `9999px` |
| Box-shadow | `0 0 0 4px rgba(106,0,255,0.15)` |
| Featured node | `24px × 24px`, filled `#6A00FF`, inner white dot `8px` |
| Position | Centered on connector line |

### 14.3 Year Badge

```
background: #6A00FF
color: #FFFFFF
font-size: 13px, font-weight: 700, letter-spacing: 0.04em
padding: 6px 16px
border-radius: 9999px
position: centered on line (z-index above line)
box-shadow: shadow-brand-sm
```

Appears above the first node of that year's group.

### 14.4 Event Card (Timeline)

Desktop (alternating left/right):
| Property | Value |
|---|---|
| Width | `calc(50% - 40px)` |
| Offset | `40px` from center line |
| Background | `#FFFFFF` |
| Border | `1px solid #E8E8EF` |
| Border-radius | `16px` |
| Padding | `20px 24px` |
| Shadow | `shadow-md` |

Connector arm: `40px` horizontal line, `2px solid #E8E8EF`, from card to node, same vertical center as node.

Left cards: align-right, arm points right toward node.
Right cards: align-left, arm points left toward node.

Content:
- Date: `body-xs`, `#9B5CFF`, weight `600`, uppercase
- Title: `H5`, `#111111`
- Description: `body-sm`, `#6B6B6B`

Hover: `shadow-lg`, `translateX(±4px)` (toward center)

### 14.5 Mobile (Stacked Layout)

- Connector line: left side, `left: 20px`
- Node: `left: 12px` (centered on `left: 20px` line)
- Cards: `margin-left: 48px`, full width minus margin
- Left offset creates an L-shaped connector

---

## 15. STATS / NUMBERS SECTION

### 15.1 Number Style

| Property | Value |
|---|---|
| Font-size | `64px / 4rem` desktop, `48px` tablet, `40px` mobile |
| Font-weight | `800` |
| Line-height | `1.0` |
| Color | Gradient text: `linear-gradient(90deg, #6A00FF 0%, #FF4FD8 100%)` applied via `-webkit-background-clip: text` |
| Suffix ("+", "k", "%") | Same style, slightly smaller `80%` size, same gradient |
| Animation | CountUp from `0` to target value, `2000ms`, `ease-out`, triggers on scroll entry |

### 15.2 Label Style

```
font-size: 15px
font-weight: 500
color: #6B6B6B
line-height: 1.4
margin-top: 8px
max-width: 140px
text-align: center (when centered layout)
```

### 15.3 Icon Treatment

Size: `40px × 40px` container, `24px` Lucide icon.
Background: `#EFE7FF`, radius `9999px`.
Icon color: `#6A00FF`.
Position: above number.
`margin-bottom: 12px`.

### 15.4 Container Background

Light variant: white, no background treatment, numbers stand alone.
Dark variant: `linear-gradient(135deg, #1A0040 0%, #2E0070 100%)`, number gradient stays but shows on dark; label color `rgba(255,255,255,0.7)`.

### 15.5 Grid Layout

Desktop: `4 columns`, `gap: 0`, `dividers: 1px solid #E8E8EF` between items (vertical, not around edges).
Tablet: `2 × 2`, same divider treatment.
Mobile: `2 × 2`, `gap: 24px`, no dividers.

Each stat item: `padding: 40px 32px`, `text-align: center`.

---

## 16. ACCORDION SYSTEM

### 16.1 Item

| Property | Value |
|---|---|
| Border | `1px solid #E8E8EF` |
| Border-radius | `12px` |
| Background | `#FFFFFF` |
| Margin-bottom | `8px` (gap between items) |
| Overflow | `hidden` |

### 16.2 Header

| Property | Value |
|---|---|
| Padding | `20px 24px` |
| Font-size | `16px` |
| Font-weight | `600` |
| Color | `#111111` |
| Icon | `Lucide ChevronDown` `20px`, `#6B6B6B`, right side |
| Display | `flex`, `justify-content: space-between`, `align-items: center` |
| Cursor | `pointer` |
| Background hover | `#F7F7FB` |
| Transition | `background-color 200ms ease` |

### 16.3 Icon Animation

Closed: `ChevronDown` at `rotate(0deg)`
Open: `rotate(180deg)`
Transition: `transform 300ms cubic-bezier(0.4,0,0.2,1)`

### 16.4 Content

| Property | Value |
|---|---|
| Padding | `0 24px 20px 24px` (no top padding — header provides separation) |
| Font-size | `15px` |
| Font-weight | `400` |
| Color | `#6B6B6B` |
| Line-height | `1.7` |
| Transition | `height` via `react-animated-height` or CSS `grid-template-rows: 0fr → 1fr` |

### 16.5 Active / Open State

- Header background: `#EFE7FF`
- Header text color: `#6A00FF`
- Border color: `#9B5CFF`
- Left border accent: `3px solid #6A00FF` on entire item (replaces 1px)
- Icon color: `#6A00FF`

### 16.6 Nested Accordion

Second level:
- Background: `#F7F7FB`
- Border-radius: `8px`
- Padding: `8px`
- Header font-size: `14px`, weight `600`
- Left indent: `16px padding-left` on inner items
- No border on nested items, use background differentiation only

---

## 17. TABS SYSTEM

### 17.1 Tab Bar

| Property | Value |
|---|---|
| Border-bottom | `2px solid #E8E8EF` |
| Background | transparent |
| Display | flex |
| Gap | `4px` |
| Overflow | `auto` (for scroll on mobile) |
| Scrollbar | hidden (`scrollbar-width: none`) |
| Padding-bottom | `0` (tabs sit flush on border) |

### 17.2 Tab Item

| State | Font | Color | Background | Border-bottom |
|---|---|---|---|---|
| Inactive | `15px/500` | `#6B6B6B` | transparent | none |
| Inactive hover | `15px/500` | `#111111` | `#F7F7FB` | none |
| Active | `15px/600` | `#6A00FF` | transparent | `2px solid #6A00FF` (offsets onto bar) |
| Disabled | `15px/500` | `#ABABAB` | transparent | none |

Padding: `12px 20px`.
Border-radius (tab item itself): `8px 8px 0 0`.
Transition: `color 200ms ease`.

### 17.3 Active Indicator

Style: **underline pill** — `2px solid #6A00FF`, positioned at bottom of tab item, `margin-bottom: -2px` to overlap the tab bar border.

Alternative (pill style): Background `#EFE7FF`, text `#6A00FF`, border-radius `9999px`. Tab bar has no bottom border in this variant.

### 17.4 Tab Panel

Padding: `32px 0 0 0` (top only, content handles own spacing).
Entry animation: `opacity: 0 → 1`, `translateX(-8px) → 0`, `200ms ease-out`.
No exit animation needed (instant).

### 17.5 Mobile Behavior

- Breakpoint < 768px: horizontal scroll on tab bar
- Label truncation: allowed if necessary (max-width `120px` per tab)
- Alternative for 6+ tabs on mobile: `<select>` native element styled to match brand, or convert to vertical accordion

---

## 18. BADGE & TAG SYSTEM

### 18.1 Badge Sizes

| Size | Height | H-Padding | Font-size | Font-weight | Letter-spacing | Radius |
|---|---|---|---|---|---|---|
| `badge-xs` | `18px` | `6px` | `10px` | `600` | `0.05em` | `4px` |
| `badge-sm` | `22px` | `8px` | `11px` | `600` | `0.05em` | `4px` |
| `badge-md` | `26px` | `12px` | `12px` | `700` | `0.04em` | `6px` |

### 18.2 Badge Variants

**Solid:**
Background is the color, white text.

**Outline:**
Transparent background, `1.5px border` of color, text same color.

**Subtle:**
`10% opacity` of color as background (e.g., `rgba(106,0,255,0.1)`), text is full color.

### 18.3 Badge Color Variants

| Variant | Solid BG | Subtle BG | Text | Border |
|---|---|---|---|---|
| `primary` | `#6A00FF` | `rgba(106,0,255,0.1)` | `#6A00FF` / white | `#6A00FF` |
| `secondary` | `#9B5CFF` | `rgba(155,92,255,0.1)` | `#9B5CFF` / white | `#9B5CFF` |
| `accent` | `#FF4FD8` | `rgba(255,79,216,0.1)` | `#FF4FD8` / white | `#FF4FD8` |
| `success` | `#059669` | `rgba(5,150,105,0.1)` | `#059669` / white | `#10B981` |
| `warning` | `#D97706` | `rgba(217,119,6,0.1)` | `#D97706` / white | `#F59E0B` |
| `error` | `#DC2626` | `rgba(220,38,38,0.1)` | `#DC2626` / white | `#EF4444` |
| `neutral` | `#6B6B6B` | `rgba(107,107,107,0.1)` | `#6B6B6B` / white | `#D0D0DF` |

### 18.4 Tag (Clickable)

Tags are interactive filter/category elements.

| State | Background | Border | Text | Shadow |
|---|---|---|---|---|
| Default | `#F7F7FB` | `1px solid #E8E8EF` | `#6B6B6B` | none |
| Hover | `#EFE7FF` | `1px solid #D8B4FE` | `#6A00FF` | none |
| Selected | `#6A00FF` | none | `#FFFFFF` | `shadow-brand-sm` |
| Disabled | `#F7F7FB` | `1px solid #E8E8EF` | `#ABABAB` | none |

Height: `32px`, padding `0 14px`, radius `9999px`, font `13px/600`.
Transition: `background-color 200ms ease, color 200ms ease, border-color 200ms ease`.

---

## 19. ANIMATION SYSTEM

### 19.1 Timing Function Tokens

| Token | CSS Value | Character |
|---|---|---|
| `ease-linear` | `cubic-bezier(0, 0, 1, 1)` | Constant, mechanical |
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Accelerates (exit) |
| `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Decelerates (enter) — default enter |
| `ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Smooth both ends — default transitions |
| `ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Slight overshoot/bounce |
| `ease-bounce` | `cubic-bezier(0.68, -0.55, 0.265, 1.55)` | Pronounced bounce |
| `ease-snappy` | `cubic-bezier(0.2, 0, 0, 1)` | Fast out, used for drawer open |

### 19.2 Duration Tokens

| Token | Value | Usage |
|---|---|---|
| `duration-instant` | `0ms` | No animation |
| `duration-fast` | `150ms` | Hover color changes, icon transitions |
| `duration-normal` | `300ms` | Default: card hover, button states |
| `duration-slow` | `500ms` | Page elements entering, dropdown |
| `duration-slower` | `800ms` | Full section entries |
| `duration-crawl` | `1200ms` | CountUp numbers, hero text cascade |

### 19.3 Page Transition

Implemented with Framer Motion `AnimatePresence` on route changes.

Outgoing page: `opacity: 1 → 0`, `y: 0 → -20px`, `duration: 300ms, ease-in`
Incoming page: `opacity: 0 → 1`, `y: 20px → 0`, `duration: 400ms, ease-out`
Delay between out and in: `100ms` (brief pause)

### 19.4 Hover Effects

**Cards:**
```
transition: transform 300ms ease-in-out, box-shadow 300ms ease-in-out
hover: translateY(-4px), shadow upgrade
```

**Buttons:**
```
transition: background-color 200ms ease, box-shadow 300ms ease, transform 200ms ease
hover: translateY(-1px), shadow upgrade
```

**Links (nav):**
```
transition: color 150ms ease
no transform
```

**Photos (gallery):**
```
image: transform 350ms ease-out (scale 1 → 1.08)
overlay: opacity 300ms ease
icon: transform 300ms ease-spring (scale 0.7 → 1), opacity 300ms ease
```

**Logo cards:**
```
filter: grayscale(1) → grayscale(0), 300ms ease
```

### 19.5 Scroll Reveal

Implemented with Framer Motion `useInView` + `motion.div`.

Default variant:
```js
initial: { opacity: 0, y: 32 }
animate: { opacity: 1, y: 0 }
transition: { duration: 0.6, ease: [0, 0, 0.2, 1] }
```

Trigger: `once: true`, `margin: "0px 0px -80px 0px"` (trigger slightly before entering viewport).

**Stagger timing for card grids:**
```js
parent: { staggerChildren: 0.08, delayChildren: 0.1 }
child: { opacity: 0 → 1, y: 24 → 0, duration: 0.5 }
```

**Stagger for list items:**
```js
staggerChildren: 0.05
```

**Fade-only variant (for images, large elements):**
```js
initial: { opacity: 0 }
animate: { opacity: 1 }
transition: { duration: 0.8 }
```

**Slide-from-left (timeline cards):**
```js
initial: { opacity: 0, x: -40 }
animate: { opacity: 1, x: 0 }
transition: { duration: 0.6, ease: [0, 0, 0.2, 1] }
```

### 19.6 Gallery Hover Animation Sequence

1. `0ms` — hover detected
2. `0–300ms` — overlay fades in: `rgba(0,0,0,0) → rgba(26,0,64,0.65)`
3. `0–350ms` — image scales: `1 → 1.08`
4. `100–300ms` — icon fades and scales in: `opacity 0→1, scale 0.7→1, ease-spring`
5. `200–400ms` — caption slides up from bottom: `translateY(100%) → translateY(0), ease-out`

On mouse-leave, all reverse at `200ms ease-in`.

### 19.7 Button Hover Animation Sequence

1. `0ms` — hover detected
2. `0–200ms` — `translateY(0) → translateY(-1px)`, `ease-out`
3. `0–200ms` — background-color transitions
4. `0–300ms` — box-shadow transitions to heavier shadow
5. On CTA gradient button: `background-position: 0% → 100%`, `500ms ease`

On click/active:
1. `translateY(-1px) → translateY(0)` in `100ms`
2. Shadow reduces to inner/smaller
3. Background darkens

### 19.8 Hero Text Entry Animation

Uses Framer Motion with split-text (per-word or per-character).

Sequence:
1. Eyebrow: `opacity: 0 → 1, y: 20 → 0`, `delay: 200ms, duration: 500ms`
2. H1 words stagger: each word `opacity: 0 → 1, y: 40 → 0`, `stagger: 60ms per word, start: 400ms, duration: 600ms, ease-spring`
3. Subtitle: `opacity: 0 → 1, y: 20 → 0`, `delay: 800ms, duration: 500ms`
4. CTA buttons: `opacity: 0 → 1, y: 16 → 0`, stagger `100ms` between buttons, `delay: 1100ms, duration: 400ms`
5. Scroll indicator: `opacity: 0 → 1`, `delay: 1500ms, duration: 400ms`

### 19.9 CountUp Animation for Stats

Trigger: `useInView`, once, `-80px` margin.
Easing: custom: starts fast, slows near end (`easeOutExpo`).
Duration: `2000ms`.
Format: integers only during animation; final value shows formatted (with `.` thousands separator per Brazilian convention: `1.500`).
Optional: number overshoots by `2–3%` then settles (using `ease-spring`), only for values without decimals.

### 19.10 Reduced Motion

When `@media (prefers-reduced-motion: reduce)` is active:

**Disabled entirely:**
- Page transitions (instant swap)
- Hero text split animation (content appears instantly)
- Scroll reveal animations (content visible immediately)
- CountUp animation (shows final value immediately)
- Gallery hover scale
- Card translateY on hover

**Preserved (subtle, important for usability):**
- Color transitions on buttons/links (keep, `150ms max`)
- Focus rings (must be visible instantly)
- Accordion open/close (fade only, no height animation? Keep height, remove easing to linear)
- Loading spinners (spinning is functional)
- Modal entry (simple fade-in only, `150ms`)

Implementation: wrap all Framer Motion `transition` objects with a hook `useReducedMotion()` that returns `{ duration: 0.01 }` overrides.

---

## 20. ICON SYSTEM

### 20.1 Icon Library

**Primary:** Lucide React (`lucide-react`)

**Reasons:** Tree-shakeable, consistent stroke-based style, TypeScript-native, well-maintained, large set covering all required use cases (social excluded — use brand SVGs).

Import pattern: `import { ArrowRight, Calendar, MapPin } from 'lucide-react'`

### 20.2 Icon Sizes

| Token | Size | Stroke-width | Usage |
|---|---|---|---|
| `icon-xs` | `12px` | `2` | Inline text icons, fine details |
| `icon-sm` | `16px` | `2` | Button icons (sm/md), metadata |
| `icon-md` | `20px` | `2` | Default UI icons, nav |
| `icon-lg` | `24px` | `1.75` | Card icons, feature icons |
| `icon-xl` | `32px` | `1.5` | Section icons, empty states |
| `icon-2xl` | `40px` | `1.5` | Hero icons, stats |
| `icon-3xl` | `48px` | `1.25` | Decorative, course modality icons |

### 20.3 Stroke Width Convention

- `12–20px` icons: stroke-width `2`
- `24–32px` icons: stroke-width `1.75`
- `40px+` icons: stroke-width `1.5`
- Icons on colored/branded backgrounds: stroke-width `1.5` for elegance
- Never use `fill` for Lucide icons — always stroke-based

### 20.4 Color Inheritance

All icons use `currentColor` (Lucide default). Set parent's `color` or pass `color` prop directly.

Conventions:
- Icons alongside `#6B6B6B` text: icon `#6B6B6B`
- Icons alongside `#6A00FF` text: icon `#6A00FF`
- Icons on dark backgrounds: `#FFFFFF` or `rgba(255,255,255,0.8)`
- Decorative section icons: `#9B5CFF`
- Form input icons: `#ABABAB` default, `#6A00FF` on focus

### 20.5 Social Icons

Lucide does not cover all social platforms. Use:
- **Instagram, YouTube, Facebook, TikTok, WhatsApp:** Custom SVG files, placed in `/public/icons/social/`
- Sizing: always `20px × 20px` within `40px × 40px` touch target
- Always `fill`-based for social logos (use `currentColor` as fill, set parent color)
- Accessibility: `aria-label="Instagram"` on the link, `aria-hidden="true"` on SVG

### 20.6 Decorative vs Functional Icons

**Functional icons** (convey meaning, trigger action):
- Must have `aria-label` on the containing button/link
- Icon itself: `aria-hidden="true"`, `focusable="false"`
- Never use icon alone without accessible label

**Decorative icons** (visual accent, no unique meaning):
- `aria-hidden="true"`, `role="presentation"`
- No `aria-label` needed

**Icon-only buttons:**
```tsx
<button aria-label="Fechar galeria">
  <X aria-hidden="true" />
</button>
```

**Icon with visible label:**
```tsx
<button>
  <Calendar aria-hidden="true" />
  <span>Ver Agenda</span>
</button>
```

### 20.7 Recommended Icon Assignments

| Context | Icon |
|---|---|
| Navigation close | `X` |
| Menu | `Menu` |
| Arrow right (CTA) | `ArrowRight` |
| External link | `ExternalLink` |
| Calendar / date | `Calendar` |
| Clock / time | `Clock` |
| Location | `MapPin` |
| Phone | `Phone` |
| Email | `Mail` |
| Gallery expand | `ZoomIn` or `Expand` |
| Play video | `Play` |
| Upload | `UploadCloud` |
| Download | `Download` |
| Check (success) | `CheckCircle` or `Check` |
| Error | `AlertCircle` |
| Warning | `AlertTriangle` |
| Info | `Info` |
| Chevron (accordion) | `ChevronDown` |
| Chevron (nav) | `ChevronRight` |
| Search | `Search` |
| User / profile | `User` |
| Dance (modality) | `Music2` or custom SVG |
| Theater (modality) | `Drama` |
| Music (modality) | `Music` |
| Star / rating | `Star` |
| Quotes (testimonial) | `Quote` |

---

## Implementation Notes for Developers

### Tailwind Config Integration

All design tokens should be extended in `tailwind.config.ts` under:
- `theme.extend.colors` — all color tokens
- `theme.extend.fontFamily` — `{ sans: ['Plus Jakarta Sans', 'sans-serif'] }`
- `theme.extend.fontSize` — heading and body scales
- `theme.extend.spacing` — space tokens
- `theme.extend.borderRadius` — radius tokens
- `theme.extend.boxShadow` — shadow tokens including brand variants
- `theme.extend.transitionDuration` — duration tokens
- `theme.extend.transitionTimingFunction` — easing tokens
- `theme.extend.letterSpacing` — tracking tokens
- `theme.extend.lineHeight` — leading tokens

### CSS Custom Properties

Define in `/src/app/globals.css` inside `:root {}`. This enables JS access via `getComputedStyle` and future dark mode via `[data-theme="dark"] {}`.

### Framer Motion Version

Use Framer Motion `^11.x`. Use `motion.div`, `AnimatePresence`, `useInView`, `useReducedMotion`, `useMotionValue`.

### Next.js Font Setup

```ts
// src/app/layout.tsx
import { Plus_Jakarta_Sans } from 'next/font/google'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
})
```

Apply `className={jakarta.variable}` to `<html>` and set `font-family: var(--font-sans)` in global CSS.

---

### Critical Files for Implementation

- `/src/app/globals.css` - All CSS custom properties (color tokens, spacing tokens, typography base styles) and global resets
- `/tailwind.config.ts` - Full design token extension mapping all color, spacing, typography, shadow, and animation tokens into Tailwind utilities
- `/src/app/layout.tsx` - Plus Jakarta Sans font loading configuration and HTML-level token application
- `/src/components/ui/Button.tsx` - Primary component implementing the complete button system (all variants, sizes, states, and loading behavior) — serves as the pattern for all component-level token consumption
- `/src/lib/animations.ts` - Centralized Framer Motion variant definitions for all animation patterns (scroll reveal, stagger, hero entry, page transitions, reduced motion overrides)