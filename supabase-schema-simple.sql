-- ============================================================================
-- SIMPLIFIED SCHEMA FOR MAGIC WORD SESSIONS
-- ============================================================================
-- Clean slate design for guest-only collaborative task voting.
-- No auth required - users join rooms via shared "magic word"
--
-- Tech debt: ZERO - this is the minimal viable schema
-- Security: Open (appropriate for MVP/demo, add RLS later if needed)
-- ============================================================================

-- Drop old tables if migrating (CAREFUL - this deletes data!)
-- Uncomment these lines only if you want to start fresh:
-- DROP TABLE IF EXISTS list_item_verifications CASCADE;
-- DROP TABLE IF EXISTS list_items CASCADE;
-- DROP TABLE IF EXISTS collaborative_lists CASCADE;
-- DROP TABLE IF EXISTS task_choices CASCADE;
-- DROP TABLE IF EXISTS tasks CASCADE;
-- DROP TABLE IF EXISTS sessions CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- ROOMS TABLE
-- ============================================================================
-- A room is created when someone enters a magic word
-- Same word = same room (case-insensitive)
-- ============================================================================
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word text UNIQUE NOT NULL,  -- The magic word (lowercase, trimmed)
  created_at timestamptz DEFAULT now(),
  last_activity timestamptz DEFAULT now()
);

-- Index for fast word lookup
CREATE INDEX IF NOT EXISTS idx_rooms_word ON rooms(word);

-- ============================================================================
-- TASKS TABLE
-- ============================================================================
-- Tasks belong to a room, anyone in the room can see them
-- ============================================================================
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  text text NOT NULL,
  creator_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Index for fetching tasks by room
CREATE INDEX IF NOT EXISTS idx_tasks_room ON tasks(room_id);

-- ============================================================================
-- VOTES TABLE
-- ============================================================================
-- Each user can vote once per task (yes/no/maybe)
-- Unique constraint on (task_id, voter_name) prevents double voting
-- ============================================================================
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  voter_name text NOT NULL,
  choice text NOT NULL CHECK (choice IN ('yes', 'no', 'maybe')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(task_id, voter_name)
);

-- Index for fetching votes by task
CREATE INDEX IF NOT EXISTS idx_votes_task ON votes(task_id);

-- ============================================================================
-- REALTIME SETUP
-- ============================================================================
-- Enable realtime for live updates (optional but nice)
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE votes;

-- Full replica identity for proper realtime change tracking
ALTER TABLE rooms REPLICA IDENTITY FULL;
ALTER TABLE tasks REPLICA IDENTITY FULL;
ALTER TABLE votes REPLICA IDENTITY FULL;

-- ============================================================================
-- HELPER FUNCTION: Get or create room by word
-- ============================================================================
-- This ensures the same word always maps to the same room
-- ============================================================================
CREATE OR REPLACE FUNCTION get_or_create_room(magic_word text)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  room_id uuid;
  clean_word text;
BEGIN
  -- Normalize: lowercase, trim whitespace
  clean_word := lower(trim(magic_word));

  -- Try to find existing room
  SELECT id INTO room_id FROM rooms WHERE word = clean_word;

  -- Create if not exists
  IF room_id IS NULL THEN
    INSERT INTO rooms (word) VALUES (clean_word) RETURNING id INTO room_id;
  ELSE
    -- Update last activity
    UPDATE rooms SET last_activity = now() WHERE id = room_id;
  END IF;

  RETURN room_id;
END;
$$;

-- ============================================================================
-- CLEANUP FUNCTION (Optional)
-- ============================================================================
-- Call periodically to remove old inactive rooms
-- Example: SELECT cleanup_old_rooms('7 days');
-- ============================================================================
CREATE OR REPLACE FUNCTION cleanup_old_rooms(older_than interval DEFAULT '7 days')
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM rooms WHERE last_activity < now() - older_than;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================
--
-- Join/create a room:
--   SELECT get_or_create_room('tacos');
--
-- Add a task:
--   INSERT INTO tasks (room_id, text, creator_name)
--   VALUES ('room-uuid-here', 'Get pizza', 'Sarah');
--
-- Vote on a task:
--   INSERT INTO votes (task_id, voter_name, choice)
--   VALUES ('task-uuid-here', 'Mike', 'yes')
--   ON CONFLICT (task_id, voter_name)
--   DO UPDATE SET choice = EXCLUDED.choice;
--
-- Get tasks with vote counts:
--   SELECT
--     t.id, t.text, t.creator_name,
--     COUNT(*) FILTER (WHERE v.choice = 'yes') as yes_count,
--     COUNT(*) FILTER (WHERE v.choice = 'no') as no_count,
--     COUNT(*) FILTER (WHERE v.choice = 'maybe') as maybe_count
--   FROM tasks t
--   LEFT JOIN votes v ON v.task_id = t.id
--   WHERE t.room_id = 'room-uuid-here'
--   GROUP BY t.id
--   ORDER BY t.created_at;
--
-- ============================================================================
