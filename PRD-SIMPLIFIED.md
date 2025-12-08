# PRD: Erin's Escapades - Magic Word Edition

## What We're Building

A shared task list where people join rooms via a "magic word" and vote yes/no/maybe on tasks.

**Core insight:** Same word = same room. No codes, no accounts. Just share a word.

---

## The Only 3 Things It Does

1. **Join with a magic word** - Type "tacos" → you're in the "tacos" room
2. **Add tasks** - Type task, hit enter
3. **Vote on tasks** - Click Yes / No / Maybe

That's it.

---

## Why Magic Word > Animal Codes

| Aspect | Magic Word | Animal Pairs |
|--------|------------|--------------|
| Inputs | 1 text field | 2 dropdowns |
| Memorable | You pick it | Random combo |
| Speakable | "Join tacos" | "Join cat-dolphin" |
| Code | ~100 lines | ~250 lines |

---

## The UX

### Join Screen
```
┌─────────────────────────────────────────┐
│                                         │
│       ✨ Erin's Escapades ✨            │
│      Collaborate with a magic word      │
│                                         │
│   Magic Word: [ tacos        ] [Random] │
│                                         │
│   Your Name:  [ Sarah        ]          │
│                                         │
│           [ ✨ Enter Room ]             │
│                                         │
│   Tell your friends: "Join tacos"       │
│                                         │
└─────────────────────────────────────────┘
```

### Task Board
```
┌─────────────────────────────────────────┐
│  ✨ tacos                    [Leave]    │
├─────────────────────────────────────────┤
│  + [Type a task...              ] [Add] │
├─────────────────────────────────────────┤
│                                         │
│  Get pizza                      - Sarah │
│  ✓ 2   ✗ 1   ? 0                       │
│  [Yes] [No] [Maybe]                     │
│                                         │
│  Watch movie                    - Mike  │
│  ✓ 3   ✗ 0   ? 0                       │
│  [Yes] [No] [Maybe]                     │
│                                         │
└─────────────────────────────────────────┘
```

---

## Database Schema (3 tables, no RLS)

```sql
-- Rooms: created when someone enters a magic word
CREATE TABLE rooms (
  id uuid PRIMARY KEY,
  word text UNIQUE NOT NULL,
  created_at timestamptz,
  last_activity timestamptz
);

-- Tasks: belong to a room
CREATE TABLE tasks (
  id uuid PRIMARY KEY,
  room_id uuid REFERENCES rooms(id),
  text text NOT NULL,
  creator_name text NOT NULL,
  created_at timestamptz
);

-- Votes: one per user per task
CREATE TABLE votes (
  id uuid PRIMARY KEY,
  task_id uuid REFERENCES tasks(id),
  voter_name text NOT NULL,
  choice text CHECK (choice IN ('yes', 'no', 'maybe')),
  UNIQUE(task_id, voter_name)
);
```

**Zero tech debt:** Clean schema, no auth cruft, no RLS policies referencing dead code.

---

## What's NOT Included

- ❌ User accounts / authentication
- ❌ Real-time sync (refresh to see updates)
- ❌ Drag-drop reordering
- ❌ Themes/vibes
- ❌ Presence indicators ("3 people online")
- ❌ Task deletion (add only for MVP)

---

## Files Changed

| File | Change |
|------|--------|
| `components/auth/magic-word-form.tsx` | NEW - single word input |
| `app/page.tsx` | Simplified, uses MagicWordForm |
| `hooks/use-session.ts` | Updated for ?room= param |
| `supabase-schema-simple.sql` | NEW - clean 3-table schema |

---

## To Deploy

1. **Run the new schema** in Supabase SQL Editor:
   - Open `supabase-schema-simple.sql`
   - Execute in Supabase Dashboard → SQL Editor

2. **Set environment variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
   ```

3. **Deploy to Vercel** (or run locally with `npm run dev`)

---

## Success Criteria

1. I type "tacos" and "Sarah"
2. I click Enter Room
3. I see the task board for "tacos"
4. I add "Get pizza"
5. I click "Yes"
6. My friend types "tacos" in another browser
7. They see "Get pizza" with 1 yes vote
8. They click "No"
9. I refresh, see 1 yes + 1 no

**Done.**

---

## Future Enhancements (Post-MVP)

If this works well:
- Real-time updates via Supabase subscriptions
- "Copy link" button for easy sharing
- Task deletion
- Presence indicator ("2 people here")
- Room expiration (auto-cleanup after 7 days)
