# CLAUDE.md — Lost in Transit (Japan Maps)

Reference this file at the start of every session. It captures the project vision, architecture decisions, and rules that prevent regressions.

---

## Project Vision

**Lost in Transit** is a curated discovery map for vintage, archive, and streetwear stores across Japan. The target user is a fashion-aware traveler who wants to find hidden gems — not tourist traps.

- 899+ stores across Tokyo, Osaka, Kyoto, Fukuoka, and more
- Community-driven: users submit "finds" (store visits + hauls)
- Aesthetic: Kirby retro-futuristic — dark backgrounds, cyan/purple neon glows, film grain, italic bold type
- Two primary views: **Map** (Mapbox GL JS) and **List** (filterable grid)

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18.3 + TypeScript 5.5 + Vite |
| Styling | Tailwind CSS 3.4 |
| Maps | Mapbox GL JS |
| Backend | Supabase (PostgreSQL + PostGIS + Storage) |
| Image CDN | ImageKit |
| Routing | React Router v6 |
| State | React Query (TanStack) + local useState |
| Animation | Framer Motion |

---

## Architecture Rules

### Data fetching
- **Never `SELECT *` from `stores` in a loop or on a per-page basis.** The main store list is fetched once via `useStores` hook → `get_stores_with_coordinates` RPC → React Query cache (5 min staleTime).
- Store detail pages use `WHERE slug = ?` (indexed). UUID fallback exists as a shim — do not remove it until all legacy URLs expire.
- `useSpotlightStores` runs **unconditionally** — never gate it on `isSpotlightMode`. The result must be pre-computed before the button fires. Gating it caused a one-render race where the result was always `[]` on first tap.

### Performance — what we've fixed and why
- **Animated `blur-3xl` orbs cause constant GPU repaint.** Always use static `blur-3xl` divs. Never add `animate-pulse`, `animate-spin`, or `repeat: Infinity` to large blur elements.
- **`scrollYProgress.on('change')` fires setState every frame.** Use `IntersectionObserver` instead for CTA show/hide triggers.
- **Map viewport updates are throttled to 250ms.** Do not remove the throttle in `handleMapMove`.
- **`storesSortedByDistance` returns `Store[]` (plain stores).** When consuming it, iterate as `(store, index)` not `({ store }, index)` — the destructure bug caused a white screen in production.
- **`onViewportChange` is emitted on map load** (not just on move) so spotlight mode works on first tap without requiring a pan.

### Slug system
- Every store has a `slug` column in the DB (unique index `stores_slug_idx`).
- `generateSlug(name, city)` in `src/utils/slugify.ts` is the source of truth — used at insert time in `AddStoreForm` and `BulkImportQueue`.
- Full-width Japanese store names that strip to empty get `store-{id_prefix}` as a fallback slug.
- **Never regenerate slugs for existing stores** — that would break shared URLs.

### Z-index conventions
| Layer | z-index |
|---|---|
| Map markers | 1–10 |
| Map UI (search button, locate) | 20–30 |
| Page header | 50 |
| Search bar / filter pills | 50 |
| Bottom sheets (backdrop) | 200 |
| Bottom sheets (panel) | 201 |

Always use `z-[200]` / `z-[201]` for `BottomSheet` — `z-50` is not enough to clear all stacking contexts on the list view page.

### Images
- List view store cards → `card` preset (800px, q-75). **Never use `thumb` on desktop cards** — it was blurry on Retina.
- Hero/mosaic images → `thumb` preset is fine (small, loads fast).
- ImageKit util: `ikUrl(photoUrl, preset)` in `src/utils/ikUrl.ts`.

---

## Key Files

```
src/
  pages/
    HomePage.tsx          — Map + List view orchestrator. Spotlight mode state lives here.
    NewLandingPage.tsx    — Landing page. All blur orbs must be static.
    StoreDetailPage.tsx   — Slug → UUID fallback lookup. Do not remove fallback.
  components/
    map/
      MapView.tsx         — Core map. handleMapLoad emits initial viewport bounds.
      SearchAreaButton.tsx — Triggers spotlight mode (not a literal "search").
    common/
      BottomSheet.tsx     — z-[200]/z-[201] required. Do not lower.
    filters/
      ListViewSidebar.tsx — Desktop filter sidebar.
    mobile/
      MobileListView.tsx  — Mobile list view with bottom sheet filters.
    landing/
      HeroSection.tsx     — Static orbs only. useScroll/useTransform for hero fade is fine.
      CitiesCarousel.tsx  — Stagger capped at 160ms max.
      FieldNotes.tsx      — Stagger capped at (index % 4) * 70ms.
  hooks/
    useStores.ts          — React Query wrapper. staleTime inherited from QueryClient (5 min).
    useSpotlightStores.ts — Expensive scoring algo. Only runs when bounds != null.
    useSearchArea.ts      — Tracks map movement to show/hide search button.
  utils/
    slugify.ts            — generateSlug(name, city). Source of truth for URL slugs.
    ikUrl.ts              — ImageKit URL builder.
```

---

## Spotlight Mode ("Search this area")

The "Search area" button activates **Spotlight Mode** — it does not re-fetch stores. It runs `useSpotlightStores` against already-loaded stores within the current viewport bounds.

Flow:
1. Map loads → `handleMapLoad` emits `onViewportChange` immediately → `viewportBounds` set
2. User taps "Search area" → `handleSearchArea` in `HomePage` → `curatedSpotlightStores` computed
3. 5 stores selected by scoring (photos + category diversity + spatial distribution + 25% random)
4. On desktop: `DesktopSpotlightPanel` slides in. On mobile: `SpotlightBottomSheet`.
5. Tapping a store in the panel → `flyToStore` + `selectedStore` set → detail panel opens.

---

## Supabase Notes

- `spatial_ref_sys` — PostGIS system table. RLS not needed. Run `REVOKE SELECT ON spatial_ref_sys FROM anon, authenticated;` to clear security advisor warning.
- `stores` table has `slug TEXT NOT NULL` with unique index `stores_slug_idx` (added March 2026).
- `get_stores_with_coordinates` RPC — does not yet include `slug` column. The `useStores` hook falls back to `generateSlug()` for the map view. SQL to update it is in CLAUDE.md history. Update once confirmed safe.
- `field_notes` table — community finds. Joined with `profiles` for username display.

## Sitemap

`public/sitemap.xml` is **generated**, not hand-edited. After any bulk store import or schema change run:
```
npm run sitemap:generate
```
Script: `scripts/generate-sitemap.mjs` — fetches all slugs from live DB, skips any invalid slug, writes the file. Commit the result. Never manually edit `sitemap.xml` — your changes will be overwritten next time the script runs.

---

## What NOT to do

- Do not add `animate-pulse` / `repeat: Infinity` to any `blur-3xl` element
- Do not do `SELECT *` from `stores` on a per-page-visit basis
- Do not lower `BottomSheet` z-index below `z-[200]`
- Do not remove the UUID fallback in `StoreDetailPage.fetchStore`
- Do not change `storesSortedByDistance` back to returning `{ store, distance }[]` — consumers use `(store, index)` now
- Do not remove the `onViewportChange` call in `handleMapLoad`
