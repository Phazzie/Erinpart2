-- Example seeds for sessions, tasks, and task_choices
-- Note: Replace UUIDs with your own where appropriate.

-- Users (assuming auth.users already populated). Insert public profiles if needed.
INSERT INTO public.users (id, username, avatar_url)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'erin', null)
ON CONFLICT (id) DO NOTHING;

-- Session hosted by erin
INSERT INTO public.sessions (id, host_id, day_vibe, session_code)
VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '{"mood":"chaos"}', 'ESCAPADE-1')
ON CONFLICT (id) DO NOTHING;

-- Tasks in session
INSERT INTO public.tasks (id, session_id, created_by, text, is_complete, day, order_index, comments, is_secret, votes)
VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Visit the spooky museum', false, 'today', 0, '', false, '{}'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Midnight ice-cream run', false, 'today', 1, '', false, '{}')
ON CONFLICT (id) DO NOTHING;

-- Per-user choices
INSERT INTO public.task_choices (task_id, user_id, choice)
VALUES
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'yes')
ON CONFLICT (task_id, user_id) DO NOTHING;
