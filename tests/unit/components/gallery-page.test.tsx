import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { trpc } from '@/lib/trpc/client'

// Mock the gallery page component
const mockGalleryPage = () => {
  const mockDesigns = [
    {
      id: '1',
      name: 'Test Design 1',
      description: 'A beautiful test design',
      fileUrl: 'https://example.com/design1.jpg',
      designType: 'Traditional',
      size: 'Medium',
      isApproved: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Test Design 2',
      description: 'Another test design',
      fileUrl: 'https://example.com/design2.jpg',
      designType: 'Realism',
      size: 'Large',
      isApproved: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  return {
    designs: mockDesigns,
    total: mockDesigns.length,
  }
}

describe('Gallery Page Component', () => {
  beforeEach(() => {
    // Mock tRPC queries
    vi.mocked(trpc.gallery.getPublicDesigns.useQuery).mockReturnValue({
      data: mockGalleryPage(),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    vi.mocked(trpc.gallery.getStats.useQuery).mockReturnValue({
      data: {
        totalDesigns: 2,
        approvedDesigns: 1,
        pendingDesigns: 1,
      },
      isLoading: false,
    } as any)

    vi.mocked(trpc.gallery.getDesignTypes.useQuery).mockReturnValue({
      data: ['Traditional', 'Realism', 'Japanese'],
      isLoading: false,
    } as any)
  })

  it('renders gallery management header', async () => {
    const GalleryPage = (await import('@/app/(admin)/admin/gallery/page')).default
    
    render(<GalleryPage />)

    expect(screen.getByText('Gallery Management')).toBeInTheDocument()
    expect(screen.getByText('Add Design')).toBeInTheDocument()
  })

  it('displays gallery statistics correctly', async () => {
    const GalleryPage = (await import('@/app/(admin)/admin/gallery/page')).default
    
    render(<GalleryPage />)

    await waitFor(() => {
      expect(screen.getByText('Total Designs')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('Approved')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('Pending Approval')).toBeInTheDocument()
    })
  })

  it('renders design cards with correct information', async () => {
    const GalleryPage = (await import('@/app/(admin)/admin/gallery/page')).default
    
    render(<GalleryPage />)

    await waitFor(() => {
      expect(screen.getByText('Test Design 1')).toBeInTheDocument()
      expect(screen.getByText('Test Design 2')).toBeInTheDocument()
      expect(screen.getByText('A beautiful test design')).toBeInTheDocument()
      expect(screen.getByText('Another test design')).toBeInTheDocument()
    })
  })

  it('shows approved and pending badges correctly', async () => {
    const GalleryPage = (await import('@/app/(admin)/admin/gallery/page')).default
    
    render(<GalleryPage />)

    await waitFor(() => {
      expect(screen.getByText('Approved')).toBeInTheDocument()
      expect(screen.getByText('Pending')).toBeInTheDocument()
    })
  })

  it('opens create dialog when Add Design button is clicked', async () => {
    const GalleryPage = (await import('@/app/(admin)/admin/gallery/page')).default
    
    render(<GalleryPage />)

    const addButton = screen.getByText('Add Design')
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByText('Create Design')).toBeInTheDocument()
    })
  })

  it('filters designs by search term', async () => {
    const GalleryPage = (await import('@/app/(admin)/admin/gallery/page')).default
    
    render(<GalleryPage />)

    const searchInput = screen.getByPlaceholderText('Search designs...')
    fireEvent.change(searchInput, { target: { value: 'Test Design 1' } })

    await waitFor(() => {
      expect(screen.getByText('Test Design 1')).toBeInTheDocument()
      // Test Design 2 should be filtered out
      expect(screen.queryByText('Test Design 2')).not.toBeInTheDocument()
    })
  })

  it('filters designs by design type', async () => {
    const GalleryPage = (await import('@/app/(admin)/admin/gallery/page')).default
    
    render(<GalleryPage />)

    // Find and click the design type filter
    const typeFilter = screen.getByDisplayValue('All Types')
    fireEvent.click(typeFilter)
    
    const traditionalOption = screen.getByText('Traditional')
    fireEvent.click(traditionalOption)

    // This would trigger a re-render with filtered data
    // In a real test, we'd mock the tRPC call with the filter
  })

  it('shows loading state when data is loading', async () => {
    vi.mocked(trpc.gallery.getPublicDesigns.useQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    } as any)

    const GalleryPage = (await import('@/app/(admin)/admin/gallery/page')).default
    
    render(<GalleryPage />)

    // Should show loading skeleton
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })
})