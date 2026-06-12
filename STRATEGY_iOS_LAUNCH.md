# Lost in Transit — iOS App Store Strategy & Innovation Audit
*Prepared June 2026 | Confidential*

---

## Executive Summary

Lost in Transit sits at a genuinely rare intersection: GPS-verified physical behavior data, a fashion-aware audience, and a market (Japan vintage/streetwear) with zero credible native app competition. The web app has strong foundations — Radar check-ins, neighborhood badges, store passport, and 899+ stores. The path to App Store is shorter than most founders realize. The risks are specific and manageable. The opportunity, if executed correctly, is to own a category that no one else is building seriously.

This document is a working strategy document, not a pitch deck. Every recommendation is tied to a real technical decision, a real user behavior, or a real revenue mechanism.

---

## Part 1: Gap Analysis

### 1.1 What Works Well (and Translates Directly)

The React/Vite SPA wraps cleanly into Capacitor. Most of what's been built — Mapbox, Supabase, the Passport system, Radar mode — requires no architectural rethinking. The PWA already runs on iPhone. The primary unlock from Capacitor is not UI (you have that) but native APIs:

- **Background GPS** — the biggest unlock. `watchPosition` in a web PWA is killed by iOS when the app is backgrounded. Capacitor's `@capacitor/geolocation` with background mode keeps the session alive during a walk.
- **Push notifications** — currently impossible on iOS PWA without a native wrapper.
- **Camera integration** — `capture="environment"` works in Safari but the experience is clunky vs a native camera sheet.
- **Haptic feedback** — zero cost, massive feel difference. A subtle haptic on stamp success makes Radar feel like a physical action.

### 1.2 Features That Won't Translate Directly (and What to Do)

| Web Pattern | Problem on iOS | Native Solution |
|---|---|---|
| `navigator.geolocation.watchPosition` | Killed when app backgrounded | `@capacitor/geolocation` with `enableHighAccuracy: true` + background mode entitlement |
| Browser file picker for photo uploads | Clunky, no camera control | `@capacitor/camera` with `CameraSource.CAMERA` |
| Web push via service worker | Not supported on iOS PWA | `@capacitor/push-notifications` + APNs (Apple Push Notification service) |
| `localStorage` for saved stores | Works but not synced across devices | Migrate to Supabase `saved_stores` table (already exists) |
| `navigator.share` for passport card | Works on iOS Safari 15+, but file sharing limited | Capacitor's `@capacitor/share` plugin — more reliable cross-app sharing |
| Mapbox GL JS (web SDK) | Works via WebView but heavy; ~4MB bundle | Keep for v1, evaluate Mapbox Maps SDK for iOS v2 if perf becomes issue |
| CSS animations / Framer Motion | Works but GPU usage is higher in WKWebView | Already compliant (no animated blur orbs). Continue enforcing CLAUDE.md rules. |

### 1.3 UX Patterns That Won't Feel Native

**Bottom navigation bar.** The current app uses floating pills and bottom sheets. iOS users expect a persistent tab bar at the bottom (UITabBar). Not mandatory, but the absence is noticeable within 30 seconds of use.

**Back gestures.** iOS users swipe right from the left edge to go back. React Router doesn't handle this natively inside a WebView. Need to wire `@capacitor/app` `backButton` listener + `history.back()`.

**Keyboard avoidance.** When the search bar or caption fields are focused, iOS will push the WKWebView up but can clip content. Requires `ScrollView` awareness — use `ionicframework`'s keyboard plugin or `@capacitor/keyboard` to listen and adjust.

**Pull-to-refresh.** On native iOS, pulling down in any scroll view triggers a refresh indicator. Without an explicit handler, the browser's native rubber-band behavior looks broken inside a Capacitor WebView. Disable native overscroll or implement a custom PTR handler.

**Status bar.** The Capacitor WebView starts below the status bar by default if not configured. Need `@capacitor/status-bar` + correct `SafeAreaInsets` handling (already partly done in CSS via `env(safe-area-inset-*)`).

**Splash screen + launch icon.** Need all sizes: 1024×1024 App Store icon, plus all device-specific splash screens (Capacitor's `@capacitor/splash-screen` handles the runtime portion; Xcode asset catalog handles the images).

### 1.4 App Store Review Considerations

**Privacy manifest (required as of iOS 17 SDK).** Any app using location, camera, or tracking APIs must include a `PrivacyInfo.xcprivacy` file declaring the exact APIs used and the reason. Capacitor 5+ generates this, but you need to verify each plugin's manifest entry is correct.

**Location permission strings.** Both `NSLocationWhenInUseUsageDescription` and `NSLocationAlwaysAndWhenInUseUsageDescription` must have clear, honest copy. "Used to show stores near your current position and to stamp your passport when you're physically at a store." Apple reviewers read this carefully.

**"Always On" location.** If you request background location, Apple requires a compelling reason. Framing: "Radar mode continues tracking your walk so your session summary includes accurate distance — the app does not track you outside of Radar mode." This is defensible. Foursquare had this approved for years.

**Apple Sign-In.** Since you're using Supabase Auth with email/password (and potentially Google OAuth), you are required to also offer Sign in with Apple if any third-party sign-in is present. This is non-negotiable — Apple will reject the app. Supabase Auth supports Apple OAuth natively.

**User-generated content.** The `field_notes` system (haul finds, captions) is UGC. App Store guideline 1.2 requires a UGC moderation mechanism and reporting tool. You have status: 'pending' → 'approved' review flow, which satisfies this. Add an in-app report button to find cards.

**In-app purchases.** If you implement subscriptions or any paid feature, Apple takes 30% (15% for small developers earning <$1M/year under the Small Business Program). All digital goods must go through IAP — no Stripe checkout links for premium features. Physical goods (merchandise, affiliate) are exempt.

**Data deletion.** Apple requires a way for users to delete their account and all associated data from within the app. Currently absent. Must add to profile settings before submission.

### 1.5 Backend & Data Architecture Readiness

| Area | Current State | Gap | Effort |
|---|---|---|---|
| Store data | 899+ stores, Supabase PostgreSQL + PostGIS | None — solid | — |
| Auth | Supabase Auth (email/password) | Add Apple OAuth | Low |
| GPS check-ins | `gps_checkins` table, Edge Function verification | Background GPS needed for native | Medium |
| Offline maps | Not implemented | Tiles must be pre-cached or app is useless without signal | High |
| Push notifications | Not implemented | APNs setup + FCM + notification table | Medium |
| Analytics | Not implemented | Needed for monetization decisions | Low |
| Store hours | Parsed client-side from text | Good enough for v1 | — |
| Images | ImageKit CDN | Works in WebView, no change needed | — |
| Account deletion | Not implemented | Required for App Store | Low |

---

## Part 2: Feature Recommendations

### P0 — Launch Blockers (must ship before App Store submission)

1. **Apple Sign-In** — Supabase Apple OAuth + Capacitor `@capacitor/sign-in-with-apple`. One day of work.

2. **Account deletion flow** — "Delete my account" in Profile settings → Supabase `auth.admin.deleteUser` via Edge Function (service role). Cascades to all user data via foreign key ON DELETE CASCADE. One day.

3. **Privacy manifest** — `PrivacyInfo.xcprivacy` with location, camera, and any tracking API declarations. Capacitor plugins generate most of this; verify completeness.

4. **Background GPS entitlement** — Required for Radar to work when phone is locked. `UIBackgroundModes: location` in `Info.plist`. Apple review note must explain the use case.

5. **Haptic feedback on stamp** — `@capacitor/haptics` with `HapticsImpactStyle.Heavy` on "Stamped ✓". One line of code. Immediately makes the experience feel physical and intentional.

6. **In-app UGC reporting** — Report button on field_notes cards → `reported_notes` table → admin review. Prevents App Store rejection under guideline 1.2.

7. **Status bar + splash screen** — `@capacitor/status-bar` (dark content on light maps, light on dark UI). All icon/splash sizes in Xcode asset catalog.

### P1 — High-Impact Differentiators (ship within 60 days of launch)

1. **Push notifications: "Store approaching"** — When background GPS detects the user is within 300m of an unstamped store, send a local push: "Bay Apt. is 200m away — you haven't stamped this one yet." This is the single highest-retention feature in the entire roadmap. Local notifications (no server) = simpler to implement and Apple-approved without special review.

2. **Offline mode for map tiles** — Cache the last-viewed city's tile set on first load. Mapbox GL JS supports tile caching via `mapbox-gl-offline` or Mapbox's offline packs API. Critical for a travel app — users are on foreign SIMs with bad data.

3. **Native camera sheet for haul photos** — Replace `<input type="file" capture="environment">` with `@capacitor/camera`. Get a proper native camera sheet with flash control, portrait mode, etc. Significantly improves photo quality of finds.

4. **Siri Shortcuts** — "Hey Siri, open Radar mode in Lost in Transit." `NSUserActivity` for key actions (open Radar, show nearby stores, open passport). Low lift, high perceived quality.

5. **iOS Home Screen Widget** — Shows the nearest unstamped store right now. `WidgetKit` extension. Requires a small Swift file wrapping a Capacitor WebView, or a pure Swift widget that calls the Supabase REST API directly. This is the feature that makes the app feel like a daily-use product rather than a trip tool.

6. **Style DNA** — After 10+ verified stamps, compute category breakdown. "Your Tokyo style: Vintage 60% · Archive 25% · Streetwear 15% · Shimokitazawa-rooted." Auto-derived from `gps_checkins` + `stores.categories`. Show on profile. This is the feature that gets screenshotted without a share button — pure organic distribution.

### P2 — Strong Follow-on Features (months 3-6)

1. **Neighborhood completion map** — Replace the badge row in Passport with a visual SVG map of visited neighborhoods. Shimokitazawa half-filled, Harajuku empty. Like Wordle but for walking. Built from `get_my_badge_progress()` data already in the DB.

2. **Pre-trip planning mode** — "Visiting Osaka next month" toggle → all stores shown with your stamp status overlaid. Builds anticipation, makes the app useful before the trip. Turns occasional users into regular planners.

3. **Friends + social layer** — Follow friends, see their passport stamps on the map as ghost pins, get notified when a friend stamps a store you've been to. This makes Radar a shared activity, not a solo one. Requires `follows` table + social feed.

4. **Store owner dashboard (MVP)** — Claim your store, update hours and photos, see your check-in analytics. Even a 1-field "claim this store" form begins building a B2B relationship. Store owners become distribution channels.

5. **"Open now" filter on map** — Uses the hours parser already built. Toggle that hides all currently-closed stores. Extremely high utility for morning/late-night walkers.

6. **Trending this week layer** — Map overlay showing most-stamped stores this week. "38 people checked in at Flamingo this week." Real behavioral signal no other app can provide because no other app has GPS-verified visit data.

### P3 — Experimental / Platform Evolution (month 6+)

1. **AR store navigation** — When inside a store's check-in radius, AR overlay showing the store name, stamp status, and a directional arrow. Needs `@capacitor-community/camera-preview` + device orientation. Ambitious but technically feasible.

2. **Resale integration** — "Find this on Grailed →" deep-link from store detail to a pre-filtered Grailed search for that store's brand. Affiliate revenue without building a marketplace. Start with URL scheme deep-links.

3. **Curated city guides (in-app purchase)** — "Shimokitazawa Vintage Guide by [local curator]" — a curated collection of 15 stores with hand-written notes, best times to visit, what to look for. One-time $4.99 purchase. Creates a curator network model where local fashion writers have a monetization mechanism.

4. **Lookbook feature** — Users can create multi-store collections ("My Harajuku archive run") with photos from their finds. Shareable as a scrollable story. Instagram for the serious vintage shopper.

5. **Pop-up & event discovery** — Integrate pop-up shop announcements from store Instagram feeds (parsed via Apify or a simple webhook). "Pop-up this weekend at Dover Street Market." High-engagement push notification use case.

---

## Part 3: Competitive Intelligence

### 3.1 Direct & Adjacent Competitors

**Foursquare / Swarm**
What they do well: The original GPS check-in mechanic, mayorships, sticker collections. Pioneered the behavior.
What went wrong: Splitting into two apps (Foursquare City Guide + Swarm) in 2014 diluted both. City Guide shut down December 2024; Swarm survives with a niche loyal user base. Lesson: do not split the app. Keep discovery and check-ins unified.
Gap you can own: Foursquare never had category depth (vintage vs archive vs streetwear) or a community that cared about the specific culture of what they were finding. Their data is generic. Yours is curated.

**Depop**
What they do well: Community-first marketplace. The new "Outfits" feature (Sep 2025) lets users style items from inventory before buying — AI background removal, sharable static images, shoppable links. Strong identity expression layer.
What they don't do: Physical discovery. Depop is online-first. They have no map, no GPS, no "I was here" layer. A user buying vintage on Depop and a user walking Shimokitazawa are the same person — they have zero connection to that real-world behavior.
Gap you can own: The bridge between physical thrifting behavior and the digital resale layer. "Found at Bay Apt. on your Lost in Transit passport? List it on Grailed →" is a feature Depop cannot build.

**ZOZOTOWN / WEAR (Japan)**
What they do well: WEAR is Japan's dominant fashion inspiration app — users share outfit photos, browse by brand/category. 56M monthly visits on ZOZOTOWN. WEAR has strong local community.
What they don't do: Physical store discovery, GPS, vintage-specific curation. WEAR is online inspiration; you're physical destination.
Gap you can own: The "where to shop in person" layer that WEAR explicitly doesn't attempt. WEAR users are your users — they care about style, they're in Japan, they want to find stores. Partnership or at minimum SEO angle: rank for "vintage shopping Tokyo guide."

**Google Maps / Apple Maps**
What they do well: Comprehensive, reliable hours, transit integration, reviews.
What they don't do: Curation. You cannot filter Google Maps by "archive fashion under ¥10,000 in Shimokitazawa." You cannot stamp a store. You cannot see that 47 style-conscious people have verified this store is worth the walk.
Gap you can own: Curation density + community verification. Google Maps has the geography; you have the taste.

**Mercari / Rakuma (Japan)**
What they do well: Dominant C2C resale in Japan. Mercari has 20M+ active users, processes thousands of transactions daily, AI-powered image recognition for listings.
What they don't do: Physical discovery. Mercari is for selling things you own, not discovering places to find new things.
Gap you can own: The top-of-funnel for Japanese vintage. Users find stores on Lost in Transit, go there in person, buy something, then list the find on Mercari. You're pre-Mercari in the purchase journey.

### 3.2 Unique Angles for Lost in Transit

**GPS-verified taste data.** No competitor has what you're building: a dataset of where fashion-aware travelers actually walk and what they find. After 10,000 verified stamps, you have behavioral data worth more than any survey.

**The passport as identity.** Depop has follower counts. Grailed has transaction history. Lost in Transit has a passport — a physical record of where you've been. This is a meaningfully different identity object than anything in the resale space.

**Japan specificity as a moat.** The density of stores in your DB (899+ in specific Tokyo neighborhoods) is a barrier to entry. Replicating it requires ground-truth knowledge and manual curation that no large platform will invest in for a niche market. Shimokitazawa-specific knowledge is your defensible position.

---

## Part 4: Monetization Deep-Dive

### 4.1 Recommended Primary Model: Freemium Subscription ("Passport Pro")

**Why this model, not ads or transaction fees:**
The App Store subscription market grew 25% year-over-year through 2025. Travel apps with premium tiers earn 5–7x more than the median free app. Your users (fashion-aware travelers, 25–35) have demonstrated willingness to pay for curated taste — they're already spending money on vintage clothing. A $4.99/month or $29.99/year subscription is trivially small relative to their average purchase value at a vintage store.

Ads would destroy the aesthetic. Transaction fees require a marketplace you haven't built. A subscription is clean, Apple-native, and aligns monetization with value delivery.

**What goes in Passport Pro:**

| Free | Pro ($4.99/mo or $29.99/yr) |
|---|---|
| Map access, all stores | Everything free |
| 3 saved stores | Unlimited saved stores |
| Radar mode (basic) | Radar mode + push notifications for approaching stores |
| Passport stamp grid | Passport + Style DNA + neighborhood completion map |
| Share card (5+ stamps) | Share card + branded export with no "unlock at 5" gate |
| — | Pre-trip planning mode (city wishlist with stamp overlay) |
| — | Offline map cache (downloaded city tiles) |
| — | Early access to new stores (7 days before public) |
| — | City guide in-app purchases at 50% discount |

**Pricing rationale:** $29.99/year = $2.50/month. The traveler who uses this once for a Tokyo trip and gets 30 minutes of value gets their money's worth. The repeat user (someone who goes to Japan regularly, or lives there) finds this trivially cheap. No "should I subscribe?" friction.

**Revenue projection (conservative):**
- 10,000 downloads in year 1 (achievable with influencer + ASO)
- 8% conversion to Pro (industry median for travel apps is 5–12%)
- 800 subscribers × $29.99 = ~$24,000 ARR year 1
- At 50,000 downloads and 10% conversion: $150,000 ARR

Not a VC scale number, but a real, sustainable business for an indie product that can be run by one person.

### 4.2 Secondary Revenue: Store Partnerships / Featured Listings

**How it works:** Store owners pay a monthly fee ($49–$149/month) to appear as "verified partners" with a featured badge, priority placement in search, and access to an analytics dashboard (how many users approached, stamped, viewed hours). This is the B2B layer.

**Why it works for stores:** A Tokyo vintage store owner who knows that 200 fashion travelers walked within 150m of their store last month and 40 stamped it is seeing data they cannot get anywhere else. Google Analytics tells you about web traffic. Lost in Transit tells you about foot traffic from your target demographic.

**Why it's App Store compliant:** B2B subscription paid outside the app (web invoice or Stripe). No IAP required — this is a business service, not a digital feature sold to consumers.

**Year 1 target:** 50 stores × $79/month = $47,400/year. This alone covers server costs and Mapbox bills with significant runway left.

### 4.3 Tertiary Revenue: Curated City Guides (In-App Purchase)

**What it is:** One-time in-app purchases for in-depth neighborhood guides written by local curators. "Shimokitazawa Vintage Guide — ¥500 ($3.99)" covering 15 stores with hand-written notes, best times to visit, what each store is known for, what to look for.

**Why this works:** Travel content that's actually useful is chronically undermonetized. Lonely Planet charges $19.99 for a guidebook. A $3.99 in-app purchase for a neighborhood guide written by someone who actually shops there is an obvious buy for the target user.

**Creator economics:** Pay curators 50% of guide revenue. A popular guide (Harajuku archive, Shimokitazawa vintage) could sell 500 copies at $3.99 = $2,000 total → $1,000 to the curator. This creates a network of fashion writers with a monetization reason to promote Lost in Transit.

**Implementation:** Apple IAP, non-consumable purchase, unlocks a rich markdown/image guide stored in Supabase Storage.

### 4.4 Model Comparison

| Model | User Value Alignment | Revenue Potential | Complexity | App Store Compliant |
|---|---|---|---|---|
| Passport Pro subscription | ★★★★★ | ★★★★ | ★★★ (medium) | ✅ |
| Store partnership / analytics | ★★★★ | ★★★★★ | ★★★★ (web billing) | ✅ |
| City guide IAP | ★★★★★ | ★★★ | ★★ (low) | ✅ |
| Affiliate links (Grailed/eBay) | ★★★ | ★★ | ★ (trivial) | ✅ (external) |
| Ads | ★ | ★★ | ★★★ | ✅ but kills aesthetic |
| Resale marketplace | ★★★ | ★★★★★ | ★★★★★ (very high) | ✅ |

**Recommended sequence:** Launch free → add Pro subscription at month 2 → launch store partnerships at month 4 → city guide IAP at month 6.

### 4.5 What Not to Do

**Don't build a marketplace in year 1.** Mercari has 20M users and $10B/month in GMV. You cannot compete with that. Your edge is discovery and curation, not transaction facilitation. Affiliate links (send users to Grailed/eBay with a tracking parameter) capture resale intent without building a marketplace.

**Don't do ads.** A banner ad on a screen showing a dark retro-futuristic map of Shimokitazawa is a UX crime. The aesthetic IS the product. Destroying it for $0.002 CPM is the wrong trade.

---

## Part 5: Growth Playbook

### 5.1 First 90 Days Post-Launch

**Days 1–14: Seed users correctly.** The first 200 users set the tone for reviews, screenshots, and social proof. Invite them personally — Japan-based fashion community members, vintage Instagram accounts, travel bloggers. Do not do a broad launch. Personalized onboarding (DM: "I built this because I kept getting lost looking for archive stores in Shimokitazawa, would love to hear what you think") produces higher-quality feedback and reviews than a Product Hunt spike.

**Days 15–30: App Store reviews campaign.** 25+ ratings in the first 30 days dramatically affects algorithmic ranking. Use `SKStoreReviewRequest` (Apple's native in-app review prompt) triggered after a user's third stamp — this is the moment of peak delight, which is when reviews are most likely to be positive.

**Days 31–60: First influencer activations.** Target micro-influencers (10K–100K followers) in the Japan vintage/streetwear space, not macro fashion accounts. Authenticity matters more than reach for this audience. A single post from a respected Shimokitazawa account ("I've been using this to track my Tokyo vintage runs") is worth more than a paid post from someone with 2M fashion followers who shops at H&M.

**Days 61–90: First store partnerships.** Reach out to 20 stores directly (Instagram DM, not email). Offer free "verified partner" status for 3 months in exchange for them sharing the app to their audience. A store with 15K Instagram followers posting "come find us on Lost in Transit" is free user acquisition from exactly your target demographic.

### 5.2 ASO Strategy

**App name:** "Lost in Transit — Japan Store Map" (maximum keyword surface area in title)

**Subtitle:** "Vintage · Archive · Streetwear Radar" (indexes "vintage," "archive," "streetwear," "radar")

**Keywords field (100 chars):** `Japan,Tokyo,vintage,thrift,streetwear,fashion,map,stores,guide,Osaka,Shimokitazawa,Harajuku,shopping`

**Screenshots:** Since June 2025, Apple indexes screenshot caption text. Each screenshot should have a keyword-dense caption: "GPS Radar mode — stamp stores as you walk," "Neighborhood passport with verified check-ins," etc.

**Since Apple doubled custom product pages to 70 (early 2026):** Create localized CPPs for different intent signals — "Japan travel" audience, "vintage fashion" audience, "streetwear discovery" audience — each with different screenshots and descriptions optimized for that search intent.

### 5.3 Six to Twelve Month Strategy

**Month 3:** Launch Passport Pro subscription. Price anchor with a clear free tier that's genuinely useful (this is critical — if the free tier feels crippled, users churn before experiencing value). The offline map and approaching-store notifications are the two features worth paying for, and they're both in Pro.

**Month 4:** Launch store partnership program. Start with 10 hand-picked stores that have strong Instagram followings and are already in the DB. Make the pitch data-driven: "Here's how many of our users have approached your store in the last 30 days."

**Month 5:** First content collaboration. Partner with 2–3 local fashion writers / stylists to produce city guide IAPs. Pay them upfront ($500) plus 50% of ongoing IAP revenue. The content quality from someone who actually knows these stores is not replicable by AI.

**Month 6:** Style DNA feature launch. This is the organic distribution catalyst. "Your Tokyo style: Vintage 65% · Archive-forward · Shimokitazawa-rooted" as a shareable card. Design it to look beautiful when screenshotted. Every share is an ad. This is the single highest-ROI feature in terms of organic growth.

**Month 9:** TikTok push. Content angle: "I rated every vintage store in Shimokitazawa." Series format. Show the map, the stamps, the finds. The "before/after walking around Tokyo with the app" format is high-engagement. This demographic watches this content — StockX hauls, grail finds, Japan thrift trips all do well.

**Month 12:** Geographic expansion evaluation. Osaka is already partially in the DB. Seoul has an active vintage scene (Hongdae, Dongmyo) and a culturally adjacent audience. London's Portobello/Brick Lane. The question is whether to expand wide (more cities, thinner data) or deep (more neighborhoods in Tokyo). Recommendation: go deep in Tokyo first. 500 stores in Tokyo with story content is more defensible than 100 stores in 5 cities.

### 5.4 Key Metrics to Track

**Acquisition:**
- Downloads per week
- Install source (organic search, referral, social)
- App Store ranking for target keywords

**Activation:**
- % of downloads that activate Radar mode at least once
- % of downloads that stamp at least one store
- Time to first stamp

**Retention:**
- Day 7 / Day 30 retention rates
- Stamps per active user per month
- Return visit rate to Passport tab

**Revenue:**
- Free → Pro conversion rate
- Pro churn rate
- MRR from subscriptions
- Store partnership count and MRR
- IAP revenue per guide

**Product quality signals:**
- App Store rating (target: 4.7+)
- Crash-free sessions rate (target: 99.5%+)
- Radar session duration (longer = more engaged walk)

---

## Part 6: Technical Readiness Checklist

### 6.1 Capacitor Setup (the wrapper)

```
npm install @capacitor/core @capacitor/cli @capacitor/ios
npx cap init "Lost in Transit" "com.lostintransit.jp"
npx cap add ios
```

Key Capacitor plugins needed:
- `@capacitor/geolocation` — replace `navigator.geolocation.watchPosition`
- `@capacitor/camera` — replace file input for haul photos
- `@capacitor/push-notifications` — APNs integration
- `@capacitor/haptics` — stamp feedback
- `@capacitor/share` — passport share card
- `@capacitor/keyboard` — keyboard avoidance in forms
- `@capacitor/status-bar` — status bar control
- `@capacitor/splash-screen` — launch screen
- `@capacitor/app` — back gesture + app lifecycle

### 6.2 Backend / API Changes Needed

| Change | Why | Effort |
|---|---|---|
| Add Apple OAuth to Supabase Auth | Required for App Store | 2 hrs |
| Add account deletion Edge Function | App Store requirement | 4 hrs |
| Add `reported_notes` table + RLS | UGC moderation requirement | 2 hrs |
| Add `push_tokens` table | Store APNs tokens per user | 2 hrs |
| Add `get_stores_with_coordinates` → include `checkin_count` | Show check-in counts on store detail | 30 min (one SQL line) |
| Add store partnership tables (`verified_partners`, `analytics_events`) | B2B revenue tier | 1 day |
| Add `city_guides` table + IAP products | City guide feature | 2 days |

### 6.3 Offline Capability Plan

**Phase 1 (launch):** Mapbox tile caching. Mapbox's JavaScript SDK caches tiles in IndexedDB. On app launch, pre-fetch tiles for the user's current city at zoom levels 10–16. This covers ~50MB for central Tokyo — acceptable.

**Phase 2 (Pro feature):** Explicit "Download Tokyo for offline" button. Triggers Mapbox offline pack download. Requires Mapbox token with offline scope enabled. Show storage usage in settings.

**Store data:** The React Query cache (`staleTime: 5 min`) plus `localStorage` persistence via TanStack Query's `createSyncStoragePersister` gives you 5-minute offline capability for store data essentially for free. For full offline: cache the `get_stores_with_coordinates` response to IndexedDB on first load.

### 6.4 GPS Optimization for Battery

Current web approach (`navigator.geolocation.watchPosition`) fires on every GPS update. Native equivalent with `@capacitor/geolocation` allows batching. Key optimizations:

1. **Geofencing for store proximity** instead of polling: register geofences for stores within 1km of current position. iOS fires a geofence event when the user enters/exits. Battery impact: near zero vs. ~8% per 30 minutes for continuous polling.

2. **Adaptive accuracy:** when moving slowly (<3 km/h based on position delta), switch to lower accuracy mode. When approaching a store's proximity ring, switch back to `HIGH_ACCURACY`.

3. **Session-based GPS:** Start high-accuracy GPS only when Radar mode is active. Stop immediately on Browse. Already architecturally correct — just needs the native plugin to respect this boundary.

A React Native case study achieved 60% battery reduction by switching from continuous polling to geofencing + adaptive accuracy. Target: Radar mode should use <5% battery per 30-minute session.

### 6.5 Testing Strategy for iOS

**Device matrix (minimum):**
- iPhone SE (4th gen) — smallest screen, 1x density
- iPhone 15 Pro — current flagship, Dynamic Island
- iPhone 14 — largest installed base
- iPad (optional, but low effort if layout uses responsive breakpoints you already have)

**GPS testing:**
- Real-device testing is required for Radar. No simulator equivalent.
- Test in Tokyo (real trip) or use the ngrok + Chrome DevTools sensor spoofing workflow documented in `SESSION_HANDOFF.md` during development.
- Specifically test: Radar entering/exiting background, GPS accuracy on subway (poor), GPS on street (good), re-entry after phone sleep.

**App Store review simulation:**
- Use TestFlight for beta distribution (up to 10,000 external testers)
- Submit to App Review with detailed review notes explaining GPS usage and background mode
- Set up a test account for reviewers with a pre-stamped store or two so they can see the Passport

### 6.6 Deployment & Versioning

**CI/CD:** Xcode Cloud or GitHub Actions with `fastlane match` for code signing. Automate TestFlight uploads on every push to `main`.

**Versioning strategy:** 
- Semantic versioning: `1.0.0` (major.minor.patch)
- Build number auto-incremented by CI
- App Store requires a new build number for every submission

**Feature flags:** Use Supabase `remote_config` table (simple key-value) to gate Pro features server-side. Allows rolling out subscription features without an App Store update.

**Over-the-air updates:** Capacitor supports Capgo (open-source OTA) for pushing JavaScript/CSS changes without App Store review. Safe to use for UI tweaks, bug fixes, and content changes. Not allowed for new native plugin usage (those require a new build).

---

## Appendix: Recommended Launch Timeline

| Phase | Timeline | Focus |
|---|---|---|
| **Pre-launch** | Month 1–2 | Capacitor setup, Apple Sign-In, account deletion, TestFlight beta |
| **Soft launch** | Month 3 | App Store submission, seed 200 users, collect reviews |
| **Growth v1** | Month 3–4 | ASO iteration, influencer seeding, store partnership outreach |
| **Monetization** | Month 4–5 | Passport Pro subscription, store analytics dashboard |
| **Content layer** | Month 6 | City guide IAP, Style DNA, style sharing |
| **Scale** | Month 9–12 | TikTok content push, geographic expansion evaluation |

---

*Lost in Transit has a real, defensible product in a real, underserved market. The gap between the web app today and an App Store product is smaller than it appears — primarily Capacitor plumbing, a subscription paywall, and Apple Sign-In. The features that create genuine lock-in (GPS-verified passport, Style DNA, neighborhood completion map) are already architecturally in place or partially built. The window to own this category before a well-funded competitor notices it is real but not infinite.*

*Build fast. Ship clean. Stamp everything.*
