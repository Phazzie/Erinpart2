# 🎭 Erin's Escapades

A collaborative task management application with unique animal code sessions and real-time synchronization.

## ✨ Features

- **Animal Code Sessions**: Create unique collaborative spaces using fun animal combinations (e.g., "cat-dog-bird")
- **Real-time Collaboration**: See updates instantly as team members add and vote on tasks
- **Clerk Authentication**: Secure user authentication with support for guest sessions
- **Task Management**: Drag-and-drop task reordering, secret tasks with vote-to-reveal
- **Dynamic Vibe Themes**: Customize your workspace with different visual themes
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🔐 Authentication

Erin's Escapades uses **Clerk** for user authentication while supporting flexible collaboration:

- **Authenticated Users**: Sign in with Clerk for cross-device session persistence
- **Guest Users**: Join sessions without authentication using animal codes
- **Animal Code Sessions**: Unique session identifiers independent of user authentication

See [docs/CLERK_SETUP.md](/docs/CLERK_SETUP.md) for detailed setup instructions.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A Clerk account (free at [clerk.com](https://clerk.com))
- A Supabase project (free at [supabase.com](https://supabase.com))

### 1. Clone and Install

```bash
git clone <repository-url>
cd Erinpart2
npm install
```

### 2. Environment Setup

Create `.env.local` in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_SECRET_HERE

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Get Your Keys:**

- **Clerk**: [dashboard.clerk.com](https://dashboard.clerk.com) → API Keys
- **Supabase**: Your project → Settings → API

### 3. Database Setup

Apply the schema to your Supabase project:

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents from `supabase-schema-clerk.sql`
3. Run the script
4. Verify tables created successfully

See [docs/DATABASE_MIGRATION.md](/docs/DATABASE_MIGRATION.md) for detailed instructions.

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app!

## 📖 Documentation

- **[CLERK_SETUP.md](/docs/CLERK_SETUP.md)** - Complete Clerk authentication setup guide
- **[ANIMAL_CODE_SESSIONS.md](/docs/ANIMAL_CODE_SESSIONS.md)** - How animal code sessions work
- **[DATABASE_MIGRATION.md](/docs/DATABASE_MIGRATION.md)** - Database schema and migration guide
- **[CLERK_MIGRATION_SUMMARY.md](/docs/CLERK_MIGRATION_SUMMARY.md)** - Migration overview and checklist
- **[DEPLOYMENT_CHECKLIST.md](/docs/DEPLOYMENT_CHECKLIST.md)** - Pre-deployment verification steps

## 🎯 How It Works

### Animal Code Sessions

Sessions are created using two animal names (e.g., "dolphin-unicorn"):

1. Pick two animals from the list
2. Enter your name
3. Share the animal code with collaborators
4. Everyone with the same code joins the same session

### User Authentication

- **Guest Users**: Temporary ID based on session (e.g., `guest-cat-dog-bird`)
- **Authenticated Users**: Persistent Clerk ID (e.g., `user_2xxxClerkID123`)
- **Upgrading**: Sign in anytime to upgrade from guest to authenticated

### Real-time Collaboration

- Tasks sync instantly across all users
- Vote on secret tasks to reveal them
- See who created each task
- Drag-and-drop reordering persists for everyone

## 🏗️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Drag & Drop**: dnd-kit

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables from `.env.local`
4. Deploy!

See [docs/DEPLOYMENT_CHECKLIST.md](/docs/DEPLOYMENT_CHECKLIST.md) for complete deployment steps.

### Environment Variables Required

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Build for production (verify no errors)
npm run build
```

## 📋 Project Structure

```
/app                    # Next.js app directory
/components             # React components
  /auth                 # Authentication components
  /session              # Session management
  /tasks                # Task components
/docs                   # Documentation
/hooks                  # Custom React hooks
/lib                    # Utility functions
  /clerk                # Clerk authentication utilities
  /supabase             # Supabase client setup
/middleware.ts          # Clerk middleware
```

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📜 License

[Add your license here]

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Authentication by [Clerk](https://clerk.com)
- Database by [Supabase](https://supabase.com)
- UI components from [shadcn/ui](https://ui.shadcn.com)

## 📞 Support

For issues or questions:

1. Check the `/docs` folder for detailed guides
2. Review [Clerk documentation](https://clerk.com/docs)
3. Review [Supabase documentation](https://supabase.com/docs)
4. Open an issue on GitHub

---

Built with ❤️ for collaborative chaos and organized adventures!
