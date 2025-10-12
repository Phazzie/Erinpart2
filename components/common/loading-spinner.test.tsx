import { render, screen } from '@testing-library/react'
import LoadingSpinner from './loading-spinner'

describe('LoadingSpinner', () => {
  it('should render with default variant (neon)', () => {
    const { container } = render(<LoadingSpinner />)
    
    // Component renders without errors
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should render with cosmic variant', () => {
    const { container } = render(<LoadingSpinner variant="cosmic" />)
    
    // Component renders without errors
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should render with matrix variant', () => {
    const { container } = render(<LoadingSpinner variant="matrix" />)
    
    // Component renders without errors
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should display custom text when provided', () => {
    render(<LoadingSpinner text="Loading tasks..." />)
    
    expect(screen.getByText('Loading tasks...')).toBeInTheDocument()
  })

  it('should display default text "Loading..." when not provided', () => {
    render(<LoadingSpinner />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should render different variants without errors', () => {
    const { container: neonContainer } = render(<LoadingSpinner variant="neon" />)
    const { container: cosmicContainer } = render(<LoadingSpinner variant="cosmic" />)
    const { container: matrixContainer } = render(<LoadingSpinner variant="matrix" />)
    const { container: defaultContainer } = render(<LoadingSpinner variant="default" />)

    // Just verify they all render without errors
    expect(neonContainer.firstChild).toBeInTheDocument()
    expect(cosmicContainer.firstChild).toBeInTheDocument()
    expect(matrixContainer.firstChild).toBeInTheDocument()
    expect(defaultContainer.firstChild).toBeInTheDocument()
  })

  it('should handle different sizes', () => {
    const { container: smContainer } = render(<LoadingSpinner size="sm" />)
    const { container: mdContainer } = render(<LoadingSpinner size="md" />)
    const { container: lgContainer } = render(<LoadingSpinner size="lg" />)

    // Just verify they all render without errors
    expect(smContainer.firstChild).toBeInTheDocument()
    expect(mdContainer.firstChild).toBeInTheDocument()
    expect(lgContainer.firstChild).toBeInTheDocument()
  })
})
