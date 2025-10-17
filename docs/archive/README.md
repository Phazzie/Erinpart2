# Documentation Archive

> **WARNING:** All documents in this archive are OUTDATED and kept for historical reference only.

## Why These Are Archived

This folder contains documentation from the initial development phase (August 2025) that has been superseded by:

1. **Code Changes:** OAuth authentication was replaced with animal code authentication
2. **Architecture Changes:** Mock data fallback was removed, Supabase is now required
3. **Deployment:** App is now production-ready; planning docs are no longer needed
4. **Schema Evolution:** Database schema has been updated with different auth approach

## What's In Here

| File | Status | Reason for Archival |
|------|--------|---------------------|
| `architecture.md` | ❌ OUTDATED | Describes mock fallback system that no longer exists |
| `database-options.md` | ❌ OUTDATED | Decision-making doc; decision made (Supabase) |
| `db-seed.md` / `db-seed.sql` | ❌ OUTDATED | Schema has changed significantly |
| `deploy-vercel.md` | ⚠️ PARTIALLY OUTDATED | OAuth references removed; basic steps still valid |
| `documentation-suggestions.md` | ❌ OUTDATED | References deleted OAuth components |
| `share-reply.md` | ❌ OUTDATED | URL-based sharing was never implemented |
| `supabase-paused-guide.md` | ❌ OUTDATED | One-time troubleshooting guide |
| `supabase-schema.md` | ⚠️ PARTIALLY OUTDATED | Schema evolved with animal codes |
| `supabase-wiring.md` | ❌ OUTDATED | Planning RFC; implementation complete |

## Current Documentation

See the parent `docs/` folder for current documentation:

- ✅ `deploy-digitalocean.md` - **CURRENT** deployment guide
- ✅ `troubleshooting.md` - **CURRENT** troubleshooting guide

## Should I Use These Docs?

**NO.** These documents describe a version of the app that no longer exists. They contain:

- ❌ OAuth/Google authentication flows (removed)
- ❌ Mock data fallback system (removed)
- ❌ Old database schema (changed)
- ❌ Planning and decision-making docs (decisions made)

**Instead:**
- Check the actual codebase for current implementation
- Review `CHANGELOG.md` for recent changes
- Use current docs in parent `docs/` folder

## Deletion Policy

These files are kept temporarily for:
- Historical reference during support/debugging
- Understanding architectural decisions
- Learning from the evolution of the project

They may be deleted in the future if deemed unnecessary.

---

**Last Updated:** October 17, 2025
