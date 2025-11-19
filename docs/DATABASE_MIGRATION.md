# Database Migration Guide: Supabase Auth → Clerk Auth

## Overview

This guide documents the migration from Supabase's UUID-based authentication to Clerk's TEXT-based authentication system. This is a **clean migration** with no existing production data to preserve.

## What Changed

### 1. Authentication System

**Before (Supabase):**
- User IDs: UUID format (e.g., `123e4567-e89b-12d3-a456-426614174000`)
- Auth function: `auth.uid()` returns UUID
- User table: `auth.users` (managed by Supabase)

**After (Clerk):**
- User IDs: TEXT format (e.g., `user_2xxxClerkID123`)
- Auth function: `current_user_id()` returns TEXT
- User table: `public.users` (managed by application)

### 2. Schema Changes Summary

#### Custom Function Added
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

This function replaces `auth.uid()` throughout the application.

#### Column Type Changes

| Table | Column | Before | After |
|-------|--------|--------|-------|
| `users` | `id` | `uuid PRIMARY KEY REFERENCES auth.users` | `text PRIMARY KEY` |
| `sessions` | `host_id` | `uuid REFERENCES public.users` | `text REFERENCES public.users` |
| `tasks` | `created_by` | `uuid REFERENCES public.users` | `text REFERENCES public.users` |
| `task_choices` | `user_id` | `uuid REFERENCES public.users` | `text REFERENCES public.users` |

#### RLS Policies Updated

**Total: 12 policies updated**

All policies that previously used `auth.uid()` now use `current_user_id()`:

**Users Table (3 policies):**
1. "Users can insert their own profile."
2. "Users can update own profile."

**Sessions Table (3 policies):**
3. "Hosts can create sessions."
4. "Hosts can update their sessions."
5. "Hosts can delete their sessions."

**Tasks Table (3 policies):**
6. "Anonymous users can create tasks."
7. "Anonymous users can update their tasks."
8. "Anonymous users can delete their tasks."

**Task Choices Table (3 policies):**
9. "Anonymous users can insert choices"
10. "Anonymous users can update own choice"
11. "Anonymous users can delete own choice"

### 3. What Was Preserved

✅ All table structures maintained
✅ All indexes preserved
✅ All constraints maintained (except `auth.users` FK)
✅ `REPLICA IDENTITY FULL` maintained for realtime
✅ All functionality intact
✅ Realtime subscriptions work the same way

## Migration Steps

### Prerequisites

1. **Backup existing database** (if any data exists):
   ```bash
   pg_dump -U postgres -h your-host -d your-database > backup.sql
   ```

2. **Verify no production users exist**:
   ```sql
   SELECT COUNT(*) FROM public.users;
   ```

### Step 1: Drop Existing Schema (Clean Start)

Since there are **no production users**, we can safely drop and recreate:

```sql
-- Drop all tables (cascades to policies and constraints)
DROP TABLE IF EXISTS public.task_choices CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
```

### Step 2: Apply New Schema

Run the new Clerk-compatible schema:

```bash
psql -U postgres -h your-host -d your-database -f supabase-schema-clerk.sql
```

Or via Supabase Dashboard:
1. Go to SQL Editor
2. Copy contents of `supabase-schema-clerk.sql`
3. Run the query
4. Verify no errors

### Step 3: Verify Migration

#### A. Check Tables Created
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

Expected tables:
- `users`
- `sessions`
- `tasks`
- `task_choices`

#### B. Verify Column Types
```sql
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND column_name IN ('id', 'host_id', 'created_by', 'user_id')
ORDER BY table_name, column_name;
```

Expected output:
```
table_name    | column_name | data_type
--------------+-------------+-----------
sessions      | host_id     | text
sessions      | id          | uuid
task_choices  | id          | uuid
task_choices  | user_id     | text
tasks         | created_by  | text
tasks         | id          | uuid
users         | id          | text
```

#### C. Verify Function Exists
```sql
SELECT
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'current_user_id';
```

Should return one row with `routine_type = 'FUNCTION'` and `data_type = 'text'`.

#### D. Verify RLS Policies
```sql
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

Verify all policies exist and use `current_user_id()` instead of `auth.uid()`.

#### E. Test the Function
```sql
-- Set a test Clerk user ID
SET request.jwt.claims = '{"sub": "user_2testClerkID123"}';

-- Verify it works
SELECT current_user_id();
-- Expected output: user_2testClerkID123
```

### Step 4: Update Application Code

#### Update Clerk Middleware

Ensure your Clerk JWT configuration includes the `sub` claim:

```typescript
// middleware.ts or auth config
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Ensure JWT includes user ID in 'sub' claim
  publicRoutes: ["/api/webhooks/clerk"],
});
```

#### Update Supabase Client

Configure Supabase client to use Clerk JWT:

```typescript
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/nextjs';

export function useSupabaseClient() {
  const { getToken } = useAuth();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: async () => {
          const token = await getToken({ template: 'supabase' });
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      },
    }
  );

  return supabase;
}
```

#### Create Clerk JWT Template

In Clerk Dashboard:
1. Go to JWT Templates
2. Create new template named "supabase"
3. Add claim: `"sub": "{{user.id}}"`
4. Ensure signing key matches Supabase JWT secret

## Testing RLS Policies

### Test User Profile Access

```sql
-- Set up test user
SET request.jwt.claims = '{"sub": "user_2testUser1"}';

-- Insert profile (should succeed)
INSERT INTO public.users (id, username, avatar_url)
VALUES ('user_2testUser1', 'testuser', 'https://example.com/avatar.jpg');

-- Update own profile (should succeed)
UPDATE public.users
SET username = 'updateduser'
WHERE id = 'user_2testUser1';

-- Try to update different user (should fail)
SET request.jwt.claims = '{"sub": "user_2differentUser"}';
UPDATE public.users
SET username = 'hacker'
WHERE id = 'user_2testUser1';
-- Expected: 0 rows affected (blocked by RLS)
```

### Test Session Access

```sql
-- Create test users
SET request.jwt.claims = '{"sub": "user_2host"}';
INSERT INTO public.users (id, username) VALUES ('user_2host', 'hostuser');

SET request.jwt.claims = '{"sub": "user_2guest"}';
INSERT INTO public.users (id, username) VALUES ('user_2guest', 'guestuser');

-- Host creates session
SET request.jwt.claims = '{"sub": "user_2host"}';
INSERT INTO public.sessions (host_id, session_code, day_vibe)
VALUES ('user_2host', 'cat-dog-bird', '{"mood": "excited"}');

-- Guest tries to update host's session (should fail)
SET request.jwt.claims = '{"sub": "user_2guest"}';
UPDATE public.sessions
SET day_vibe = '{"mood": "hacked"}'
WHERE session_code = 'cat-dog-bird';
-- Expected: 0 rows affected (blocked by RLS)
```

### Test Task Permissions

```sql
-- User creates task
SET request.jwt.claims = '{"sub": "user_2taskCreator"}';
INSERT INTO public.users (id, username) VALUES ('user_2taskCreator', 'tasker');

-- Assume session exists with ID
INSERT INTO public.tasks (session_id, created_by, text)
VALUES ((SELECT id FROM public.sessions LIMIT 1), 'user_2taskCreator', 'Test task');

-- Different user tries to update (should fail)
SET request.jwt.claims = '{"sub": "user_2differentUser"}';
UPDATE public.tasks
SET text = 'Hacked task'
WHERE created_by = 'user_2taskCreator';
-- Expected: 0 rows affected (blocked by RLS)
```

## Rollback Procedure

If you need to rollback to Supabase auth:

### Step 1: Backup Current Data (if any)
```sql
-- Export users
COPY (SELECT * FROM public.users) TO '/tmp/users_backup.csv' CSV HEADER;

-- Export sessions
COPY (SELECT * FROM public.sessions) TO '/tmp/sessions_backup.csv' CSV HEADER;

-- Export tasks
COPY (SELECT * FROM public.tasks) TO '/tmp/tasks_backup.csv' CSV HEADER;

-- Export choices
COPY (SELECT * FROM public.task_choices) TO '/tmp/choices_backup.csv' CSV HEADER;
```

### Step 2: Drop Clerk Schema
```sql
DROP TABLE IF EXISTS public.task_choices CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP FUNCTION IF EXISTS public.current_user_id();
```

### Step 3: Restore Original Schema
```bash
psql -U postgres -h your-host -d your-database -f supabase-schema-TO-APPLY.sql
```

### Step 4: Restore Data (if needed)

**Note:** You'll need to convert TEXT user IDs back to UUIDs, which is complex. Better to avoid rollback if possible.

## How current_user_id() Works

### In Production

When a Clerk-authenticated request comes in with a valid JWT:

1. **Clerk generates JWT** containing claims like:
   ```json
   {
     "sub": "user_2xxxClerkID123",
     "email": "user@example.com",
     ...
   }
   ```

2. **Supabase validates JWT** using the shared secret (configured in Clerk JWT template)

3. **Supabase sets request context**:
   ```sql
   request.jwt.claims = '{"sub": "user_2xxxClerkID123", ...}'
   ```

4. **current_user_id() extracts user ID**:
   ```sql
   SELECT current_setting('request.jwt.claims', true)::json->>'sub'
   -- Returns: "user_2xxxClerkID123"
   ```

5. **RLS policies use the function**:
   ```sql
   -- Example policy check
   USING (current_user_id() = created_by)
   -- Evaluates to: USING ('user_2xxxClerkID123' = created_by)
   ```

### In Development/Testing

You can manually set the JWT claims:

```sql
-- Set test user
SET request.jwt.claims = '{"sub": "user_2testID"}';

-- Now all operations act as this user
SELECT current_user_id(); -- Returns: user_2testID

INSERT INTO public.users (id, username) VALUES ('user_2testID', 'testuser');
-- Will succeed because current_user_id() matches id
```

### Security Notes

- **SECURITY DEFINER**: Function runs with creator privileges (bypasses RLS on function itself)
- **STABLE**: Function result won't change during query (optimization)
- **Returns NULL**: If no JWT or invalid format, returns NULL (blocks most operations)

## Common Issues & Solutions

### Issue: "current_user_id() returns NULL"

**Cause:** JWT not set or missing 'sub' claim

**Solution:**
```typescript
// Ensure Clerk JWT template includes 'sub'
// In Clerk Dashboard → JWT Templates → Edit
{
  "sub": "{{user.id}}"
}
```

### Issue: "permission denied for table"

**Cause:** RLS policies blocking access

**Solution:**
```sql
-- Check current user
SELECT current_user_id();

-- Verify policies allow operation
SELECT * FROM pg_policies WHERE tablename = 'your_table';
```

### Issue: "function current_user_id() does not exist"

**Cause:** Function not created

**Solution:**
```sql
-- Recreate function
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
$$;
```

### Issue: "cannot cast type uuid to text"

**Cause:** Old schema still using UUID columns

**Solution:**
```sql
-- Check column types
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'id';

-- If still UUID, drop and recreate tables
-- (see Step 1 of migration)
```

## Verification Checklist

Before deploying to production:

- [ ] All tables created successfully
- [ ] User ID columns are TEXT type
- [ ] Foreign keys reference correct tables
- [ ] `current_user_id()` function exists and works
- [ ] All 12 RLS policies updated and active
- [ ] Realtime publication includes all tables
- [ ] REPLICA IDENTITY FULL set on realtime tables
- [ ] Test user can create profile
- [ ] Test user can create session
- [ ] Test user can create task
- [ ] Test user CANNOT modify other users' data
- [ ] Clerk JWT template includes 'sub' claim
- [ ] Supabase JWT secret matches Clerk signing key
- [ ] Application code uses Clerk tokens with Supabase

## Performance Considerations

### Index Coverage

The migration preserves all existing indexes:
- `idx_tasks_session` on `tasks(session_id)`
- `idx_tasks_session_day` on `tasks(session_id, day)`
- `idx_tasks_order` on `tasks(order_index)`
- `idx_task_choices_task` on `task_choices(task_id)`
- `idx_task_choices_user` on `task_choices(user_id)`

### TEXT vs UUID Performance

**UUIDs (old):**
- 16 bytes storage
- Slightly faster comparisons (binary)
- Built-in indexing optimization

**TEXT (new - Clerk IDs):**
- ~20-25 bytes storage (Clerk IDs like "user_2xxx...")
- Slightly slower comparisons (string)
- Still very fast with proper indexes

**Impact:** Negligible for applications with < 1M users. TEXT comparison is microseconds slower per row.

### Function Performance

`current_user_id()` is marked `STABLE`, meaning:
- Called once per statement, result cached
- Won't cause performance issues in RLS policies
- No per-row overhead

## Next Steps

After successful migration:

1. **Update documentation** - Ensure team knows about new auth system
2. **Monitor logs** - Watch for RLS policy violations or auth errors
3. **Test edge cases** - Verify all user flows work correctly
4. **Update CI/CD** - Ensure tests use correct JWT format
5. **Remove old code** - Clean up any Supabase auth-specific code

## Support

If you encounter issues:

1. **Check Clerk Dashboard** - Verify JWT templates configured
2. **Check Supabase Logs** - Look for RLS policy violations
3. **Test SQL directly** - Use verification queries above
4. **Review this guide** - Common issues section covers most problems

## Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Docs](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [JWT Debugging Tool](https://jwt.io)

---

**Migration Created:** 2024-11-14
**Schema Version:** Clerk v1.0
**Last Updated:** 2024-11-14
