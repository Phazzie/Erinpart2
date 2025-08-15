import { render, screen } from '@testing-library/react'
import { Input } from './input'

describe('Input', () => {
  it('should render correctly', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
  })
})
