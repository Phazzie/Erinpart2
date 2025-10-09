# 🧪 Manual Test Plan - Multi-User Session Testing

**Date:** October 9, 2025  
**Purpose:** Verify multi-user functionality works correctly  
**Estimated Time:** 15-20 minutes

---

## 🎯 Core Features to Test

### 1. **Animal Code Authentication** ✅
**Goal:** Two users can create different animal codes and join

**Steps:**
1. Open app in Browser 1 (incognito/private window)
2. Enter: 
   - First name: "Alice"
   - Animal 1: "Penguin"
   - Animal 2: "Cactus"
3. Click "Join Session"
4. ✅ Verify you see the session board with your name displayed
5. Open app in Browser 2 (different incognito/private window)
6. Enter:
   - First name: "Bob"
   - Animal 1: "Turtle"
   - Animal 2: "Bagel"
7. Click "Join Session"
8. ✅ Verify Bob sees a different session (not Alice's)

**Expected:**
- ✅ Each user gets a unique session ID
- ✅ Animal codes work (format: `penguin-cactus-alice`, `turtle-bagel-bob`)
- ✅ No errors in console

---

### 2. **Session Joining via URL** ✅
**Goal:** Multiple users can join the same session

**Steps:**
1. In Browser 1 (Alice), click the **"Share Session"** button
2. ✅ Verify a URL is copied to clipboard (should see toast notification)
3. Manually copy the URL from browser address bar (format: `/?session=<sessionId>`)
4. Paste URL into Browser 2 (Bob's window)
5. Bob should see Alice's session

**Expected:**
- ✅ Both Alice and Bob see the same session
- ✅ Session ID in URL matches Alice's session
- ✅ Both users see their own names in the UI

**Common Issues:**
- ⚠️ If Bob doesn't see Alice's session, check:
  - URL has `?session=` parameter
  - Both are using same session ID
  - Check browser console for errors

---

### 3. **Shared Task Visibility** ✅
**Goal:** Tasks created by one user appear for all users in real-time

**Steps:**
1. Alice (Browser 1) adds a task: "Buy groceries"
2. ✅ Verify Bob (Browser 2) sees the task appear **immediately** (within 1-2 seconds)
3. Bob adds a task: "Walk the dog"
4. ✅ Verify Alice sees Bob's task appear **immediately**
5. Alice edits "Buy groceries" to "Buy organic groceries"
6. ✅ Verify Bob sees the updated text

**Expected:**
- ✅ Tasks appear in real-time (Supabase realtime working)
- ✅ No page refresh needed
- ✅ Both users see the same task list
- ✅ Task order is consistent

**Debug:**
- Check Network tab for WebSocket connection
- Look for `realtime` channel subscription in console
- Verify Supabase realtime is enabled in project settings

---

### 4. **Independent User Choices (Yes/No/Maybe)** ✅
**Goal:** Each user's choices are independent and visible to others

**Steps:**
1. Alice clicks **"Yes"** (👍) on "Buy groceries"
2. ✅ Verify Alice sees her choice highlighted
3. ✅ Verify Bob sees Alice's choice (should show count: "1 yes")
4. Bob clicks **"No"** (👎) on "Buy groceries"
5. ✅ Verify Bob sees his choice highlighted
6. ✅ Verify Alice sees both choices (count: "1 yes, 1 no")
7. Alice clicks **"Maybe"** (🤔) on "Walk the dog"
8. ✅ Verify both see the maybe choice

**Expected:**
- ✅ Choices are per-user (stored in `task_choices` table)
- ✅ Choice counts update in real-time
- ✅ Users can change their own choices
- ✅ Users cannot change others' choices

**Visual Check:**
- Each task should show summary like "2 yes · 1 no · 1 maybe"
- Current user's choice should be visually distinct (highlighted button)

---

### 5. **Real-time Choice Updates** ✅
**Goal:** Choice changes propagate instantly

**Steps:**
1. Alice clicks "Yes" on a task
2. ✅ Verify Bob sees count update immediately
3. Alice changes to "No"
4. ✅ Verify Bob sees count change from "1 yes" to "1 no"
5. Both Alice and Bob click "Yes" on same task
6. ✅ Verify both see "2 yes"

**Expected:**
- ✅ No lag or delay (< 1 second)
- ✅ Counts are accurate
- ✅ No duplicate choices

---

### 6. **Persistence After Refresh** ✅
**Goal:** Data survives page reloads

**Steps:**
1. Alice adds tasks: "Task A", "Task B", "Task C"
2. Alice votes "Yes" on Task A
3. Bob votes "No" on Task A, "Maybe" on Task B
4. Refresh Alice's browser (F5 or Cmd+R)
5. ✅ Verify Alice sees all 3 tasks
6. ✅ Verify Alice's choice on Task A is still "Yes"
7. ✅ Verify Bob's choices are still visible
8. Refresh Bob's browser
9. ✅ Verify Bob sees all 3 tasks and choices

**Expected:**
- ✅ All data persists in Supabase
- ✅ User identity persists (localStorage + Supabase session)
- ✅ No data loss

---

### 7. **Vibe Theme Changes** ✅
**Goal:** Theme changes are local to each user

**Steps:**
1. Alice selects "Chaos Gremlin" vibe
2. ✅ Verify Alice's UI changes theme (background, colors)
3. ✅ Verify Bob's UI stays the same (independent theme)
4. Bob selects "Zen Monk" vibe
5. ✅ Verify Bob's theme changes
6. ✅ Verify Alice's theme stays "Chaos Gremlin"

**Expected:**
- ✅ Vibes are per-user (not synced)
- ✅ Themes apply correctly
- ✅ No visual glitches

---

### 8. **Day Toggle (Today/Tomorrow)** ✅
**Goal:** Day selection is local to each user

**Steps:**
1. Alice toggles to "Tomorrow"
2. ✅ Verify Alice's view changes
3. ✅ Verify Bob still sees "Today" (independent)
4. Bob toggles to "Tomorrow"
5. ✅ Both see "Tomorrow" tasks (if different per day)

**Expected:**
- ✅ Day toggle is per-user
- ✅ No sync issues

---

### 9. **Task Reordering** ⚠️
**Goal:** Drag-and-drop task reordering works

**Steps:**
1. Alice drags "Task C" to top of list
2. ✅ Verify Alice sees new order
3. ⚠️ **Known Issue:** Reordering NOT persisted to database
4. Refresh Alice's browser
5. ⚠️ Tasks return to original order

**Status:** **MEDIUM PRIORITY BUG** - See BUG_AUDIT.md #4  
**Workaround:** Manual reordering works temporarily, but resets on refresh

---

### 10. **Edge Cases & Error Handling** ✅

#### a) **Empty Task Submission**
1. Try to submit a task with no text
2. ✅ Verify you see an error message
3. ✅ Task is not created

#### b) **Long Task Names**
1. Create a task with 500+ characters
2. ✅ Verify it displays correctly (or truncates gracefully)

#### c) **Special Characters**
1. Create a task: "Buy milk & eggs 🥛🥚"
2. ✅ Verify it saves and displays correctly

#### d) **Network Disconnect**
1. Open DevTools → Network tab → Go offline
2. Try to add a task
3. ✅ Verify you see an error/warning
4. Go back online
5. ✅ Retry adding task - should work

#### e) **Concurrent Edits**
1. Alice and Bob edit the same task simultaneously
2. ✅ Last edit wins (expected behavior)
3. ✅ No data corruption

---

## 🔍 What to Look For (Red Flags)

### Console Errors
- ❌ WebSocket connection errors
- ❌ 403 Forbidden (RLS policy issue)
- ❌ 401 Unauthorized (auth issue)
- ❌ Hydration errors
- ✅ Dev warnings are okay

### Visual Bugs
- ❌ Loading screen stuck forever
- ❌ Tasks appearing twice
- ❌ Choice buttons not responding
- ❌ Theme not applying
- ❌ Animations glitching

### Data Issues
- ❌ Tasks disappearing
- ❌ Choices not saving
- ❌ Wrong user's choices showing
- ❌ Duplicate sessions created

---

## 📊 Success Criteria

### ✅ MUST WORK:
1. ✅ Two users can join same session via URL
2. ✅ Tasks appear in real-time for all users
3. ✅ Choices are per-user and update in real-time
4. ✅ Data persists after refresh
5. ✅ No console errors (except dev warnings)

### ⚠️ KNOWN ISSUES:
1. ⚠️ Task reordering not persisted (medium priority)
2. ⚠️ Some console.logs in production (low priority)

### 🎯 BONUS (Nice to Have):
1. Share button copies URL smoothly
2. Loading states are visible
3. Error messages are helpful
4. UI is responsive on mobile

---

## 🚀 Testing Shortcuts

### Quick 2-User Test (5 minutes):
```
1. Open 2 incognito windows side-by-side
2. Alice joins → Share session URL
3. Bob joins via URL
4. Alice adds task "Test task"
5. Bob clicks "Yes" on task
6. Verify Alice sees "1 yes"
7. ✅ CORE FUNCTIONALITY WORKS
```

### Full Test (15 minutes):
- Run all sections above
- Check console for errors
- Test edge cases

---

## 🐛 If Something Breaks

1. **Check Supabase Connection:**
   ```bash
   # In browser console
   localStorage.getItem('sessionData')
   ```

2. **Check Auth Status:**
   ```typescript
   // In browser console
   supabase.auth.getSession().then(console.log)
   ```

3. **Check Realtime:**
   - Look for `realtime` in Network tab (WebSocket)
   - Should see `connected` status

4. **Clear State:**
   ```javascript
   // In browser console
   localStorage.clear()
   location.reload()
   ```

---

## 📝 Test Results Template

```
Date: ___________
Tester: ___________

✅ Animal code works
✅ Session joining works
✅ Tasks sync in real-time
✅ Choices are independent
✅ Data persists
⚠️ Issues found: ___________
```

---

## 🎯 Next Steps After Testing

1. If all tests pass → **Ready for production deployment**
2. If bugs found → Create GitHub issues with steps to reproduce
3. If performance issues → Check Supabase query logs
4. If realtime fails → Verify Supabase realtime enabled + RLS policies correct
