# Erin's Escapades - Simple PRD

## One Sentence
A shared task list where people join the same room by typing the same word.

## How It Works
1. Type a word (e.g., "tacos")
2. Type your name
3. You're in the "tacos" room
4. Add tasks, vote yes/no/maybe
5. Anyone who types "tacos" joins you

## Three Features
| Feature | How |
|---------|-----|
| Join room | Type any word |
| Add task | Type + enter |
| Vote | Click Yes/No/Maybe |

## Database
```
rooms:  id, word, created_at
tasks:  id, room_id, text, creator_name
votes:  id, task_id, voter_name, choice
```

## Not Building
- User accounts
- Real-time sync
- Drag-drop
- Delete tasks

## To Ship
1. Run `supabase-schema-simple.sql` in Supabase
2. Set env vars
3. Deploy

## Done When
Two people type "tacos" → see same tasks → vote → see each other's votes.
