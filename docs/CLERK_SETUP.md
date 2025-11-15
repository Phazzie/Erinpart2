# Clerk Authentication Setup Guide

This guide explains how to set up Clerk authentication for Erin's Escapades.

## Overview

Erin's Escapades uses **Clerk** for user authentication and **Supabase** for the database. This separation allows us to leverage Clerk's powerful authentication features while maintaining our data in Supabase.

---

## 🔑 Getting Your Clerk API Keys

### 1. Create a Clerk Account

If you don't have one already:
- Visit [https://clerk.com](https://clerk.com)
- Sign up for a free account
- Create a new application for this project

### 2. Get Your API Keys

1. Go to the Clerk Dashboard: [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **API Keys** section: [Direct Link](https://dashboard.clerk.com/last-active?path=api-keys)
4. You'll see two types of keys:

   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
     - Safe to expose in client-side code
     - Used to initialize Clerk on the frontend

   - **Secret Key** (starts with `sk_test_` or `sk_live_`)
     - **NEVER expose this in client-side code**
     - Only use on the server
     - Provides full API access to your Clerk instance

---

## 🛠️ Local Development Setup

### Step 1: Create Your Local Environment File

```bash
# Copy the example file to create your local environment
cp .env.example .env.local
```

**IMPORTANT**: `.env.local` is in `.gitignore` and should **NEVER** be committed to version control!

### Step 2: Fill in Your Clerk Keys

Open `.env.local` and replace the placeholders with your actual Clerk keys:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_ACTUAL_SECRET_HERE
```

### Step 3: Configure Supabase Database

While you're in `.env.local`, also add your Supabase credentials for database access:

```env
# Supabase Database (Clerk handles auth, Supabase is DB only)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
```

Find these in your Supabase project: **Project Settings > API**

---

## 🌐 Production Deployment (Vercel)

### Step 1: Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings > Environment Variables**
3. Add the following variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Your Clerk publishable key | Production, Preview, Development |
| `CLERK_SECRET_KEY` | Your Clerk secret key | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | Production, Preview |

### Step 2: Configure Clerk Domain

In your Clerk Dashboard:
1. Go to **Domains**
2. Add your Vercel domain (e.g., `your-app.vercel.app`)
3. Add your custom domain if you have one

---

## 📝 Environment Variables Reference

### Clerk Variables

| Variable | Required | Description | Exposed to Client? |
|----------|----------|-------------|-------------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ Yes | Initializes Clerk on the client | ✅ Yes (safe) |
| `CLERK_SECRET_KEY` | ✅ Yes | Server-side authentication | ❌ No (secret) |

### Supabase Variables (Database Only)

| Variable | Required | Description | Exposed to Client? |
|----------|----------|-------------|-------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Your Supabase project URL | ✅ Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Public anon key for DB access | ✅ Yes (safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ Optional | Admin access to DB (bypass RLS) | ❌ No (secret) |

### Other Variables

| Variable | Required | Description | Exposed to Client? |
|----------|----------|-------------|-------------------|
| `NEXT_PUBLIC_SITE_URL` | ⚠️ Optional | Base URL for share links | ✅ Yes |

---

## 🔒 Security Best Practices

### ✅ DO:
- Store real API keys in `.env.local` (never committed)
- Use environment variables in Vercel for production
- Keep `CLERK_SECRET_KEY` server-side only
- Rotate keys if they're ever exposed
- Use test keys (`pk_test_*`, `sk_test_*`) during development

### ❌ DON'T:
- Commit `.env.local` to git
- Hard-code API keys in your code
- Expose secret keys in client-side code
- Share keys in screenshots or public documentation
- Use production keys in development

---

## 🧪 Testing Your Setup

After configuring your environment variables:

```bash
# Start the development server
npm run dev

# Visit http://localhost:3000
# Try signing up or logging in
```

If everything is configured correctly:
- You should see Clerk's authentication UI
- After signing in, you should be able to access protected routes
- User data should sync with your Supabase database

---

## 🆘 Troubleshooting

### "Clerk: Missing publishable key"
- Make sure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set in `.env.local`
- Restart your development server after adding env vars

### "Clerk: Invalid secret key"
- Verify your `CLERK_SECRET_KEY` is correct
- Make sure you're using the right key for your environment (test vs production)

### "Supabase client not initialized"
- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Verify the URL format: `https://your-project.supabase.co`

### Authentication works but database errors
- Ensure your Supabase RLS policies allow Clerk-authenticated users
- Check that user IDs are properly synced between Clerk and Supabase

---

## 📚 Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk + Next.js Guide](https://clerk.com/docs/quickstarts/nextjs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

---

## 🔄 Migrating from Supabase Auth

If you're migrating from Supabase Auth to Clerk:

1. Export your existing users from Supabase (if needed)
2. Set up Clerk as described above
3. Configure user sync between Clerk and your Supabase users table
4. Update RLS policies to use Clerk user IDs instead of Supabase auth.uid()
5. Test authentication flows thoroughly before deploying

See the migration guide in `/docs/migration-supabase-to-clerk.md` (if available) for detailed steps.
