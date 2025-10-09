# 📚 Lessons Learned - Erin's Escapades

**Date Started:** October 9, 2025
**Maintainer:** GitHub Copilot

---

## Purpose
This file collects key lessons, insights, and best practices from the development, testing, and deployment of Erin's Escapades. All contributors (AI agents, users, developers) should add new lessons here as the project evolves.

---

## How to Contribute (Instructions for Other Chat Windows)
1. **Add a new lesson:**
   - Use a clear heading (e.g., `### [Date] - [Topic]`)
   - Write a concise summary of the lesson, insight, or pitfall
   - Include context (what happened, what was tried, what worked/failed)
   - If possible, add recommendations for future work
2. **Do not delete or overwrite previous entries.**
3. **Keep entries factual and constructive.**
4. **If you fix a bug or improve a process, add a note here.**

---

## Example Entry
### 2025-10-09 - Supabase Anonymous Auth Pitfall
- **Issue:** Multiple users were being created due to repeated anonymous sign-ins.
- **Lesson:** Always check for an existing session before calling `signInAnonymously`.
- **Fix:** Use `supabase.auth.getSession()` to avoid duplicate users.
- **Recommendation:** Audit all auth flows for session reuse before creating new users.

---

## Lessons Learned

### 2025-10-09 - Real-time Testing with Playwright
- **Insight:** Automated browser testing (Playwright) is essential for verifying multi-user features when manual testing is impractical.
- **Lesson:** Use Playwright to simulate multiple users joining, voting, and syncing tasks in real-time.
- **Recommendation:** Maintain E2E tests for all collaborative features.

### 2025-10-09 - Docker for Next.js Deployment
- **Insight:** Multi-stage Docker builds (Node 20 Alpine) reduce image size and speed up deployments.
- **Lesson:** Always test Docker builds locally before deploying to cloud platforms.
- **Recommendation:** Document Dockerfile changes and verify with `docker-compose` before production.

### 2025-10-09 - Error Boundaries Prevent App Crashes
- **Insight:** Wrapping main components in error boundaries prevents total app failure from unexpected errors.
- **Lesson:** Add error boundaries to all major client components.
- **Recommendation:** Provide user-friendly fallback UI for error states.

---

## [Add your lesson below]
