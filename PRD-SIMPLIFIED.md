# PRD: Erin's Escapades - 30-Minute Build

## What We're Building

A shared task list where people join via animal codes and vote yes/no/maybe on tasks.

**Build time: 30 minutes**

---

## The Only 3 Things It Does

1. **Join with animal code** - Type "cat-dog" → you're in that room
2. **Add tasks** - Type task, hit enter
3. **Vote on tasks** - Click Yes / No / Maybe

That's it.

---

## What We're NOT Building

- ❌ No user accounts / auth
- ❌ No real-time sync (just refresh)
- ❌ No drag-drop reordering
- ❌ No themes/vibes
- ❌ No presence indicators
- ❌ No delete (add only)

---

## Single Page UI

```
┌─────────────────────────────────────────┐
│  Animal Code: [cat-dog    ] [Join]      │
│  Your Name:   [Sarah      ]             │
├─────────────────────────────────────────┤
│  + [Type a task...           ] [Add]    │
├─────────────────────────────────────────┤
│                                         │
│  □ Get pizza                            │
│    ✓2  ✗1  ?0   [Yes] [No] [Maybe]     │
│                                         │
│  □ Watch movie                          │
│    ✓3  ✗0  ?0   [Yes] [No] [Maybe]     │
│                                         │
│  □ Clean apartment                      │
│    ✓0  ✗2  ?1   [Yes] [No] [Maybe]     │
│                                         │
└─────────────────────────────────────────┘
```

---

## Database (2 Tables)

Already exists in Supabase - just use what's there:

**Use existing `tasks` table:**
- id, session_id, text, created_at

**Use existing `task_choices` table:**
- id, task_id, user_name, choice (yes/no/maybe)

No new tables needed. Reuse existing schema.

---

## Build Steps (30 min)

### 1. Simplify Homepage (10 min)
- Strip down `animal-code-form.tsx` to just: animal code input + name input + join button
- Remove all the fancy stuff

### 2. Simplify Task Board (15 min)
- Strip down `session-board.tsx` to just show tasks
- Keep task input + add button
- Keep vote buttons (yes/no/maybe)
- Remove: drag-drop, day toggle, secret tasks, vibes

### 3. Test It (5 min)
- Enter animal code
- Add a task
- Vote on it
- Open in another tab, same code, see the task

---

## Files to Modify

| File | Change |
|------|--------|
| `app/page.tsx` | Simplify to just the form + task list |
| `components/auth/animal-code-form.tsx` | Strip to basics |
| `components/tasks/task-list.tsx` | Remove drag-drop |
| `components/tasks/task-item.tsx` | Keep only vote buttons |

---

## What Success Looks Like

1. I type "fox-bear" and my name
2. I click Join
3. I see a task list
4. I add "Get tacos"
5. I click "Yes" on it
6. My friend types "fox-bear" in another browser
7. They see "Get tacos" with 1 yes vote
8. They click "No"
9. I refresh, see 1 yes + 1 no

**Done. Ship it.**
