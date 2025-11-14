import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const enabled = process.env.SUPABASE_HEALTH_RUN === 'true'

const skipReason = !enabled
  ? 'SUPABASE_HEALTH_RUN is not true'
  : !url || !anon
    ? 'Supabase env not set'
    : null

;(skipReason ? describe.skip : describe)('Supabase health', () => {
  it('can SELECT on public.users (schema + RLS)', async () => {
    const client = createClient(url as string, anon as string)
    const { error, count } = await client
      .from('users')
      .select('id', { head: true, count: 'exact' })
      .limit(1)

    if (error) {
      // Provide clearer hints for common setup issues
      if (/relation .*users.* does not exist/i.test(error.message)) {
        throw new Error(
          'Schema not applied: public.users missing. Run docs/supabase-schema.sql in Supabase.'
        )
      }
      throw error
    }
    expect(count).toBeGreaterThanOrEqual(0)
  })

  const checkRealtime = process.env.SUPABASE_HEALTH_REALTIME === 'true'
  ;(checkRealtime ? it : it.skip)('realtime publication has tasks & task_choices', async () => {
    const client = createClient(url as string, anon as string)
    // Use a SQL RPC fallback via pg_catalog to avoid needing a custom function
    const { data, error } = await client
      .from('pg_publication_tables' as any)
      .select('*')
      .eq('pubname', 'supabase_realtime')

    if (error) throw error
    const tables = (data as any[]).map(r => r.tablename)
    expect(tables).toEqual(expect.arrayContaining(['tasks', 'task_choices']))
  })
})

if (skipReason) {
  // eslint-disable-next-line no-console
  console.warn(`[supabase-health] Skipped: ${skipReason}`)
}
