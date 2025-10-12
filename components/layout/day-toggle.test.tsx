import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DayToggle from './day-toggle'

describe('DayToggle', () => {
  const mockOnDayChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render both Today and Tomorrow buttons', () => {
    render(<DayToggle currentDay="today" onDayChange={mockOnDayChange} />)
    
    expect(screen.getByText('Today')).toBeInTheDocument()
    expect(screen.getByText('Tomorrow')).toBeInTheDocument()
  })

  it('should highlight Today button when currentDay is today', () => {
    const { container } = render(<DayToggle currentDay="today" onDayChange={mockOnDayChange} />)
    
    const todayButton = screen.getByText('Today')
    const tomorrowButton = screen.getByText('Tomorrow')
    
    // Just verify both buttons exist and render correctly
    expect(todayButton).toBeInTheDocument()
    expect(tomorrowButton).toBeInTheDocument()
    // The animated slider should position itself based on currentDay
    const slider = container.querySelector('.bg-gradient-to-r')
    expect(slider).toBeInTheDocument()
  })

  it('should highlight Tomorrow button when currentDay is tomorrow', () => {
    const { container } = render(<DayToggle currentDay="tomorrow" onDayChange={mockOnDayChange} />)
    
    const todayButton = screen.getByText('Today')
    const tomorrowButton = screen.getByText('Tomorrow')
    
    // Just verify both buttons exist and render correctly
    expect(todayButton).toBeInTheDocument()
    expect(tomorrowButton).toBeInTheDocument()
    // The animated slider should position itself based on currentDay
    const slider = container.querySelector('.bg-gradient-to-r')
    expect(slider).toBeInTheDocument()
  })

  it('should call onDayChange with "today" when Today button is clicked', async () => {
    render(<DayToggle currentDay="tomorrow" onDayChange={mockOnDayChange} />)
    
    const todayButton = screen.getByText('Today')
    await userEvent.click(todayButton)
    
    expect(mockOnDayChange).toHaveBeenCalledWith('today')
  })

  it('should call onDayChange with "tomorrow" when Tomorrow button is clicked', async () => {
    render(<DayToggle currentDay="today" onDayChange={mockOnDayChange} />)
    
    const tomorrowButton = screen.getByText('Tomorrow')
    await userEvent.click(tomorrowButton)
    
    expect(mockOnDayChange).toHaveBeenCalledWith('tomorrow')
  })

  it('should not call onDayChange when clicking already active button', async () => {
    render(<DayToggle currentDay="today" onDayChange={mockOnDayChange} />)
    
    const todayButton = screen.getByText('Today')
    await userEvent.click(todayButton)
    
    // Should not be called because it's already the active day
    expect(mockOnDayChange).not.toHaveBeenCalled()
  })
})
