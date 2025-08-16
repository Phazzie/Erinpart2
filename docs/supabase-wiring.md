# RFC: Supabase Integration for Authentication and Task Management

**Date:** 2025-08-15
**Author:** Gemini

## 1. Introduction

This RFC proposes a plan to replace the current mock data implementation with a Supabase backend for user authentication and task management. This change will enable persistent data, real-time collaboration, and a more robust feature set for Erin's Escapades.

## 2. Data Model

We will create the following tables in our Supabase project.

### `users`

Stores public user profile information.

| Column      | Type      | Constraints                | Description                                  |
|-------------|-----------|----------------------------|----------------------------------------------|
| `id`        | `uuid`    | Primary Key, `auth.users.id` | Foreign key to the `auth.users` table.       |
| `updated_at`| `timestamptz`| Not Null                   | Timestamp of the last profile update.        |
| `username`  | `text`    | Unique, Not Null           | Public username for display.                 |
| `avatar_url`| `text`    |                            | URL for the user's avatar image.             |

### `sessions`

Stores the core session data.

| Column      | Type        | Constraints              | Description                                  |
|-------------|-------------|--------------------------|----------------------------------------------|
| `id`        | `uuid`      | Primary Key, Default `gen_random_uuid()` | Unique identifier for the session.           |
| `created_at`| `timestamptz` | Not Null, Default `now()`| Timestamp of session creation.               |
| `host_id`   | `uuid`      | Not Null, Foreign Key to `users.id` | The user who created the session.            |
| `day_vibe`  | `jsonb`     |                          | The selected vibe for the day.               |
| `session_code` | `text`   | Unique, Not Null         | Short, shareable code for joining a session. |

### `tasks`

Stores tasks associated with a session.

| Column      | Type        | Constraints              | Description                                  |
|-------------|-------------|--------------------------|----------------------------------------------|
| `id`        | `uuid`      | Primary Key, Default `gen_random_uuid()` | Unique identifier for the task.              |
| `session_id`| `uuid`      | Not Null, Foreign Key to `sessions.id` | The session this task belongs to.            |
| `created_by`| `uuid`      | Not Null, Foreign Key to `users.id` | The user who created the task.               |
| `title`     | `text`      | Not Null                 | The content of the task.                     |
| `is_complete`| `boolean`  | Not Null, Default `false`| Whether the task is completed.               |
| `completed_at`| `timestamptz`|                         | Timestamp of when the task was completed.    |

## 3. Authentication Flow

We will use Supabase's built-in authentication.

1.  **Sign-up:** Users can sign up with email/password or via Google OAuth. A new entry will be created in `auth.users` and a corresponding public profile in our `users` table.
2.  **Login:** Users can log in using their credentials or OAuth.
3.  **Session Management:** The user's session will be managed by Supabase's JWT-based session handling. The client will store the session token and use it for authenticated requests.
4.  **Row-Level Security (RLS):** We will implement RLS policies on all tables to ensure users can only access and modify their own data.

## 4. Migration Plan

The migration from mock data to Supabase will be performed in the following phases:

1.  **Environment Setup:**
    *   Create a new Supabase project.
    *   Add Supabase project URL and `anon` key to a `.env.local` file, using `.env.example` as a template.
2.  **Schema Setup:**
    *   Apply the data model defined above to the Supabase project using SQL migration scripts.
3.  **Client-Side Integration:**
    *   **Authentication:**
        *   Update `lib/supabase/client.ts` to initialize the Supabase client.
        *   Refactor `components/auth/signup-form.tsx` and `components/auth/login-form.tsx` to use the `supabase.auth.signUp` and `supabase.auth.signInWithPassword` methods.
        *   Integrate Google OAuth using `supabase.auth.signInWithOAuth`.
        *   Replace mock user logic in `hooks/use-session.ts` with calls to `supabase.auth.getUser()` and `supabase.auth.onAuthStateChange`.
    *   **Task Management:**
        *   Refactor `hooks/use-tasks.ts` to perform CRUD operations on the `tasks` table using the Supabase client (`supabase.from('tasks')...`).
        *   Enable real-time updates for tasks using Supabase Realtime subscriptions.
4.  **Testing:**
    *   Update existing tests in `components/auth/*.test.tsx` and `hooks/use-tasks.test.ts` to mock Supabase client calls instead of using static mock data.
    *   Add new integration tests to verify the end-to-end flow.
5.  **Removal of Mock Data:**
    *   Once the integration is complete and verified, remove `lib/mock-data.ts` and all its usages.

## 5. API Changes and UI Impact

This change is primarily a backend replacement. We will strive to keep the public props of our components the same to minimize the impact on the UI.

-   **`use-tasks.ts`:** The hook's interface (`tasks`, `addTask`, `updateTask`) will remain the same, but its internal implementation will change.
-   **`use-session.ts`:** The hook's interface will be updated to reflect the asynchronous nature of fetching a user session from Supabase.
-   **Component Props:** No major changes to component props are anticipated.

## 6. Risks and Mitigation

-   **Security:** RLS policies must be carefully implemented and tested to prevent data leaks.
    -   **Mitigation:** We will write tests for our RLS policies.
-   **Data Migration:** Not applicable for the initial launch, but a plan will be needed if we ever migrate from this Supabase project.
-   **Performance:** We will need to create appropriate database indexes on frequently queried columns (`session_id`, `created_by`).
    -   **Mitigation:** We will monitor query performance using the Supabase dashboard.
