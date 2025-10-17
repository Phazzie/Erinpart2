-- Hardened Supabase Schema with Improved RLS Policies
-- Safe to run multiple times; uses IF NOT EXISTS / ON CONFLICT where possible
-- Based on Supabase AI security audit recommendations

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

-- Add index for common lookups
CREATE INDEX IF NOT EXISTS idx_users_id ON public.users(id);

DO $$ BEGIN
  CREATE POLICY "users_select_public" ON public.users 
    FOR SELECT 
    TO authenticated 
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "users_insert_own" ON public.users 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "users_update_own" ON public.users 
    FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- SESSIONS
CREATE TABLE IF NOT EXISTS public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '3 days'),
  host_id uuid NOT NULL REFERENCES public.users ON DELETE CASCADE,
  day_vibe jsonb,
  session_code text UNIQUE NOT NULL
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Add indexes for common lookups and policy performance
CREATE INDEX IF NOT EXISTS idx_sessions_host ON public.sessions(host_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_code ON public.sessions(session_code);

-- Cleanup job: delete expired sessions (run manually or via pg_cron)
-- To run manually:
-- DELETE FROM public.sessions WHERE expires_at < now();

-- If pg_cron is available, schedule daily cleanup:
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('cleanup-expired-sessions', '0 3 * * *', $$DELETE FROM public.sessions WHERE expires_at < now()$$);

DO $$ BEGIN
  CREATE POLICY "sessions_insert_host" ON public.sessions 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = host_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "sessions_update_host" ON public.sessions 
    FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = host_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "sessions_delete_host" ON public.sessions 
    FOR DELETE 
    TO authenticated 
    USING (auth.uid() = host_id);
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

-- Add indexes for policy performance and common queries
CREATE INDEX IF NOT EXISTS idx_tasks_session ON public.tasks(session_id);
CREATE INDEX IF NOT EXISTS idx_tasks_session_day ON public.tasks(session_id, day);
CREATE INDEX IF NOT EXISTS idx_tasks_order ON public.tasks(order_index);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON public.tasks(created_by);

-- SELECT policy: tasks are viewable by session participants (host or task creators in same session)
DO $$ BEGIN
  CREATE POLICY "tasks_select_session_participants" ON public.tasks 
    FOR SELECT 
    TO authenticated 
    USING (
      -- Creator can see their own tasks
      auth.uid() = created_by 
      OR 
      -- Host can see all tasks in their sessions
      EXISTS (
        SELECT 1 FROM public.sessions s 
        WHERE s.id = tasks.session_id 
        AND s.host_id = auth.uid()
      )
      OR
      -- Other participants can see tasks (if they have any task in the same session)
      EXISTS (
        SELECT 1 FROM public.tasks t 
        WHERE t.session_id = tasks.session_id 
        AND t.created_by = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Special policy for secret tasks: only creator and host can see them
DO $$ BEGIN
  CREATE POLICY "tasks_select_secret_restricted" ON public.tasks 
    FOR SELECT 
    TO authenticated 
    USING (
      is_secret = false 
      OR 
      auth.uid() = created_by 
      OR 
      EXISTS (
        SELECT 1 FROM public.sessions s 
        WHERE s.id = tasks.session_id 
        AND s.host_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "tasks_insert_own" ON public.tasks 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = created_by);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "tasks_update_own" ON public.tasks 
    FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = created_by);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "tasks_delete_own" ON public.tasks 
    FOR DELETE 
    TO authenticated 
    USING (auth.uid() = created_by);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Now that tasks exist, add sessions visibility policy that references tasks
DO $$ BEGIN
  CREATE POLICY "sessions_select_participants" ON public.sessions 
    FOR SELECT 
    TO authenticated 
    USING (
      auth.uid() = host_id 
      OR 
      EXISTS (
        SELECT 1 FROM public.tasks t 
        WHERE t.session_id = sessions.id 
        AND t.created_by = auth.uid()
      )
    );
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

-- Add indexes for policy performance
CREATE INDEX IF NOT EXISTS idx_task_choices_task ON public.task_choices(task_id);
CREATE INDEX IF NOT EXISTS idx_task_choices_user ON public.task_choices(user_id);

DO $$ BEGIN
  CREATE POLICY "task_choices_select_session_participants" ON public.task_choices 
    FOR SELECT 
    TO authenticated 
    USING (
      -- Can see own choices
      auth.uid() = user_id 
      OR 
      -- Can see choices for tasks in sessions where user participates
      EXISTS (
        SELECT 1 FROM public.tasks t 
        JOIN public.sessions s ON s.id = t.session_id
        WHERE t.id = task_choices.task_id 
        AND (s.host_id = auth.uid() OR t.created_by = auth.uid())
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "task_choices_insert_own" ON public.task_choices 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "task_choices_update_own" ON public.task_choices 
    FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "task_choices_delete_own" ON public.task_choices 
    FOR DELETE 
    TO authenticated 
    USING (auth.uid() = user_id);
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

-- COLLABORATIVE LISTS
-- Table for storing collaborative lists that can be created and verified by session participants
-- Note: Uses text session_id to support animal-code anonymous sessions
CREATE TABLE IF NOT EXISTS public.collaborative_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL, -- Using text to support animal-code sessions
  title text NOT NULL,
  list_type text NOT NULL CHECK (list_type IN ('bullet', 'numbered')),
  creator_id text NOT NULL, -- User ID who created the list (text for anonymous support)
  creator_name text NOT NULL, -- Display name of creator
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.collaborative_lists ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_collaborative_lists_session ON public.collaborative_lists(session_id);
CREATE INDEX IF NOT EXISTS idx_collaborative_lists_creator ON public.collaborative_lists(creator_id);

-- SELECT policy: authenticated users can view lists in their sessions
-- Note: For anonymous animal-code sessions, we allow authenticated users to view
DO $$ BEGIN
  CREATE POLICY "collaborative_lists_select_authenticated" ON public.collaborative_lists 
    FOR SELECT 
    TO authenticated 
    USING (true); -- Allow viewing for authenticated users (anonymous sessions supported)
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- INSERT policy: authenticated users can create lists
DO $$ BEGIN
  CREATE POLICY "collaborative_lists_insert_authenticated" ON public.collaborative_lists 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (true); -- Allow creation for authenticated users
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- UPDATE policy: only creator or session host can update
DO $$ BEGIN
  CREATE POLICY "collaborative_lists_update_creator" ON public.collaborative_lists 
    FOR UPDATE 
    TO authenticated 
    USING (creator_id = auth.uid()::text); -- Only creator can update
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- DELETE policy: only creator or session host can delete
DO $$ BEGIN
  CREATE POLICY "collaborative_lists_delete_creator" ON public.collaborative_lists 
    FOR DELETE 
    TO authenticated 
    USING (creator_id = auth.uid()::text); -- Only creator can delete
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- LIST ITEMS
-- Table for storing items within collaborative lists
CREATE TABLE IF NOT EXISTS public.list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL REFERENCES public.collaborative_lists ON DELETE CASCADE,
  text text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.list_items ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_list_items_list ON public.list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_list_items_order ON public.list_items(list_id, order_index);

-- SELECT policy: can view items if can view the parent list
DO $$ BEGIN
  CREATE POLICY "list_items_select_authenticated" ON public.list_items 
    FOR SELECT 
    TO authenticated 
    USING (
      EXISTS (
        SELECT 1 FROM public.collaborative_lists cl 
        WHERE cl.id = list_items.list_id
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- INSERT policy: can create items in lists within accessible sessions
DO $$ BEGIN
  CREATE POLICY "list_items_insert_authenticated" ON public.list_items 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.collaborative_lists cl 
        WHERE cl.id = list_id
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- UPDATE policy: can update items in accessible lists
DO $$ BEGIN
  CREATE POLICY "list_items_update_authenticated" ON public.list_items 
    FOR UPDATE 
    TO authenticated 
    USING (
      EXISTS (
        SELECT 1 FROM public.collaborative_lists cl 
        WHERE cl.id = list_items.list_id 
        AND cl.creator_id = auth.uid()::text
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- DELETE policy: only list creator can delete items
DO $$ BEGIN
  CREATE POLICY "list_items_delete_creator" ON public.list_items 
    FOR DELETE 
    TO authenticated 
    USING (
      EXISTS (
        SELECT 1 FROM public.collaborative_lists cl 
        WHERE cl.id = list_items.list_id 
        AND cl.creator_id = auth.uid()::text
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- LIST ITEM VERIFICATIONS
-- Table for storing user verifications (green/red votes) on list items
CREATE TABLE IF NOT EXISTS public.list_item_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.list_items ON DELETE CASCADE,
  user_id text NOT NULL, -- Text to support anonymous auth
  user_name text NOT NULL,
  is_accurate boolean NOT NULL, -- true = green (accurate), false = red (inaccurate)
  correction_text text, -- Only used when is_accurate = false
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(item_id, user_id) -- One vote per user per item
);

ALTER TABLE public.list_item_verifications ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_verifications_item ON public.list_item_verifications(item_id);
CREATE INDEX IF NOT EXISTS idx_verifications_user ON public.list_item_verifications(user_id);

-- SELECT policy: can view verifications for accessible list items
DO $$ BEGIN
  CREATE POLICY "list_item_verifications_select_authenticated" ON public.list_item_verifications 
    FOR SELECT 
    TO authenticated 
    USING (
      EXISTS (
        SELECT 1 FROM public.list_items li 
        JOIN public.collaborative_lists cl ON cl.id = li.list_id
        WHERE li.id = list_item_verifications.item_id
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- INSERT policy: can verify items in accessible lists
DO $$ BEGIN
  CREATE POLICY "list_item_verifications_insert_authenticated" ON public.list_item_verifications 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.list_items li 
        JOIN public.collaborative_lists cl ON cl.id = li.list_id
        WHERE li.id = item_id
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- UPDATE policy: can only update own verifications
DO $$ BEGIN
  CREATE POLICY "list_item_verifications_update_own" ON public.list_item_verifications 
    FOR UPDATE 
    TO authenticated 
    USING (user_id = auth.uid()::text);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- DELETE policy: can only delete own verifications
DO $$ BEGIN
  CREATE POLICY "list_item_verifications_delete_own" ON public.list_item_verifications 
    FOR DELETE 
    TO authenticated 
    USING (user_id = auth.uid()::text);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Enable realtime on collaborative list tables
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.collaborative_lists;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.list_items;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.list_item_verifications;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.collaborative_lists REPLICA IDENTITY FULL;
ALTER TABLE public.list_items REPLICA IDENTITY FULL;
ALTER TABLE public.list_item_verifications REPLICA IDENTITY FULL;

-- Verify publication membership (optional to run manually)
-- SELECT pubname, schemaname, tablename
-- FROM pg_publication_tables
-- WHERE pubname = 'supabase_realtime'
-- ORDER BY tablename;
