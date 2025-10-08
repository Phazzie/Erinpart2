# 🚀 Quick Deploy Guide - Digital Ocean

## ⚡ 5-Minute Deployment Checklist

### Before You Start
- [ ] Digital Ocean account created
- [ ] Supabase database schema applied (run SQL from `docs/supabase-schema.sql`)
- [ ] Supabase realtime enabled for `tasks` and `task_choices` tables

### Deploy to Digital Ocean App Platform

**1. Create App**
```
→ Go to https://cloud.digitalocean.com/apps
→ Click "Create App"
→ Connect GitHub repository
→ Select your repo and branch
```

**2. Configure Build** (Auto-detected)
```
Type: Web Service
Dockerfile Path: Dockerfile ✓ (detected automatically)
HTTP Port: 3000
```

**3. Set Environment Variables**
```bash
NEXT_PUBLIC_SITE_URL=https://your-app.ondigitalocean.app
NEXT_PUBLIC_SUPABASE_URL=https://pticifvppekrgqaeotjr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_from_supabase
NEXT_PUBLIC_ENABLE_GOOGLE=false
```

**4. Update Supabase Auth**
```
→ Supabase Dashboard → Authentication → URL Configuration
→ Site URL: https://your-app.ondigitalocean.app
→ Redirect URLs: Add https://your-app.ondigitalocean.app/auth/callback
```

**5. Deploy**
```
→ Click "Create Resources"
→ Wait 5-10 minutes
→ Visit your app URL! 🎉
```

---

## 💻 Test Locally First (Optional)

```bash
# Quick test with Docker Compose
docker-compose up --build

# Visit http://localhost:3000
```

---

## 📋 Environment Variables Quick Copy

Get these from your Supabase project (Settings → API):

```bash
NEXT_PUBLIC_SITE_URL=             # Your DO app URL
NEXT_PUBLIC_SUPABASE_URL=         # From Supabase → Settings → API
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # From Supabase → Settings → API
NEXT_PUBLIC_ENABLE_GOOGLE=false   # Keep false unless using Google OAuth
```

---

## 🔍 Quick Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails | Check DO build logs; ensure `package-lock.json` committed |
| Can't connect to Supabase | Verify env vars are set correctly in DO |
| Realtime not working | Enable Realtime in Supabase for `tasks` & `task_choices` |
| Auth redirect fails | Update Supabase redirect URLs to match DO app URL |

---

## 📖 Full Documentation

See **`docs/deploy-digitalocean.md`** for complete step-by-step guide with:
- Detailed instructions
- Alternative deployment methods
- Performance tuning
- Monitoring setup
- Cost optimization

---

## 💰 Estimated Cost

- **Basic Tier**: ~$5/month (good for testing)
- **Professional Tier**: ~$12/month (recommended for production)
- **Supabase**: Free tier (current setup, no changes needed)

**Total: ~$5-12/month**

---

## ✅ Deployment Checklist

- [x] Dockerfile created
- [x] Docker Compose configured  
- [x] Next.js standalone mode enabled
- [x] Tests cleaned up
- [x] Production build passing
- [x] Documentation complete
- [ ] **Your turn:** Deploy to Digital Ocean! 🚀

---

**Need help?** Check `docs/deploy-digitalocean.md` for detailed troubleshooting and advanced options.
