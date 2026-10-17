# Legacy Supabase API keys — migration inventory

Checked against the deployed Edge Function source and `main` Vercel API routes on 17 October 2026. This is an inventory, not an authorization change or deployment plan.

[Supabase's migration guide](https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys) says the legacy `anon` and `service_role` keys remain supported only until the **end of 2026**. This project's legacy keys have already been disabled, so these reads should be migrated and tested without waiting for that deadline.

## Edge Functions

| Function | Legacy environment variables read |
| --- | --- |
| `gps-checkin` | `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| `rate-limit-suggestions` | `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| `cache-kurb-inventory` | `SUPABASE_SERVICE_ROLE_KEY` |
| `discover-store` | `SUPABASE_SERVICE_ROLE_KEY` |

For each function, review its caller authentication before changing keys. Use the appropriate named entry from Supabase's built-in `SUPABASE_PUBLISHABLE_KEYS` or `SUPABASE_SECRET_KEYS` JSON dictionary, and keep privileged keys server-side. New publishable and secret keys are not JWTs; do not pass them as `Authorization: Bearer` or assume gateway `verify_jwt` authenticates them. Preserve or add an explicit in-function authorization check where needed.

## Vercel API routes

These routes read `SUPABASE_SERVICE_ROLE_KEY`:

- `api/imagekit-auth.js`
- `api/imagekit-upload.js`
- `api/imagekit-delete.js`

The Vercel environment variable `SUPABASE_SERVICE_ROLE_KEY` must be swapped to a new **secret** key, with the route code and the Production, Preview, and Development environments updated together. Prefer a new variable name such as `SUPABASE_SECRET_KEY` so it no longer implies a legacy service-role JWT. Never put this key in a `VITE_` variable or browser code. Verify the ImageKit auth, upload, and delete authorization paths after the migration using approved test data.

No functions, API routes, or Vercel environment variables are changed by this document.
