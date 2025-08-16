# Troubleshooting

## Missing env keys
- Symptom: Errors like "Supabase is not configured"
- Fix: Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY on Vercel

## OAuth redirect mismatch
- Symptom: Google sign-in loops or error page
- Fix: Ensure Supabase Auth URL config and Google Cloud OAuth redirect URIs include /auth/callback and correct domain(s)

## Realtime not updating
- Symptom: Choices or tasks not syncing across clients
- Fixes:
  - Enable Realtime for `tasks` and `task_choices` in Supabase
  - Check browser console for channel logs/errors
  - Verify auth; RLS may block rows for unauthenticated users

## Jest DOM issues
- Symptom: act()/not wrapped warnings
- Fix: Ensure `jest.setup.ts` loads @testing-library/jest-dom and use `await` with userEvent

## RLS denies writes
- Symptom: 401/permission denied on insert/update
- Fix: Confirm you are authenticated; verify `task_choices` policies allow INSERT/UPDATE for `auth.uid()`
