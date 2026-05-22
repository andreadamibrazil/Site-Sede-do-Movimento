# Sede do Movimento — Design System

## Colors (Tailwind tokens only)
- Primary: `brand-purple-600` (#6A00FF) — hover: `brand-purple-700`
- Secondary: `brand-pink-500` (#FF4FD8)
- Light tint: `brand-light` (#EFE7FF)
- Dark: `brand-purple-950` (#1A0040)

## Gradients
- `bg-gradient-brand`: 135deg, purple → pink
- `bg-gradient-dark`: 135deg, #1A0040 → #2E0070 → #4400A3
- `bg-gradient-tint`: 180deg, white → brand-light
- `bg-gradient-card`: 135deg, secondary-500 → purple-600

## Typography
- Font: Plus Jakarta Sans (var(--font-jakarta))
- Weights: 300–800 available
- Body max-width: 65ch

## Badges & Tags (MANDATORY sizes)
| Type | Classes |
|---|---|
| Status badge | `text-sm font-semibold px-3 py-1.5 rounded-full` |
| Info tag | `text-sm font-semibold px-4 py-1.5 rounded-full border` |
| Highlight badge on card | `text-sm font-bold px-4 py-2 rounded-full` |

## Shadows
- `shadow-brand-sm`: subtle purple glow
- `shadow-brand-md`: medium purple glow
- `shadow-brand-glow`: ambient purple glow

## Spacing
- Section padding: `section-padding` utility
- Container: `container-main` utility
- Card gap: gap-8 preferred, gap-6 minimum

## Components
- `cn()` from `@/lib/utils/cn` for className merging
- `SanityImage` via `urlFor(image).url()`
- `motion.div` with `staggerContainer`/`staggerItem` for entrance animations
