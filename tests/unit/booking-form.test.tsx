/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import BookingForm from '@/components/booking/BookingForm'

// Mock fetch
global.fetch = jest.fn()

// Mock router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

describe('BookingForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all form sections', () => {
    render(<BookingForm />)
    
    expect(screen.getByText(/personal information/i)).toBeInTheDocument()
    expect(screen.getByText(/tattoo preferences/i)).toBeInTheDocument()
    expect(screen.getByText(/appointment details/i)).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(<BookingForm />)
    
    const submitButton = screen.getByRole('button', { name: /submit booking/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/phone is required/i)).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    render(<BookingForm />)
    
    const emailInput = screen.getByLabelText(/email/i)
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    
    const submitButton = screen.getByRole('button', { name: /submit booking/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
    })
  })

  it('shows tattoo style options', () => {
    render(<BookingForm />)
    
    const styles = ['Traditional', 'Realism', 'Japanese', 'Neo-Traditional', 'Blackwork']
    
    styles.forEach(style => {
      expect(screen.getByText(style)).toBeInTheDocument()
    })
  })

  it('handles file upload', async () => {
    render(<BookingForm />)
    
    const file = new File(['test'], 'test.png', { type: 'image/png' })
    const input = screen.getByLabelText(/reference images/i)
    
    Object.defineProperty(input, 'files', {
      value: [file],
    })
    
    fireEvent.change(input)
    
    await waitFor(() => {
      expect(screen.getByText('test.png')).toBeInTheDocument()
    })
  })

  it('calculates budget range', () => {
    render(<BookingForm />)
    
    const budgetSlider = screen.getByRole('slider', { name: /budget/i })
    fireEvent.change(budgetSlider, { target: { value: 500 } })
    
    expect(screen.getByText(/\$500/)).toBeInTheDocument()
  })

  it('handles date selection', () => {
    render(<BookingForm />)
    
    const dateInput = screen.getByLabelText(/preferred date/i)
    fireEvent.change(dateInput, { target: { value: '2024-12-25' } })
    
    expect(dateInput).toHaveValue('2024-12-25')
  })

  it('submits form with valid data', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, bookingId: '123' })
    })
    
    render(<BookingForm />)
    
    // Fill personal info
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '555-0123' } })
    
    // Select tattoo style
    fireEvent.click(screen.getByText('Traditional'))
    
    // Set size
    fireEvent.click(screen.getByText('Medium'))
    
    // Set placement
    fireEvent.change(screen.getByLabelText(/placement/i), { target: { value: 'Arm' } })
    
    // Set date
    fireEvent.change(screen.getByLabelText(/preferred date/i), { target: { value: '2024-12-25' } })
    
    // Submit
    const submitButton = screen.getByRole('button', { name: /submit booking/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('John Doe')
      })
    })
  })

  it('shows loading state during submission', async () => {
    (global.fetch as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    )
    
    render(<BookingForm />)
    
    // Fill required fields
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '555-0123' } })
    
    // Submit
    const submitButton = screen.getByRole('button', { name: /submit booking/i })
    fireEvent.click(submitButton)
    
    expect(screen.getByText(/submitting/i)).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('shows error on submission failure', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))
    
    render(<BookingForm />)
    
    // Fill required fields
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '555-0123' } })
    
    // Submit
    const submitButton = screen.getByRole('button', { name: /submit booking/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/error submitting booking/i)).toBeInTheDocument()
    })
  })

  it('navigates between form steps', () => {
    render(<BookingForm />)
    
    // Should start at step 1
    expect(screen.getByText(/personal information/i)).toBeInTheDocument()
    
    // Go to step 2
    const nextButton = screen.getByRole('button', { name: /next/i })
    fireEvent.click(nextButton)
    
    expect(screen.getByText(/tattoo preferences/i)).toBeInTheDocument()
    
    // Go back to step 1
    const backButton = screen.getByRole('button', { name: /back/i })
    fireEvent.click(backButton)
    
    expect(screen.getByText(/personal information/i)).toBeInTheDocument()
  })
})