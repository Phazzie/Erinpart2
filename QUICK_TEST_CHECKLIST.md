# ⚡ Quick Test Checklist - Multi-User Session

**Time:** 5 minutes  
**Goal:** Verify core multi-user functionality works

---

## 🎯 The 5-Minute Test

### Setup (1 min)
1. ✅ Open http://localhost:3000 in Browser 1 (Chrome Incognito)
2. ✅ Open http://localhost:3000 in Browser 2 (Firefox Private or Chrome Profile 2)

### Test 1: Animal Codes Work (1 min)
**Browser 1 (Alice):**
- Enter: Alice / Penguin / Cactus
- Click "Join Session"
- ✅ See session board

**Browser 2 (Bob):**
- Enter: Bob / Turtle / Bagel  
- Click "Join Session"
- ✅ See different session (not Alice's)

**✅ PASS:** Each user gets unique session

---

### Test 2: Session Joining (1 min)
**Browser 1 (Alice):**
- Click **"Share Session"** button (top right)
- ✅ See toast: "Session link copied!"
- Copy URL from address bar: `http://localhost:3000/?session=XXXXX`

**Browser 2 (Bob):**
- Paste Alice's URL and press Enter
- ✅ Bob now sees "Alice's session"

**✅ PASS:** Multiple users can join same session

---

### Test 3: Real-time Tasks (1 min)
**Browser 1 (Alice):**
- Add task: "Buy groceries"
- ✅ See task appear in Alice's list

**Browser 2 (Bob):**
- ✅ See "Buy groceries" appear **immediately** (within 1-2 sec)
- Add task: "Walk dog"

**Browser 1 (Alice):**
- ✅ See "Walk dog" appear **immediately**

**✅ PASS:** Tasks sync in real-time

---

### Test 4: Independent Choices (1 min)
**Browser 1 (Alice):**
- Click 👍 (Yes) on "Buy groceries"
- ✅ Button highlights

**Browser 2 (Bob):**
- ✅ See count update: "1 yes" 
- Click 👎 (No) on "Buy groceries"
- ✅ Button highlights

**Browser 1 (Alice):**
- ✅ See count: "1 yes · 1 no"

**✅ PASS:** Choices are per-user and sync in real-time

---

### Test 5: Persistence (1 min)
**Browser 1 (Alice):**
- Press F5 (refresh page)
- ✅ Still see both tasks
- ✅ Still see all votes (1 yes, 1 no)

**Browser 2 (Bob):**
- Press F5 (refresh page)
- ✅ Still see both tasks
- ✅ Still see all votes

**✅ PASS:** Data persists after refresh

---

## 🎉 All Tests Passed?

### ✅ YES → You're ready to deploy!
- Core functionality works
- Multi-user sessions work
- Real-time updates work
- Data persistence works

### ❌ NO → Check these:

#### Tasks don't sync?
- Check browser console for errors
- Verify Supabase realtime is enabled
- Check Network tab for WebSocket connection

#### Choices don't show?
- Check `task_choices` table in Supabase
- Verify RLS policies allow reads
- Check console for 403 errors

#### Session joining fails?
- Verify URL has `?session=` parameter
- Check localStorage in DevTools
- Clear localStorage and try again

---

## 🐛 Quick Fixes

### Clear Everything:
```javascript
// In browser console
localStorage.clear()
location.reload()
```

### Check Session:
```javascript
// In browser console
localStorage.getItem('sessionData')
```

### Check Auth:
```javascript
// In browser console (async)
supabase.auth.getSession().then(d => console.log(d))
```

---

## 📊 What Should You See?

### Browser Console (Normal):
```
✅ [useSession] User authenticated: {id: "...", name: "Alice"}
✅ [useTasks] Fetched 2 tasks
✅ [useRealtime] Subscribed to tasks:session-xxxxx
✅ [useTaskChoices] Loaded 2 choices
```

### Browser Console (Errors to Ignore):
```
⚠️ Dev warnings about React strict mode (normal)
⚠️ Next.js fast refresh messages (normal)
```

### Browser Console (ERRORS - Red Flags):
```
❌ 403 Forbidden → RLS policy issue
❌ WebSocket closed → Realtime connection failed
❌ undefined is not an object → Bug in code
```

---

## 🚀 After Testing

### If everything works:
1. Close dev server (Ctrl+C in terminal)
2. Run production build: `npm run build`
3. Deploy to Digital Ocean (see `docs/deploy-digitalocean.md`)

### If bugs found:
1. Note which test failed
2. Check browser console for errors
3. Report issue with steps to reproduce

---

**Next Steps:** See `MANUAL_TEST_PLAN.md` for comprehensive testing (15 min)
