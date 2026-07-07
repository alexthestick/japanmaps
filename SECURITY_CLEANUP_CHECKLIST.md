# Lost in Transit — Post-Audit Checklist
Updated 2026-07-03

## ✅ Already done and verified
- Dropped the RLS policies that let any signed-up user edit/delete all 899 stores and blog posts.
- Closed the `field_notes` moderation bypass (users can no longer self-approve their own finds).
- Removed public listing access on the `finds-photos`/`profile-photos` storage buckets.
- Revoked anon/authenticated execute on internal counter + `handle_new_user` functions; ran the `spatial_ref_sys` revoke CLAUDE.md had documented but never applied.
- Added a stopgap size/shape limit on `store_suggestions` inserts.
- Removed `.env.local.bak` from git tracking and deleted it from disk.
- Split your 20 uncommitted files into two clean commits on `main` (security cleanup, dead "verified" badge removal) and moved the unfinished admin overhaul to its own `admin-overhaul-wip` branch so nothing was lost.
- Broadened `.gitignore` to `.env*` (+ exception for `.env.example`) so no env-file variant can slip through again.

## 🔴 Only you can do these — do them today
1. **Rotate the Google Places API key.** console.cloud.google.com → APIs & Services → Credentials → find the key starting `AIzaSyDbYx…`. Create a new key first, restrict it (HTTP referrer = your domain, API restriction = Places API only), then continue to step 3 before deleting the old one.
2. **Rotate the Gemini key.** Check aistudio.google.com/app/apikey first, then Cloud Console credentials if not there. It isn't referenced anywhere in your code, so once rotated you can likely delete it outright instead of replacing it.
3. **Put the new key(s) where the old ones lived:** your local `.env.local`, and your Vercel project's Environment Variables (Project Settings → Environment Variables) for production. Redeploy after updating.
4. **Turn on GitHub secret scanning + push protection.** github.com/alexthestick/japanmaps → Settings → Code security. Free for public repos — stops a key from ever being pushed again.
5. **Confirm you've pushed.** Run `git push` if you haven't — your two clean security/cleanup commits are still local-only as of last check.
6. **Flip one Supabase Auth setting.** Supabase Dashboard → Authentication → Policies/Settings → enable "Leaked password protection." Not something I can toggle via SQL.

## 🟡 Ready when you are — just say "go"
- **Move the Google Places calls off the browser bundle** (task already queued: `GoogleMapsStoreExtractor.tsx`, `FetchPlaceIdButton.tsx`, `BulkImportApprovalCard.tsx`, `googleMapsExtractor.ts` → rewire to your existing server routes). This is the fix that stops a future key from being exposed in your JS bundle regardless of git hygiene.
- **Repo root cleanup**: 39 stray markdown files, old CSVs, ~20 stale `vite.config.ts.timestamp-*.mjs` files, Python carousel tools sitting next to `index.html`. Cosmetic, but makes the repo sane for future-you.
- **Optional — purge the old keys from git history entirely** (`git filter-repo`). Not required once rotated (the old keys are dead either way), but removes the appearance of a leak for anyone browsing history later. Requires a force-push; I'll walk you through it if you want it.

## ⚪ Later, no rush
- Finish or abandon the `admin-overhaul-wip` branch (data-quality tools, carousel creator rework) whenever you're ready to test it.
- The bigger product/engineering roadmap from the original audit — `HomePage.tsx` god component, duplicated store-detail components, zero analytics/error tracking, no design-token system, marker rendering at scale. All real, none on fire. Say the word whenever you want to start on one.
