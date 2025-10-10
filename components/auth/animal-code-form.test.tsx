import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import AnimalCodeForm from './animal-code-form'
import { toast } from '@/lib/toast'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/lib/toast', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}))

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

describe('AnimalCodeForm', () => {
  const mockRouter = {
    refresh: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    })
  })

  describe('Rendering', () => {
    it('should render the form with all elements', () => {
      render(<AnimalCodeForm />)
      
      expect(screen.getByText('🐾 Join Session')).toBeInTheDocument()
      expect(screen.getByLabelText('First Animal')).toBeInTheDocument()
      expect(screen.getByLabelText('Second Animal')).toBeInTheDocument()
      expect(screen.getByLabelText('Your First Name')).toBeInTheDocument()
      expect(screen.getByText('🦁 Join Session')).toBeInTheDocument()
      expect(screen.getByText('🎲 Pick Random Animals for Me')).toBeInTheDocument()
    })

    it('should show session code preview when animals are selected', () => {
      render(<AnimalCodeForm />)
      
      const animal1Select = screen.getByLabelText('First Animal')
      const animal2Select = screen.getByLabelText('Second Animal')
      
      fireEvent.change(animal1Select, { target: { value: 'Dragon' } })
      fireEvent.change(animal2Select, { target: { value: 'Phoenix' } })
      
      expect(screen.getByText(/dragon-phoenix/i)).toBeInTheDocument()
    })

    it('should filter out selected animal1 from animal2 options', () => {
      render(<AnimalCodeForm />)
      
      const animal1Select = screen.getByLabelText('First Animal') as HTMLSelectElement
      const animal2Select = screen.getByLabelText('Second Animal') as HTMLSelectElement
      
      fireEvent.change(animal1Select, { target: { value: 'Cat' } })
      
      const animal2Options = Array.from(animal2Select.options).map(opt => opt.value)
      expect(animal2Options).not.toContain('Cat')
    })
  })

  describe('Validation', () => {
    it('should disable join button when fields are empty (preventing empty submission)', () => {
      render(<AnimalCodeForm />)
      
      const joinButton = screen.getByRole('button', { name: /join session/i })
      
      // Button should be disabled, preventing clicks
      expect(joinButton).toBeDisabled()
      
      // Even if we try to click, nothing should happen
      fireEvent.click(joinButton)
      expect(toast.error).not.toHaveBeenCalled()
    })

    it('should show error when same animal is selected twice', async () => {
      // Note: Due to filtering, we can't directly select the same animal in both dropdowns
      // This test verifies the validation logic exists, even though the UI prevents it
      render(<AnimalCodeForm />)
      
      const animal1Select = screen.getByLabelText('First Animal')
      const animal2Select = screen.getByLabelText('Second Animal')
      const nameInput = screen.getByLabelText('Your First Name')
      
      // Select different animals initially
      fireEvent.change(animal1Select, { target: { value: 'Dragon' } })
      fireEvent.change(animal2Select, { target: { value: 'Phoenix' } })
      // Then change animal1 to match animal2 (simulating a race condition or manual state manipulation)
      fireEvent.change(animal1Select, { target: { value: 'Phoenix' } })
      fireEvent.change(nameInput, { target: { value: 'Alice' } })
      
      const joinButton = screen.getByRole('button', { name: /join session/i })
      fireEvent.click(joinButton)
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please choose two different animals')
      })
    })

    it('should show error when name is too short', async () => {
      render(<AnimalCodeForm />)
      
      const animal1Select = screen.getByLabelText('First Animal')
      const animal2Select = screen.getByLabelText('Second Animal')
      const nameInput = screen.getByLabelText('Your First Name')
      
      fireEvent.change(animal1Select, { target: { value: 'Dragon' } })
      fireEvent.change(animal2Select, { target: { value: 'Phoenix' } })
      fireEvent.change(nameInput, { target: { value: 'A' } })
      
      const joinButton = screen.getByRole('button', { name: /join session/i })
      fireEvent.click(joinButton)
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Name must be at least 2 characters')
      })
    })

    it('should show error when name is too long', async () => {
      render(<AnimalCodeForm />)
      
      const animal1Select = screen.getByLabelText('First Animal')
      const animal2Select = screen.getByLabelText('Second Animal')
      const nameInput = screen.getByLabelText('Your First Name')
      
      fireEvent.change(animal1Select, { target: { value: 'Dragon' } })
      fireEvent.change(animal2Select, { target: { value: 'Phoenix' } })
      fireEvent.change(nameInput, { target: { value: 'A'.repeat(21) } })
      
      const joinButton = screen.getByRole('button', { name: /join session/i })
      fireEvent.click(joinButton)
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Name must be less than 20 characters')
      })
    })

    it('should trim whitespace from name', async () => {
      render(<AnimalCodeForm />)
      
      const animal1Select = screen.getByLabelText('First Animal')
      const animal2Select = screen.getByLabelText('Second Animal')
      const nameInput = screen.getByLabelText('Your First Name')
      
      fireEvent.change(animal1Select, { target: { value: 'Dragon' } })
      fireEvent.change(animal2Select, { target: { value: 'Phoenix' } })
      fireEvent.change(nameInput, { target: { value: '  Alice  ' } })
      
      const joinButton = screen.getByRole('button', { name: /join session/i })
      fireEvent.click(joinButton)
      
      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'sessionData',
          expect.stringContaining('"userName":"Alice"')
        )
      })
    })
  })

  describe('Session Creation', () => {
    it('should create session with valid inputs', async () => {
      render(<AnimalCodeForm />)
      
      const animal1Select = screen.getByLabelText('First Animal')
      const animal2Select = screen.getByLabelText('Second Animal')
      const nameInput = screen.getByLabelText('Your First Name')
      
      fireEvent.change(animal1Select, { target: { value: 'Dragon' } })
      fireEvent.change(animal2Select, { target: { value: 'Phoenix' } })
      fireEvent.change(nameInput, { target: { value: 'Alice' } })
      
      const joinButton = screen.getByRole('button', { name: /join session/i })
      fireEvent.click(joinButton)
      
      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'sessionData',
          expect.stringContaining('dragon-phoenix')
        )
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'sessionData',
          expect.stringContaining('Alice')
        )
        expect(toast.success).toHaveBeenCalledWith('Welcome Alice! 🐾')
        expect(mockRouter.refresh).toHaveBeenCalled()
      })
    })

    it('should create session with lowercase animal code', async () => {
      render(<AnimalCodeForm />)
      
      const animal1Select = screen.getByLabelText('First Animal')
      const animal2Select = screen.getByLabelText('Second Animal')
      const nameInput = screen.getByLabelText('Your First Name')
      
      fireEvent.change(animal1Select, { target: { value: 'Red Panda' } })
      fireEvent.change(animal2Select, { target: { value: 'Narwhal' } })
      fireEvent.change(nameInput, { target: { value: 'Bob' } })
      
      const joinButton = screen.getByRole('button', { name: /join session/i })
      fireEvent.click(joinButton)
      
      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'sessionData',
          expect.stringContaining('red panda-narwhal')
        )
      })
    })

    it('should include timestamp in session data', async () => {
      const mockDate = new Date('2025-10-10T12:00:00Z')
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any)
      
      render(<AnimalCodeForm />)
      
      const animal1Select = screen.getByLabelText('First Animal')
      const animal2Select = screen.getByLabelText('Second Animal')
      const nameInput = screen.getByLabelText('Your First Name')
      
      fireEvent.change(animal1Select, { target: { value: 'Dragon' } })
      fireEvent.change(animal2Select, { target: { value: 'Phoenix' } })
      fireEvent.change(nameInput, { target: { value: 'Alice' } })
      
      const joinButton = screen.getByRole('button', { name: /join session/i })
      fireEvent.click(joinButton)
      
      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'sessionData',
          expect.stringContaining('2025-10-10T12:00:00.000Z')
        )
      })
    })
  })

  describe('Quick Join Feature', () => {
    it('should select random animals when Quick Join is clicked', () => {
      render(<AnimalCodeForm />)
      
      const quickJoinButton = screen.getByRole('button', { name: /pick random animals/i })
      fireEvent.click(quickJoinButton)
      
      // Check that both animals are now selected
      const animal1Select = screen.getByLabelText('First Animal') as HTMLSelectElement
      const animal2Select = screen.getByLabelText('Second Animal') as HTMLSelectElement
      
      expect(animal1Select.value).toBeTruthy()
      expect(animal2Select.value).toBeTruthy()
      expect(animal1Select.value).not.toBe(animal2Select.value)
      
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining('Random animals selected')
      )
    })

    it('should allow joining after Quick Join', async () => {
      render(<AnimalCodeForm />)
      
      const quickJoinButton = screen.getByRole('button', { name: /pick random animals/i })
      fireEvent.click(quickJoinButton)
      
      const nameInput = screen.getByLabelText('Your First Name')
      fireEvent.change(nameInput, { target: { value: 'Charlie' } })
      
      const joinButton = screen.getByRole('button', { name: /join session/i })
      fireEvent.click(joinButton)
      
      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalled()
        expect(toast.success).toHaveBeenCalledWith('Welcome Charlie! 🐾')
        expect(mockRouter.refresh).toHaveBeenCalled()
      })
    })
  })

  describe('Button States', () => {
    it('should disable join button when fields are empty', () => {
      render(<AnimalCodeForm />)
      
      const joinButton = screen.getByRole('button', { name: /join session/i })
      expect(joinButton).toBeDisabled()
    })

    it('should enable join button when all fields are filled', () => {
      render(<AnimalCodeForm />)
      
      const animal1Select = screen.getByLabelText('First Animal')
      const animal2Select = screen.getByLabelText('Second Animal')
      const nameInput = screen.getByLabelText('Your First Name')
      
      fireEvent.change(animal1Select, { target: { value: 'Dragon' } })
      fireEvent.change(animal2Select, { target: { value: 'Phoenix' } })
      fireEvent.change(nameInput, { target: { value: 'Alice' } })
      
      const joinButton = screen.getByRole('button', { name: /join session/i })
      expect(joinButton).not.toBeDisabled()
    })
  })

  describe('Animal List', () => {
    it('should include classic animals', () => {
      render(<AnimalCodeForm />)
      
      const animal1Select = screen.getByLabelText('First Animal')
      const html = animal1Select.innerHTML
      
      expect(html).toContain('Cat')
      expect(html).toContain('Dog')
      expect(html).toContain('Lion')
    })

    it('should include quirky animals', () => {
      render(<AnimalCodeForm />)
      
      const animal1Select = screen.getByLabelText('First Animal')
      const html = animal1Select.innerHTML
      
      expect(html).toContain('Platypus')
      expect(html).toContain('Axolotl')
      expect(html).toContain('Narwhal')
      expect(html).toContain('Capybara')
    })

    it('should include mythical animals', () => {
      render(<AnimalCodeForm />)
      
      const animal1Select = screen.getByLabelText('First Animal')
      const html = animal1Select.innerHTML
      
      expect(html).toContain('Dragon')
      expect(html).toContain('Phoenix')
      expect(html).toContain('Unicorn')
      expect(html).toContain('Kraken')
    })

    it('should have at least 40 animal options', () => {
      render(<AnimalCodeForm />)
      
      const animal1Select = screen.getByLabelText('First Animal') as HTMLSelectElement
      // -1 for the "Choose first animal..." placeholder option
      const animalCount = animal1Select.options.length - 1
      
      expect(animalCount).toBeGreaterThanOrEqual(40)
    })
  })
})
