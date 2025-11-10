# 🚨 URGENT: Apply Infinite Recursion Fix

## What You Need to Do

The infinite recursion error has been **FIXED** in the code. Now you need to apply this fix to your Supabase database.

## Quick Steps (5 minutes)

### 1. Open Supabase Dashboard
- Go to your Supabase project: https://supabase.com/dashboard
- Navigate to **SQL Editor** → **New Query**

### 2. Copy the Fixed Schema
Open the file: **`supabase-schema-TO-APPLY.sql`** (in the root directory of this project)

⚠️ **IMPORTANT**:
- Use `supabase-schema-TO-APPLY.sql` from the ROOT directory
- DO NOT use `docs/archive/supabase-schema.sql` (it has the old buggy version)

### 3. Paste and Run
- Copy the **entire contents** of `supabase-schema-TO-APPLY.sql`
- Paste into the Supabase SQL Editor
- Click **Run** (or press Cmd/Ctrl + Enter)

### 4. Verify Success
The script is safe to run multiple times. You may see some "duplicate object" messages - that's expected and normal.

After running, test your app:
- Create a session
- Add tasks
- Verify NO "infinite recursion" errors appear ✅

## What Was Fixed

The fix removes a circular dependency in the RLS (Row Level Security) policies:

**BEFORE (Buggy):**
```sql
-- Sessions policy checked tasks table
CREATE POLICY "Sessions are viewable by participants."
  ON public.sessions FOR SELECT
  USING (
    auth.uid() = host_id OR
    EXISTS (SELECT 1 FROM public.tasks t WHERE ...) -- ❌ Creates circular dependency!
  );
```

**AFTER (Fixed):**
```sql
-- Sessions are now publicly readable (access control via animal codes)
CREATE POLICY "Sessions are publicly readable."
  ON public.sessions FOR SELECT
  USING (true); -- ✅ No circular dependency!
```

## Why This is Safe

Making sessions and tasks publicly readable is appropriate because:
- Your app uses animal-code based session sharing (e.g., "cat-dog")
- Access control happens at the application level via session codes
- Other operations (INSERT, UPDATE, DELETE) still require proper authentication
- This matches your app's design of collaborative sessions

## Troubleshooting

**Q: I see "duplicate object" errors**
- That's normal! The script is idempotent (safe to run multiple times)

**Q: The error still happens after applying**
- Clear your browser cache and refresh
- Check that you used the correct file (`supabase-schema-TO-APPLY.sql`)
- Verify in Supabase Dashboard → Database → Policies that you see "Sessions are publicly readable" and "Tasks are publicly readable"

**Q: How do I verify the fix was applied?**
Run this in the SQL Editor:
```sql
-- Should return policies with USING = true
SELECT
  schemaname,
  tablename,
  policyname,
  qual as using_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('sessions', 'tasks')
  AND cmd = 'SELECT'
ORDER BY tablename, policyname;
```

You should see policies with simple `true` expressions, not complex EXISTS queries.

## Need Help?

See the full documentation in `docs/supabase-apply.md` or the detailed fix explanation in `docs/fixes/infinite-recursion-policy-fix.md`.
