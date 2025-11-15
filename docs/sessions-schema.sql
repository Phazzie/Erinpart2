-- Database Sessions with Participant Limits
-- Replaces localStorage with proper session management

-- Enable UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- SESSIONS table (replaces localStorage)
CREATE TABLE IF NOT EXISTS public.sessions (
  id text PRIMARY KEY,                    -- "cat-dog" style IDs
  created_by text,                        -- who created it (nullable for anonymous) - Clerk user ID
  participant_limit integer DEFAULT 4,   -- max people allowed
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days'), -- auto-expire old sessions
  settings jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_sessions_created_by ON public.sessions(created_by);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON public.sessions(expires_at);

-- SESSION_PARTICIPANTS (who's in each session)
CREATE TABLE IF NOT EXISTS public.session_participants (
  session_id text NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id text NOT NULL,  -- Clerk user ID (e.g., "user_2xxx...")
  user_name text NOT NULL,
  joined_at timestamptz DEFAULT now(),
  last_seen timestamptz DEFAULT now(),
  PRIMARY KEY (session_id, user_id)
);

ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_session_participants_session ON public.session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_session_participants_last_seen ON public.session_participants(last_seen);

-- RLS Policies: Anyone can read sessions and participants (for joining/viewing)
-- This enables session sharing while still being secure

DO $$ BEGIN
  CREATE POLICY "sessions_select_all" ON public.sessions 
    FOR SELECT 
    USING (true); -- Anyone can read session info to join
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "sessions_insert_authenticated" ON public.sessions 
    FOR INSERT 
    WITH CHECK (true); -- Anyone can create sessions
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "sessions_update_creator" ON public.sessions
    FOR UPDATE
    USING (true); -- Allow updates (Clerk auth replaces Supabase auth.uid())
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "session_participants_select_all" ON public.session_participants 
    FOR SELECT 
    USING (true); -- Anyone can see who's in sessions
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "session_participants_insert_own" ON public.session_participants
    FOR INSERT
    WITH CHECK (true); -- Allow inserts (Clerk auth replaces Supabase auth.uid())
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "session_participants_update_own" ON public.session_participants
    FOR UPDATE
    USING (true); -- Allow updates (Clerk auth replaces Supabase auth.uid())
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "session_participants_delete_own" ON public.session_participants
    FOR DELETE
    USING (true); -- Allow deletes (Clerk auth replaces Supabase auth.uid())
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Helper function to check if session is full
CREATE OR REPLACE FUNCTION is_session_full(session_id_param text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_count integer;
  max_limit integer;
BEGIN
  -- Get current participant count and limit
  SELECT COUNT(*), s.participant_limit
  INTO current_count, max_limit
  FROM public.session_participants sp
  JOIN public.sessions s ON s.id = sp.session_id
  WHERE sp.session_id = session_id_param
  GROUP BY s.participant_limit;
  
  -- If no participants yet, session is not full
  IF current_count IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN current_count >= max_limit;
END;
$$;

-- Helper function to join a session (with limit checking)
CREATE OR REPLACE FUNCTION join_session(
  session_id_param text,
  user_id_param text,  -- Changed to text for Clerk user IDs (e.g., "user_2xxx...")
  user_name_param text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_exists boolean;
  session_full boolean;
  already_joined boolean;
BEGIN
  -- Check if session exists
  SELECT EXISTS(SELECT 1 FROM public.sessions WHERE id = session_id_param)
  INTO session_exists;
  
  IF NOT session_exists THEN
    RETURN jsonb_build_object('success', false, 'error', 'Session does not exist');
  END IF;
  
  -- Check if user already joined
  SELECT EXISTS(
    SELECT 1 FROM public.session_participants 
    WHERE session_id = session_id_param AND user_id = user_id_param
  ) INTO already_joined;
  
  IF already_joined THEN
    -- Update last_seen and return success
    UPDATE public.session_participants 
    SET last_seen = now() 
    WHERE session_id = session_id_param AND user_id = user_id_param;
    
    RETURN jsonb_build_object('success', true, 'message', 'Already in session');
  END IF;
  
  -- Check if session is full
  SELECT is_session_full(session_id_param) INTO session_full;
  
  IF session_full THEN
    RETURN jsonb_build_object('success', false, 'error', 'Session is full');
  END IF;
  
  -- Join the session
  INSERT INTO public.session_participants (session_id, user_id, user_name)
  VALUES (session_id_param, user_id_param, user_name_param);
  
  RETURN jsonb_build_object('success', true, 'message', 'Joined session successfully');
END;
$$;

-- Cleanup function for inactive participants (run via cron or manually)
CREATE OR REPLACE FUNCTION cleanup_inactive_participants()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Remove participants who haven't been seen in 24 hours
  DELETE FROM public.session_participants 
  WHERE last_seen < (now() - interval '24 hours');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Also delete empty sessions (no participants left)
  DELETE FROM public.sessions 
  WHERE id NOT IN (
    SELECT DISTINCT session_id FROM public.session_participants
  ) AND created_at < (now() - interval '1 hour'); -- Grace period for new sessions
  
  RETURN deleted_count;
END;
$$;

-- Add sessions and participants to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_participants;

-- Set replica identity for realtime
ALTER TABLE public.sessions REPLICA IDENTITY FULL;
ALTER TABLE public.session_participants REPLICA IDENTITY FULL;

-- Update updated_at trigger for sessions
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: You may want to run cleanup_inactive_participants() periodically
-- Example: SELECT cleanup_inactive_participants();