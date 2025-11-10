# Fix: Infinite Recursion in RLS Policies

## Issue
Users were experiencing "infinite recursion detected for policy tasks" errors when interacting with the application. This error was caused by circular dependencies in the Row Level Security (RLS) policies.

## Root Cause
The Supabase database schema contained circular dependencies between the `sessions` and `tasks` tables:

1. The `sessions` table had a SELECT policy that queried the `tasks` table:
   ```sql
   CREATE POLICY "Sessions are viewable by participants." ON public.sessions FOR SELECT USING (
     auth.uid() = host_id OR EXISTS (
       SELECT 1 FROM public.tasks t WHERE t.session_id = public.sessions.id AND t.created_by = auth.uid()
     )
   );
   ```

2. The `tasks` table references `sessions` via foreign key: `session_id uuid NOT NULL REFERENCES public.sessions ON DELETE CASCADE`

3. When Postgres tried to evaluate the RLS policies, it created an infinite loop:
   - To check if a user can SELECT from sessions, it needs to query tasks
   - To query tasks, it may need to evaluate the sessions policy again
   - This creates a circular dependency that causes infinite recursion

Additionally, there were **duplicate SELECT policies** on the tasks table, which added unnecessary complexity.

## Solution

### 1. Removed Circular Dependency
Simplified the sessions SELECT policy to not reference the tasks table:
```sql
-- Sessions are publicly readable (uses animal codes for access control)
-- FIXED: Removed circular dependency that checked tasks table
DO $$ BEGIN
  CREATE POLICY "Sessions are publicly readable." ON public.sessions FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
```

### 2. Removed Duplicate Policies
Consolidated the two duplicate SELECT policies on tasks into a single policy:
```sql
DO $$ BEGIN
  CREATE POLICY "Tasks are publicly readable for shared sessions." ON public.tasks FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
```

## Justification
Making sessions and tasks publicly readable is appropriate for this application because:
- The application uses animal-code based session sharing (e.g., "cat-dog")
- Access control is handled at the application level via session codes
- Tasks and sessions are meant to be shared among participants
- Other operations (INSERT, UPDATE, DELETE) still require proper authentication

## Files Modified
- `supabase-schema-TO-APPLY.sql` - Main schema file
- `docs/archive/supabase-schema.sql` - Archived schema (updated for consistency)

## Testing
To verify the fix:
1. Create a new session
2. Add tasks to the session
3. Check that no "infinite recursion" errors occur
4. Verify that tasks and sessions are still properly accessible

## Prevention
To prevent similar issues in the future:
- Avoid creating RLS policies that query other tables with RLS enabled
- If cross-table policies are necessary, ensure they don't create circular dependencies
- Document the dependency graph between policies
- Consider using simpler access control mechanisms when possible
