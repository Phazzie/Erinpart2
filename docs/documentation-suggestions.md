## Documentation Suggestions

This document lists suggested comments and documentation additions for various files in the project.

### File: `/workspaces/Erinpart2/components/auth/animal-code-form.tsx`
*   **Line 11:** Add JSDoc for `AnimalCodeForm` component explaining its purpose (allows login with two animal names, no account needed).
*   **Line 14:** Add JSDoc for `handleAnimalJoin` function explaining its purpose (generates a session ID from animal names, shows a toast, and redirects).
*   **Line 20:** Add a comment explaining the purpose of `window.location.href` here (quick mock navigation).

### File: `/workspaces/Erinpart2/components/auth/login-form.tsx`
*   **Line 16:** Add JSDoc for `LoginForm` component explaining its purpose (allows users to log in via email/password or Google OAuth).
*   **Line 20:** Add JSDoc for `handleGoogleSignIn` function explaining its purpose (initiates Google OAuth sign-in and handles success/failure toasts).

### File: `/workspaces/Erinpart2/components/auth/signup-form.tsx`
*   **Line 15:** Add JSDoc for `SignupForm` component explaining its purpose (allows new users to sign up with email and password).

### File: `/workspaces/Erinpart2/components/session/session-details.tsx`
*   **Line 15:** Add JSDoc for `SessionDetails` component explaining its purpose (displays details of a selected task, allows updating comments).
*   **Line 18:** Add JSDoc for `SessionDetailsProps` interface explaining its properties.

### File: `/workspaces/Erinpart2/components/ui/textarea.tsx`
*   **Line 6:** Add JSDoc for `Textarea` component explaining its purpose (a reusable textarea component with styling).
*   **Line 4:** Add JSDoc for `TextareaProps` interface explaining its properties (extends standard textarea attributes).

### File: `/workspaces/Erinpart2/hooks/use-session.ts`
*   **Line 8:** Add JSDoc for `useSession` hook explaining its purpose (manages user authentication session, provides user and loading state, integrates with Supabase or uses mock).
*   **Line 5:** Add JSDoc for `SessionHook` type explaining its properties.
*   **Line 16:** Add a comment explaining the `isMounted` flag (prevents state updates on unmounted components).
*   **Line 29:** Add a comment explaining the `sub?.subscription?.unsubscribe?.()` (cleans up Supabase auth subscription on unmount).

### File: `/workspaces/Erinpart2/hooks/use-tasks.ts`
*   **Line 6:** Add JSDoc for `useTasks` hook explaining its purpose (manages tasks for a session, provides CRUD operations, integrates with Supabase for persistence and real-time, or uses mock).
*   **Line 12:** Add a comment explaining the `cancelled` flag (prevents state updates from async operations after component unmounts).
*   **Line 29:** Add a comment explaining the `channel` setup (Supabase Realtime channel for task changes).
*   **Line 34:** Add a comment explaining the `eventType` and `rowNew`/`rowOld` (handling different Supabase Realtime events).
*   **Line 37:** Add a comment explaining the `sid` check (ensures events are for the current session).
*   **Line 40:** Add a comment explaining the `setTasks` logic for `INSERT` (adds new task, avoids duplicates).
*   **Line 43:** Add a comment explaining the `setTasks` logic for `UPDATE` (maps and updates existing task).
*   **Line 45:** Add a comment explaining the `setTasks` logic for `DELETE` (filters out deleted task).
*   **Line 53:** Add a comment explaining the `return` cleanup function (unsubscribes from Realtime channel on unmount).
*   **Line 57:** Add JSDoc for `addTask` function explaining its purpose (adds a new task to the session, either to Supabase or mock).
*   **Line 85:** Add JSDoc for `updateTask` function explaining its purpose (updates an existing task, either in Supabase or mock).
*   **Line 92:** Add JSDoc for `deleteTask` function explaining its purpose (deletes a task, either from Supabase or mock).

### File: `/workspaces/Erinpart2/lib/actions.ts`
*   **Line 5:** Add JSDoc for `assertSupabaseConfigured` function explaining its purpose (throws an error if Supabase environment variables are not set).
*   **Line 12:** Add JSDoc for `signIn` function explaining its purpose (handles user sign-in with email and password).
*   **Line 22:** Add JSDoc for `signUp` function explaining its purpose (handles new user registration with email and password).
*   **Line 31:** Add JSDoc for `signOut` function explaining its purpose (handles user logout).
*   **Line 37:** Add JSDoc for `signInWithGoogle` function explaining its purpose (initiates Google OAuth sign-in).
*   **Line 43:** Add JSDoc for `createTask` function explaining its purpose (creates a new task in Supabase).
*   **Line 50:** Add JSDoc for `updateTask` function explaining its purpose (updates an existing task in Supabase).
*   **Line 57:** Add JSDoc for `deleteTask` function explaining its purpose (deletes a task from Supabase).
*   **Line 64:** Add JSDoc for `updateSession` function explaining its purpose (updates a session in Supabase).
*   **Line 71:** Add JSDoc for `createShareableSession` function explaining its purpose (generates a shareable URL for a session).
*   **Line 79:** Add JSDoc for `getCurrentUser` function explaining its purpose (fetches the current authenticated user from Supabase).
*   **Line 85:** Add JSDoc for `isAuthenticated` function explaining its purpose (checks if a user is currently authenticated).

### File: `/workspaces/Erinpart2/lib/supabase/client.ts`
*   **Line 5:** Add JSDoc for `isSupabaseConfigured` explaining its purpose (checks if Supabase environment variables are set).
*   **Line 8:** Add JSDoc for `noop` explaining its purpose (a no-operation function for stubbing).
*   **Line 9:** Add JSDoc for `supabaseStub` explaining its purpose (a minimal stub for Supabase client when not configured).
*   **Line 50:** Add JSDoc for `supabase` explaining its purpose (the Supabase client instance, either real or stubbed).
*   **Line 54:** Add JSDoc for `createClient` explaining its purpose (factory function to return the Supabase client instance).

### File: `/workspaces/Erinpart2/lib/supabase/server.ts`
*   **Line 5:** Add JSDoc for `isSupabaseConfigured` explaining its purpose (checks if Supabase environment variables are set for server-side).
*   **Line 8:** Add JSDoc for `noop` explaining its purpose (a no-operation function for stubbing).
*   **Line 9:** Add JSDoc for `supabaseStub` explaining its purpose (a minimal stub for Supabase server client when not configured).
*   **Line 50:** Add JSDoc for `supabaseServer` explaining its purpose (the Supabase server client instance, either real or stubbed).

### File: `/workspaces/Erinpart2/app/auth/callback/route.ts`
*   **Line 3:** Add JSDoc for `GET` function explaining its purpose (handles OAuth callback, redirects to home page).

### File: `/workspaces/Erinpart2/app/auth/login/page.tsx`
*   **Line 5:** Add JSDoc for `LoginPage` component explaining its purpose (renders the login form within a card layout).

### File: `/workspaces/Erinpart2/app/auth/signup/page.tsx`
*   **Line 5:** Add JSDoc for `SignupPage` component explaining its purpose (renders the signup form within a card layout).

### File: `/workspaces/Erinpart2/app/error.tsx`
*   **Line 6:** Add JSDoc for `Error` component explaining its purpose (Next.js error boundary component to catch and display errors).
*   **Line 14:** Add a comment explaining `reset` function (resets the error boundary).

### File: `/workspaces/Erinpart2/app/layout.tsx`
*   **Line 12:** Add JSDoc for `RootLayout` component explaining its purpose (the root layout for the Next.js application, setting up global styles, metadata, and common components).

### File: `/workspaces/Erinpart2/app/loading.tsx`
*   **Line 3:** Add JSDoc for `Loading` component explaining its purpose (displays a loading spinner for Next.js Suspense boundaries).

### File: `/workspaces/Erinpart2/app/page.tsx`
*   **Line 6:** Add JSDoc for `HomePage` component explaining its purpose (the main application home page, displaying the session board).

### File: `/workspaces/Erinpart2/components/auth/google-signin-button.tsx`
*   **Line 9:** Add JSDoc for `GoogleSignInButton` component explaining its purpose (a button to initiate Google OAuth sign-in).
*   **Line 12:** Add JSDoc for `handleSignIn` function explaining its purpose (handles the click event for Google sign-in, showing toasts for success/failure).

### File: `/workspaces/Erinpart2/components/common/animated-background.tsx`
*   **Line 10:** Add JSDoc for `AnimatedBackground` component explaining its purpose (renders various animated background effects like particles, matrix, grid, or waves).
*   **Line 13:** Add JSDoc for `AnimatedBackgroundProps` interface explaining its properties.
*   **Line 20:** Add a comment explaining the `canvasRef` (reference to the canvas element for particle animation).
*   **Line 22:** Add a comment explaining the `useEffect` for particles (initializes and animates particles on canvas).
*   **Line 40:** Add a comment explaining the `animate` function (main animation loop for particles).
*   **Line 78:** Add a comment explaining the `handleResize` function (resizes canvas on window resize).
*   **Line 85:** Add a comment explaining the `matrix` variant rendering (renders a matrix rain effect using Framer Motion).
*   **Line 110:** Add a comment explaining the `grid` variant rendering (renders a grid background with pulsating dots).
*   **Line 135:** Add a comment explaining the `waves` variant rendering (renders a pulsating wave effect).

### File: `/workspaces/Erinpart2/components/common/error-message.tsx`
*   **Line 7:** Add JSDoc for `ErrorMessage` component explaining its purpose (displays an animated error message).
*   **Line 5:** Add JSDoc for `ErrorMessageProps` interface explaining its properties.

### File: `/workspaces/Erinpart2/components/common/loading-spinner.tsx`
*   **Line 10:** Add JSDoc for `LoadingSpinner` component explaining its purpose (displays an animated loading spinner with various visual styles).
*   **Line 7:** Add JSDoc for `LoadingSpinnerProps` interface explaining its properties.
*   **Line 18:** Add a comment explaining `sizeClasses` (maps size props to Tailwind CSS classes).
*   **Line 25:** Add a comment explaining the `matrix` variant rendering (renders a matrix-style loading animation).
*   **Line 55:** Add a comment explaining the `neon` variant rendering (renders a neon-themed loading animation with pulsating rings).
*   **Line 90:** Add a comment explaining the default spinner rendering.

### File: `/workspaces/Erinpart2/components/common/neon-title.tsx`
*   **Line 7:** Add JSDoc for `NeonTitle` component explaining its purpose (renders a neon-styled title with animation).
*   **Line 5:** Add JSDoc for `NeonTitleProps` interface explaining its properties.

### File: `/workspaces/Erinpart2/components/layout/day-toggle.tsx`
*   **Line 9:** Add JSDoc for `DayToggle` component explaining its purpose (a toggle switch for "Today" and "Tomorrow" views with animations).
*   **Line 6:** Add JSDoc for `DayToggleProps` interface explaining its properties.
*   **Line 15:** Add JSDoc for `handleDayChange` function explaining its purpose (handles day change, triggers animation, and calls `onDayChange` callback).

### File: `/workspaces/Erinpart2/components/layout/mobile-nav.tsx`
*   **Line 7:** Add JSDoc for `MobileNav` component explaining its purpose (a mobile navigation component using a sheet/drawer pattern).

### File: `/workspaces/Erinpart2/components/layout/presence-indicator.tsx`
*   **Line 9:** Add JSDoc for `PresenceIndicator` component explaining its purpose (displays a visual indicator of user presence, currently using mock data).
*   **Line 5:** Add a comment explaining `mockUsers` (placeholder for real-time user presence data).

### File: `/workspaces/Erinpart2/components/layout/top-bar.tsx`
*   **Line 6:** Add JSDoc for `TopBar` component explaining its purpose (renders the main application top navigation bar with a title and login link).

### File: `/workspaces/Erinpart2/components/session/session-sidebar.tsx`
*   **Line 6:** Add JSDoc for `SessionSidebar` component explaining its purpose (a sidebar component intended for session navigation).

### File: `/workspaces/Erinpart2/components/tasks/task-item.tsx`
*   **Line 10:** Add JSDoc for `TaskItemProps` interface explaining its properties.
*   **Line 20:** Add a comment explaining `style` (Framer Motion styles for draggable item).
*   **Line 26:** Add a comment explaining `hasVoted` (checks if the current user has voted to reveal a secret task).
*   **Line 29:** Add a comment explaining the conditional rendering for secret tasks.
*   **Line 66:** Add a comment explaining the conditional rendering for normal tasks.

### File: `/workspaces/Erinpart2/components/tasks/task-list.tsx`
*   **Line 20:** Add JSDoc for `TaskListProps` interface explaining its properties.
*   **Line 35:** Add a comment explaining `sensors` (Dnd-kit sensors for drag and drop).
*   **Line 44:** Add a comment explaining `handleDragEnd` function (handles task reordering after drag).
*   **Line 68:** Add a comment explaining the conditional rendering for empty task list.

### File: `/workspaces/Erinpart2/components/ui/badge.tsx`
*   **Line 8:** Add JSDoc for `badgeVariants` explaining its purpose (defines the visual variants for the Badge component).
*   **Line 24:** Add JSDoc for `BadgeProps` interface explaining its properties.
*   **Line 28:** Add JSDoc for `Badge` component explaining its purpose (a reusable badge component with different visual styles).

### File: `/workspaces/Erinpart2/components/ui/button.tsx`
*   **Line 8:** Add JSDoc for `buttonVariants` explaining its purpose (defines the visual variants and sizes for the Button component).
*   **Line 34:** Add JSDoc for `ButtonProps` interface explaining its properties.
*   **Line 39:** Add JSDoc for `Button` component explaining its purpose (a reusable button component with different visual styles and sizes).

### File: `/workspaces/Erinpart2/components/ui/card.tsx`
*   **Line 7:** Add JSDoc for `Card` component explaining its purpose (a reusable card container component).
*   **Line 18:** Add JSDoc for `CardHeader` component explaining its purpose (header section for a Card).
*   **Line 29:** Add JSDoc for `CardTitle` component explaining its purpose (title element for a Card).
*   **Line 40:** Add JSDoc for `CardDescription` component explaining its purpose (description text for a Card).
*   **Line 51:** Add JSDoc for `CardContent` component explaining its purpose (main content area for a Card).
*   **Line 60:** Add JSDoc for `CardFooter` component explaining its purpose (footer section for a Card).

### File: `/workspaces/Erinpart2/components/ui/checkbox.tsx`
*   **Line 10:** Add JSDoc for `Checkbox` component explaining its purpose (a reusable checkbox component built on Radix UI).

### File: `/workspaces/Erinpart2/components/ui/input.tsx`
*   **Line 7:** Add JSDoc for `InputProps` interface explaining its properties.
*   **Line 10:** Add JSDoc for `Input` component explaining its purpose (a reusable input field component).

### File: `/workspaces/Erinpart2/components/ui/label.tsx`
*   **Line 8:** Add JSDoc for `labelVariants` explaining its purpose (defines the visual variants for the Label component).
*   **Line 13:** Add JSDoc for `Label` component explaining its purpose (a reusable label component built on Radix UI).

### File: `/workspaces/Erinpart2/components/ui/sheet.tsx`
*   **Line 10:** Add JSDoc for `Sheet` component explaining its purpose (a reusable sheet/drawer component built on Radix UI).
*   **Line 12:** Add JSDoc for `SheetTrigger` component explaining its purpose (triggers the opening of a Sheet).
*   **Line 14:** Add JSDoc for `SheetClose` component explaining its purpose (closes a Sheet).
*   **Line 16:** Add JSDoc for `SheetPortal` component explaining its purpose (portal for rendering Sheet content outside the DOM hierarchy).
*   **Line 18:** Add JSDoc for `SheetOverlay` component explaining its purpose (overlay for a Sheet).
*   **Line 31:** Add JSDoc for `sheetVariants` explaining its purpose (defines the visual variants for the Sheet component).
*   **Line 44:** Add JSDoc for `SheetContentProps` interface explaining its properties.
*   **Line 47:** Add JSDoc for `SheetContent` component explaining its purpose (main content area for a Sheet).
*   **Line 64:** Add JSDoc for `SheetHeader` component explaining its purpose (header section for a Sheet).
*   **Line 74:** Add JSDoc for `SheetFooter` component explaining its purpose (footer section for a Sheet).
*   **Line 84:** Add JSDoc for `SheetTitle` component explaining its purpose (title element for a Sheet).
*   **Line 94:** Add JSDoc for `SheetDescription` component explaining its purpose (description text for a Sheet).

### File: `/workspaces/Erinpart2/components/vibes/vibe-card.tsx`
*   **Line 9:** Add JSDoc for `VibeCard` component explaining its purpose (displays a single vibe as a card).
*   **Line 5:** Add JSDoc for `Vibe` interface explaining its properties.
*   **Line 11:** Add JSDoc for `VibeCardProps` interface explaining its properties.

### File: `/workspaces/Erinpart2/components/vibes/vibe-editor.tsx`
*   **Line 7:** Add JSDoc for `VibeEditor` component explaining its purpose (a form component for editing vibe details).

### File: `/workspaces/Erinpart2/components/vibes/vibe-selector.tsx`
*   **Line 19:** Add JSDoc for `getVibeIcon` function explaining its purpose (returns the appropriate Lucide icon component based on vibe category).
*   **Line 29:** Add JSDoc for `getVibeColor` function explaining its purpose (returns Tailwind CSS gradient classes based on vibe category).
*   **Line 40:** Add JSDoc for `VibeSelector` component explaining its purpose (allows users to browse and select different vibe themes, with category expansion and owner controls).
*   **Line 45:** Add a comment explaining `hoveredVibe` (state for tracking which vibe is currently hovered for preview).
*   **Line 46:** Add a comment explaining `expandedCategory` (state for tracking which vibe category is expanded).
*   **Line 49:** Add a comment explaining `vibesByCategory` (memoized grouping of vibes by their category).
*   **Line 58:** Add JSDoc for `handleVibeChange` function explaining its purpose (handles vibe selection and calls the `onVibeChange` callback).

### File: `/workspaces/Erinpart2/hooks/use-mobile.ts`
*   **Line 5:** Add JSDoc for `useMobile` hook explaining its purpose (a custom React hook to detect if the current viewport width is below a specified breakpoint, indicating a mobile device).
*   **Line 7:** Add a comment explaining `breakpoint` parameter.
*   **Line 10:** Add a comment explaining `checkScreenSize` function (updates `isMobile` state based on window width).
*   **Line 14:** Add a comment explaining `useEffect` (sets up and cleans up resize event listener).

### File: `/workspaces/Erinpart2/jest.setup.ts`
*   **Line 3:** Add a comment explaining why `ResizeObserver` is mocked (JSDOM does not implement it, preventing test failures).

### File: `/workspaces/Erinpart2/lib/mock-data.ts`
*   **Line 7:** Add JSDoc for `mockUsers` explaining its purpose (mock data for user profiles).
*   **Line 17:** Add JSDoc for `mockSessions` explaining its purpose (mock data for collaborative sessions).
*   **Line 28:** Add JSDoc for `mockTasks` explaining its purpose (mock data for tasks within a session).
*   **Line 90:** Add JSDoc for `mockVibes` explaining its purpose (mock data for Vibe templates).

### File: `/workspaces/Erinpart2/lib/toast.tsx`
*   **Line 6:** Add JSDoc for `ToastOptions` interface explaining its properties.
*   **Line 12:** Add JSDoc for `ToastComponent` explaining its purpose (a React component for rendering custom toast notifications).
*   **Line 13:** Add JSDoc for `getToastStyles` function explaining its purpose (returns Tailwind CSS classes for toast styling based on type).
*   **Line 24:** Add JSDoc for `getIcon` function explaining its purpose (returns an emoji icon based on toast type).
*   **Line 58:** Add JSDoc for `toast` object explaining its purpose (a utility object for displaying various types of toast notifications).
*   **Line 59:** Add JSDoc for `toast.success` function.
*   **Line 69:** Add JSDoc for `toast.error` function.
*   **Line 79:** Add JSDoc for `toast.info` function.
*   **Line 89:** Add JSDoc for `toast.warning` function.

### File: `/workspaces/Erinpart2/lib/utils.ts`
*   **Line 5:** Add JSDoc for `cn` function explaining its purpose (a utility function to conditionally join Tailwind CSS classes).
