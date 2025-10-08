# 🚀 DIGITAL OCEAN DEPLOYMENT - STEP-BY-STEP GUIDE

## ✅ Pre-Deployment Checklist (All Done!)
- [x] Supabase database schema applied
- [x] Realtime enabled for tasks & task_choices
- [x] Docker configuration complete
- [x] Environment variables ready
- [x] Production build tested
- [x] Code committed to GitHub

---

## 📋 STEP-BY-STEP DEPLOYMENT INSTRUCTIONS

### Step 1: Go to Digital Ocean Apps
**URL:** https://cloud.digitalocean.com/apps

Click the big blue **"Create App"** button

---

### Step 2: Select Source
**Choose:** GitHub

**Action:** Click "Manage Access" if needed to connect GitHub account

**Select Repository:** `Phazzie/Erinpart2`

**Select Branch:** `feat/erins-escapades-full-implementation`

Click **"Next"**

---

### Step 3: Configure Resources (Auto-Detected)

Digital Ocean should automatically detect:
- **Type:** Web Service ✅
- **Dockerfile:** Detected ✅
- **HTTP Port:** 3000 ✅

**If it asks for build settings:**
- Build Command: (leave empty - Dockerfile handles it)
- Run Command: (leave empty - Dockerfile handles it)

Click **"Next"**

---

### Step 4: Environment Variables (CRITICAL!)

Click **"Edit"** next to your app component, then scroll to **"Environment Variables"**

**Add these EXACT variables:**

#### Variable 1:
- **Key:** `NEXT_PUBLIC_SITE_URL`
- **Value:** `${APP_URL}` (Digital Ocean will auto-fill this)
- **Encrypted:** NO

#### Variable 2:
- **Key:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** `https://pticifvppekrgqaeotjr.supabase.co`
- **Encrypted:** NO

#### Variable 3:
- **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0aWNpZnZwcGVrcmdxYWVvdGpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNzg1MTAsImV4cCI6MjA3MDg1NDUxMH0.SluCtYLgV8CALB5ksNv1nTC3DGNMM1HTxkwTQ9fzMhs`
- **Encrypted:** NO

#### Variable 4:
- **Key:** `NEXT_PUBLIC_ENABLE_GOOGLE`
- **Value:** `false`
- **Encrypted:** NO

Click **"Save"** then **"Next"**

---

### Step 5: Select Region & Plan

**Region:** Choose closest to you (e.g., New York, San Francisco, etc.)

**Plan/Size:**
- **For Testing:** Basic ($5/month) - 512 MB RAM
- **For Production:** Professional ($12/month) - 1 GB RAM

**Recommendation:** Start with Basic, upgrade later if needed

Click **"Next"**

---

### Step 6: Name Your App

**App Name:** `erins-escapades` (or any name you like)

**Project:** Default (or select/create a project)

Click **"Next"**

---

### Step 7: Review & Create

Review all settings:
- ✅ Repository: Phazzie/Erinpart2
- ✅ Branch: feat/erins-escapades-full-implementation
- ✅ Dockerfile detected
- ✅ 4 environment variables set
- ✅ Plan selected

Click **"Create Resources"**

---

## ⏱️ WAIT FOR DEPLOYMENT (10-15 minutes)

Digital Ocean will now:
1. Clone your repository
2. Build the Docker container (this takes the longest)
3. Deploy the container
4. Assign a URL

**You can watch the build logs in real-time!**

Look for:
- ✅ "Building..." → Building Docker image
- ✅ "Deploying..." → Starting container
- ✅ "Live" → YOUR APP IS LIVE! 🎉

**Your app URL will be:** `https://erins-escapades-xxxxx.ondigitalocean.app`

---

## 🔧 POST-DEPLOYMENT STEPS

### Step 8: Update Supabase Auth Redirect

Once you have your app URL:

1. Go to: https://supabase.com/dashboard/project/pticifvppekrgqaeotjr/auth/url-configuration

2. **Site URL:** Set to your Digital Ocean app URL
   - Example: `https://erins-escapades-xxxxx.ondigitalocean.app`

3. **Redirect URLs:** Add this line:
   - `https://erins-escapades-xxxxx.ondigitalocean.app/auth/callback`

4. Click **"Save"**

---

### Step 9: Test Your Deployed App

Visit your app URL and test:

1. ✅ **Page loads** without errors
2. ✅ **Pick 3 animals** and enter username
3. ✅ **Create a session** or join one
4. ✅ **Add a task** and verify it saves
5. ✅ **Open in another browser** and check realtime updates

---

## 🎉 SUCCESS CHECKLIST

- [ ] App deployed to Digital Ocean
- [ ] No build errors in DO logs
- [ ] App URL accessible
- [ ] Animal code auth works
- [ ] Can create tasks
- [ ] Tasks save to Supabase
- [ ] Realtime updates work
- [ ] Supabase redirect URL updated

---

## 🆘 TROUBLESHOOTING

### Build Fails
- Check Digital Ocean build logs for specific error
- Verify Dockerfile syntax
- Ensure all dependencies in package.json

### App Loads but Can't Connect to Supabase
- Verify environment variables are set correctly
- Check for typos in SUPABASE_URL or ANON_KEY
- Ensure variables are NOT encrypted (should be visible)

### Realtime Not Working
- Verify Realtime is enabled in Supabase for both tables
- Check browser console for WebSocket errors
- Ensure RLS policies allow reads

### 500 Server Error
- Check Digital Ocean Runtime Logs
- Look for Node.js errors
- Verify all environment variables are set

---

## 📊 WHAT YOU'LL PAY

**Monthly Cost:**
- Digital Ocean Basic: $5/month
- Supabase Free Tier: $0/month
- **Total: $5/month** 🎉

---

## 🎯 READY TO DEPLOY?

Follow the steps above in order. Copy/paste the environment variable values EXACTLY as shown.

**Estimated time:** 20-30 minutes (mostly waiting for build)

**Need help?** Come back and tell me:
- What step you're on
- Any error messages you see
- Screenshots if you're stuck

---

## 🚀 LET'S DO THIS!

Open https://cloud.digitalocean.com/apps and let's deploy! 🔥
