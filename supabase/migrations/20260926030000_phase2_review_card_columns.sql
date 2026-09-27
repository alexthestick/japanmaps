-- Backfilled into the repo by Claude, matching Phase 0/1 practice: applied
-- directly to production via the Supabase MCP tools first, then written
-- here afterward so `supabase db push` / a fresh clone stays in sync with
-- what's actually deployed.
--
-- Phase 2 of the discovery-pipeline rollout: adds the columns the rich
-- Admin Dashboard review card and the real approve -> promote flow depend
-- on. Everything here is additive (new nullable columns, a widened check
-- constraint) -- no existing data is touched.
--
-- lat/lng: plain double precision mirrors of the geography(Point,4326)
-- `location` column discover-store already computes, so the dashboard can
-- read coordinates directly instead of parsing PostGIS client-side.
--
-- google_photo_names: Places photo *references* only (not the images
-- themselves) -- captured at discovery time, resolved to real images later
-- by fetch-google-photo only when a reviewer opens a card. Keeps Places
-- Photo quota / storage spend limited to candidates someone actually looked
-- at, instead of every bulk-rejected find.
--
-- oembed_*: Instagram/Threads oEmbed preview, fetched by discover-store at
-- submission time (see the design doc's live-test findings -- no access
-- token needed as of Meta's June 2026 policy change, but neither platform's
-- response carries thumbnail_url/author_name, so those two columns are
-- typically null; oembed_html is what the review card actually renders).
--
-- follower_count: Muse sends this as its own structured field going
-- forward, rather than it being buried in free-text notes.
--
-- promoted_store_id: set by promoteSuggestion() when a suggestion is
-- approved and turned into a real store row. Nullable and a plain FK (not
-- unique) so an already-approved-but-never-promoted row (an orphan --
-- status='approved', promoted_store_id is null) is trivially detectable by
-- the dashboard and can be promoted or reverted to pending, per Alex's
-- "don't silently skip them" instruction.
--
-- stores_import_source_check: widened to allow 'discovery_bot' and
-- 'public_suggestion' as legitimate values for stores.import_source, since
-- promoteSuggestion() will start writing those.

begin;

alter table public.store_suggestions
  add column if not exists lat                    double precision,
  add column if not exists lng                     double precision,
  add column if not exists google_photo_names      text[],
  add column if not exists oembed_html             text,
  add column if not exists oembed_thumbnail_url     text,
  add column if not exists oembed_author_name       text,
  add column if not exists oembed_fetched_at        timestamptz,
  add column if not exists follower_count           int,
  add column if not exists promoted_store_id        uuid references public.stores(id);

alter table public.stores drop constraint if exists stores_import_source_check;
alter table public.stores add constraint stores_import_source_check
  check (import_source in ('manual', 'chain_locator', 'osm', 'discovery_bot', 'public_suggestion'));

commit;
