# Deep-Dive Audit Prompt for Fable 5 — "Lost in Transit"

Copy everything in the box below into your Fable 5 session, with this project folder attached/mounted.

---

```
You are acting as a principal-level full-stack engineer and product-design consultant doing a
paid, no-holds-barred audit of a live production web app. The founder wants the unfiltered
truth: what's broken, what's mediocre, what's dangerous, and what would make this genuinely
best-in-class. Do not be polite for politeness's sake — be direct, specific, and back every
claim with evidence from the actual code.

## What this app is

"Lost in Transit" is a curated discovery map for vintage/archive/streetwear stores across Japan
(899+ stores, Tokyo/Osaka/Kyoto/Fukuoka/etc). Two core views: an interactive Mapbox map and a
filterable list. Community members submit "finds" (store visit + haul posts). Stack: React 18 +
TypeScript + Vite, Tailwind, Mapbox GL JS, Supabase (Postgres + PostGIS + Storage), React Query,
React Router, Framer Motion, ImageKit for image delivery.

## Step 0 — Orient yourself before critiquing anything

1. Read `CLAUDE.md` in the project root first. It documents known architecture decisions, past
   regressions and their fixes, and explicit "do not do this" rules. Treat these as
   already-litigated decisions, not open questions — see "Guardrails" below.
2. Skim the actual folder structure, `package.json`, and `src/` before forming opinions. Quote
   the specific file and line(s) you're reacting to for every finding — no generic advice.
3. Note that the repo root currently has 35+ standalone planning/status markdown files, several
   duplicated `.env*` variants, a tracked `.env.local.bak`, ~20 stale
   `vite.config.ts.timestamp-*.mjs` build artifacts, and a handful of Python scripts
   (`carousel_app.py`, `carousel_generator.py`, `canvas_editor.py`) living alongside the JS app.
   Treat this as real signal about repo hygiene and dig into whether any of it is a live risk
   (e.g., check whether `.env.local.bak` or any historical git commit ever exposed a live
   secret) — don't just wave it off as clutter.

## Guardrails — do not re-litigate these

CLAUDE.md documents specific regressions that were already fixed. Do not recommend reverting
these, and don't flag the current behavior as a bug:
- `useSpotlightStores` runs unconditionally (not gated on spotlight mode) — intentional, fixes a
  race condition.
- Static (non-animated) `blur-3xl` orbs — animating them caused constant GPU repaint.
- Map viewport updates throttled to 250ms in `handleMapMove`.
- `storesSortedByDistance` returns `Store[]`, consumed as `(store, index)`.
- `onViewportChange` fires on map load, not just on move.
- UUID→slug fallback in `StoreDetailPage` — required for legacy URLs, don't remove.
- `BottomSheet` at `z-[200]`/`z-[201]`.
- `KURB_API_KEY` lives only in Supabase Edge Function secrets, never client-side.
If you think one of these guardrails is itself wrong, say so explicitly and argue the case — but
don't silently contradict it.

## What to audit — go deep on each, not a surface pass

For every finding: cite the file/line, explain the actual impact (not hypothetical), rate
severity, and give a concrete fix or direction — not "consider optimizing this."

1. **Performance** — bundle size and code-splitting, unnecessary re-renders, React Query cache
   usage, image loading strategy (are `card` vs `thumb` ImageKit presets used correctly
   everywhere per CLAUDE.md's rule?), map rendering cost with 899+ markers/clustering via
   supercluster, Framer Motion overuse, anything blocking first paint, Lighthouse-style concerns
   even though you can't run Lighthouse directly (reason about it from the code).
2. **Architecture & code quality** — data fetching patterns vs the `useStores`/RPC rules in
   CLAUDE.md, component coupling, prop drilling vs context usage, TypeScript strictness and any
   `any` escape hatches, duplicated logic across mobile/desktop components, dead code, the
   uncommitted working-tree diff (large — is this a half-finished feature branch that should be
   isolated?).
3. **Design & UX** — evaluate the actual execution of the "Kirby retro-futuristic" aesthetic
   (dark bg, cyan/purple neon, film grain, italic bold type) for consistency across pages, not
   just intent. Visual hierarchy, motion quality (not just performance — does it feel good?),
   empty states, loading states, error states, onboarding for first-time visitors, mobile vs
   desktop parity, the bottom-sheet filter UX, spotlight mode discoverability.
4. **Data layer / Supabase** — schema sanity (`stores`, `field_notes`, `profiles`, slug
   uniqueness), RLS policy coverage (anything publicly readable that shouldn't be?), the
   `get_stores_with_coordinates` RPC gap (doesn't include `slug` yet, per CLAUDE.md), N+1 risk in
   any per-row fetches, index coverage for common query patterns.
5. **Security** — env var hygiene (see Step 0), any client-exposed secrets, Edge Function auth
   posture (`get-kurb-inventory` runs with `verify_jwt: false` — is that scoped tightly enough?),
   input validation on user-submitted "finds," image upload validation.
6. **Accessibility** — color contrast against the dark neon theme, keyboard navigation for map +
   filters + bottom sheets, screen reader labeling on icon-only buttons, focus management when
   sheets/modals open.
7. **SEO** — the sitemap generation flow (`scripts/generate-sitemap.mjs`, prerendering via
   Puppeteer), meta tags / structured data on store detail pages, whether slugs are actually
   SEO-friendly, canonical URL handling for the UUID→slug fallback.
8. **Analytics & observability** — I don't see an analytics or error-tracking package
   (PostHog/GA/Sentry/etc.) in `package.json`. Confirm whether one exists; if not, treat "we are
   flying blind on user behavior and production errors" as a finding, and recommend a concrete,
   lightweight way to fix it.
9. **Repo hygiene / tech debt** — the stray root-level docs, backup env files, timestamped Vite
   build junk, and Python scripts noted in Step 0. Recommend what to archive, delete, or move
   into a `/docs` or `/scripts` folder, and what (if anything) is actually load-bearing.
10. **"Next level" opportunities** — beyond fixing what's broken: what would make this feel like
    a best-in-class, defensible product? Think concretely about the community/finds feature,
    personalization (saved stores, passport/collection mechanics already hinted at in the
    codebase), better search/discovery beyond spotlight mode, and any monetization or retention
    lever appropriate for a niche travel/fashion audience. Ground every idea in what's already
    half-built in the codebase (e.g. `src/components/passport/`, `src/components/radar/`) rather
    than inventing features from scratch.

## Output format

1. **Executive summary** (5-10 sentences): overall health, biggest risk, biggest opportunity.
2. **Prioritized findings**, grouped by the categories above, each tagged with:
   - Severity: Critical / High / Medium / Low
   - Effort: S / M / L
   - File(s)/line(s) as evidence
   - The fix or direction
3. **Top 10 quick wins** — highest impact-to-effort findings, pulled from across all categories,
   something a solo/small team could knock out this week.
4. **Next-level roadmap** — a short list (5-8 items) of bigger bets for taking the product to the
   next tier, each with a one-line rationale tied to the existing codebase or user base.

Be exhaustive within each category, but don't pad — if a category is genuinely fine, say so in
one line and move on. Prioritize finding the handful of things that actually matter over listing
every stylistic nit.
```

---

### Why this prompt is built this way

- **Orientation before critique.** Fable is told to read `CLAUDE.md` and skim the repo structure
  first, so its findings are grounded in what's actually there instead of generic advice —
  the single biggest failure mode for "review my codebase" prompts.
- **Guardrails section** stops it from re-flagging intentional fixes as bugs (a real risk since
  several of those patterns look wrong at first glance, e.g. static blur orbs, unconditional
  hook execution).
- **Concrete, pre-seeded leads** (tracked `.env.local.bak`, no analytics package, stray root
  files) came from a quick pass of your actual folder — they give Fable a running start and a
  bar for how specific the rest of its findings should be.
- **Severity + effort tagging and a "quick wins" section** keep the output usable as a backlog,
  not just a wall of observations.
