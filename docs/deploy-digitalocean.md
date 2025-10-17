# Deploying Erin's Escapades to Digital Ocean

> **LAST UPDATED:** October 2025 - Reflects production-ready deployment with animal code authentication

This guide covers deployment to **Digital Ocean App Platform** using Docker containers.

## Prerequisites

- Digital Ocean account ([sign up here](https://www.digitalocean.com/))
- Supabase project with database schema applied
- GitHub repository connected to Digital Ocean
- Your Supabase credentials (URL and anon key)

---

## Option A: Deploy via Digital Ocean App Platform (Recommended)

### Step 1: Verify Your Supabase Database

Your Supabase database should already be configured with:
- `sessions` table (for session management)
- `tasks` table (for task CRUD)
- `task_choices` table (for yes/no/maybe voting)
- RLS policies for security
- Realtime enabled on `tasks` and `task_choices`

**If setting up fresh**, apply the schema from your Supabase SQL Editor.

### Step 2: Create App on Digital Ocean

1. **Log into Digital Ocean Console**
   - Go to [Apps](https://cloud.digitalocean.com/apps)
   - Click **Create App**

2. **Connect Your GitHub Repository**
   - Choose GitHub as source
   - Select your repository
   - Choose the branch (e.g., `main` or your deployment branch)

3. **Configure Build Settings**
   - **Type**: Web Service
   - **Dockerfile Path**: `Dockerfile` (default)
   - **HTTP Port**: `3000`
   - **Build Command**: (leave empty, Dockerfile handles it)
   - **Run Command**: (leave empty, Dockerfile handles it)

### Step 3: Set Environment Variables

In the Digital Ocean App Platform console, add these environment variables:

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `NEXT_PUBLIC_SITE_URL` | `https://your-app.ondigitalocean.app` | Your DO app URL |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | From Supabase Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | From Supabase Project Settings → API |
| `NODE_ENV` | `production` | Auto-set by DO, but verify |

**Where to find Supabase credentials:**
- Go to your Supabase project
- Settings → API
- Copy the **Project URL** and **anon/public key**

### Step 4: Configure App Settings

1. **Resource Size**
   - For testing: Basic (512 MB RAM, 1 vCPU) - ~$5/month
   - For production: Professional (1 GB RAM, 1 vCPU) - ~$12/month

2. **Region**
   - Choose closest to your Supabase region for best performance

3. **HTTP Routes**
   - Keep default `/` route
   - HTTPS will be auto-configured

### Step 5: Deploy

1. Click **Next** → Review settings
2. Click **Create Resources**
3. Wait for build and deployment (5-10 minutes first time)
4. Digital Ocean will provide you with a URL: `https://your-app.ondigitalocean.app`

### Step 6: Configure Supabase Authentication (Important!)

1. **Update Supabase Auth Settings**
   - Go to Supabase → Authentication → URL Configuration
   - **Site URL**: `https://your-app.ondigitalocean.app`
   - **Redirect URLs**: Add these:
     - `https://your-app.ondigitalocean.app/auth/callback`
     - `http://localhost:3000/auth/callback` (for local dev)

**Note:** This app uses **animal code authentication** (no OAuth), so no Google Cloud configuration needed.

### Step 7: Verify Deployment

1. Visit your app URL: `https://your-app.ondigitalocean.app`
2. Test the animal code authentication:
   - Pick 3 animals (e.g., 🦊🐼🦁) and enter a username
   - Click "Join the Chaos!"
3. Create a session:
   - Enter a session name
   - Add tasks to test CRUD operations
4. Test realtime updates:
   - Open the same session in two different browsers/incognito windows
   - Add/edit/delete tasks in one window
   - Verify changes appear instantly in the other window
5. Test yes/no/maybe voting on tasks across both windows

---

## Option B: Deploy to Digital Ocean Droplet (Advanced)

### Using Docker Compose on a Droplet

1. **Create a Droplet**
   - Ubuntu 22.04 LTS
   - Install Docker and Docker Compose

2. **Clone Your Repository**
   ```bash
   git clone https://github.com/yourusername/erins-escapades.git
   cd erins-escapades
   ```

3. **Create Environment File**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   nano .env
   ```

4. **Build and Run**
   ```bash
   docker-compose up -d --build
   ```

5. **Set Up Nginx Reverse Proxy** (recommended)
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **Enable SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

## Testing Locally with Docker

Before deploying, test the Docker container locally:

```bash
# Build the image
docker build -t erins-escapades .

# Run with environment variables
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SITE_URL=http://localhost:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_supabase_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key \
  erins-escapades

# Or use docker-compose
docker-compose up --build
```

Visit `http://localhost:3000` to test.

---

## Troubleshooting

### Build Fails on Digital Ocean

**Issue**: Build times out or fails
- **Solution**: Check Digital Ocean build logs for specific errors
- **Common causes**:
  - Missing `package-lock.json` (commit it)
  - Node version mismatch (Dockerfile uses Node 20)
  - Out of memory (upgrade resource tier)

### App Runs But Can't Connect to Supabase

**Issue**: Errors like "Supabase is not configured"
- **Solution**: Verify environment variables are set correctly in DO App Platform
- Check that variables are **not** encrypted-only (they should be visible)
- Rebuild the app after adding variables

### Realtime Updates Not Working

**Issue**: Tasks don't sync between browsers
- **Solution**: 
  1. Enable Realtime in Supabase for `tasks` and `task_choices` tables
  2. Check browser console for WebSocket errors
  3. Verify RLS policies allow reads (should be `FOR SELECT USING (true)`)

### Authentication Issues

**Issue**: Animal code login fails or doesn't persist
- **Solution**: 
  1. Check browser console for errors
  2. Verify localStorage is working (not in private browsing)
  3. Check Supabase connection (network tab)

### Port Issues

**Issue**: Container not accessible
- **Solution**: 
  - Digital Ocean App Platform expects port 3000 (configured in Dockerfile)
  - Don't change the `PORT` environment variable
  - Verify HTTP Route is set to `/` in DO console

---

## Monitoring and Logs

### View Application Logs
- Digital Ocean Console → Your App → Runtime Logs
- Shows real-time application output
- Filter by severity (info, error, warning)

### Check Container Health
- Digital Ocean shows health status
- Health check pings `http://localhost:3000` every 30s
- If unhealthy, container auto-restarts

### Performance Monitoring
- Digital Ocean provides basic metrics (CPU, RAM, bandwidth)
- Consider adding external monitoring (e.g., Sentry, LogRocket)

---

## Scaling and Performance

### Auto-Scaling (App Platform Pro)
- Digital Ocean can auto-scale based on load
- Configure in App Platform console
- Minimum 1 instance, maximum based on your plan

### Database Optimization
- Ensure indexes exist (schema includes them)
- Monitor Supabase dashboard for slow queries
- Consider upgrading Supabase tier for more connections

### CDN and Caching
- Digital Ocean App Platform includes CDN
- Static assets automatically cached
- Configure cache headers in `next.config.mjs` if needed

---

## Cost Estimation

| Component | Monthly Cost |
|-----------|--------------|
| DO App Platform (Basic) | ~$5 |
| DO App Platform (Professional) | ~$12 |
| Supabase (Free tier) | $0 |
| Supabase (Pro) | $25 |
| Domain (optional) | ~$12/year |

**Recommended for production**: Professional tier + Supabase Pro = ~$37/month

---

## Next Steps

1. ✅ Deploy to Digital Ocean App Platform
2. ✅ Configure custom domain (optional)
3. ✅ Set up monitoring and alerts
4. ✅ Configure automatic deployments from GitHub
5. ✅ Add staging environment (create separate DO app)

For questions or issues, check:
- [Digital Ocean App Platform Docs](https://docs.digitalocean.com/products/app-platform/)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Supabase Docs](https://supabase.com/docs)
