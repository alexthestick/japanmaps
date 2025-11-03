## Persona‑level Motion Plan (Cities First)

### Purpose
Create a cohesive, high‑end motion system starting with the cities experience, scalable to the rest of the landing and app. This plan is optimized for React + Framer Motion, with optional View Transitions API enhancements later.

### Goals
- Deliver a vivid “bullet‑train” feel when navigating cities.
- Use shared element transitions from city thumbnail → city hero → map focal state.
- Introduce scroll‑driven scenes for city content with buttery performance.
- Codify motion tokens for consistency and easy tuning.

### Scope (Phase 1 – Cities)
- Horizontal City Scroll and City Grid → City Page transition
- City Page hero enter (shared element + colorized streak overlay)
- City Page sections reveal (neighborhoods/top stores) with stagger
- Map “Open on Map” CTA → pre‑filtered map view with focused camera ease

### Motion Principles
- **Hierarchy first**: motion emphasizes primary actions (enter/exit, focus) before decoration.
- **Easing**: crisp but friendly. Favor easeOut for enters, easeIn for exits, spring for shared elements.
- **Duration bands**: 120–180ms micro, 200–300ms page, 400–600ms scene.
- **Stagger**: 20–40ms for lists; 60–80ms for larger chunks.
- **Z‑depth**: layering via shadows/scale ≤ 1.04; avoid heavy scale for readability.

### Motion Tokens (CSS custom properties)
Add to `:root` (already prepared partially in `src/index.css`). Extend with motion constants:

```css
:root {
  /* Motion */
  --motion-fast: 120ms;
  --motion-medium: 200ms;
  --motion-slow: 300ms;
  --motion-scene: 450ms;

  --curve-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --curve-emph: cubic-bezier(0.2, 0.8, 0.2, 1);
  --curve-entrance: cubic-bezier(0.16, 1, 0.3, 1);
  --curve-exit: cubic-bezier(0.4, 0, 1, 1);
}
```

### Core Patterns
- **Route/page transitions**: `AnimatePresence` with subtle fade/slide. City routes add horizontal slide for “shinkansen” feel.
- **Shared element transitions**: city tile → city hero uses `layoutId` so the image/card morphs positions and size seamlessly.
- **Scroll‑driven scenes**: `useScroll` + `useTransform` for parallax, copy reveals, and image scaling.
- **Shinkansen streak overlay**: a short, color‑tinted streak on city mount; adjustable duration/opacity/layers.

### Implementation Plan
1) Tokens
   - Extend `src/index.css` with motion tokens (above). Replace ad‑hoc durations with variables over time.

2) Route Transitions (App shell)
   - Already in place with `AnimatePresence`. For `/city/:slug`, keep horizontal slide: initial `{x: 40}`, exit `{x: -40}`, `duration ~0.25`.

3) Shared Element: City Tile → City Hero
   - Give city image wrappers a stable `layoutId` like `city-image-${cityName}` in both the city card (scroll/grid) and CityPage hero.
   - On click, navigate to `/city/:slug`; Framer Motion will animate the element between states.

4) City Page Scenes
   - Hero: title and meta fade/slide up with a short stagger.
   - Sections: “Top Spots” list items animate in with 20–30ms stagger.
   - Optional parallax: background image subtle `y` transform via `useScroll`.

5) Shinkansen Streak Overlay
   - Lightweight absolutely‑positioned gradient bars that sweep horizontally on mount.
   - Tint from city color; expose controls (duration, count, opacity) for art direction.

6) Map Focus Transition
   - When clicking “Open on Map,” push route with `?city=...`; smoothly set Mapbox camera toward the city with an easeOut. Consider fading in pins late for clarity.

### Example Snippets
Shared element wiring (card → hero image):
```tsx
// City card image
<motion.img layoutId={`city-image-${city.name}`} src={city.image} />

// CityPage hero image (behind gradient)
<motion.img layoutId={`city-image-${cityName}`} src={heroImage} className="absolute inset-0 w-full h-full object-cover" />
```

Scroll‑driven parallax in CityPage:
```tsx
const { scrollYProgress } = useScroll();
const y = useTransform(scrollYProgress, [0, 1], [0, -40]);
<motion.div style={{ y }} className="absolute inset-0">/* hero bg */</motion.div>
```

Route transition (already applied for cities):
```tsx
<motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
  <CityPage />
</motion.div>
```

### Performance & Accessibility
- Prefer transform/opacity; avoid animating layout properties.
- Respect Reduced Motion: disable non‑essential animations if `prefers-reduced-motion`.
- Limit simultaneous animated elements; stagger instead of parallel blast.
- Defer large images; use `loading="lazy"` and prefetch only critical city assets.

### Asset Pipeline
- City images curated and optimized (WebP/AVIF if available).
- Optional bespoke sequences via Lottie/Rive for hero moments.

### QA Checklist
- No layout shift during transitions.
- 60fps on mid‑range laptop; no jank on city switch.
- Focus states preserved during route changes; tab order intact.
- Reduced Motion behaves correctly.

### Milestones
1. Tokens + City route slide + streak overlay (done/prototyped)
2. Shared element tile → hero image transition
3. CityPage scroll scenes (parallax + staggered sections)
4. Map focus transition polish
5. Landing hero/sections extension (optional)

### Risks & Mitigations
- Over‑animation → fatigue: keep durations short, reserve strong effects for key actions.
- Performance regressions: profile with React DevTools/Performance tab; gate heavy effects behind media queries.

### Extension to Landing Page
- Apply the same shared element pattern from city tiles on landing to city hero.
- Introduce “cut‑scene” overlays (texture wipes, vertical kanji reveals) sparingly between major sections.

### Handoff to Claude – What to Build Next
- Implement shared element transitions between city cards (scroll/grid) and CityPage hero using `layoutId`.
- Add CityPage parallax and staggered content reveals via `useScroll`/`useTransform`.
- Expose motion tokens in code and replace hardcoded durations/easings accordingly.
- Add Reduced Motion handling and basic performance budget checks.




















