# Erin's Escapades

A collaborative task management app where people join rooms via a "magic word" and vote yes/no/maybe on tasks.

**Core insight:** Same word = same room. No accounts needed. Just share a word.

## Features

- **Magic Word Rooms**: Type a word like "tacos" and you're in the "tacos" room
- **Real-time Collaboration**: See updates instantly via Supabase subscriptions
- **Task Voting**: Vote Yes / No / Maybe on any task
- **Guest Mode**: No accounts required - just enter a word and your name

## Quick Start

### Prerequisites

- Node.js 18+
- A Supabase project (free at [supabase.com](https://supabase.com))

### 1. Clone and Install

```bash
git clone <repository-url>
cd Erinpart2
npm install
```

### 2. Environment Setup

Create `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Database Setup

Apply the schema to your Supabase project:

1. Go to Supabase Dashboard > SQL Editor
2. Copy contents from `supabase-schema-simple.sql`
3. Run the script
4. Verify tables created: `rooms`, `tasks`, `votes`

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## How It Works

1. **Enter a magic word** - Type any word like "tacos", "friday", "adventure"
2. **Enter your name** - Just for display, no account needed
3. **Share the word** - Tell friends "Join tacos" to collaborate
4. **Add tasks** - Type a task and hit Enter
5. **Vote** - Click Yes / No / Maybe on any task

Everyone with the same word sees the same room in real-time.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime
- **UI Components**: shadcn/ui + Radix
- **Animations**: Framer Motion
- **Drag & Drop**: dnd-kit

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
4. Deploy!

## Database Schema

Three simple tables, no auth complexity:

```sql
-- Rooms: created when someone enters a magic word
CREATE TABLE rooms (
  id uuid PRIMARY KEY,
  word text UNIQUE NOT NULL,
  created_at timestamptz
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

## Project Structure

```
/app                    # Next.js app directory
/components             # React components
  /auth                 # Magic word form
  /session              # Session management
  /tasks                # Task components
/hooks                  # Custom React hooks
/lib                    # Utility functions
  /supabase             # Supabase client setup
```

## Testing

```bash
# Run unit tests
npm test

# Build for production
npm run build
```

## License

[Add your license here]

---

Built for collaborative chaos and organized adventures!
