import { createTask, updateTask, deleteTask, updateSession, createShareableSession } from '@/lib/actions'

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(() => Promise.resolve({ userId: null })),
}))

describe('server actions validation', () => {
  const OLD_ENV = process.env
  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })
  afterAll(() => { process.env = OLD_ENV })

  it('throws when Supabase is not configured for task operations', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    await expect(createTask('s1', { text: 'x' }, 'testuser')).rejects.toThrow('Supabase is not configured')
    await expect(updateTask('t1', { text: 'y' }, 'testuser')).rejects.toThrow('Supabase is not configured')
    await expect(deleteTask('t1')).rejects.toThrow('Supabase is not configured')
    await expect(updateSession('s1', { name: 'n' })).rejects.toThrow('Supabase is not configured')
  })

  it('createShareableSession returns url regardless of config', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const res = await createShareableSession('s1')
    expect(res.success).toBe(true)
    expect(res.shareUrl).toContain('session=s1')
  })
})
