# Lost in Transit — Session Handoff
*Last updated: June 10, 2026*

---

## START HERE — Files to read first

Before doing anything, read these in order:

1. `/Users/alexcoluna/Desktop/Projects/Japan Maps/CLAUDE.md` — architecture rules, performance constraints, z-index conventions, hard "never do" list. These are not suggestions.
2. `git log --oneline -15` — see what was committed vs what's still local
3. This file — complete context of what was built, what's broken, what's next

---

## Project Overview

**Lost in Transit JP** (`lostintransitjp.com`) — curated discovery map for vintage, archive, and streetwear stores across Japan. 899+ stores across Tokyo, Osaka, Kyoto, Fukuoka. Target user: fashion-aware travellers wanting hidden gems.

**Aesthetic:** Kirby retro-futuristic — dark backgrounds, cyan/purple neon glows, film grain, italic bold type.

**Stack:** React 18.3 + TypeScript 5.5 + Vite, Tailwind CSS 3.4, Mapbox GL JS via react-map-gl v7.1.9, Supabase (PostgreSQL + PostGIS), ImageKit CDN, React Router v6, TanStack React Query, Framer Motion v12.

**Deployed:** Vercel (auto-deploys on push to main). Supabase project ID: `avhtmmmblkjvinhhddzq`.

---

## What Was Completed This Session

### Phase 2 — GPS Check-in & Passport System (core feature, fully built)

#### Supabase
- **`gps_checkins` table** — GPS-verified Radar mode check-ins. One row per (user, store). `verified = true` when accuracy ≤ 25m at check-in.
- **`checkin_count` column on `stores`** — auto-maintained by INSERT/DELETE triggers. Never update manually.
- **Three RPCs:**
  - `get_my_checkins()` — all stamps for current user, with store details (passport grid)
  - `get_my_checkin_status(p_store_id)` — has this user stamped this store? Used by approach card
  - `get_my_badge_progress()` — check-in counts per neighborhood for badge tiers (3=bronze, 7=silver, 15=gold)
- **Migration file:** `supabase/migrations/20260609000000_phase2_gps_checkins.sql`

#### Edge Function — `gps-checkin`
- **Location:** `supabase/functions/gps-checkin/index.ts`
- **Deployed:** ✅ Live on Supabase
- **What it does:** Verifies JWT → fetches store coordinates → WKB hex parse (PostGIS returns WKB not GeoJSON) → Haversine check vs dynamic radius `max(50, accuracy × 1.5)` capped at 150m → upserts `gps_checkins`
- **Critical:** INSERT is service-role only. No client INSERT policy — this is intentional for GPS verification integrity.
- **Error responses:** `too_far` with `{distance_meters, required_meters}` for the UI shake + message. `-1` sentinel for network errors.
- **Re-verification:** Stamps can be "upgraded" from `verified=false` to `verified=true` by re-checking-in with better GPS. A verified stamp can never be downgraded.

#### React Components (all local, NOT yet committed/deployed)
- **`src/components/radar/RadarCheckinCard.tsx`** — the approach + check-in card
  - 4 states: approaching (slim), in_range (expanded with CTA), checking_in, success/too_far
  - Shows: store photo, name, sub-category pill, price range, find count, description snippet
  - Caches checkin status per store ID via `useRef` to prevent GPS-boundary-flicker spam
  - Shake animation on too_far, with exact distance message
- **`src/components/radar/RadarStoreMarker.tsx`** — Pokéstop-style circular disc markers
  - 4 visual states: far (grey outline), approaching (tinted fill), in_range (solid fill + white icon + glow ring), stamped (faded green + ✓)
  - Coin-flip animation (CSS `radar-disc-flip`) fires once on entering in-range
  - Uses category colors from `MAIN_CATEGORY_COLORS` in constants
- **`src/hooks/useCheckinCache.ts`** — fetches user's stamped store IDs on Radar enter
  - Invalidates when `lastStampedAt` changes (bumped by `handleCheckinSuccess` in HomePage)
  - Marker turns green immediately after stamp without page reload

#### GPS Fixes (critical, do not revert)
- **Direct `watchPosition`** in `MapView.tsx` — the `onGeolocate` callback from react-map-gl's `GeolocateControl` does NOT reliably expose `coords` because `GeolocationPosition.coords` is a non-enumerable native getter that Mapbox's event system can't copy via `for...in`. We bypass this entirely and use `navigator.geolocation.watchPosition` directly for position data. The `GeolocateControl` still handles map pan-lock and heading rotation.
- **`useIsMobile` landscape fix** — now returns `true` for `(max-width: 767px), (max-height: 500px) and (pointer: coarse)`. This catches iPhones in landscape (932px wide, 430px tall) that were previously getting the desktop layout with the map legend showing.
- **`LocateButton` hidden on mobile** — wrapped in `{!isMobile && ...}`. Radar pill is the GPS control on mobile; the crosshair was redundant.
- **Avatar** — pulsing `radar-ping` ring + cyan dot at user position. `@keyframes radar-ping` in `index.css`.

#### Other Fixes This Session
- **`MetroTimeline.tsx`** — fixed "Target ref not hydrated" Framer Motion crash. `useScroll({ target: sectionRef })` was called before `return null` guards. Fixed by splitting into outer `MetroTimeline` (fetches, returns null) + inner `MetroTimelineInner` (always renders, calls hooks).
- **`BottomSheetStoreDetail.tsx`** — fully rewritten from `react-spring-bottom-sheet` (crashed React 18 with `.getValue()` call) to Framer Motion slide-up drawer. Sheet opens at `65dvh`, scrolls internally.
- **`SpotlightBottomSheet.tsx`** — same migration. Peek mode: `42dvh` Framer Motion sheet with `drag="y"` swipe-to-dismiss.
- **`react-spring-bottom-sheet` removed** from `package.json` entirely.
- **`MapView.tsx` `stopPropagation`** — `e?.originalEvent?.stopPropagation()` optional chaining guard (was crashing on certain click paths).
- **`ROADMAP_IDEAS.md`** — innovations backlog saved at project root.

---

## Current State of the Codebase

### What's deployed ✅
- Phase 1 + 1.5: Radar mode (GPS walking mode, approach card, status bar, avatar)
- Phase 2 DB: `gps_checkins` table, triggers, RPCs
- Phase 2 Edge Function: `gps-checkin` live on Supabase

### What's LOCAL ONLY — needs commit + deploy
```bash
cd ~/Desktop/Projects/Japan\ Maps
git add -A
git commit -m "feat: Phase 2 complete — Radar check-in, disc markers, card improvements"
git push
```

Changed files (all confirmed TypeScript-clean):
- `src/components/map/MapView.tsx`
- `src/components/radar/RadarCheckinCard.tsx` (new)
- `src/components/radar/RadarStoreMarker.tsx` (new)
- `src/hooks/useCheckinCache.ts` (new)
- `src/pages/HomePage.tsx`
- `src/types/store.ts`
- `src/index.css`
- `supabase/functions/gps-checkin/index.ts`
- `ROADMAP_IDEAS.md` (new)

---

## Architecture Rules — Key Things Not to Break

From `CLAUDE.md` (read the full file):
- **Never add `animate-pulse` / `repeat: Infinity` to `blur-3xl` elements** — GPU repaint
- **Never do `SELECT *` from `stores` in a loop** — use `useStores` hook + React Query cache
- **Never lower `BottomSheet` z-index below `z-[200]`**
- **Never remove UUID fallback in `StoreDetailPage.fetchStore`**
- **`storesForMap` must be defined AFTER `filteredStores`** in `HomePage.tsx` — references it
- **`onViewportChange` call in `handleMapLoad`** — never remove
- **`StoreMiniMap` stays lazy-loaded** — static import puts 1,625 kB Mapbox back in critical path

New rules from this session:
- **`onGeolocate` in `MapView` must NOT check `isExploreMode`** — stale closure. The direct `watchPosition` useEffect handles position tracking instead.
- **INSERT to `gps_checkins` must go through the Edge Function** — client INSERT policy intentionally absent for GPS verification integrity.
- **`react-spring-bottom-sheet` is gone** — do not reintroduce. Use Framer Motion for all bottom sheets.

---

## What's Next — Immediate Priority

### 1. Passport Tab on ProfilePage (highest leverage)
The entire backend is ready (`get_my_checkins()`, `get_my_badge_progress()`, `gps_checkins` table). Users can stamp stores but have no way to see their collection. This is the feature that transforms the check-in from a tap into a lasting thing.

**What to build:**
- New `'passport'` tab in `ProfilePage.tsx` alongside Saved/Finds
- Stamp grid: 3-column mobile, each stamp = store photo + perforated edge CSS + store name + date
- Neighborhood badge row: horizontal scroll, all possible badges shown as earned/outline
  - 3 stamps = bronze ring, 7 = silver double ring, 15 = gold triple ring with glow
- Stats: Stamps · Neighborhoods · Cities
- Empty state: phantom stamp outlines with "Start exploring in Radar mode"
- Unverified stamps: desaturated + dashed border + amber dot + "Verify" CTA
- Data via `supabase.rpc('get_my_checkins')` and `supabase.rpc('get_my_badge_progress')`

### 2. Post-stamp Haul Snap
After "Verified ✓" fades, a second card: "Found something here? → Add a find". Opens lightweight camera/haul entry. Connects GPS stamp to `field_notes` system. Makes finds GPS-gated (high trust layer) vs manually posted (existing system stays).

### 3. Open/Closed Status on Card
`store.hours` is a text string ("Monday: 11AM–8PM\n..."). Need a small parser to determine open now. Shows "Open · Closes 8pm" or "Closed" on the approach card. High decision value.

### 4. Check-in Count on Store Detail
`checkin_count` column exists, is live, increments automatically. Wire it to the store detail panel and as a sort option ("Most visited"). Requires updating `get_stores_with_coordinates` RPC to return `checkin_count` (one-line SQL change).

### 5. Type Generation
Run to clean up the `{ verified: boolean }` cast in `RadarCheckinCard.tsx`:
```bash
npx supabase gen types typescript --project-id avhtmmmblkjvinhhddzq > src/types/database.ts
```

---

## Roadmap — Horizon Items

See `ROADMAP_IDEAS.md` for full details. Summary:

**Medium term:**
- Streak mechanic (stamp one store per Radar session for N days → streak counter on profile)
- Neighborhood badge unlock ceremony (full-screen flash + animation when hitting threshold)
- Walking session summary (on Radar exit: "3 stamps · 1.2km · Shimokitazawa")
- Stamp share card (shareable image: "12 stores stamped in Tokyo")

**Longer term:**
- Style DNA (compute category breakdown of stamps → "Your Tokyo style: vintage-forward, Shimokitazawa-rooted")
- Neighborhood completion map (profile view where neighborhoods fill in as you stamp)
- Trending stores layer (most stamped this week using `checkin_count`)
- Sound design (Web Audio API chime on in-range threshold — planned for Capacitor phase)

**Phase 3 — Capacitor iOS native app:**
- Wrap React PWA in Capacitor
- Native GPS (background, battery-efficient)
- Pedometer between GPS fixes (Pikmin Bloom walking quality)
- Push notifications for store approaching
- App Store submission

---

## Supabase Notes

- `gps_checkins` — INSERT only via service role (Edge Function). RLS: SELECT own rows, DELETE own rows.
- `get_my_checkins()` — no args, uses `auth.uid()` internally. Returns all stamps with store details.
- `get_my_checkin_status(p_store_id uuid)` — returns `{has_checkin, verified, visited_at}[]`
- `get_my_badge_progress()` — returns `{neighborhood, city, visited_count, total_store_count}[]`
- `spatial_ref_sys` — run `REVOKE SELECT ON spatial_ref_sys FROM anon, authenticated;` to clear security advisor warning
- `store_visits` — the old manual "I've been here" toggle, separate from GPS check-ins. Keep both.

---

## Testing Setup

**Local:** `npm run dev` at `localhost:5173`. Use Chrome DevTools → iPhone 14 Pro Max → Sensors → add custom locations:
- Shimokitazawa: `35.6618, 139.6685`, accuracy `20`
- Bay Apt. (Koto): `35.6392742, 139.821649`, accuracy `20`

**On-device (real GPS):** `brew install ngrok && ngrok http 5173` → open ngrok URL on iPhone Safari.

**Safari remote debugging:** Plug iPhone to Mac via USB → Safari on Mac → Develop → [iPhone name] → localhost.

---

## Known Issues / Things to Monitor

1. **GeolocateControl error (code 2)** in console during Radar — `POSITION_UNAVAILABLE` from the Mapbox control (not our direct GPS). Expected in DevTools simulation; won't appear on real device. Safe to ignore.
2. **`checkin_count` not in `get_stores_with_coordinates` RPC** — column exists on stores table but the RPC doesn't return it yet. Need a one-line SQL update to include it, then update `useStores.ts` mapping. Blocked until that migration runs.
3. **Database types stale** — `src/types/database.ts` was manually updated for Phase 2 RPCs. Run `supabase gen types` to get the official generated version.
4. **Pre-existing TS warnings in admin files** — BulkImportQueue, BlogPostEditor, etc. have pre-existing type errors unrelated to Radar work. Don't fix them without understanding the full admin context.
