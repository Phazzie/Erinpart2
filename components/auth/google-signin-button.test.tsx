import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
// Mock before importing the component so the import uses the mock
jest.mock('@/lib/actions', () => ({ signInWithGoogle: jest.fn() }))
const GoogleSignInButton = require('./google-signin-button').default

describe('GoogleSignInButton', () => {
  const OLD_ENV = process.env
  beforeEach(() => {
    process.env = { ...OLD_ENV, NEXT_PUBLIC_ENABLE_GOOGLE: 'true' }
  })
  afterAll(() => {
    process.env = OLD_ENV
  })

  it('calls signInWithGoogle on click', async () => {
    const { signInWithGoogle } = jest.requireMock('@/lib/actions') as any
    signInWithGoogle.mockResolvedValueOnce(undefined)

    render(<GoogleSignInButton />)

    const btn = screen.getByRole('button', { name: /continue with google/i })
  await userEvent.click(btn)
  await waitFor(() => expect(signInWithGoogle).toHaveBeenCalled())
  })

  it('handles error from action gracefully', async () => {
    const { signInWithGoogle } = jest.requireMock('@/lib/actions') as any
    signInWithGoogle.mockRejectedValueOnce(new Error('boom'))

    render(<GoogleSignInButton />)
    const btn = screen.getByRole('button', { name: /continue with google/i })
  await userEvent.click(btn)
  await waitFor(() => expect(signInWithGoogle).toHaveBeenCalled())
  })

  it('renders nothing when disabled via env flag', () => {
    process.env.NEXT_PUBLIC_ENABLE_GOOGLE = 'false'
    const { container } = render(<GoogleSignInButton />)
    expect(container).toBeEmptyDOMElement()
  })
})
