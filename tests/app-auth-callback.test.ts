import { jest } from '@jest/globals'

// Mock next/server to capture redirects
jest.mock('next/server', () => {
  const redirect = jest.fn()
  return {
    NextResponse: { redirect },
  }
})

describe('auth callback route', () => {
  it('redirects to root', async () => {
    const { GET } = await import('@/app/auth/callback/route')
    const { NextResponse } = jest.requireMock('next/server') as any

    const req: any = {
      nextUrl: {
        clone: () => ({ pathname: '/auth/callback', search: '?code=abc' })
      }
    }

    await GET(req)

    expect(NextResponse.redirect).toHaveBeenCalled()
    const urlArg: any = (NextResponse.redirect as jest.Mock).mock.calls[0][0]
    expect(urlArg.pathname).toBe('/')
    expect(urlArg.search).toBe('')
  })
})
