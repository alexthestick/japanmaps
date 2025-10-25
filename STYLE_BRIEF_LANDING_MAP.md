## Style Brief – Landing Page and Map (Neo‑Tokyo Washi / Neon Night)

### Purpose
Provide a clear visual/motion blueprint for the landing experience and map. This is optimized for React + Tailwind + Framer Motion + Mapbox GL. It pairs with `MOTION_PLAN.md` for animation details.

### Visual Direction
- **Day – “Neo‑Tokyo Washi”**: Bright, colorful, light surfaces with subtle washi paper texture. Colors feel hand‑printed, not flat.
- **Night – “Neon Night”**: Charcoal backgrounds with vibrant accent colors (neon lines/labels), but not a fully dark UI. Readability first.
- **Texture**: Soft paper noise/grain overlays at 4–8% opacity, especially in hero and city imagery.
- **Typography**: Confident, minimal copy; bold headlines, tight tracking. Short phrases over long sentences.

### Tokens (design system)
We added core tokens in `src/index.css`. Expand as needed:
- **Colors** (examples)
  - Background: `--color-bg: #ffffff` (day), `#0b0f19` (night wrappers)
  - Text: `--color-text: #0b0f19`
  - Border: `--color-border: #e5e7eb`
  - Primary: `--color-primary: #111827` (charcoal)
  - Categories: Fashion `#F59E0B`, Food `#3B82F6`, Coffee `#92400E`, Home Goods `#6B7280`, Museum `#9CA3AF`
  - City accents: see `CITY_COLORS` in `src/lib/constants.ts`
- **Radii**: `--radius-md: 12px`, `--radius-lg: 16px`
- **Shadows**: `--shadow-sm`, `--shadow-md`, `--shadow-lg`
- **Motion**: add to `:root` (see `MOTION_PLAN.md`), e.g., `--motion-medium: 200ms; --curve-entrance: cubic-bezier(0.16, 1, 0.3, 1)`

### Landing Page – Hero
- **Layout**: Full‑bleed image or gradient wash with washi overlay. Headline + subhead + single strong CTA.
- **Copy**: Focus on “discover”, “map”, “cities”. Keep it punchy.
- **Motion**: Parallax background (5–12px), headline fade/slide up (~180–220ms), texture subtly reveals.
- **CTA**: Primary button uses `--color-primary` on light; on night, white button on charcoal.

### Landing – Cities Section
- **Horizontal City Scroll**: Big cards (approx 288×384), snap scrolling, image with gradient top overlay.
- **City Accent**: Use `CITY_COLORS` as a thin focus ring or dot on selected city.
- **Content**: City name + store count; arrow affordance on hover.
- **Interaction**: Click navigates to `/city/:slug` with a slide transition (already implemented). Optionally add shared element for image.

### City Page (First Expansion)
- **Hero**: City color gradient overlay, headline, count, CTAs (“Open on Map”, “Browse List”).
- **Motion**: “Shinkansen” streak on mount (already prototyped), slide transition between cities, optional shared element for image.
- **Sections**: Staggered reveal of top stores; optional parallax on background imagery.

### Store Cards (List View)
- **Product‑like**: 4/5 image ratio, hover overlay with “Explore”, category icon badge, save button.
- **Info line**: City dot (from `CITY_COLORS`) + city name, divider, neighborhood or primary category.
- **Chips**: Up to 2 subcategories, rounded, subtle surface.

### Map – Style and Behavior
- **Map styles**
  - Day: `VITE_MAPBOX_STYLE_DAY` → colorful, light base (navigation‑day fallback if unset).
  - Night: `VITE_MAPBOX_STYLE_NIGHT` → charcoal base with vibrant road/water/poi accents (navigation‑night fallback).
  - Keep labels highly readable; avoid low‑contrast neon text.
- **Pins/Colors**
  - Default pins use main category colors (see `MAIN_CATEGORY_COLORS`).
  - Subcategory colors show only when that main category is explicitly selected (Fashion & Home Goods), per current logic.
  - Museum has no subcategories; Coffee uses main category only.
- **Legend**
  - Show main categories with icons; expand Fashion and Home Goods to reveal subcategory colors.
  - Keep it compact; avoid overlapping controls (day/night toggle is positioned to not collide).
- **Labels**
  - Light density by default; show larger labels, reveal smaller labels on interaction/hover.
  - Truncate long names and reveal fully on hover.
- **Clusters** (later)
  - At city level, cluster pins with category‑tinted counts. Expand on click.

### Motion Touchpoints (Map)
- **Day/Night Toggle**: small slide of indicator, 150–180ms.
- **Pin hover**: scale to 1.08–1.12, shadow lift; label fade in.
- **Map camera**: when navigating from a city, ease to city center and then reveal pins.

### Accessibility
- Minimum contrast: 4.5:1 for text on both day/night.
- Reduced Motion: disable large transitions and parallax when `prefers-reduced-motion` is on.
- Focus states: visible ring for keyboard navigation on cards, CTAs, toggles.

### Performance
- Use GPU transforms (translate/scale/opacity), avoid layout properties.
- Lazy‑load city and store images; prefetch only hero imagery.
- Consider pin clustering and list virtualization for 500–1000 stores.

### Deliverables for Implementation (Claude)
1) Mapbox Studio styles or confirmation to use fallbacks; set env in `.env.local`:
```bash
VITE_MAPBOX_TOKEN=pk.YOUR_TOKEN
VITE_MAPBOX_STYLE_DAY=mapbox://styles/youruser/day-style
VITE_MAPBOX_STYLE_NIGHT=mapbox://styles/youruser/night-style
```
2) Add/extend tokens in `src/index.css` (motion, color aliases for day/night wrappers).
3) Landing hero: apply texture overlay layer, parallax, CTA styles per tokens.
4) Horizontal city scroll: selected ring using `CITY_COLORS`; optional shared element `layoutId` for image.
5) City page: shared element hero image, parallax background, staggered sections; keep shinkansen streak.
6) Map: verify day/night palette readability, pin color rules, legend expansion, control positions.

### Acceptance Criteria
- Landing hero uses tokens and texture overlay; page transitions feel smooth (≤ 250ms where possible).
- City scroll cards match spec: size, gradient overlay, focus ring, count.
- City page transitions: horizontal slide + streak; optional shared element added.
- Map renders with readable labels and correct pin color rules; legend is compact and non‑overlapping.
- Reduced Motion preference respected; no jank on mid‑range hardware.











