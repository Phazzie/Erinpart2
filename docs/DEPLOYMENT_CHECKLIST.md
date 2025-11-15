# Deployment Checklist

Complete this checklist before deploying Erin's Escapades to production.

## Pre-Deployment Checklist

### 1. Code Quality

- [ ] All tests passing (`npm test`)
- [ ] Build succeeds without errors (`npm run build`)
- [ ] No TypeScript errors (`npm run type-check` or `tsc --noEmit`)
- [ ] ESLint passes (`npm run lint`)
- [ ] No console.log statements in production code paths
- [ ] All unused imports removed
- [ ] Code reviewed and approved

### 2. Environment Variables

#### Development Keys Removed

- [ ] No hard-coded API keys in code
- [ ] `.env.local` not committed to git
- [ ] `.env.example` updated with all required variables
- [ ] Test keys replaced with production keys

#### Production Environment Variables Set

**Required Variables:**

- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (production: `pk_live_*`)
- [ ] `CLERK_SECRET_KEY` (production: `sk_live_*`)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`

**Optional Variables:**

- [ ] `NEXT_PUBLIC_SITE_URL` (for share links)
- [ ] `NODE_ENV=production` (usually auto-set by platform)

### 3. Clerk Configuration

#### Application Setup

- [ ] Production Clerk application created
- [ ] Production domain added to allowed domains
- [ ] Redirect URLs configured:
  - [ ] `https://your-domain.com`
  - [ ] `https://your-domain.com/sign-in`
  - [ ] `https://your-domain.com/sign-up`
- [ ] Email provider configured (if using email auth)
- [ ] OAuth providers configured (if using social auth)

#### JWT Template

- [ ] JWT template named "supabase" created
- [ ] Template includes required claims:
  ```json
  {
    "sub": "{{user.id}}"
  }
  ```
- [ ] Signing key matches Supabase JWT secret
- [ ] Template tested and active

#### Session Settings

- [ ] Session duration configured
- [ ] Multi-session handling configured
- [ ] Sign-out redirect URL set

### 4. Supabase Configuration

#### Database Setup

- [ ] Production database backed up (if migrating)
- [ ] Database migration script applied
- [ ] All tables created successfully:
  - [ ] `users`
  - [ ] `sessions`
  - [ ] `tasks`
  - [ ] `task_choices`
- [ ] `current_user_id()` function exists and works
- [ ] All foreign keys properly configured
- [ ] All indexes created

#### RLS Policies

- [ ] RLS enabled on all tables
- [ ] All 12 policies active and using `current_user_id()`:
  - [ ] Users: 3 policies
  - [ ] Sessions: 3 policies
  - [ ] Tasks: 3 policies
  - [ ] Task_choices: 3 policies
- [ ] Policies tested with sample data
- [ ] Unauthorized access blocked correctly

#### Realtime Setup

- [ ] Realtime enabled for project
- [ ] All required tables in realtime publication:
  - [ ] `users`
  - [ ] `sessions`
  - [ ] `tasks`
  - [ ] `task_choices`
- [ ] `REPLICA IDENTITY FULL` set on realtime tables
- [ ] Realtime tested with multiple clients

#### Connection Settings

- [ ] Connection pooling configured (if needed)
- [ ] API rate limits reviewed
- [ ] Database size and usage monitored

### 5. Application Testing

#### Authentication Flow

- [ ] Guest user can join session via animal codes
- [ ] Guest user can create and modify tasks
- [ ] User can sign up with Clerk
- [ ] User can sign in with Clerk
- [ ] User can sign out
- [ ] Authenticated user can join sessions
- [ ] Session persists across page refreshes
- [ ] Cross-device session works for authenticated users

#### Core Functionality

- [ ] Create new session with animal codes
- [ ] Join existing session
- [ ] Create tasks
- [ ] Update tasks
- [ ] Delete tasks (if applicable)
- [ ] Vote on tasks
- [ ] Secret tasks can be created
- [ ] Secret tasks reveal after vote threshold
- [ ] Drag-and-drop reordering works
- [ ] Task order persists after reorder

#### Real-time Features

- [ ] Multiple users can join same session
- [ ] Tasks sync in real-time across users
- [ ] Updates appear within 1-2 seconds
- [ ] No race conditions or duplicate tasks
- [ ] Optimistic updates work correctly
- [ ] Error handling works when offline

#### User Experience

- [ ] All pages load without errors
- [ ] Mobile responsive design works
- [ ] Animations perform smoothly
- [ ] No broken links
- [ ] Share links work correctly
- [ ] Error messages are user-friendly
- [ ] Loading states display correctly

### 6. Security Verification

#### Authentication Security

- [ ] Unauthorized users cannot access protected routes
- [ ] Users cannot modify other users' data
- [ ] RLS policies block unauthorized database access
- [ ] JWT tokens validated correctly
- [ ] Session hijacking prevented
- [ ] CSRF protection enabled (Clerk handles this)

#### Input Validation

- [ ] User input sanitized to prevent XSS
- [ ] SQL injection prevented (using Supabase client)
- [ ] Animal code format validated
- [ ] User name length validated
- [ ] Task text length validated

#### API Security

- [ ] No secret keys exposed in client code
- [ ] API rate limiting configured
- [ ] CORS configured correctly
- [ ] CSP headers set (check `vercel.json`)

### 7. Performance Optimization

- [ ] Images optimized (if applicable)
- [ ] Bundle size checked (`npm run build`)
- [ ] Lighthouse score > 80 (if applicable)
- [ ] Database queries optimized
- [ ] Proper indexes on frequent queries
- [ ] No N+1 query issues

### 8. Error Tracking

- [ ] Error tracking service configured (optional)
  - Sentry, LogRocket, or similar
- [ ] Client-side errors captured
- [ ] Server-side errors logged
- [ ] Webhook failures monitored (if applicable)

### 9. Documentation

- [ ] README.md updated with current info
- [ ] CLERK_SETUP.md reviewed
- [ ] DATABASE_MIGRATION.md reviewed
- [ ] ANIMAL_CODE_SESSIONS.md reviewed
- [ ] API documentation updated (if applicable)
- [ ] Environment variable documentation complete

### 10. Deployment Platform (Vercel)

#### Project Setup

- [ ] GitHub repository connected
- [ ] Build command configured: `npm run build`
- [ ] Output directory: `.next`
- [ ] Install command: `npm install`
- [ ] Node.js version: 18.x or higher

#### Environment Variables

- [ ] All variables added to Vercel project settings
- [ ] Variables applied to production environment
- [ ] Variables applied to preview environment (optional)
- [ ] Sensitive variables marked as sensitive

#### Domain Configuration

- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] DNS records properly set
- [ ] Domain added to Clerk allowed domains

#### Build Settings

- [ ] Build logs reviewed for warnings
- [ ] Build cache configured
- [ ] Edge functions configured (if used)

## Deployment Steps

### Step 1: Pre-Deployment Verification

1. Run full test suite locally
2. Build production bundle locally
3. Test production build locally
4. Review all checklist items above

### Step 2: Staging Deployment (Recommended)

1. Deploy to staging environment first
2. Test all authentication flows
3. Test all core features
4. Test with multiple users
5. Monitor logs for errors
6. Fix any issues before production

### Step 3: Production Deployment

1. Merge to main branch (if using GitOps)
2. Tag release with version number
3. Deploy to production via platform
4. Monitor deployment logs
5. Wait for build to complete
6. Verify deployment successful

### Step 4: Post-Deployment Verification

1. Visit production URL
2. Test authentication flow
3. Create test session
4. Add test tasks
5. Test real-time sync with second device
6. Verify RLS policies working
7. Check error tracking dashboard
8. Monitor performance metrics

### Step 5: Rollback Plan (If Needed)

If critical issues occur:

1. Immediately revert to previous deployment
2. Document the issue
3. Fix in staging environment
4. Re-test thoroughly
5. Deploy fix to production

## Post-Deployment Monitoring

### First 24 Hours

- [ ] Monitor error rates
- [ ] Check authentication success rate
- [ ] Verify database performance
- [ ] Monitor API rate limits
- [ ] Review user feedback

### First Week

- [ ] Check database growth rate
- [ ] Monitor realtime connection count
- [ ] Review Clerk usage metrics
- [ ] Check Supabase usage metrics
- [ ] Optimize based on metrics

### Ongoing

- [ ] Weekly error log review
- [ ] Monthly security audit
- [ ] Quarterly dependency updates
- [ ] Regular database backups
- [ ] Performance monitoring

## Environment-Specific Configurations

### Development

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_*
CLERK_SECRET_KEY=sk_test_*
# Dev Supabase project
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
```

### Staging

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_*
CLERK_SECRET_KEY=sk_test_*
# Staging Supabase project
NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
```

### Production

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_*
CLERK_SECRET_KEY=sk_live_*
# Production Supabase project
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
```

## Common Issues & Solutions

### Issue: "Clerk: Missing publishable key"

**Solution:**
- Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set
- Ensure variable starts with `NEXT_PUBLIC_`
- Restart build after adding variable

### Issue: "Supabase client not initialized"

**Solution:**
- Check `NEXT_PUBLIC_SUPABASE_URL` is set
- Verify URL format: `https://project.supabase.co`
- Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set

### Issue: RLS policies blocking legitimate access

**Solution:**
- Test `current_user_id()` function returns correct value
- Verify JWT template includes `sub` claim
- Check Clerk JWT signing key matches Supabase

### Issue: Real-time not working

**Solution:**
- Verify realtime enabled in Supabase
- Check tables in realtime publication
- Verify `REPLICA IDENTITY FULL` set
- Check WebSocket connection in browser DevTools

### Issue: Build fails on deployment

**Solution:**
- Check build logs for specific error
- Verify all dependencies in `package.json`
- Check Node.js version compatibility
- Ensure TypeScript compiles without errors

## Success Criteria

Deployment is successful when:

- ✅ All checklist items completed
- ✅ Build succeeds without errors
- ✅ All tests passing
- ✅ Authentication flow works
- ✅ Real-time sync functional
- ✅ RLS policies enforced
- ✅ No critical errors in logs
- ✅ Performance metrics acceptable
- ✅ Multiple users can collaborate
- ✅ Mobile experience smooth

## Emergency Contacts

If issues occur during deployment:

- **Clerk Support**: [support.clerk.com](https://support.clerk.com)
- **Supabase Support**: [supabase.com/dashboard/support](https://supabase.com/dashboard/support)
- **Vercel Support**: [vercel.com/help](https://vercel.com/help)

## Rollback Procedure

### Quick Rollback (Vercel)

1. Go to Vercel Dashboard
2. Navigate to Deployments
3. Find last working deployment
4. Click "..." menu → "Promote to Production"
5. Confirm rollback

### Database Rollback

1. Restore from backup if schema changed
2. Re-apply previous migration
3. Verify data integrity
4. Test authentication flow

## Final Notes

- **Test thoroughly** before production deployment
- **Monitor closely** after deployment
- **Have rollback plan** ready
- **Document issues** for future reference
- **Communicate** with team about deployment

---

**Checklist Version:** 1.0
**Last Updated:** November 14, 2025
**Next Review:** Before production deployment
