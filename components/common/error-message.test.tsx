import { render, screen } from '@testing-library/react'
import ErrorMessage from './error-message'

describe('ErrorMessage', () => {
  it('should render the error message when a message is provided', () => {
    render(<ErrorMessage message="Invalid input" />)

    expect(screen.getByText(/Error:/)).toBeInTheDocument()
    expect(screen.getByText(/Invalid input/)).toBeInTheDocument()
  })

  it('should not render anything when the message is empty', () => {
    const { container } = render(<ErrorMessage message="" />)

    expect(container).toBeEmptyDOMElement()
  })

  it('should not render anything when the message is null', () => {
    // @ts-ignore
    const { container } = render(<ErrorMessage message={null} />)

    expect(container).toBeEmptyDOMElement()
  })
})
