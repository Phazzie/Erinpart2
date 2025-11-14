# Clerk Migration Summary

## Overview

This document summarizes the migration from Supabase Auth to Clerk authentication for Erin's Escapades, completed on November 14, 2025.

## What Changed

### 1. Authentication System

**Before:**
- Supabase Auth with anonymous sessions
- UUID-based user IDs
- `auth.uid()` for RLS policies

**After:**
- Clerk for user authentication
- TEXT-based user IDs (e.g., `user_2xxxClerkID123`)
- `current_user_id()` custom function for RLS policies
- Guest sessions using `guest-{sessionId}` pattern

### 2. Database Schema

#### New Function Added
```sql
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
$$;
```

#### Column Type Changes

| Table | Column | Before | After |
|-------|--------|--------|-------|
| `users` | `id` | `uuid` | `text` |
| `sessions` | `host_id` | `uuid` | `text` |
| `tasks` | `created_by` | `uuid` | `text` |
| `task_choices` | `user_id` | `uuid` | `text` |

#### RLS Policies Updated

All 12 RLS policies updated to use `current_user_id()` instead of `auth.uid()`:

- Users table: 3 policies
- Sessions table: 3 policies
- Tasks table: 3 policies
- Task_choices table: 3 policies

### 3. Application Code

#### New Files Created

- `/lib/clerk/auth.ts` - Server-side authentication utilities
- `/lib/clerk/client.ts` - Client-side authentication hooks
- `/middleware.ts` - Clerk middleware configuration

#### Modified Files

- `/hooks/use-session.ts` - Updated to integrate Clerk user with animal code sessions
- All components using authentication now use Clerk hooks

### 4. Animal Code Sessions

Animal code sessions (e.g., "cat-dog-bird") remain unchanged and work alongside Clerk:

- **Guest users**: Can join sessions without authentication using `guest-{sessionId}` IDs
- **Authenticated users**: Use their Clerk ID with animal code sessions
- **localStorage pattern**: Remains the same for session management

## Breaking Changes

### For Users

**None** - The user experience remains the same:
- Animal code sessions work exactly as before
- Guest access still supported
- Users can optionally sign in for cross-device persistence

### For Developers

1. **User ID Format Changed**
   - Old: `123e4567-e89b-12d3-a456-426614174000` (UUID)
   - New: `user_2xxxClerkID123` (TEXT) or `guest-cat-dog-bird` (guest)

2. **Authentication Hooks Changed**
   - Old: Supabase `useSession()`, `getSession()`
   - New: Clerk `useUser()`, `useAuth()`

3. **Server-Side Auth Changed**
   - Old: `supabase.auth.getUser()`
   - New: `auth()` from `@clerk/nextjs/server`

4. **Database Function Changed**
   - Old: `auth.uid()` in RLS policies
   - New: `current_user_id()` in RLS policies

## How to Test Locally

### 1. Environment Setup

Create `.env.local` with required variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_SECRET_HERE

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Database Migration

Apply the new schema to your Supabase project:

```bash
# Via Supabase Dashboard SQL Editor
# Copy and run contents of: supabase-schema-clerk.sql
```

Or see detailed instructions in `/docs/DATABASE_MIGRATION.md`

### 3. Start Development Server

```bash
npm install
npm run dev
```

### 4. Test Authentication Flows

#### Test 1: Guest User Flow
1. Visit `http://localhost:3000`
2. Enter two animals and your name
3. Click "Join Session"
4. Verify you can:
   - Create tasks
   - Vote on tasks
   - See real-time updates
5. Check localStorage for `sessionData`
6. Verify user ID format: `guest-{sessionId}`

#### Test 2: Authenticated User Flow
1. Sign in using Clerk (email or OAuth)
2. Join or create a session with animal codes
3. Verify you can:
   - Create tasks (attributed to Clerk ID)
   - Vote on tasks
   - See real-time updates
4. Verify user ID format: `user_2xxxClerkID123`

#### Test 3: Guest to Authenticated Upgrade
1. Start as guest user in a session
2. Click "Sign In" and authenticate
3. Verify:
   - You remain in the same session
   - New actions use your Clerk ID
   - Session data persists

#### Test 4: Cross-Device Persistence
1. Sign in with Clerk on Device A
2. Join session and create tasks
3. Sign in with same Clerk account on Device B
4. Verify:
   - Tasks created on Device A appear
   - User attribution is consistent

#### Test 5: RLS Policy Testing
1. Sign in as User A
2. Create a session and tasks
3. Sign in as User B (different account)
4. Verify:
   - User B cannot modify User A's tasks
   - User B can view shared session
   - User B can create their own tasks

## Deployment Checklist

### Pre-Deployment

- [ ] **Backup Database**: Export all data from production Supabase
- [ ] **Clerk Account**: Create production Clerk application
- [ ] **Environment Variables**: Set in production environment (Vercel/etc)
- [ ] **Database Migration**: Apply new schema to production Supabase
- [ ] **JWT Template**: Configure Clerk JWT template for Supabase
- [ ] **Domain Configuration**: Add production domain to Clerk
- [ ] **Test on Staging**: Deploy to staging environment first

### Environment Variables Required

Production environment must have:

```env
# Clerk (Production Keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# Optional
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Apply Database Migration

In production Supabase:

1. Go to SQL Editor
2. Run the migration script from `/docs/DATABASE_MIGRATION.md`
3. Verify all tables created with correct column types
4. Verify `current_user_id()` function exists
5. Verify all RLS policies active

### Configure Clerk JWT

In Clerk Dashboard → JWT Templates:

1. Create template named "supabase"
2. Add claims:
   ```json
   {
     "sub": "{{user.id}}"
   }
   ```
3. Set signing key to match Supabase JWT secret
4. Save template

### Verify RLS Policies

```sql
-- Check all policies exist
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;

-- Should return 12 policies using current_user_id()
```

### Test Authentication Flow

- [ ] Test guest user can join session
- [ ] Test authenticated user can sign in
- [ ] Test user can create tasks
- [ ] Test real-time updates work
- [ ] Test RLS policies block unauthorized access
- [ ] Test cross-device session persistence

### Post-Deployment

- [ ] Monitor error logs for auth issues
- [ ] Verify Clerk webhook delivery (if configured)
- [ ] Check database connection pooling
- [ ] Monitor API rate limits (Clerk + Supabase)
- [ ] Test from multiple devices/browsers

### Rollback Plan

If critical issues occur:

1. Revert to previous deployment
2. Restore database from backup
3. Re-enable Supabase Auth (if possible)
4. Investigate issues in staging environment

## Environment Variables Needed

### Required Variables

| Variable | Type | Description |
|----------|------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Public | Clerk publishable key (pk_test_* or pk_live_*) |
| `CLERK_SECRET_KEY` | Secret | Clerk secret key (sk_test_* or sk_live_*) |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anonymous key |

### Optional Variables

| Variable | Type | Description |
|----------|------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Supabase admin key (bypass RLS) |
| `NEXT_PUBLIC_SITE_URL` | Public | Base URL for share links |

### Getting Your Keys

**Clerk Keys:**
1. Visit [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Select your application
3. Go to **API Keys**
4. Copy publishable and secret keys

**Supabase Keys:**
1. Visit your Supabase project
2. Go to **Settings > API**
3. Copy URL and keys

### Security Notes

- Never commit `.env.local` to git
- Use test keys (`pk_test_*`, `sk_test_*`) in development
- Use production keys (`pk_live_*`, `sk_live_*`) in production
- Rotate keys if exposed
- Store secrets in secure environment variable management

## Known Issues

### 1. Guest Data Not Migrated on Sign-In

**Issue:** When a guest user signs in with Clerk, their past actions remain attributed to the guest ID.

**Impact:** Low - Most users won't notice

**Workaround:** None currently

**Future Fix:** Implement data migration logic to transfer guest actions to Clerk ID upon sign-in

**Code Location:** `/hooks/use-session.ts` (see migration function in `ANIMAL_CODE_SESSIONS.md`)

### 2. Console.log Statements Present

**Issue:** Development console.log statements exist in hooks

**Impact:** None - All wrapped in `process.env.NODE_ENV === 'development'` checks

**Status:** Resolved - Only logs in development mode

**Affected Files:**
- `/hooks/use-tasks.ts`
- `/hooks/use-session.ts`
- `/hooks/use-realtime.ts`

### 3. Cross-Tab Session Sync Delay

**Issue:** When joining a session in one tab, other tabs may take 1-2 seconds to sync

**Impact:** Low - localStorage storage event propagation

**Workaround:** Refresh the page if session doesn't appear immediately

**Status:** Expected behavior - no fix needed

### 4. URL Session Sharing Without Auth

**Issue:** Users can access shared sessions via URL without signing in (read-only by default)

**Impact:** None - This is intentional design

**Status:** Working as designed

**Notes:** Users must enter name and join to gain write access

## Migration Checklist

- [x] Database schema updated with TEXT user IDs
- [x] `current_user_id()` function created
- [x] All RLS policies updated
- [x] Clerk authentication integrated
- [x] Server-side auth utilities created
- [x] Client-side auth hooks created
- [x] Middleware configured
- [x] `useSession` hook updated
- [x] Animal code sessions preserved
- [x] Guest user support maintained
- [x] Documentation created
- [x] Code cleanup performed
- [ ] Staging deployment tested
- [ ] Production deployment ready

## Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [CLERK_SETUP.md](/docs/CLERK_SETUP.md) - Detailed setup instructions
- [ANIMAL_CODE_SESSIONS.md](/docs/ANIMAL_CODE_SESSIONS.md) - Session system explanation
- [DATABASE_MIGRATION.md](/docs/DATABASE_MIGRATION.md) - Database migration guide

## Support

For issues or questions:

1. Check this document first
2. Review documentation in `/docs` folder
3. Check Clerk Dashboard for auth errors
4. Review Supabase logs for database errors
5. Test SQL queries directly in Supabase SQL Editor

## Summary

The Clerk migration successfully:

- ✅ Replaced Supabase Auth with Clerk
- ✅ Maintained animal code session functionality
- ✅ Preserved guest user support
- ✅ Updated database schema cleanly
- ✅ Ensured no breaking changes for users
- ✅ Provided clear documentation
- ✅ Maintained application stability

**Status:** Ready for deployment after staging verification

**Migration Date:** November 14, 2025

**Last Updated:** November 14, 2025
