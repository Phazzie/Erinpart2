# Troubleshooting

> **LAST UPDATED:** October 2025 - Current for production deployment

## Common Issues

### Missing Environment Variables
- **Symptom:** Errors like "Supabase is not configured" or blank screens
- **Fix:** Ensure these environment variables are set:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Where to set:**
  - Local: `.env.local` file
  - Vercel/DO: Environment Variables in project settings

### Animal Code Authentication Not Working
- **Symptom:** Login screen doesn't progress after selecting animals
- **Fixes:**
  - Check browser console for JavaScript errors
  - Verify localStorage is enabled (not in incognito/private mode)
  - Clear browser cache and try again
  - Check network tab for failed Supabase requests

### Realtime Updates Not Syncing
- **Symptom:** Tasks or choices don't update across different browser windows
- **Fixes:**
  - Enable Realtime in Supabase Dashboard:
    - Database → Replication → Realtime
    - Toggle ON for `tasks` and `task_choices` tables
  - Check browser console for WebSocket connection errors
  - Verify user is authenticated (animal code login completed)
  - Check RLS policies allow SELECT access

### Task Creation Fails
- **Symptom:** Error when adding tasks or tasks don't persist
- **Fixes:**
  - Verify `created_by` field is being set (userId required for RLS)
  - Check browser console for RLS policy errors
  - Ensure user is authenticated
  - Verify session exists in database

### Build Failures
- **Symptom:** Build fails on deployment platforms
- **Common causes:**
  - **Google Fonts Network Error:** Fixed in latest version (uses system fonts)
  - Missing `package-lock.json`: Commit it to repository
  - Node version mismatch: Use Node 20 (specified in Dockerfile)
  - Out of memory: Upgrade deployment tier

### Infinite Re-render Loop
- **Symptom:** Browser freezes, React errors about too many renders
- **Status:** Fixed in PR #17 with `useRef` pattern in `useRealtime` hook
- **If still occurring:** Update to latest version from main branch

### RLS Permission Denied Errors
- **Symptom:** 401/permission denied on insert/update operations
- **Fixes:**
  - Confirm user is authenticated (check `auth.uid()` in browser console)
  - Verify `task_choices` and `tasks` RLS policies allow INSERT/UPDATE for authenticated users
  - Check that `created_by` field matches `auth.uid()`
  - Review Supabase logs for specific RLS policy failures

### Local Development Issues

#### Port Already in Use
- **Symptom:** `Error: listen EADDRINUSE: address already in use :::3000`
- **Fix:** 
  ```bash
  # Find and kill process on port 3000
  lsof -ti:3000 | xargs kill -9
  # Or use a different port
  PORT=3001 npm run dev
  ```

#### Docker Build Issues
- **Symptom:** Docker build fails or container won't start
- **Fixes:**
  - Ensure Docker is running: `docker info`
  - Clear Docker cache: `docker system prune -a`
  - Check Dockerfile syntax
  - Verify environment variables are passed to container

### Test Failures

#### Jest/DOM Warnings
- **Symptom:** `act()` warnings or "not wrapped" errors in tests
- **Fix:** 
  - Ensure `jest.setup.ts` loads `@testing-library/jest-dom`
  - Use `await` with `userEvent` interactions
  - Wrap state updates in `act()` if needed

#### Supabase Mock Issues
- **Symptom:** Tests fail with Supabase client errors
- **Fix:** Mock the Supabase module in test files:
  ```typescript
  jest.mock('@/lib/supabase/client', () => ({
    supabase: { /* mock methods */ },
    isSupabaseConfigured: true
  }))
  ```

## Getting Help

If you're still experiencing issues:

1. **Check Recent Changes:** Review `CHANGELOG.md` for recent fixes
2. **Check Build Logs:** Deployment platform logs often show the exact error
3. **Supabase Dashboard:** Check logs and realtime status
4. **Browser DevTools:** Console and Network tabs are your friends
5. **GitHub Issues:** Search for similar issues or create a new one

## Known Issues

### Fixed Issues (Update to Latest)
- ✅ Google Fonts build blocker (fixed in PR #17)
- ✅ Infinite re-render in useRealtime (fixed in PR #17)
- ✅ RLS policy violations on task creation (fixed in PR #17)

### Current Limitations
- Test suite: 89% pass rate (6 tests have infrastructure issues, not app bugs)
- Animal codes are stored in localStorage (cleared on browser cache clear)
