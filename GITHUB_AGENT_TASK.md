# GitHub Coding Agent Task - Bug Fixes & E2E Tests

**Priority:** HIGH  
**Created:** 2025-10-11  
**Assigned to:** GitHub Coding Agent  
**Status:** Ready to Start

---

## 🎯 Primary Objectives

### 1. **Fix Playwright E2E Tests** (CRITICAL)
**Location:** `tests/e2e/multi-user.spec.ts`

**Current Status:** 3 out of 4 tests failing  
**Issue:** Tests are timing out waiting for page elements

**Problems to Fix:**
- Tests use incorrect selectors (need to wait for `textarea[placeholder*="Add a new chaotic task"]` instead of `text=Erin's Escapades`)
- Some tests need to handle both localStorage AND URL-based sessions
- QR code/share modal test needs to find the correct Share button

**Action Items:**
- [ ] Update all test selectors to use reliable elements (task textarea, buttons with proper IDs)
- [ ] Fix timing issues - ensure page fully loads before assertions
- [ ] Verify tests pass with dev server running (`npm run dev`)
- [ ] All 4 tests should pass green

### 2. **Fix Critical Session ID Race Condition** (CRITICAL)
**Location:** `components/session/session-board.tsx` lines 40-75

**Problem:** 
The component initializes `useTasks` with an empty sessionId before URL params are parsed, causing tasks to not load properly.

```tsx
// CURRENT (BROKEN):
const { sessionId: defaultSessionId } = useSession()  // empty on first render
const [sessionId, setSessionId] = useState(defaultSessionId)  // empty string
const { tasks, addTask } = useTasks(sessionId)  // fetches with empty!

// Later in useEffect:
useEffect(() => {
  const s = url.searchParams.get('session')
  if (s) setSessionId(s)  // Too late! useTasks already ran
}, [])
```

**Fix Required:**
```tsx
// OPTION 1: Parse URL first, then initialize
const [urlSessionId, setUrlSessionId] = useState<string | null>(null)

useEffect(() => {
  const s = url.searchParams.get('session')
  setUrlSessionId(s)
}, [])

const sessionId = urlSessionId || defaultSessionId
const { tasks, addTask } = useTasks(sessionId)

// OPTION 2: Make sessionId reactive to both URL and useSession
useEffect(() => {
  const s = url.searchParams.get('session')
  setSessionId(s || defaultSessionId)
}, [defaultSessionId])
```

### 3. **Fix Anonymous Auth Creating Multiple Users** (CRITICAL)
**Location:** `hooks/use-session.ts` lines 15-35

**Problem:**
Every page load calls `signInAnonymously()` even if user is already signed in, creating database pollution.

**Current Code:**
```tsx
useEffect(() => {
  // ALWAYS creates new user
  const { data: authData } = await supabase.auth.signInAnonymously()
}, [])
```

**Fix Required:**
```tsx
useEffect(() => {
  const initAuth = async () => {
    // Check existing session first
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user) {
      // Reuse existing session
      const parsed = JSON.parse(localStorage.getItem('sessionData') || '{}')
      setUser({ id: session.user.id, name: parsed.userName || 'Guest' })
      setSessionId(parsed.sessionId || '')
    } else {
      // Only create new if no session exists
      const { data: authData, error } = await supabase.auth.signInAnonymously()
      if (authData?.user) {
        // ... rest of logic
      }
    }
  }
  initAuth()
}, [])
```

---

## 🔍 Additional Tasks - Find & Fix Other Bugs

### Audit These Areas:
1. **Loading States:** Check if any loading spinners stick or don't clear properly
2. **Form Validation:** Ensure all forms validate correctly and show proper error messages
3. **Realtime Sync:** Verify tasks sync properly between multiple users
4. **Error Handling:** Check if errors are caught and displayed to users
5. **Memory Leaks:** Look for missing cleanup in useEffect hooks
6. **TypeScript Errors:** Fix any type issues (run `npm run build` to check)

### Known Issues from BUG_AUDIT.md:
- ✅ Window reload loop (partially fixed by Copilot)
- ⚠️ Session ID race condition (needs fix - see above)
- ⚠️ Anonymous auth spam (needs fix - see above)
- ❓ Presence indicator may have state issues
- ❓ Realtime subscriptions may not clean up properly

**Action:**
- [ ] Review `BUG_AUDIT.md` for all issues
- [ ] Fix any TypeScript/ESLint errors
- [ ] Run `npm run build` and ensure it passes
- [ ] Run `npm test` and ensure all Jest tests pass
- [ ] Document any new bugs found in BUG_AUDIT.md

---

## 🚫 DO NOT TOUCH (Copilot is working on these)

**Files Copilot Will Be Handling:**
- `components/auth/animal-code-form.tsx` - UX improvements, styling tweaks
- `CHANGELOG.md` - Documentation updates
- `aitalk` - Coordination log
- Any new feature additions or UI polish

**Coordination:**
- Copilot will focus on: UX/UI polish, documentation, small component tweaks
- You (Agent) focus on: Core bugs, test fixes, system stability

---

## ✅ Definition of Done

- [ ] All 4 Playwright E2E tests passing (run: `npx playwright test tests/e2e/multi-user.spec.ts`)
- [ ] Session ID race condition fixed - tasks load on first render
- [ ] Anonymous auth only creates user once per session
- [ ] No TypeScript errors (run: `npm run build`)
- [ ] All Jest tests passing (run: `npm test`)
- [ ] Updated BUG_AUDIT.md with fixes applied and any new issues found
- [ ] Updated CHANGELOG.md with all bug fixes made
- [ ] Updated TESTING_CHECKLIST.md with test status

---

## 📝 Success Criteria

**Before:**
- 3/4 E2E tests failing
- Tasks not loading on first render
- Multiple anonymous users created per page load
- Unknown number of other bugs

**After:**
- 4/4 E2E tests passing ✅
- Tasks load immediately on session join ✅
- One user per browser session ✅
- All critical bugs documented and fixed ✅
- Build passes clean ✅

---

## 🔧 How to Test

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run E2E tests
npx playwright test tests/e2e/multi-user.spec.ts --headed

# Run unit tests
npm test

# Check build
npm run build
```

---

## 📚 Reference Documents
- `BUG_AUDIT.md` - Comprehensive list of known issues
- `TESTING_CHECKLIST.md` - Test coverage status
- `.github/copilot-instructions.md` - Project guidelines and coordination rules
- `aitalk` - Real-time coordination log

---

**Good luck! 🚀**  
**Questions?** Check `aitalk` file or add entries there for coordination.
