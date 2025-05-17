/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react'
import GalleryGrid from '@/components/gallery/GalleryGrid'

const mockGalleryItems = [
  {
    id: 1,
    src: '/images/tattoo1.jpg',
    alt: 'Japanese Dragon',
    style: 'Japanese',
    artist: 'Master Chen',
    title: 'Dragon Sleeve'
  },
  {
    id: 2,
    src: '/images/tattoo2.jpg',
    alt: 'Realistic Portrait',
    style: 'Realism',
    artist: 'Mike Johnson',
    title: 'Lion Portrait'
  },
  {
    id: 3,
    src: '/images/tattoo3.jpg',
    alt: 'Traditional Rose',
    style: 'Traditional',
    artist: 'Sarah Lee',
    title: 'Rose Design'
  }
]

describe('GalleryGrid', () => {
  it('renders all gallery items', () => {
    render(<GalleryGrid items={mockGalleryItems} />)
    
    expect(screen.getByAltText('Japanese Dragon')).toBeInTheDocument()
    expect(screen.getByAltText('Realistic Portrait')).toBeInTheDocument()
    expect(screen.getByAltText('Traditional Rose')).toBeInTheDocument()
  })

  it('displays item titles and artists', () => {
    render(<GalleryGrid items={mockGalleryItems} />)
    
    expect(screen.getByText('Dragon Sleeve')).toBeInTheDocument()
    expect(screen.getByText('Master Chen')).toBeInTheDocument()
    expect(screen.getByText('Lion Portrait')).toBeInTheDocument()
  })

  it('filters items by style', () => {
    render(<GalleryGrid items={mockGalleryItems} />)
    
    // Click on Japanese filter
    const japaneseFilter = screen.getByRole('button', { name: /japanese/i })
    fireEvent.click(japaneseFilter)
    
    // Check that only Japanese item is visible
    expect(screen.getByAltText('Japanese Dragon')).toBeInTheDocument()
    expect(screen.queryByAltText('Realistic Portrait')).not.toBeInTheDocument()
    expect(screen.queryByAltText('Traditional Rose')).not.toBeInTheDocument()
  })

  it('shows all items when All filter is selected', () => {
    render(<GalleryGrid items={mockGalleryItems} />)
    
    // First filter by style
    fireEvent.click(screen.getByRole('button', { name: /japanese/i }))
    
    // Then click All
    fireEvent.click(screen.getByRole('button', { name: /all/i }))
    
    // All items should be visible
    expect(screen.getByAltText('Japanese Dragon')).toBeInTheDocument()
    expect(screen.getByAltText('Realistic Portrait')).toBeInTheDocument()
    expect(screen.getByAltText('Traditional Rose')).toBeInTheDocument()
  })

  it('opens modal when item is clicked', () => {
    render(<GalleryGrid items={mockGalleryItems} />)
    
    // Click on first item
    const firstItem = screen.getByAltText('Japanese Dragon')
    fireEvent.click(firstItem)
    
    // Modal should be open
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Dragon Sleeve')).toBeInTheDocument()
  })

  it('closes modal when close button is clicked', () => {
    render(<GalleryGrid items={mockGalleryItems} />)
    
    // Open modal
    fireEvent.click(screen.getByAltText('Japanese Dragon'))
    
    // Close modal
    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)
    
    // Modal should be closed
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('navigates between images in modal', () => {
    render(<GalleryGrid items={mockGalleryItems} />)
    
    // Open modal
    fireEvent.click(screen.getByAltText('Japanese Dragon'))
    
    // Click next button
    const nextButton = screen.getByRole('button', { name: /next/i })
    fireEvent.click(nextButton)
    
    // Should show second item
    expect(screen.getByText('Lion Portrait')).toBeInTheDocument()
  })

  it('handles empty items array', () => {
    render(<GalleryGrid items={[]} />)
    
    expect(screen.getByText(/no items to display/i)).toBeInTheDocument()
  })

  it('applies grid layout classes', () => {
    const { container } = render(<GalleryGrid items={mockGalleryItems} />)
    
    const gridElement = container.querySelector('.grid')
    expect(gridElement).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3')
  })

  it('shows loading skeleton when isLoading is true', () => {
    render(<GalleryGrid items={[]} isLoading={true} />)
    
    const skeletons = screen.getAllByTestId('gallery-skeleton')
    expect(skeletons).toHaveLength(6) // Default skeleton count
  })
})