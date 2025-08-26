# GitHub Copilot Development Instructions

**ALWAYS follow these instructions first. Only search or use bash commands for additional context if information here is incomplete or incorrect.**

Project: Erin's Escapades (Next.js 14 + TypeScript + Tailwind CSS, npm)

A collaborative task management app with neon cyberpunk styling, real-time features, and Supabase integration.

## Quick Start Commands

Bootstrap the development environment:
```bash
npm install  # Takes ~30s, expect dependency warnings
npm run typecheck  # Validate TypeScript, takes ~5s
npm run lint  # Check code style, takes ~10s (TypeScript version warning is normal)
npm run build  # ***NEVER CANCEL*** - Takes ~30s, may fail on restricted networks due to Google Fonts
npm test  # Run Jest tests, takes ~10s, some Supabase mock tests may fail (expected)
```

## Critical Build Information

### Build Requirements and Timing
- **NEVER CANCEL builds or tests** - Set timeouts of 90+ minutes for builds, 30+ minutes for tests
- **Build time**: ~30 seconds normally, may take longer on restricted networks
- **Network dependency**: Build may fail with `ENOTFOUND fonts.googleapis.com` error in restricted environments
- **Workaround**: Comment out Google Fonts import in `app/layout.tsx` if build fails due to network restrictions

### Development Server
```bash
npm run dev  # Starts in ~2s at http://localhost:3000
```

### Quality Assurance Commands
Always run these before committing changes:
```bash
npm run check  # Combines typecheck + lint + build
npm test  # Jest test suite - expect some Supabase mock failures
```

## Architecture Overview

- **Framework**: Next.js 14 with App Router, TypeScript strict mode, Server Actions
- **Styling**: Tailwind CSS with custom neon cyberpunk theme
- **Database**: Supabase PostgreSQL with Row-Level Security (RLS)  
- **Authentication**: Animal code system (OAuth components removed)
- **Real-time**: Supabase Realtime for collaborative features
- **Testing**: Jest with Testing Library
- **State Management**: Custom React hooks with mock fallbacks

## Directory Structure

```
app/                 # Next.js App Router pages
├── auth/           # Authentication callback pages
├── page.tsx        # Home page
└── layout.tsx      # Root layout with fonts

components/          # React components
├── auth/           # Authentication components  
├── common/         # Shared UI components
├── session/        # Session management UI
├── tasks/          # Task management components
├── ui/             # Base UI primitives (shadcn/ui style)
└── vibes/          # Theme/vibe selector components

lib/                # Utility libraries
├── actions.ts      # Server actions for data mutations
├── supabase/       # Supabase client configuration
├── types.ts        # TypeScript type definitions
├── mock-data.ts    # Development mock data
└── utils.ts        # Utility functions

hooks/              # Custom React hooks
├── use-session.ts  # Session state management
├── use-tasks.ts    # Task CRUD operations
├── use-realtime.ts # Real-time subscriptions
└── use-*.ts        # Other state hooks

docs/               # Documentation
├── architecture.md # System architecture
├── deploy-vercel.md # Deployment guide
├── troubleshooting.md # Common issues
└── supabase-*.sql  # Database schema and seeds
```

## Environment Configuration

### Mock Mode (Default)
Works out of the box with no environment setup. Uses `lib/mock-data.ts` for UI development.

### Supabase Mode
Copy `.env.example` to `.env.local` and set:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Database Setup
Run SQL from `docs/supabase-schema.sql` in Supabase SQL Editor:
```bash
npm run db:print      # View schema SQL
npm run db:seed:print # View seed data SQL
```
Enable Realtime for `tasks` and `task_choices` tables in Supabase Dashboard.

## Validation Scenarios

After making changes, ALWAYS test these complete user workflows:

### 1. Basic Task Management
1. Visit http://localhost:3000
2. Create a new session with any name
3. Add 3-4 tasks (mix of normal and secret tasks)
4. Drag and drop tasks to reorder
5. Click on tasks to mark complete/incomplete
6. Verify animations and neon styling work

### 2. Real-time Collaboration
1. Open two browser windows to the same session
2. In window 1: Add a task, verify it appears in window 2
3. In window 2: Vote on tasks, verify votes appear in window 1
4. Test secret task reveal voting (requires multiple votes)

### 3. Share Functionality
1. Create a session with tasks
2. Click share button, copy URL
3. Open share URL in incognito window
4. Verify session loads with read-only access
5. Test reply flow (answer tasks, copy reply URL)

### 4. Theme and UI
1. Test vibe selector (different themes)
2. Verify responsive design on mobile/desktop
3. Check all animations and transitions
4. Test toast notifications for actions

## Common Issues and Solutions

### Build Failures
- **Google Fonts network error**: Comment out `Inter` font import in `app/layout.tsx` and use `font-sans` class
- **TypeScript errors**: Run `npm run typecheck` to isolate issues
- **Missing dependencies**: Run `npm install` after pulling changes

### Runtime Issues
- **App stuck on loading screen**: Known issue with ClientOnly hydration - reload page or wait 30+ seconds for client mounting
- **Test failures**: Expect some Supabase mock errors in restricted environments, focus on component tests
- **Act() warnings**: Use `await waitFor()` and proper async handling in tests
- **DOM errors**: Ensure `jest.setup.ts` imports `@testing-library/jest-dom`

### Development Issues
- **Realtime not working**: Check Supabase Realtime is enabled for tables
- **Auth errors**: Verify environment variables are set correctly
- **RLS denies**: Confirm authenticated user has proper permissions

## File Modification Guidelines

### Always Preserve
- Public component APIs and exported types
- Server action signatures in `lib/actions.ts`
- Database schema in `docs/supabase-schema.sql`
- Test structure and existing mocks

### Safe to Modify
- Component internal implementation
- Styling and animations
- Mock data for development
- Documentation files

### Requires Approval
- Dependencies in `package.json`
- TypeScript/Next.js/Tailwind configuration
- Database schema changes
- Authentication flow changes

## Testing Strategy

### Unit Tests
```bash
npm test                    # Full test suite
npm test -- --watch        # Watch mode for development
npm test TaskForm          # Test specific component
```

### Integration Tests
Focus on:
- Server actions with mock Supabase client
- Hook behavior with state changes
- Component integration with user interactions

### Manual Testing
- Always test in both mock and Supabase modes
- Verify responsive design
- Test complete user workflows
- Validate real-time features with multiple browsers

## Development Workflow

1. **Setup**: `npm install` (first time only)
2. **Development**: `npm run dev` 
3. **Changes**: Make minimal, focused modifications
4. **Validation**: `npm run check` + manual testing scenarios
5. **Testing**: `npm test` for affected components
6. **Documentation**: Update `CHANGELOG.md` with changes

## Deployment

### Vercel Deployment
```bash
npm run deploy:preview  # Preview deployment
npm run deploy:prod     # Production deployment  
```

### Pre-deployment Checklist
- [ ] `npm run check` passes
- [ ] Manual validation scenarios tested
- [ ] Environment variables configured on Vercel
- [ ] Database schema applied in Supabase
- [ ] Realtime enabled for required tables

## Additional Resources

- **Architecture**: `docs/architecture.md` - Detailed system design
- **Deployment**: `docs/deploy-vercel.md` - Production deployment guide  
- **Troubleshooting**: `docs/troubleshooting.md` - Common issues and fixes
- **AI Coordination**: `GEMINI.md` - Multi-agent development guidelines

**Remember: Always run the complete validation scenarios after making changes to ensure the application works end-to-end.**