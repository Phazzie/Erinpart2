-- ============================================================================
-- CLERK-COMPATIBLE SUPABASE SCHEMA
-- ============================================================================
-- Migrated from Supabase Auth (UUID) to Clerk Auth (TEXT user IDs)
--
-- Key Changes:
-- 1. User IDs changed from UUID to TEXT to support Clerk IDs (e.g., "user_2xxx...")
-- 2. Removed auth.users foreign key constraint
-- 3. Created custom current_user_id() function to replace auth.uid()
-- 4. Updated all RLS policies to use current_user_id()
--
-- Safe to run multiple times; uses IF NOT EXISTS / ON CONFLICT where possible
-- ============================================================================

-- Ensure UUID generator is available (still needed for other ID columns)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- CUSTOM AUTHENTICATION FUNCTION FOR CLERK
-- ============================================================================
-- This function extracts the Clerk user ID from JWT claims
-- Clerk sets the 'sub' claim to the user ID (e.g., "user_2xxx...")
-- In development/testing, you can manually set the user ID:
--   SET request.jwt.claims = '{"sub": "user_2xxxTestID"}';
-- ============================================================================
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
$$;

COMMENT ON FUNCTION public.current_user_id() IS
'Returns the current Clerk user ID from JWT claims. Replaces auth.uid() for Clerk integration.';

-- ============================================================================
-- USERS TABLE (Profile)
-- ============================================================================
-- Changed: id is now TEXT instead of UUID (no more auth.users reference)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id text PRIMARY KEY, -- Changed from: uuid PRIMARY KEY REFERENCES auth.users
  updated_at timestamptz NOT NULL DEFAULT now(),
  username text UNIQUE NOT NULL,
  avatar_url text
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Public profiles are viewable by everyone
DO $$ BEGIN
  CREATE POLICY "Public profiles are viewable by everyone."
    ON public.users
    FOR SELECT
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Users can insert their own profile
-- Changed: auth.uid() → current_user_id()
DO $$ BEGIN
  CREATE POLICY "Users can insert their own profile."
    ON public.users
    FOR INSERT
    WITH CHECK (current_user_id() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Users can update their own profile
-- Changed: auth.uid() → current_user_id()
DO $$ BEGIN
  CREATE POLICY "Users can update own profile."
    ON public.users
    FOR UPDATE
    USING (current_user_id() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- SESSIONS TABLE
-- ============================================================================
-- Changed: host_id is now TEXT to reference users.id (TEXT)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  host_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE, -- Changed from: uuid
  day_vibe jsonb,
  session_code text UNIQUE NOT NULL
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Hosts can create sessions
-- Changed: auth.uid() → current_user_id()
DO $$ BEGIN
  CREATE POLICY "Hosts can create sessions."
    ON public.sessions
    FOR INSERT
    WITH CHECK (current_user_id() = host_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Hosts can update their sessions
-- Changed: auth.uid() → current_user_id()
DO $$ BEGIN
  CREATE POLICY "Hosts can update their sessions."
    ON public.sessions
    FOR UPDATE
    USING (current_user_id() = host_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Hosts can delete their sessions
-- Changed: auth.uid() → current_user_id()
DO $$ BEGIN
  CREATE POLICY "Hosts can delete their sessions."
    ON public.sessions
    FOR DELETE
    USING (current_user_id() = host_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- TASKS TABLE
-- ============================================================================
-- Changed: created_by is now TEXT to reference users.id (TEXT)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  created_by text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE, -- Changed from: uuid
  text text NOT NULL,
  is_complete boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  choice text,
  day text,
  order_index integer,
  comments text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  is_secret boolean NOT NULL DEFAULT false,
  votes text[] NOT NULL DEFAULT '{}'::text[],
  user_name text -- User display name for anonymous authentication
);

-- Add user_name column if it doesn't exist
DO $$ BEGIN
  ALTER TABLE public.tasks ADD COLUMN user_name text;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_session ON public.tasks(session_id);
CREATE INDEX IF NOT EXISTS idx_tasks_session_day ON public.tasks(session_id, day);
CREATE INDEX IF NOT EXISTS idx_tasks_order ON public.tasks(order_index);

-- Tasks are publicly readable for shared sessions
DO $$ BEGIN
  CREATE POLICY "Tasks are publicly readable for shared sessions."
    ON public.tasks
    FOR SELECT
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Users can create tasks (anonymous users supported)
-- Changed: auth.uid() → current_user_id()
DO $$ BEGIN
  CREATE POLICY "Anonymous users can create tasks."
    ON public.tasks
    FOR INSERT
    WITH CHECK (current_user_id() = created_by);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Users can update their own tasks
-- Changed: auth.uid() → current_user_id()
DO $$ BEGIN
  CREATE POLICY "Anonymous users can update their tasks."
    ON public.tasks
    FOR UPDATE
    USING (current_user_id() = created_by);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Users can delete their own tasks
-- Changed: auth.uid() → current_user_id()
DO $$ BEGIN
  CREATE POLICY "Anonymous users can delete their tasks."
    ON public.tasks
    FOR DELETE
    USING (current_user_id() = created_by);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Sessions are publicly readable (uses animal codes for access control)
-- FIXED: Removed circular dependency that checked tasks table
DO $$ BEGIN
  CREATE POLICY "Sessions are publicly readable."
    ON public.sessions
    FOR SELECT
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- TASK_CHOICES TABLE (Per-user yes/no/maybe)
-- ============================================================================
-- Changed: user_id is now TEXT to reference users.id (TEXT)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.task_choices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE, -- Changed from: uuid
  choice text NOT NULL CHECK (choice IN ('yes','no','maybe')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  user_name text, -- User display name for anonymous authentication
  UNIQUE (task_id, user_id)
);

-- Add user_name column if it doesn't exist
DO $$ BEGIN
  ALTER TABLE public.task_choices ADD COLUMN user_name text;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

ALTER TABLE public.task_choices ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_choices_task ON public.task_choices(task_id);
CREATE INDEX IF NOT EXISTS idx_task_choices_user ON public.task_choices(user_id);

-- Choices are publicly readable for shared sessions
DO $$ BEGIN
  CREATE POLICY "Choices readable publicly for shared sessions"
    ON public.task_choices
    FOR SELECT
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Users can insert their own choices
-- Changed: auth.uid() → current_user_id()
DO $$ BEGIN
  CREATE POLICY "Anonymous users can insert choices"
    ON public.task_choices
    FOR INSERT
    WITH CHECK (current_user_id() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Users can update their own choices
-- Changed: auth.uid() → current_user_id()
DO $$ BEGIN
  CREATE POLICY "Anonymous users can update own choice"
    ON public.task_choices
    FOR UPDATE
    USING (current_user_id() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Users can delete their own choices
-- Changed: auth.uid() → current_user_id()
DO $$ BEGIN
  CREATE POLICY "Anonymous users can delete own choice"
    ON public.task_choices
    FOR DELETE
    USING (current_user_id() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- REALTIME PUBLICATION
-- ============================================================================
-- Add tables to the supabase_realtime publication
-- Ensure UPDATE/DELETE operations send old row data
-- ============================================================================
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.task_choices;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Set REPLICA IDENTITY FULL for realtime to work properly
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER TABLE public.task_choices REPLICA IDENTITY FULL;

-- ============================================================================
-- VERIFICATION QUERIES (Optional - for testing)
-- ============================================================================
-- Verify publication membership:
-- SELECT pubname, schemaname, tablename
-- FROM pg_publication_tables
-- WHERE pubname = 'supabase_realtime'
-- ORDER BY tablename;
--
-- Test current_user_id() function:
-- SET request.jwt.claims = '{"sub": "user_2testClerkID123"}';
-- SELECT current_user_id(); -- Should return: user_2testClerkID123
-- ============================================================================
