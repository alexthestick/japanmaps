# Lost in Transit Web — Innovation & Optimization Roadmap
**Date:** 2026-07-03 · Companion to `WEB-AUDIT-2026-07-03.md` (security items from that audit are done and verified — this doc is entirely forward-looking)

---

## 0. The strategic frame: what the web is FOR now that iOS exists

Every decision below flows from one reframing. Before the iOS app, the web had to be everything. Now there are two devices in the user's life:

- **The web is the planning and discovery surface** — the hotel-lobby laptop session, the "found it on Google" landing, the link a friend sends, the blog post that ranks. Its superpowers: URLs, SEO, shareability, big-screen planning.
- **iOS is the street companion** — GPS, Radar, stamps, the pocket.

The web should stop competing with the phone at being a phone (the two-tap marker dance, mobile radar duplication) and become the best *upstream* surface in the funnel: **rank → land → plan → hand off to the app → come back and share.** Almost everything below serves one of those five verbs.

---

## 1. Performance & platform (make the fast site actually fast everywhere)

**P1 — Migrate map dots to GPU layers (the big one).** Up to 200 DOM `<Marker>` components re-render through React on every tier change (`MapView.tsx:791+`); `supercluster` ships in package.json but the render path doesn't use it. Move atmosphere/discovery tiers to a Mapbox GeoJSON source + circle/symbol layers — exactly the architecture the iOS app already proves — and keep DOM markers only where they earn it (spotlight ≤5, radar ≤30, street-tier icon pins). Effect: buttery pan/zoom on mid-range Android, headroom to 2,000+ stores, and it deletes the marker-cap heuristics. *Effort: L. The one real engineering project in this section.*

**P2 — List view virtualization.** `StoreList` renders all 899 cards to DOM. `react-window` (or CSS `content-visibility: auto` as the zero-dependency first step) keeps scroll at 60fps and cuts hydration cost on the prerendered pages. *Effort: S–M.*

**P3 — Offline & instant-revisit via the PWA you already ship.** `vite-plugin-pwa` is installed and registering a service worker — but with default caching. Add Workbox runtime rules: stale-while-revalidate for the `get_all_stores_json` RPC response and ImageKit URLs, cache-first for fonts/icons. A returning traveler on hotel wifi gets a near-instant map; the Yamanote-line test partially passes *on web*. Pair with React Query `persistQueryClient` → localStorage. *Effort: M, no new packages beyond the persist adapter.*

**P4 — Image pipeline polish.** (a) `BlurImage` exists — feed it real dominant-color placeholders (ImageKit can return them, or precompute into `image_metadata` which already has a provider index). (b) Add `srcset` generation to `ikUrl` so the 800px `card` preset isn't shipped to 320px cells. (c) `fetchpriority="high"` on the store-detail hero, `loading="lazy"` everywhere below the fold (partially done). (d) Self-host the fonts in `/fonts` with `font-display: swap` and preload the display face — Google Fonts preconnect still costs a round trip on first paint. *Effort: S–M each, independent.*

**P5 — Bundle diet.** Drop one of `html2canvas`/`html-to-image` (both ship for the same screenshot job). Wrap Framer Motion in `LazyMotion`/`domAnimation` to shave ~25KB from every page that animates. Move `@anthropic-ai/sdk` to devDependencies. Verify `lenis` never mounts on `/map`. *Effort: S.*

**P6 — Harden the prerender pipeline.** It's load-bearing for SEO and fails silently. Post-build assertion: fetch 3 known store pages from `dist`, grep for their `<title>`, fail the deploy otherwise. Longer term, consider moving store/city/neighborhood pages to build-time SSG proper — but the puppeteer flow works; don't rewrite what an assertion can protect. *Effort: S now; L later only if it starts hurting.*

**P7 — INP quick kills.** Remove mobile two-tap (see U-track), debounce the search input's URL sync (500ms exists for URL, confirm the filter itself doesn't re-filter 899 stores per keystroke), and `startTransition` the filter state updates so typing never janks the map.

---

## 2. The SEO & growth engine (web's home turf — highest compounding ROI)

**G1 — Brand index pages: `/brands/:brand`.** The moat feature. Mine `field_notes.item_name` ("Helmut Lang coat") + Kurb inventory into store-level brand tags, then generate a page per brand: "Where to find Helmut Lang in Japan — 14 stores, 32 community finds." Every archive-fashion search on earth ("helmut lang tokyo", "raf simons osaka vintage") currently has NO good answer. You have the data to own that entire query class. Feed pages into the existing sitemap generator + prerender. *Schema flag: `store_brands` join table or `brands text[]` on stores. Start with a mining script (you already have `scripts/generate-store-descriptions.mjs` as the pattern) that proposes tags for admin approval in the admin overhaul branch.*

**G2 — Make neighborhood/city pages ALIVE.** `CityPage`/`NeighborhoodPage` exist as filtered lists. Upgrade them into living guides: open-now count (hoursParser), this week's finds, dominant-category breakdown (Style-DNA aggregation logic exists), the quest for that neighborhood, best-of photo mosaic. Programmatic SEO that's genuinely useful beats a thousand static blog posts — and it's all existing data. *Effort: M.*

**G3 — Share cards as the acquisition loop.** `ShareFieldReportCard.tsx` + `InstagramCard.tsx` already exist. Polish the exported image (trail + stamps + neighborhood in brand style, URL watermark), add visible share CTAs at the three emotional peaks: radar exit, quest completion, first find approved. Your audience lives on Instagram; every good day in Koenji should end as a story with your domain on it. *Effort: S–M, mostly design.*

**G4 — Public passport profiles: `/u/:username`.** `src/components/passport/` has Style DNA + neighborhood bubbles; ProfilePage is private. A public, OG-image-rich profile page (stamps count, DNA chart, top neighborhoods, recent finds) makes the collection mechanic social — collections only motivate when someone can see them. Also: every shared profile is a landing page. *Privacy: opt-in toggle, default private. Schema flag: `profiles.is_public boolean`.*

**G5 — Embeddable store cards.** A tiny `/embed/store/:slug` iframe route (photo, name, category, map thumbnail, "View on Lost in Transit"). Travel bloggers and Discord servers embed it → backlinks → domain authority. Cheap to build off the existing store-card component. *Effort: S.*

**G6 — Canonical hygiene.** Confirm `SEOHead` emits `<link rel="canonical">` on every prerendered route, with UUID URLs canonicalizing to the slug URL. One duplicate-content leak can drag a whole cluster. *Effort: S (verify + patch).*

---

## 3. Product innovation (plan → hand off → return)

**N1 — Trip planner ("Transit Lines").** The single biggest new capability, and it's a *web-first* feature: desktop is where trips get planned. Named lists ("Tokyo Day 2"), drag-order, per-day grouping, total walk time between stops (Mapbox Directions API — existing account), a print/share view, and a public URL per trip (`/trip/:id` — more SEO surface, more shared links). The iOS app then consumes the same lists on the street (Phase-flagged in the iOS brief as `lists`/`list_items` — build the schema ONCE for both). This turns "cool map" into "the thing I organized my Japan trip with," which is retention you can't buy. *Schema flag: `lists`, `list_items(position, day)`. Effort: L, the flagship bet.*

**N2 — Search that understands the domain.** Today search matches name/city/neighborhood substrings. Travelers search in concepts: "archive", "military", "denim", "cheap", "Y2K". Path: (a) quick win — client-side fuzzy over name+categories+brands with Fuse.js; (b) proper — Postgres full-text (tsvector over name, description, categories, brand tags) exposed via one RPC, which iOS reuses. Add "recent searches" and top-brand chips under the search bar. *Effort: M; the RPC benefits both platforms.*

**N3 — "Open now" everywhere.** hoursParser exists on web (it was ported *to* iOS from here). Surface it as: filter chip on map + list, dimmed markers when closed, "opens at 13:00" on cards. For a vintage scene where half the stores open after noon and close Wednesdays, this is the most trust-building single feature versus Google Maps' stale hours. *Effort: S–M.*

**N4 — Onboarding + spotlight rescue.** One dismissible 3-step overlay for first-time `/map` visitors (Browse → "Pick 5 for me" → Radar), reusing the `RadarOnboardingCard` pattern. Rename the "Search this area" button — it triggers curation, not search; call it what it is. Kill mobile two-tap in favor of tap → peek sheet (matches iOS, deletes a duplicated interaction, fixes an a11y hole). *Effort: S–M.*

**N5 — Community layer, sequenced honestly.** Follows/feeds/notifications are the obvious ask, but they need density to not feel empty. Sequence: (1) make finds *visible* where intent is highest — "3 finds this week" pulse on store cards, recent-find strip on neighborhood pages (no schema, data exists); (2) public passports (G4) create identity; (3) *then* follows + a "from people you follow" feed; (4) email digest ("5 new finds in neighborhoods you've saved") as the retention channel — web's native re-engagement tool, no push permission needed. *Schema flags: `follows`; email infra flag: Resend/Postmark + a Supabase cron.*

**N6 — Store pages as living documents.** Small compounding upgrades to the highest-SEO-value pages: "last verified" date, community-sourced price-range votes, "what people found here" brand chips (from G1 mining), a one-tap "suggest an edit" (reuses `store_suggestions` with a `store_id` — closes the data-freshness loop at 899+ stores where staleness is the product killer). *Effort: S each.*

---

## 4. Monetization (appropriate to a taste-driven niche — protect the curation)

Ranked by fit, not size:
1. **Kurb affiliate/rev-share** — infrastructure exists (`kurb_vendor_id`, Edge Function). Push to get more vendors mapped; "Shop online" on web store pages mirrors iOS. Zero trust cost: it's genuinely useful.
2. **Premium tier (shared with iOS RevenueCat phase):** unlimited trip lists + collaborative trips + offline city packs (iOS) + early access to new city drops. Keep the map and community free forever — the moat is the audience.
3. **Store partnerships, done carefully:** a "claimed" store profile (owner-verified hours/photos/stock highlights) — charged as a service, never as ranking. Interesting note: a dead "verified" badge was just removed from the codebase; this is what verification should have meant. *Never* sell spotlight placement — spotlight's credibility IS the product.
4. **Not worth it:** display ads (brand poison), paid API (too early).

---

## 5. Cross-platform coherence (pay this down before both codebases diverge further)

- **C1 — Shared design tokens.** iOS has `theme.ts`; web has hundreds of hand-typed hexes. Extract one `tokens` definition → Tailwind theme extension on web, theme.ts on iOS. The Kirby aesthetic becomes enforceable. *Effort: M, mostly sweep.*
- **C2 — Shared types + parsers.** `Store`, `Find`, hoursParser, slugify are hand-duplicated and already drifting. Lightest viable fix: a `shared/` folder consumed by both repos (git submodule or npm workspace) for pure-TS code only. *Effort: M. Do it before the brand/search/lists schemas add three more duplicated types.*
- **C3 — The AASA file** (`public/.well-known/apple-app-site-association`) — required by iOS Phase 17 universal links, lives in THIS repo, five minutes of work. Plus a smart-banner / "Open in app" chip on store pages for iOS Safari visitors once the app ships.
- **C4 — QR handoff.** On web store/trip pages: small QR that deep-links into the app. The hotel-laptop → phone handoff moment, physicalized.

---

## 6. Data & intelligence (the quiet compounding layer)

- **I1 — Instrument first (prerequisite for everything).** PostHog + Sentry, six events (`map_loaded`, `store_opened`, `spotlight_activated`, `radar_started`, `checkin_success`, `find_submitted`). Still not installed as of this doc. Every roadmap debate above becomes measurable instead of vibes.
- **I2 — Nightly computed tables via `pg_cron`:** `trending_stores` (saves+finds momentum), `neighborhood_stats` (density, open-now-at-noon, dominant categories). Powers G2 pages, "Trending in Tokyo" modules, and email digests without runtime cost. *Schema flag: two materialized views.*
- **I3 — Finish the data-quality suite.** The `admin-overhaul-wip` branch (DuplicateDetector, NeighborhoodFixer, DataQualityTab) is the right instinct — at 899 curated stores, data quality is the product. Land it behind the now-fixed admin RLS. Add a "staleness report" (stores unedited >12 months, dead Instagram links) feeding the suggest-an-edit loop (N6).
- **I4 — Personalization, earned not creepy:** once saves/checkins are instrumented — "because you saved Kinji" similar-store rails, a "your kind of neighborhood" hint on city pages. All client-side computable from data the user gave you.

---

## 7. Sequenced roadmap

**W1 — See clearly (days):** I1 analytics+Sentry · P5 bundle diet · G6 canonical check · P6 prerender assertion · rotate the Google keys if not yet done.
**W2 — Feel fast (1–2 weeks):** P2 list virtualization · P4 image polish · P7 INP kills · N4 onboarding + spotlight rename + two-tap removal.
**W3 — Own the queries (2–3 weeks):** G1 brand mining script + admin approval + `/brands/` pages *(schema flag)* · N3 open-now everywhere · G2 living neighborhood pages · N2 search RPC.
**W4 — The flagship (3–4 weeks):** N1 trip planner *(schema flag — design the tables WITH the iOS lists phase)* · C3 AASA + open-in-app chip · C4 QR handoff.
**W5 — The loop (2–3 weeks):** G3 share cards · G4 public passports *(schema flag)* · N5 step 1–2 (finds visibility, no schema) · N6 store-page upgrades.
**W6 — The engine room (ongoing):** P1 GPU markers · C1 tokens · C2 shared types · I2 cron tables · I3 admin suite landing · then N5 steps 3–4 (follows + digest) *(schema + email infra flags)*.

**All schema changes in one place** (per convention, each via migration + advisor re-run): `store_brands` (G1) · `lists`/`list_items` (N1) · `profiles.is_public` (G4) · `follows` (N5) · 2 materialized views (I2) · `store_suggestions.store_id` (N6). None are needed before W3.

---

*The thread through all of it: the web wins by being the thing search engines and friends can point at. Brands, trips, passports, neighborhoods — every new feature above is also a new class of URL. That's the game iOS can't play, and it's the game that fills the funnel iOS drinks from.*
