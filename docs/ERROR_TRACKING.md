# Error Tracking Setup Guide

This guide outlines how to set up error tracking for Erin's Escapades in production.

## Overview

Error tracking helps you monitor, debug, and fix issues in production by capturing errors, stack traces, and context automatically.

## Recommended Service: Sentry

Sentry is a popular error tracking service that integrates well with Next.js applications. However, you can choose any error tracking service that fits your needs.

## Setup Instructions

### 1. Create a Sentry Account

1. Go to [sentry.io](https://sentry.io) and create an account
2. Create a new project and select "Next.js" as the platform
3. Note your DSN (Data Source Name) - you'll need this for configuration

### 2. Install Sentry SDK

```bash
npm install @sentry/nextjs
```

### 3. Initialize Sentry

Run the Sentry wizard to automatically configure your project:

```bash
npx @sentry/wizard@latest -i nextjs
```

This will create the following files:
- `sentry.client.config.ts` - Client-side configuration
- `sentry.server.config.ts` - Server-side configuration
- `sentry.edge.config.ts` - Edge runtime configuration
- Updated `next.config.mjs` - Adds Sentry webpack plugin

### 4. Configure Environment Variables

Add the following environment variables to your deployment platform and `.env.local`:

```env
# Sentry Configuration
SENTRY_DSN=your_sentry_dsn_here
SENTRY_ORG=your_organization_slug
SENTRY_PROJECT=your_project_name

# Optional: Control error reporting
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
SENTRY_AUTH_TOKEN=your_auth_token_here
```

### 5. Update .gitignore

Ensure sensitive Sentry files are not committed:

```
# Sentry
.sentryclirc
sentry.properties
```

## Alternative Services

If you prefer a different error tracking service, consider:

### LogRocket
- Combines error tracking with session replay
- Great for debugging user interactions
- Website: [logrocket.com](https://logrocket.com)

### Rollbar
- Simple setup and good error grouping
- Website: [rollbar.com](https://rollbar.com)

### Bugsnag
- Good for mobile and web applications
- Website: [bugsnag.com](https://bugsnag.com)

## Custom Error Tracking

If you prefer to build your own error tracking, you can create an API endpoint:

### Create Error Logging Endpoint

**File:** `app/api/errors/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const errorData = await request.json();

    // Log to your preferred service or database
    console.error('Client Error:', errorData);

    // You can also store in your database
    // await supabase.from('errors').insert({
    //   message: errorData.message,
    //   stack: errorData.stack,
    //   user_agent: request.headers.get('user-agent'),
    //   timestamp: new Date().toISOString(),
    // });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging failed:', error);
    return NextResponse.json(
      { error: 'Failed to log error' },
      { status: 500 }
    );
  }
}
```

### Client-Side Error Handler

**File:** `app/error.tsx` (Already exists - enhance it)

```typescript
'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Send error to your tracking service
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        digest: error.digest,
        timestamp: new Date().toISOString(),
      }),
    }).catch(console.error);
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 border border-red-500 rounded-lg p-6">
        <h2 className="text-xl font-bold text-red-500 mb-4">Something went wrong!</h2>
        <p className="text-gray-300 mb-4">{error.message}</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
```

## Best Practices

### 1. Set Up Error Boundaries
Place error boundaries at strategic points in your component tree to catch and handle errors gracefully.

### 2. Add Context to Errors
Include useful context when logging errors:
- User ID (if authenticated)
- URL/Route
- User actions leading to error
- Browser/Device information

### 3. Filter Sensitive Data
Never log sensitive information:
- Passwords
- API keys
- Personal identifying information (PII)
- Payment details

### 4. Set Up Alerts
Configure alerts for:
- High error rates
- Critical errors
- New error types
- Errors affecting many users

### 5. Review and Triage Regularly
- Review error reports daily
- Prioritize based on impact
- Track resolution progress
- Update documentation based on common issues

## Integration with Existing Code

The application already has:
- Toast notifications for user-facing errors
- Error boundaries for React errors
- Try-catch blocks in critical paths

Error tracking will complement these by:
- Capturing errors that slip through
- Providing stack traces and context
- Alerting you to production issues
- Tracking error trends over time

## Deployment Checklist

Before deploying with error tracking:

- [ ] Choose error tracking service
- [ ] Install and configure SDK
- [ ] Add environment variables
- [ ] Test error reporting in staging
- [ ] Set up alerts and notifications
- [ ] Configure error filtering/sampling
- [ ] Document team access and procedures
- [ ] Set up integration with issue tracker (GitHub, Jira, etc.)

## Support

For service-specific documentation:
- Sentry Next.js Docs: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- LogRocket Next.js Docs: https://docs.logrocket.com/docs/nextjs
- Rollbar Next.js Docs: https://docs.rollbar.com/docs/nextjs

## Notes

Error tracking is essential for production applications but is intentionally left as a manual setup step because:
1. Service choice depends on your budget and requirements
2. Requires creating external accounts
3. Needs careful configuration of sensitive data filtering
4. Should be tested in staging before production deployment
