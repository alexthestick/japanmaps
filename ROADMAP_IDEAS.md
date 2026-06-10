# Lost in Transit — Innovation Backlog

Ideas captured during Phase 2 session. Not prioritised — pull from here when planning future sprints.

---

## Passport & Social

**Passport share card**
After stamping enough stores, generate a shareable image: "12 stores stamped in Tokyo" with a mosaic of stamp photos. Instagram-format. No other vintage map has this. Each share is organic marketing that looks nothing like an ad.

**Style DNA**
After 10+ stamps, compute the category breakdown of the user's check-ins (e.g. vintage 60%, archive 25%, streetwear 15%) and surface it on the profile: "Your Tokyo style: vintage-forward, Shimokitazawa-rooted." Derived automatically from store categories in `gps_checkins` → `stores`. Unique to LIT because no other map has GPS-verified visit data.

**Neighborhood completion map**
A special profile view where each neighborhood "fills in" as the user stamps stores within it. Empty outline → partial fill → complete. Like painting Tokyo by walking through it. Data already exists via `get_my_badge_progress()`.

---

## Discovery & Walking

**Pre-trip planning mode**
"Visiting Osaka next month" → toggle a city, see all stores with stamp status overlaid (stamped = filled pin, unstamped = outline). Makes the app useful before the trip, not just during it.

**"Store approaching" differentiation**
Unstamped approaching stores should feel like discovery (cyan, forward energy). Already-stamped stores should feel like a reunion (subtle amber, "You've been here"). Small UX change, big difference in how Radar feels returning to a familiar neighborhood.

**Post-stamp haul prompt**
After "Verified ✓" fades, a second softer card: "Found something here? Log it →". One tap opens lightweight haul entry (photo + item name). Connects GPS stamp to existing `field_notes` system. The visit becomes a complete record: *I was here, I found this.*

**Session summary on Radar exit**
When tapping "← Browse," a brief overlay: "Today's walk: 3 stores stamped · 1.2km · Shimokitazawa." Rewards physical behavior. Calculated from `gps_checkins` timestamps + Haversine math.

---

## Social Proof & Community

**Trending stores layer**
"Most stamped this week" as a map layer toggle. Uses the `checkin_count` column already maintained by DB trigger. In 6 months, "38 people checked in at Flamingo this week" is genuinely useful signal for a traveler choosing where to spend an afternoon.

**Seasonal events**
Time-gated discovery: "Cherry blossom season — stores near Shinjuku Gyoen reporting special pieces." Admin-created events with a geofence radius and date range. Drives repeat opens.

---

## Platform

**Capacitor iOS native app (Phase 3)**
Background GPS, pedometer for walking animation between fixes (full Pikmin Bloom quality), push notifications for store approaching alerts, App Store presence. Radar mode tab bar replaces the unified bottom bar.

**Kurb API integration**
UI shells already exist. Live store data (open now, special drops). Connects real-time inventory to the discovery layer.

---

*Last updated: Phase 2 completion — GPS check-in system live.*
