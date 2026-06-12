# Lost in Transit — Session Handoff
Last updated: June 12, 2026

## START HERE — Files to read first
1. `/CLAUDE.md` — architecture rules, performance constraints, z-index conventions, hard "never do" list
2. `git log --oneline -20` — see what's committed
3. This file — complete context of what was built, what's next

---

## Project Overview
Lost in Transit JP (`lostintransitjp.com`) — curated discovery map for vintage, archive, and streetwear stores across Japan. **906 stores** across Tokyo, Osaka, Kyoto, Fukuoka, and more.

Aesthetic: Kirby retro-futuristic — dark backgrounds, cyan/purple neon glows, film grain, italic bold type.

Stack: React 18.3 + TypeScript 5.5 + Vite, Tailwind CSS 3.4, Mapbox GL JS via react-map-gl v7.1.9, Supabase (PostgreSQL + PostGIS), ImageKit CDN, React Router v6, TanStack React Query, Framer Motion v12.

Deployed: Vercel (auto-deploys on push to main). Supabase project ID: `avhtmmmblkjvinhhddzq`.

---

## What Was Completed — Full Feature List

### Phase 1–2 (Previous Sessions)
- Interactive Mapbox map with 900+ store pins
- Radar/Explore GPS mode with approach card, disc markers
- `gps_checkins` table, triggers, RPCs for GPS check-ins
- `gps-checkin` Edge Function (live on Supabase)
- Bottom sheets (Framer Motion — react-spring-bottom-sheet removed)
- Spotlight mode ("Search this area")
- MetroTimeline fix, BottomSheet z-index rules

### Phase 3 — This Session (all committed)

**Open/Closed Hours Signal**
- `src/utils/hoursParser.ts` — parses Google Maps export format hours strings
- Handles: `12:00 – 8:00 PM`, `11:00 AM – 7:00 PM`, `Closed`, `Open 24 hours`, no-day-prefix formats
- Converts to JST via `toLocaleString('en-US', { timeZone: 'Asia/Tokyo' })`
- Returns 5 typed states: `open`, `opens_soon`, `closed`, `closed_today`, `open_24h`, `unknown`
- Shown in `RadarCheckinCard` metadata row (visible in both approaching + in-range states)

**Stamped vs. Unstamped Visual Treatment**
- `RadarCheckinCard` now has 3 emotional states: `discovery` (cyan), `reunion` (green), `verify` (amber)
- Reunion state: green-tinted card, checkmark badge on store photo, "You've been here · Dec 3" instead of CTA
- `CachedStatus` now includes `visitedAt` for last-visit display

**Dismiss X Button**
- Always-visible X in top-right of `RadarCheckinCard`
- Auto-dismiss 3s after stamp success; X closes early
- `cardDismissed` state in `HomePage`, resets when store changes

**Stamped Badge on Store Detail**
- `isStamped` prop on `StoreDetail`, `BottomSheetStoreDetail`, `SpotlightBottomSheet`
- Green "Stamped" badge overlays hero image when store is stamped
- `useCheckinCache` always fetches (not gated on radar mode)

**Post-Stamp Haul Prompt** (`src/components/radar/PostStampHaulPrompt.tsx`)
- Slides up ~3.2s after successful stamp
- Purple card: "Found something here? Log it"
- Photo-first, store pre-populated (store_id, store_name, neighborhood, city)
- Submits to `field_notes` with `type='haul'` and `store_id` set (GPS-gated find)

**Radar Session Summary** (`src/components/radar/RadarSessionSummary.tsx`)
- Shown on Radar exit if >= 1 stamp made during session
- Shows: stamp count, walking distance (Haversine of GPS positions), neighborhood
- `sessionPositionsRef` + `sessionStampCountRef` refs in `HomePage` (no re-renders on GPS tick)
- Auto-dismisses after 4s, tap to close early

**Passport Tab** (`src/pages/ProfilePage.tsx`)
- New 'passport' tab alongside Saved and Finds
- Stamp grid: 3-column, `.stamp-perf` perforated CSS border, photo + name + date
- Ghost stamps for empty state; verified vs. unverified treatment (grayscale + amber dot)

**Passport Share Card** (`src/utils/passportCanvas.ts`)
- Canvas-drawn 1080x1080: dark bg, stamp grid, username, count, LIT branding
- Web Share API on iOS, download fallback on desktop. Unlocks at 5+ stamps.

**Style DNA** (`src/utils/computeStyleDNA.ts`)
- Unlocks at 10 stamps
- Format: "[Category] fan · Runs [Neighborhood]" e.g. "Archive fan · Runs Shimokita"
- Locked state: circular progress ring N/10
- Unlocked: identity line + animated category breakdown bars (color-coded by category)
- `get_my_checkins()` updated to return `main_category` + `primary_category`

**Neighborhood Bubble Map** (`src/components/passport/NeighborhoodBubbleMap.tsx`)
- SVG bubble map at real geographic coordinates (uses `NEIGHBORHOOD_COORDINATES`)
- Ghost nodes for all neighborhoods in stamped cities; glowing nodes for stamped ones
- 4 visual tiers: ghost -> visited (dim cyan) -> bronze (amber) -> silver (white) -> gold (cyan + purple halo)
- SVG glow filters per tier (feGaussianBlur) — compositor-friendly
- Tappable: tooltip shows name, stamps/total, tier, next-tier progress
- Circle sizes proportional to store_count from `get_all_neighborhood_counts()` RPC

---

## Supabase State

### Active RPCs
- `get_stores_with_coordinates()` — main store list for map
- `get_my_checkins()` — passport stamps + main_category + primary_category
- `get_my_badge_progress()` — neighborhood stamp counts
- `get_my_checkin_status(uuid)` — has user stamped this store?
- `get_all_neighborhood_counts()` — all neighborhoods with store counts

### Edge Functions
- `gps-checkin` — GPS verification, upserts gps_checkins
- `fetch-google-photo` — Places API photos

### Security (fixed this session)
- REVOKED EXECUTE from `anon` on: `is_user_admin`, trigger functions, all `get_my_*` RPCs, `get_all_neighborhood_counts`
- REVOKED trigger functions from `authenticated` role
- REVOKED SELECT on `spatial_ref_sys` from anon/authenticated
- Hardened `search_path` on all user-facing RPCs

### Still needs fixing (next session — do before any public launch)
- Remove broad SELECT policy on `field-notes` storage bucket (allows listing all files)
- Rate-limit `store_suggestions` INSERT (currently WITH CHECK (true) = spam vector)
- Enable leaked-password protection in Supabase Auth settings (one-click in dashboard)
- Add indexes: `saved_stores(store_id)`, `stores(submitted_by)`
- Add `device_push_tokens` table, `lists` table, `reports` + `blocked_users` tables

---

## Architecture Rules (DO NOT BREAK)
From CLAUDE.md:
- Never add `animate-pulse` / `repeat: Infinity` to `blur-3xl` elements
- Never SELECT * from stores in a loop — use useStores hook
- Never lower BottomSheet z-index below z-[200]
- Never remove UUID fallback in StoreDetailPage.fetchStore
- `storesSortedByDistance` returns Store[] — iterate as (store, index) not ({ store }, index)
- onViewportChange call in handleMapLoad — never remove
- INSERT to gps_checkins must go through Edge Function
- react-spring-bottom-sheet is gone — do not reintroduce
- Style DNA identity line: "[Category] fan · [Behavior] [Location]" — no compound adjectives

---

## What's Next — iOS Native App

### Decision: React Native via Expo (NOT Capacitor)
Capacitor wrapper risks Apple Guideline 4.2 rejection (minimum functionality / thin wrapper).
React Native reuses all TypeScript, Supabase client code, Edge Functions.
Only the UI layer needs rebuilding: Tailwind -> NativeWind, Framer Motion -> Reanimated, Mapbox GL JS -> @rnmapbox/maps.

### Key Expo dependencies
- expo (managed workflow) + EAS Build for CI
- @rnmapbox/maps — native Mapbox SDK (Metal-rendered)
- expo-location — CoreLocation
- expo-haptics — haptic on stamp
- expo-sqlite — offline store cache (~2MB for 906 stores)
- expo-camera — native camera for haul photos
- expo-notifications — APNs push
- expo-updates — OTA JS-only fixes
- @supabase/supabase-js — works in React Native unchanged
- RevenueCat — IAP (City Pass + Field Pass subscription)
- Sentry — crash reporting

### P0 Before App Store Submission
1. React Native (Expo) app shell — tabs: Map / Radar / Passport / Profile
2. Sign in with Apple (Supabase OAuth — required if any third-party login)
3. In-app account deletion (required since June 2022 — Edge Function cascade + Apple token revocation)
4. Mapbox Maps SDK with clustering (906 pins must cluster)
5. Native CoreLocation for Radar (background GPS entitlement)
6. Haptic feedback on stamp (expo-haptics — one line)
7. Native camera for haul prompt (expo-camera)
8. UGC report + block user (Guideline 1.2 — required for field_notes UGC)
9. Offline store cache (expo-sqlite + delta sync on updated_at)
10. Privacy manifest + app icon + splash screen
11. Fix remaining backend security items (bucket policy, rate limit, leaked-password auth)

### Monetization Sequence
- Launch free
- City Pass IAP ($4.99/city, offline tiles + editorial guides) at launch
- Affiliate links (Grailed/eBay tagged URLs on haul + store pages) at launch
- Field Pass subscription ($19.99/yr) at ~5k MAU
- Store partnerships (analytics dashboard) once check-in data proves foot traffic

### Positioning
"Beli for vintage pilgrimage" — the physical Japan vintage shopping trip, end to end.

---

## Testing
Local: `npm run dev` at localhost:5173
DevTools: iPhone 14 Pro Max + Sensors:
- Shimokitazawa: 35.6618, 139.6685, accuracy 20
- Bay Apt. (Koto): 35.6392742, 139.821649, accuracy 20

On-device: ngrok http 5173, open on iPhone Safari.
