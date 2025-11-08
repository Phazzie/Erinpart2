# Deployment Guide for Erin's Escapades

## Overview
This application is now fully configured for deployment to **Vercel** or **DigitalOcean App Platform**. All security issues have been fixed and the build process is working correctly.

---

## Prerequisites

### 1. Supabase Project Setup
You need a Supabase project with the database schema applied.

**Steps:**
1. Create a Supabase project at https://supabase.com
2. Apply the database schema from `supabase-schema-TO-APPLY.sql`
3. Enable Realtime for tables: `tasks`, `task_choices`, `collaborative_lists`, `list_items`, `list_item_verifications`
4. Get your credentials from Project Settings > API:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Deployment Options

### Option 1: Deploy to Vercel (Recommended)

**Why Vercel?**
- Native Next.js support
- Automatic HTTPS
- Global CDN
- Zero configuration needed
- Free tier available

**Steps:**

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Set Environment Variables in Vercel Dashboard**:
   - Go to your project settings
   - Add these environment variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
     NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
     ```

3. **Deploy**:
   ```bash
   # Via CLI
   npm run deploy:prod

   # Or via Git
   - Connect your GitHub repo to Vercel
   - Push to main branch
   - Vercel auto-deploys
   ```

4. **Verify**:
   - Visit your deployed URL
   - Check that the app loads
   - Test creating a session

---

### Option 2: Deploy to DigitalOcean App Platform

**Why DigitalOcean?**
- Full Docker support
- Dedicated resources
- Predictable pricing

**Steps:**

1. **Set Environment Secrets in DigitalOcean**:
   - Go to DigitalOcean App Platform
   - Create or edit your app
   - Add these environment variables:
     ```
     SUPABASE_URL=https://your-project.supabase.co
     SUPABASE_ANON_KEY=your_anon_key
     ```

2. **Deploy**:
   - Push to your GitHub repository
   - DigitalOcean auto-deploys from `.do/app.yaml`

3. **Verify**:
   - Check build logs
   - Visit your app URL
   - Test functionality

---

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://abcdef.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | `eyJhbGciOiJIUzI1NiI...` |
| `NEXT_PUBLIC_SITE_URL` | Your deployed app URL | `https://your-app.vercel.app` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_ENABLE_GOOGLE` | Enable Google OAuth | `false` |
| `ENABLE_TRAP_LOGIN` | Enable demo trap login | `false` |

---

## Security Checklist ✅

The following security fixes have been applied:

- ✅ **Hardcoded credentials removed** from `.do/app.yaml`
- ✅ **Credentials removed** from documentation files
- ✅ **Security headers added** to `next.config.mjs`
- ✅ **Next.js SSRF vulnerability** fixed (upgraded to 14.2.33)
- ✅ **Cryptographic randomness** implemented for animal shuffling
- ✅ **TypeScript strict mode** enabled and passing
- ✅ **Vercel deployment configuration** added (`vercel.json`)
- ✅ **Public assets** added (favicon, robots.txt)
- ✅ **Environment template** created (`.env.local`)

---

## Build Verification

Before deploying, verify the build locally:

```bash
# Install dependencies
npm ci

# Run checks
npm run typecheck  # TypeScript validation
npm run lint       # ESLint validation
npm run build      # Production build

# Run locally
npm run dev        # Development server
```

**Expected Output:**
- ✅ TypeScript: No errors
- ✅ ESLint: No warnings or errors
- ✅ Build: Successful compilation
- ✅ All pages render without errors

---

## Post-Deployment Checklist

After deploying, verify:

1. **Application Loads**
   - [ ] Home page displays correctly
   - [ ] No console errors in browser

2. **Authentication Works**
   - [ ] Can select animals and enter name
   - [ ] Session is created

3. **Real-time Features**
   - [ ] Tasks sync across multiple tabs
   - [ ] Presence indicator shows active users

4. **Collaborative Lists**
   - [ ] Can create lists
   - [ ] Can add items
   - [ ] Verification works

5. **Security Headers**
   - [ ] Check headers: `curl -I https://your-app.vercel.app`
   - [ ] Verify `X-Frame-Options`, `X-Content-Type-Options` present

---

## Troubleshooting

### Build Fails with "Invalid URL"
**Cause:** Missing or invalid Supabase URL in environment variables

**Fix:**
1. Verify environment variables are set correctly
2. Check `.env.local` has valid URLs (not placeholders)
3. For Vercel: Check project settings → Environment Variables

### Real-time Not Working
**Cause:** Supabase Realtime not enabled for tables

**Fix:**
1. Go to Supabase Dashboard → Database → Replication
2. Enable Realtime for: `tasks`, `task_choices`, `collaborative_lists`, `list_items`, `list_item_verifications`

### Database Errors
**Cause:** Row Level Security (RLS) policies not applied

**Fix:**
1. Ensure you applied the full schema from `supabase-schema-TO-APPLY.sql`
2. Check that RLS is enabled on all tables
3. Verify policies are created

---

## Performance Optimization

For production deployments:

1. **Enable Caching**:
   - Vercel automatically caches static assets
   - DigitalOcean: Configure CDN if needed

2. **Monitor Performance**:
   - Use Vercel Analytics
   - Monitor Supabase usage

3. **Database Optimization**:
   - Ensure indexes are applied (already in schema)
   - Monitor query performance in Supabase dashboard

---

## Next Steps

After successful deployment:

1. **Share Your App**: Send the URL to collaborators
2. **Monitor Usage**: Check Supabase and hosting dashboards
3. **Iterate**: Based on user feedback, add features
4. **Scale**: Upgrade hosting plan as needed

---

## Support

For issues:
- Check this guide first
- Review error logs in deployment platform
- Check Supabase logs for database errors
- Review `docs/troubleshooting.md` for common issues

---

**Last Updated**: November 8, 2025
**Build Status**: ✅ Production Ready
**Security Audit**: ✅ Passed
