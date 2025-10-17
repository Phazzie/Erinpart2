# ⚠️ DEPRECATED - Supabase SQL Schema

> **STATUS:** PARTIALLY OUTDATED - This schema is from August 2025.  
> **REASON:** Schema has evolved - added user_name fields, changed auth approach to animal codes.  
> **SEE INSTEAD:** `supabase-schema.sql` file or check production Supabase directly.  
> **LAST UPDATED:** 2025-08-15

**Date:** 2025-08-15
**Author:** Gemini

This document details the SQL schema for the Supabase database, including table definitions and Row-Level Security (RLS) policies.

## Tables

### `users`

Stores public user profile information. This table is linked to Supabase's built-in `auth.users` table via its `id` column.

```sql
CREATE TABLE public.users (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  updated_at timestamptz DEFAULT now() NOT NULL,
  username text UNIQUE NOT NULL,
  avatar_url text
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.users FOR UPDATE USING (auth.uid() = id);
```

### `sessions`

Stores the core session data, including the host, day vibe, and a shareable session code.

```sql
CREATE TABLE public.sessions (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  host_id uuid REFERENCES public.users ON DELETE CASCADE NOT NULL,
  day_vibe jsonb,
  session_code text UNIQUE NOT NULL
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sessions are viewable by participants." ON public.sessions FOR SELECT USING (
  auth.uid() = host_id OR EXISTS (SELECT 1 FROM public.tasks WHERE session_id = id AND created_by = auth.uid())
);
CREATE POLICY "Hosts can create sessions." ON public.sessions FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Hosts can update their sessions." ON public.sessions FOR UPDATE USING (auth.uid() = host_id);
CREATE POLICY "Hosts can delete their sessions." ON public.sessions FOR DELETE USING (auth.uid() = host_id);
```

### `tasks`

Stores tasks associated with a session. Each task belongs to a specific session and is created by a user.

```sql
CREATE TABLE public.tasks (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  session_id uuid REFERENCES public.sessions ON DELETE CASCADE NOT NULL,
  created_by uuid REFERENCES public.users ON DELETE CASCADE NOT NULL,
  text text NOT NULL,
  is_complete boolean DEFAULT false NOT NULL,
  completed_at timestamptz,
  choice text,
  day text,
  order_index integer,
  comments text,
  is_secret boolean DEFAULT false NOT NULL,
  votes text[] DEFAULT '{}'::text[] NOT NULL
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tasks are viewable by session participants." ON public.tasks FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.sessions WHERE id = session_id AND (auth.uid() = host_id OR EXISTS (SELECT 1 FROM public.tasks WHERE session_id = public.sessions.id AND created_by = auth.uid())))
);
CREATE POLICY "Users can create tasks for their sessions." ON public.tasks FOR INSERT WITH CHECK (
  auth.uid() = created_by AND EXISTS (SELECT 1 FROM public.sessions WHERE id = session_id AND auth.uid() = host_id)
);
CREATE POLICY "Users can update their own tasks." ON public.tasks FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own tasks." ON public.tasks FOR DELETE USING (auth.uid() = created_by);
```

### `task_choices`

Stores per-user choices for a given task. Single row per (task_id, user_id).

```sql
CREATE TABLE public.task_choices (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  task_id uuid REFERENCES public.tasks ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.users ON DELETE CASCADE NOT NULL,
  choice text CHECK (choice IN ('yes','no','maybe')) NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (task_id, user_id)
);

ALTER TABLE public.task_choices ENABLE ROW LEVEL SECURITY;

-- Anyone who can see the task can see aggregate choices; row visibility not sensitive.
CREATE POLICY "Choices readable to session participants" ON public.task_choices FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.tasks t
    JOIN public.sessions s ON s.id = t.session_id
    WHERE t.id = task_id AND (auth.uid() = s.host_id OR EXISTS (
      SELECT 1 FROM public.tasks t2 WHERE t2.session_id = s.id AND t2.created_by = auth.uid()
    ))
  )
);

-- Only the user themselves can insert/update their choice
CREATE POLICY "Users upsert own choice" ON public.task_choices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own choice" ON public.task_choices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own choice" ON public.task_choices FOR DELETE USING (auth.uid() = user_id);
```
