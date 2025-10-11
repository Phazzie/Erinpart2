# GitHub Coding Agent Task

**Created**: 2025-10-11  
**Updated**: 2025-10-11T00:45:00Z  
**Priority**: HIGH  
**Assigned to**: GitHub Copilot Coding Agent  

---

## 🎯 Mission: Bug Hunt, Verify, and Fix

**CRITICAL INSTRUCTIONS**:
- ❌ **DO NOT** assume anything is complete based on documentation alone
- ✅ **VERIFY** all claims by reading actual code and running tests
- 🐛 **HUNT** for bugs proactively - don't just fix what's listed
- 📊 **CITE** specific code locations when reporting findings (file:line)
- 🧪 **TEST** everything you fix - run builds, tests, and manual verification
- 📝 **DOCUMENT** every finding with evidence (code snippets, error messages)

---

## 🚧 What Copilot Will Be Doing (Avoid These)

While you work, **Copilot (the chat assistant)** will be:
- 📚 **Documentation updates** - README.md, architecture docs, code comments
- 🎨 **UI polish** - Minor styling tweaks, animation improvements
- 🔍 **Code review** - Reviewing your PR and providing feedback
- 📊 **Analytics** - Checking bundle sizes, performance metrics

**DO NOT TOUCH**:
- `README.md` - Copilot is updating
- `docs/architecture.md` - Copilot is documenting
- Any files in `docs/` - Copilot's territory
- `lib/utils.ts` - Copilot is adding JSDoc comments
- `components/ui/*` - Copilot may add accessibility improvements

**SAFE TO EDIT**:
- All test files (`**/*.test.tsx`, `tests/**/*`)
- Component logic files (`components/auth/*`, `components/session/*`, etc.)
- Server actions (`lib/actions.ts`)
- Type definitions (`lib/types.ts`)
- Configuration files (if needed for fixes)

---

## Current Issues to Fix

### 1. 🔴 CRITICAL: Build Failure - Syntax Error in Test File
**File**: `components/auth/animal-code-form.test.tsx`  
**Line**: 306  
**Error**: `Declaration or statement expected.`

**Root Cause**: Extra closing brace on line 305 causing syntax error.

**Fix**: Remove the duplicate `})` on line 305. The structure should be:
```tsx
// Line 304
    })
    
  }) // <- This is the correct closing for the describe block
  // Remove the extra })
```

### 2. 🟡 E2E Tests Failing - Playwright Multi-User Tests
**File**: `tests/e2e/multi-user.spec.ts`  
**Status**: 3 of 4 tests failing, 1 passing

**Specific Issues**:

#### Test 1: "two users can join the same session via animal codes"
- **Error**: Timeout waiting for session board to load
- **Likely Cause**: Incorrect selector - looking for `text=Erin's Escapades` but should wait for a more reliable element like the task input textarea
- **Partial Fix Applied**: Changed some selectors to use `textarea[placeholder*="Add a new chaotic task"]` but tool calls were cancelled mid-operation

#### Test 2: "users can join via direct URL sharing"  
- **Error**: Similar timeout issue
- **Status**: Partially fixed, needs verification

#### Test 3: "users can join via QR code URL"
- **Error**: Can't find "Share" button
- **Root Cause**: Either button doesn't exist, has different text, or isn't visible when expected
- **Action Needed**: Verify the actual button text and selector in `components/session/session-header.tsx` or wherever the share button lives

#### Test 4: "Quick Join creates random session" ✅
- **Status**: PASSING! 
- **Note**: This one works, so use it as a reference for the selector patterns that DO work

**Recommended Actions**:
1. Fix the syntax error in the test file FIRST (blocking build)
2. Update all E2E test selectors to use the task textarea as the "session loaded" indicator instead of text search
3. Investigate and fix the Share button selector issue
4. Verify tests pass with dev server running on `localhost:3000`

---

## Additional Investigation Needed

Please also check for:
- Any other TypeScript/ESLint errors hiding behind the current build failure
- Any unused imports in modified files
- Console errors when running the app manually
- Any RLS policy issues if Supabase is connected
- Memory leaks or infinite loops in React components (check for missing useEffect dependencies)

---

## What Copilot Will Be Working On (Avoid Duplication)

While you work on the above, Copilot will be focusing on:
- **Documentation updates**: Updating README, architecture docs
- **Component polish**: Minor UI/UX improvements to existing components
- **Code comments**: Adding JSDoc comments to utility functions
- **Performance**: Investigating React rendering optimizations

**DO NOT TOUCH**:
- `components/layout/*` - Copilot is refactoring these
- `docs/architecture.md` - Copilot is updating
- `lib/utils.ts` - Copilot is adding documentation

---

## Testing Instructions

1. **Fix build first**: `npm run build` should pass
2. **Start dev server**: `npm run dev`
3. **Run E2E tests**: `npx playwright test tests/e2e/multi-user.spec.ts`
4. **Target**: All 4 tests should pass

---

## Success Criteria

- ✅ `npm run build` passes with no errors
- ✅ All 4 Playwright E2E tests pass
- ✅ No new ESLint warnings introduced
- ✅ Manual smoke test: Join session via animal codes works in browser
- ✅ Manual smoke test: Two browser windows can join same session

---

## Notes

- The app uses **localStorage** for session state AND **URL params** for sharing
- After joining, URL should have `?session=animal1-animal2` format
- The loading screen issue was JUST fixed (window.location.href with URL param)
- Build was passing before the test file syntax error was introduced

---

## Context Files to Review

- `components/auth/animal-code-form.tsx` - Just fixed loading issue
- `components/session/session-board.tsx` - Handles URL param parsing
- `app/page.tsx` - Main entry point with localStorage check
- `tests/e2e/multi-user.spec.ts` - The failing tests

Good luck! 🚀
