# 🚀 Pre-Deployment Checklist - Erin's Escapades

Use this checklist to ensure everything is ready before deploying to Digital Ocean.

## 📋 Database Setup

- [ ] **Supabase project is active** (not paused)
  - Go to: https://supabase.com/dashboard/project/pticifvppekrgqaeotjr
  - Status should show "Active" or "Healthy"
  
- [ ] **Database schema applied**
  - Run: `npm run db:print`
  - Copy SQL output
  - Paste into Supabase SQL Editor
  - Click "Run"
  - Verify no errors
  
- [ ] **Realtime enabled for tables**
  - Go to: Database → Replication → Realtime
  - Enable for: `tasks` ✅
  - Enable for: `task_choices` ✅

- [ ] **Test database connection locally**
  ```bash
  npm run dev
  # Visit http://localhost:3000
  # Try creating a task
  # Verify it works
  ```

---

## 🔐 Security & Credentials

- [ ] **Environment variables documented**
  - ✅ NEXT_PUBLIC_SUPABASE_URL (in .env.local)
  - ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY (in .env.local)
  - ✅ NEXT_PUBLIC_SITE_URL (will be DO URL)

- [ ] **.gitignore updated**
  - ✅ .env.local ignored
  - ✅ .vscode/settings.json ignored (for API tokens)
  - ✅ No secrets in git history

- [ ] **Digital Ocean API token ready** (for MCP deployment)
  - Go to: https://cloud.digitalocean.com/account/api/tokens
  - Generate token with Read & Write permissions
  - Copy for VS Code MCP configuration

---

## 🐳 Docker & Build

- [ ] **Docker build succeeds**
  ```bash
  docker build -t erins-escapades .
  # Should complete without errors
  ```

- [ ] **Production build works**
  ```bash
  npm run build
  # Should show ✓ Compiled successfully
  ```

- [ ] **Test Docker container locally** (optional but recommended)
  ```bash
  docker-compose up --build
  # Visit http://localhost:3000
  # Verify app loads
  ```

---

## 📦 Code Quality

- [ ] **No TypeScript errors**
  ```bash
  npm run typecheck
  # Should show no errors
  ```

- [ ] **Tests passing** (at least core tests)
  ```bash
  npm test
  # Verify majority pass (some test issues are known and safe)
  ```

- [ ] **All changes committed**
  ```bash
  git status
  # Should show working tree clean or only known uncommitted files
  ```

---

## 🌐 Digital Ocean Setup

- [ ] **Digital Ocean account created**
  - Sign up at: https://cloud.digitalocean.com/

- [ ] **Payment method added** (even for free credits)
  - Required to create apps

- [ ] **API token generated**
  - Name: GitHub Copilot MCP
  - Permissions: Read and Write
  - Expiration: Your choice (30/90 days or never)

- [ ] **MCP Server configured** (optional, for auto-deployment)
  - Token added to `.vscode/settings.json`
  - VS Code window reloaded

---

## 📝 Documentation Ready

- [ ] **Deployment guide reviewed**
  - File: `docs/deploy-digitalocean.md`
  - Understand the steps

- [ ] **Quick deploy guide ready**
  - File: `QUICK_DEPLOY.md`
  - Have it open for reference

- [ ] **Environment variables list ready**
  - Know what to set in Digital Ocean:
    - NEXT_PUBLIC_SITE_URL
    - NEXT_PUBLIC_SUPABASE_URL
    - NEXT_PUBLIC_SUPABASE_ANON_KEY
    - NEXT_PUBLIC_ENABLE_GOOGLE=false

---

## 🎯 Deployment Steps (when ready)

### Method A: With MCP Server (Automated)
- [ ] MCP server configured with DO token
- [ ] Ask Copilot: "Deploy this app to Digital Ocean"
- [ ] Copilot handles it automatically! 🎉

### Method B: Manual via DO Console
- [ ] Go to: https://cloud.digitalocean.com/apps
- [ ] Click "Create App"
- [ ] Connect GitHub repository
- [ ] Select repo and branch
- [ ] Verify Dockerfile detected
- [ ] Add environment variables
- [ ] Click "Create Resources"
- [ ] Wait for deployment (~10 minutes)

---

## ✅ Post-Deployment Verification

After deployment completes:

- [ ] **App URL accessible**
  - Visit: `https://your-app.ondigitalocean.app`
  - Page loads without errors

- [ ] **Supabase connection works**
  - Update Supabase auth redirect URL
  - Go to: Supabase → Authentication → URL Configuration
  - Add: `https://your-app.ondigitalocean.app/auth/callback`

- [ ] **Animal code auth works**
  - Pick 3 animals
  - Enter username
  - Join session successfully

- [ ] **Task creation works**
  - Create a task
  - Verify it saves

- [ ] **Realtime updates work**
  - Open in two browsers/windows
  - Create task in one
  - Verify it appears in the other

- [ ] **Mobile responsive**
  - Test on mobile device or browser dev tools
  - Verify layout works

---

## 🎉 Launch Checklist

- [ ] **Share URL with friends/testers**
- [ ] **Monitor Digital Ocean logs** for first hour
  - Apps → Your App → Runtime Logs
  
- [ ] **Check Supabase usage**
  - Dashboard → Settings → Usage
  - Verify within free tier limits

- [ ] **Set up monitoring** (optional)
  - Digital Ocean alerts
  - Uptime monitoring (e.g., UptimeRobot)

---

## 📊 Current Status

**Last Updated:** [Fill in when checking]

### Quick Status Check:
```bash
# Run these commands to verify readiness:
npm run build          # Should PASS
npm run typecheck      # Should PASS
docker build -t test . # Should succeed
git status            # Check what's uncommitted
```

### Status Summary:
- [ ] Supabase: Active
- [ ] Database: Schema applied
- [ ] Docker: Builds successfully
- [ ] Secrets: Secured in .gitignore
- [ ] DO Account: Ready
- [ ] Ready to deploy! 🚀

---

## 🆘 If Something Goes Wrong

1. **Check Digital Ocean build logs** (most common issues show here)
2. **Review** `docs/deploy-digitalocean.md` troubleshooting section
3. **Verify environment variables** are set correctly
4. **Check Supabase** is active and healthy
5. **Test locally** with Docker first

---

## 💡 Pro Tips

- ✅ Test locally with Docker before deploying
- ✅ Deploy to DO's free preview first, then promote to production
- ✅ Keep Supabase credentials secure
- ✅ Monitor logs during first deployment
- ✅ Have this checklist open during deployment

---

**Ready to deploy?** Check off all items above, then let's go live! 🚀
