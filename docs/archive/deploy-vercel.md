# Deploying Erin’s Escapades to Vercel

## Prereqs
- Vercel account with GitHub connected
- Supabase project with URL and anon key

## 1) Apply DB schema in Supabase
- Open SQL Editor
- Paste `docs/supabase-schema.md` SQL blocks for:
  - users, sessions, tasks, task_choices (tables + RLS)
- Enable Realtime for `tasks` and `task_choices`:
  - Database > Replication > Realtime > toggle tables on
- (Optional) Seed: run `docs/db-seed.sql`

## 2) Configure environment variables
On Vercel Project Settings > Environment Variables:
- NEXT_PUBLIC_SUPABASE_URL = your Supabase URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY = your Supabase anon key
- (Optional) SUPABASE_SERVICE_ROLE = service role key (server only)
- NEXT_PUBLIC_SITE_URL = https://<your-vercel-domain>

## 3) OAuth redirects (Google optional)
- In Supabase > Authentication > URL Configuration:
  - Site URL: https://<your-vercel-domain>
  - Redirect URLs: https://<your-vercel-domain>/auth/callback (add preview domain too)
- In Google Cloud OAuth: set authorized redirect URIs to the above

## 4) Connect and deploy on Vercel
- Import the GitHub repo in Vercel
- Framework: Next.js; build command defaults
- Ensure Node 22 (matches dev container) in Vercel Project Settings
- Trigger first deploy (Preview), then Promote to Production

## 5) Smoke test (quick manual check)
- Open two browsers (or profiles) and visit the site
- Sign in (email/password or Google)
- Create a session and add 2-3 tasks
- From second browser, view same session; select yes/no/maybe on tasks
- Verify realtime updates across both; test secret task vote/reveal
- Copy share link; open in incognito; verify parsing and behavior

## Notes
- RLS requires correct auth state; ensure you test while authenticated
- If realtime isn’t working, re-check table toggles and console for channel logs
