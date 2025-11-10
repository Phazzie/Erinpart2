
> erins-escapades@0.1.0 db:print
> cat docs/supabase-schema.sql

-- Safe to run multiple times; uses IF NOT EXISTS / ON CONFLICT where possible

-- Ensure UUID generator is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- USERS (profile)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  updated_at timestamptz NOT NULL DEFAULT now(),
  username text UNIQUE NOT NULL,
  avatar_url text
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public profiles are viewable by everyone." ON public.users FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own profile." ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own profile." ON public.users FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- SESSIONS
CREATE TABLE IF NOT EXISTS public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  host_id uuid NOT NULL REFERENCES public.users ON DELETE CASCADE,
  day_vibe jsonb,
  session_code text UNIQUE NOT NULL
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Hosts can create sessions." ON public.sessions FOR INSERT WITH CHECK (auth.uid() = host_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Hosts can update their sessions." ON public.sessions FOR UPDATE USING (auth.uid() = host_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Hosts can delete their sessions." ON public.sessions FOR DELETE USING (auth.uid() = host_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- TASKS
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.sessions ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES public.users ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_tasks_session ON public.tasks(session_id);
CREATE INDEX IF NOT EXISTS idx_tasks_session_day ON public.tasks(session_id, day);
CREATE INDEX IF NOT EXISTS idx_tasks_order ON public.tasks(order_index);

DO $$ BEGIN
  CREATE POLICY "Tasks are publicly readable for shared sessions." ON public.tasks FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Anonymous users can create tasks." ON public.tasks FOR INSERT WITH CHECK (
    auth.uid() = created_by
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Anonymous users can update their tasks." ON public.tasks FOR UPDATE USING (auth.uid() = created_by);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Anonymous users can delete their tasks." ON public.tasks FOR DELETE USING (auth.uid() = created_by);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Sessions are publicly readable (uses animal codes for access control)
-- FIXED: Removed circular dependency that checked tasks table
DO $$ BEGIN
  CREATE POLICY "Sessions are publicly readable." ON public.sessions FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- TASK_CHOICES (per-user yes/no/maybe)
CREATE TABLE IF NOT EXISTS public.task_choices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_task_choices_task ON public.task_choices(task_id);
CREATE INDEX IF NOT EXISTS idx_task_choices_user ON public.task_choices(user_id);

DO $$ BEGIN
  CREATE POLICY "Choices readable publicly for shared sessions" ON public.task_choices FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Anonymous users can insert choices" ON public.task_choices FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Anonymous users can update own choice" ON public.task_choices FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Anonymous users can delete own choice" ON public.task_choices FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- REALTIME PUBLICATION (recommended)
-- Add tables to the supabase_realtime publication and ensure UPDATE/DELETE send old row data
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.task_choices;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER TABLE public.task_choices REPLICA IDENTITY FULL;

-- Verify publication membership (optional to run manually)
-- SELECT pubname, schemaname, tablename
-- FROM pg_publication_tables
-- WHERE pubname = 'supabase_realtime'
-- ORDER BY tablename;
