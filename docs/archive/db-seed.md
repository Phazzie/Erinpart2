# ⚠️ DEPRECATED - DB Seed Guide

> **STATUS:** OUTDATED - Schema has evolved significantly since this was written.  
> **REASON:** Current schema uses animal codes (no OAuth), different table structure.  
> **SEE INSTEAD:** Check current Supabase schema in production or `supabase-schema.sql`.  
> **LAST UPDATED:** 2025-08-15

This file describes how to seed your local Supabase instance for Erin's Escapades.

## Usage

1. Ensure your Supabase project is running and you have access to the SQL editor.
2. Copy the contents of `db-seed.sql` into the SQL editor and run it.
3. This will create a demo user, a session, two tasks, and a per-user choice row.

## Notes
- You may need to adjust UUIDs to match your auth.users table.
- The seed is safe to run multiple times (uses ON CONFLICT DO NOTHING).
- See `docs/supabase-schema.md` for table and policy details.
