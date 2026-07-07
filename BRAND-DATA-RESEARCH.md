# Brand Data Research — How to Know What Every Store Carries
**Date:** 2026-07-03 · Supporting research for roadmap item G1 (`/brands/` index pages)
**Question:** for ~900 Japanese vintage stores, how do we learn — specifically and freshly — which brands each store carries, beyond photos? And can it be done free?

**Short answer: yes, mostly free.** Realistic total cost: **~$10–20 one-time, $0–5/month ongoing**, using four data tiers you can stack. The single best discovery of this research: a meaningful slice of your stores almost certainly run Shopify, and **every Shopify store publicly exposes its entire product catalog — including a `vendor` (brand) field per product — as structured JSON**. That's not scraping; it's an intentionally public endpoint. For those stores you don't just get "carries Helmut Lang" — you get *live inventory-level* brand data you can refresh weekly.

---

## 1. The data sources, ranked by cost and quality

### Tier 0 — Data you already own (cost: $0, start today)
- **`field_notes.item_name`** — community hauls already contain strings like "Helmut Lang coat." A normalization pass (see §3) turns these into store↔brand edges with real "someone actually found it here" credibility. This is also the only source that captures what's *findable*, not just what's stocked.
- **Kurb inventory** — the `get-kurb-inventory` Edge Function already returns items with a `brand` field per vendor-mapped store. Free, structured, already integrated.
- **Store categories/descriptions** — some `stores.description` rows already name brands; one regex/LLM pass extracts them.

### Tier 1 — Shopify `products.json` (cost: $0, the jackpot)
Every Shopify store exposes `https://{store-domain}/products.json` publicly by default — up to 250 products per page, paginated, with title, price, images, availability, and crucially **`vendor`**, which vintage/archive resellers almost universally fill with the brand ("COMME des GARÇONS", "Yohji Yamamoto"). Confirmed alive and standard practice in 2026; a minority of stores disable it.

**Pipeline:** for each of your ~900 `stores.website` values, attempt `GET {website}/products.json?limit=250`. If it returns JSON → tag the store `has_live_feed`, harvest distinct `vendor` values, store with `source='shopify_feed'` and `last_seen_at`. Re-run weekly (it's one HTTP request per store — a GitHub Actions cron does this for free).
**What it unlocks beyond brand tags:** "In stock now: 12 Helmut Lang pieces across 4 Tokyo stores" — inventory-aware brand pages no competitor (including Google) can produce. Japanese vintage stores increasingly run Shopify for their EC; even a 10–25% hit rate across 900 stores is 90–200 stores with *live* brand feeds.

### Tier 2 — Crawl + LLM extraction on everyone else (cost: ~$5–15 one-time)
Japanese store sites very commonly have a **取扱ブランド ("brands we carry") page** — it's a genre convention — plus brand tag clouds on BASE/STORES/Color-Me-Shop storefronts (Japan's Shopify-alikes; BASE's API is shop-owner-OAuth only, so for third parties the public HTML is the source).

**Pipeline:** for each store with a website: fetch homepage → discover likely brand pages (links matching `brand`, `ブランド`, `取扱`, `maker`) → fetch 1–3 pages → strip HTML to text → send to **Claude Haiku with a strict JSON schema prompt** ("extract brand names this store claims to carry; return `[]` if none; never guess") → write candidates with `source='site_crawl'` + a confidence score.

**Cost math:** ~900 sites × ~3 pages × ~5K tokens ≈ 13–15M input tokens. Haiku 4.5 is $1/M input, $5/M output — and the **Batch API halves that** ($0.50/$2.50). Extraction outputs are tiny. Realistic total: **$8–15 one-time**, ~$2–5 per quarterly refresh. You already have the exact pattern in-repo: `scripts/generate-store-descriptions.mjs` uses the Anthropic SDK the same way.

**Fetching itself:** DIY (`fetch` + cheerio, 1 req/sec politeness, respect robots.txt) = $0 and sufficient for most static/BASE/STORES sites. If a chunk turn out to be JS-rendered and resist plain fetch: **Firecrawl's free tier is 1,000 pages/month** (turns URLs into LLM-ready markdown, handles JS rendering) — enough to cover the stragglers over a month or two at $0, or $16/month for one month if impatient. You likely won't need it.

### Tier 3 — Instagram: skip the scraping, mine what you have
The honest answer on IG, where many of these stores post their best inventory: the free official path died — **Basic Display API shut down Dec 4, 2024**; the Graph API only works for accounts *you own* (Business/Creator, 200 calls/hr, Meta app review). Third-party scrapers exist (HikerAPI ~$0.0006/request, Apify's Instagram actors, SocialCrawl credits) but they're ToS-gray, blockable, and an ongoing bill — the worst cost-to-durability ratio of any source here. **Recommendation: don't build on scraped IG.** You get 80% of the value from Tiers 0–2 plus §4's community loop. If you ever want IG signal, the durable version is stores granting access to their own accounts as part of a future "claimed profile" partnership — official API, zero ToS risk, and it doubles as a monetization hook.

### Reference, not source: Vintage.City
Japan's own vintage-store platform (store map + per-store item listings, WEGO/RAGTAG/JAM-tier shops on it). Scraping it would be a ToS problem and strategically silly — but it's the best *manual cross-check* for your top-50 stores' brand accuracy, and proof the demand pattern ("which shop carries what") is real in the home market.

---

## 2. The pipeline, assembled (free-first)

```
                         ┌──────────────────────────────┐
 stores.website ────────▶│ 1. Shopify probe (weekly,$0) │──▶ vendor[] (live, high trust)
                         └──────────────────────────────┘
                         ┌──────────────────────────────┐
 stores.website ────────▶│ 2. Crawl 取扱ブランド pages    │──▶ Haiku extract (~$10 once)
                         └──────────────────────────────┘
 field_notes.item_name ─▶ 3. LLM normalize (~$1)       ──▶ community-verified edges
 Kurb inventory ────────▶ 4. brand field passthrough    ──▶ live, already integrated
                                    │
                                    ▼
                    ┌──────────────────────────────────┐
                    │ 5. Canonicalization (brands tbl) │  ← the make-or-break step
                    │    "HELMUT LANG"·"ヘルムートラング"  │
                    │    ·"helmut lang" → one brand_id  │
                    └──────────────────────────────────┘
                                    │
                                    ▼
                    ┌──────────────────────────────────┐
                    │ 6. Admin approval queue          │  ← fits admin-overhaul-wip
                    │    (confidence-sorted, 1-click)  │
                    └──────────────────────────────────┘
                                    │
                                    ▼
              store_brands (store_id, brand_id, source, confidence, last_seen_at)
                                    │
                                    ▼
        /brands/:slug pages · brand chips on store pages · brand search · "in stock now"
```

**Step 5 deserves emphasis:** Japanese sites list brands in katakana, romaji, English, and abbreviations. A `brands` table with `canonical_name`, `slug`, and `aliases text[]` (seeded by one LLM pass over all raw extracted strings: "group these into canonical brands with aliases") is what makes ヘルムートラング and HELMUT LANG the same page. Without it you'll ship a duplicate-riddled index.

**Step 6 keeps the trust:** never auto-publish `site_crawl` results below a confidence threshold. Shopify-feed and Kurb edges can auto-publish (they're first-party claims); crawl+LLM edges go through the admin queue. `source` + `last_seen_at` also lets brand pages honestly say "seen in their online store this week" vs "listed on their site."

---

## 3. Cost summary

| Item | One-time | Ongoing | Notes |
|---|---|---|---|
| Shopify probe (DIY fetch) | $0 | $0 | GitHub Actions weekly cron |
| Site crawl (DIY fetch+cheerio) | $0 | $0 | robots.txt + 1 req/s politeness |
| Haiku extraction (Batch API) | ~$8–15 | ~$2–5/quarter | $0.50/$2.50 per M tokens batched |
| `item_name` + description mining | ~$1 | pennies | tiny corpus |
| Canonicalization LLM pass | ~$1 | pennies | one-shot + incremental |
| Firecrawl (only if JS-heavy sites resist) | $0 (1,000 pages/mo free) | $0 | escape hatch, probably unneeded |
| Instagram scrapers | — | — | **recommended: don't** |
| **Total** | **≈ $10–20** | **≈ $0–5/mo** | |

## 4. The flywheel that makes it self-maintaining (all free)

Bootstrap data decays; community data compounds. Three loops to build alongside:
1. **Post-find brand prompt** — when a find is approved, if `item_name` contains a known brand alias, auto-propose the store↔brand edge; if not, one optional chip in the log-find flow: "what brand?" (autocomplete against the `brands` table).
2. **"Seen it here?" confirmations** — on brand pages, a one-tap "I saw ✕ here recently" on each store row; three confirmations refresh `last_seen_at`. Cheapest possible crowdsourced freshness.
3. **Store self-service (later, monetizable)** — claimed profiles maintain their own brand list; the eventual official-Instagram-access hook lives here too.

## 5. Legal & politeness posture
Brand lists are **facts** — facts aren't copyrightable, and "Store X carries Brand Y" is exactly the kind of factual compilation directories have always published. Shopify's `products.json` is intentionally public. Behave well anyway: honor robots.txt, identify your crawler UA (`LostInTransitBot/1.0 (+lostintransitjp.com/bot)`), 1 req/sec, cache aggressively, and never crawl marketplaces/platforms whose ToS prohibit it (Instagram, Mercari, Vintage.City). The `store_brands.source` column is also your provenance audit trail if any store ever asks "where did this come from?" — and a store *asking* is a partnership conversation, not a threat.

## 6. Build order for the builder chat
1. `brands` + `store_brands` tables *(schema flag — via migration)*.
2. Shopify probe script + weekly GitHub Action → auto-publish edges.
3. `item_name` mining pass → high-trust community edges.
4. Crawler + Haiku batch extraction → staging table.
5. Canonicalization pass → aliases.
6. Admin approval queue tab (lands in the `admin-overhaul-wip` branch).
7. Ship `/brands/:slug` pages + brand chips on store detail + brand terms in search; add to sitemap generator + prerender routes.

---

### Sources
- [The Shopify products.json Trick (DEV Community)](https://dev.to/dentedlogic/the-shopify-productsjson-trick-scrape-any-store-25x-faster-with-python-4p95) · [How to Scrape Shopify Stores in 2026 (DEV Community)](https://dev.to/agenthustler/how-to-scrape-shopify-stores-in-2026-products-prices-and-inventory-2p2) · [Scraping Shopify Product Catalogs 2026 (Tendem)](https://tendem.ai/blog/scraping-shopify-stores-product-catalogs) · [shopify-products-scraper (GitHub)](https://github.com/grabowskiadrian/shopify-products-scraper)
- [Vintage.City — 古着ファッションアプリ (Google Play)](https://play.google.com/store/apps/details?id=com.naverjhub.vcity&hl=en_GB&gl=US)
- [Instagram API Deprecated Again? What to Do in 2026 (SociaVault)](https://sociavault.com/blog/instagram-api-deprecated-alternative-2026) · [Instagram Scraping in 2026: What Works, What It Costs (SocialCrawl)](https://www.socialcrawl.dev/blog/instagram-scraping-2026) · [Instagram Basic Display API Deprecation (Phyllo)](https://www.getphyllo.com/post/instagram-basic-display-api-deprecation-what-it-is-for-developers-and-businesses) · [Best Instagram APIs in 2026 (HikerAPI)](https://hikerapi.com/help/best-instagram-api-for-developers-2026)
- [Claude Platform Pricing docs](https://platform.claude.com/docs/en/about-claude/pricing) · [Anthropic API Pricing 2026 (CloudZero)](https://www.cloudzero.com/blog/claude-api-pricing/) · [Claude API Pricing 2026 (MetaCTO)](https://www.metacto.com/blogs/anthropic-api-pricing-a-full-breakdown-of-costs-and-integration)
- [BASE API press release (BASE, Inc.)](https://binc.jp/en/press-room/news/press-release/pr_20141001) · [BASE: Japan's All-In-One Shopify (Japan BI)](https://japanbi.substack.com/p/base-japans-all-in-one-shopify-etsy) · [The State of BASE in 2026 (Store Leads)](https://storeleads.app/reports/base)
- [Firecrawl Pricing (official)](https://www.firecrawl.dev/pricing) · [Firecrawl Pricing in 2026 (eesel)](https://www.eesel.ai/blog/firecrawl-pricing)
