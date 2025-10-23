# 🎨 Aesthetics & Core Design Roadmap

Last updated: October 2025

This plan focuses on visual polish and UX across the Landing page, Cities experiences, Map, and Store views. It outlines goals, changes, and acceptance criteria for each area.

---

## 1) Landing Page

Goals
- Establish a strong brand moment and value proposition
- Showcase cities with larger, more expressive visuals
- Smooth, performant motion with tasteful depth

Changes
- Hero section: bold headline, concise subcopy, primary CTA to Map; background with subtle motion (parallax or gradient noise)
- Cities carousel: much larger cards (4:5), dramatic hover/scroll zoom, glow borders, region labels, shard/shine shimmer
- Typography: larger scale for headings; tighten letter-spacing; balanced weight hierarchy
- Color system: keep current category colors; add elevated neutrals and soft shadows for depth

Acceptance criteria
- Above-the-fold loads under 2.0s on 4G; no layout shift
- Hero and carousel are keyboard accessible; readable contrast
- Carousel supports touch drag (Embla) and snaps cleanly

---

## 2) Cities (Landing + Map Modal/Sidebar)

Goals
- Consistent visual language across landing and map contexts
- Clear city → neighborhood exploration

Changes
- Larger city cards in modal and horizontal scroll
- Consistent labels: City, Region; store counts pulled live
- Placeholder image strategy per city with progressive loading
- Add all 15 cities (incl. Kanagawa / Yokohama)

Acceptance criteria
- City cards are readable at mobile sizes; images never crop important content
- Store counts update without layout shift (skeleton shimmer)

---

## 3) Map Page

Goals
- Improve legibility and affordances without clutter
- Make interactions feel crisp and intentional

Changes
- Legend: clearer grouping of main categories; expandable Home Goods subcategories
- Markers: consistent sizing, improved hit area, subtle hover lift; icons for Home Goods (🏠) and Museum (🏛️)
- Labels: smarter truncation and fade; optional density-based label showing
- Pan/zoom inertia tuned; preserve current fix (no auto-zoom on filter change)

Acceptance criteria
- Marker hover/press states meet 44px touch target
- Subcategory color only applies when main category is Fashion/Home Goods
- 60 FPS during pan/zoom on mid-range laptops

---

## 4) Store Detail & Cards

Goals
- Strong image-first design; scannable info hierarchy
- Faster comprehension of “what, where, why special”

Changes
- Card layout: bigger image ratio, tighter metadata; category pills refined
- Detail view: improved gallery (swipe, lightbox polish), better typography rhythm, quick actions (Directions, Website, IG)
- AI description formatting: short paragraphs, sentence fragments acceptable; no review citation phrasing

Acceptance criteria
- Cards remain 3-up on desktop with clean vertical rhythm
- Detail lightbox is keyboard and screen-reader accessible

---

## 5) Navigation & Layout

Goals
- Keep users oriented; reduce cognitive load

Changes
- Header: simplified nav, sticky with subtle blur backdrop; active state clarity
- Footer: clearer grouping (About, Contact, GitHub), compact on mobile

Acceptance criteria
- Header remains legible on photo-heavy pages; no overlap issues

---

## 6) Design System Tokens

Tokens
- Colors: extend neutrals (gray-50..900) and elevation shadows; grey for Museum
- Typography: type ramp (12/14/16/18/24/32/40/56), tracking presets
- Spacing: 4/8/12/16/20/24/32/40
- Radius: 6/8/12
- Motion: 150–250ms ease-out; spring for marquee/hero elements

Acceptance criteria
- Tokens live in constants and are reused across components

---

## 7) Motion Principles

Principles
- Purposeful, minimal, stateful: motion communicates hierarchy
- Prefer opacity/transform; avoid expensive filters
- Respect “reduce motion” preference

Applications
- Hero reveal, city card hover, marker hover, modal slide, skeleton shimmer

---

## 8) Accessibility & Performance

Accessibility
- Focus rings visible; keyboard traps avoided
- Color contrast AA for text; non-text decorative elements exempt
- ARIA labels for markers and important controls

Performance
- Image sizes matched to device DPR; lazy load below fold
- Preload hero and above-the-fold city images
- Avoid heavy box-shadows and filters on scroll

---

## 9) Assets & Iconography

Assets
- City placeholders curated; ensure license-friendly sources
- Consider subtle duotone treatment for consistency

Icons
- Maintain emoji for Home Goods (🏠) and Museum (🏛️) where appropriate
- Use vector icons elsewhere for consistency

---

## 10) Implementation Phases

Phase A — Landing & Cities (target: 1–2 days)
- Landing hero redesign
- Cities carousel (large cards, shimmer, counts)
- Cities modal/scroll alignment

Phase B — Map & Legend (target: 1 day)
- Legend grouping and expandable Home Goods subcategories
- Marker hover/press refinements; label polish

Phase C — Store Views (target: 1 day)
- Card hierarchy and density
- Detail gallery and typography rhythm

Phase D — Nav & System (target: 0.5–1 day)
- Header/footer polish
- Token pass (colors/type/spacing/motion)

---

## 11) Acceptance Checklist

- Landing conveys brand and purpose at a glance
- Cities are visually engaging and consistent across contexts
- Map interactions feel crisp with clear feedback
- Store views communicate value, quickly
- Accessibility and performance budgets met

---

## 12) Open Questions (Non-blocking)

- Brand font preferences? (e.g., Inter vs. alternative)
- Accent color adjustments or keep current palette?
- City imagery final sources/attribution standard?

If not specified, defaults will align with current Tailwind setup and existing category colors.


