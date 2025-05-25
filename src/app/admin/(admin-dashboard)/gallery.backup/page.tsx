'use client'

import { useState } from 'react'
import { Plus, Search, Edit, Trash2, Eye, Check, X, Image } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { ImageDropzone } from '@/components/ui/image-dropzone'
import { trpc } from '@/lib/trpc/client'
import { uploadFile } from '@/lib/supabase/upload'
import { format } from 'date-fns'
import type { TattooDesign } from '@prisma/client'

const designTypeOptions = [
  'Traditional',
  'Realism',
  'Japanese',
  'Blackwork',
  'Watercolor',
  'Geometric',
  'Portrait',
  'Biomechanical',
  'Abstract',
  'Custom'
]

const sizeOptions = [
  'Small (< 2 inches)',
  'Medium (2-4 inches)',
  'Large (4-8 inches)',
  'Extra Large (> 8 inches)',
  'Full Sleeve',
  'Half Sleeve',
  'Back Piece',
  'Full Body'
]

export default function GalleryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterApproval, setFilterApproval] = useState<string>('all')
  const [selectedDesign, setSelectedDesign] = useState<TattooDesign | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    images: [] as string[],
    designType: '',
    size: '',
    isApproved: false
  })
  
  const [isUploading, setIsUploading] = useState(false)

  // tRPC queries
  const { data: designsData, isLoading, refetch } = trpc.gallery.getPublicDesigns.useQuery({
    limit: 50,
    designType: filterType === 'all' ? undefined : filterType,
  })

  const { data: stats } = trpc.gallery.getStats.useQuery()
  const { data: designTypes } = trpc.gallery.getDesignTypes.useQuery()

  // Mutations
  const createDesignMutation = trpc.gallery.create.useMutation({
    onSuccess: () => {
      toast.success('Design created successfully')
      setCreateDialogOpen(false)
      resetForm()
      refetch()
    },
    onError: (error) => {
      console.error('Create design error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create design'
      toast.error('Error creating design', {
        description: errorMessage
      })
    }
  })

  const updateDesignMutation = trpc.gallery.update.useMutation({
    onSuccess: () => {
      toast.success('Design updated successfully')
      setEditDialogOpen(false)
      refetch()
    },
    onError: (error) => {
      console.error('Update design error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update design'
      toast.error('Error updating design', {
        description: errorMessage
      })
    }
  })

  const deleteDesignMutation = trpc.gallery.delete.useMutation({
    onSuccess: () => {
      toast.success('Design deleted successfully')
      refetch()
    },
    onError: (error) => {
      console.error('Delete design error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete design'
      toast.error('Error deleting design', {
        description: errorMessage
      })
    }
  })

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      images: [],
      designType: '',
      size: '',
      isApproved: false
    })
  }

  const handleView = (design: any) => {
    setSelectedDesign(design)
    setViewDialogOpen(true)
  }

  const handleEdit = (design: any) => {
    setSelectedDesign(design)
    setFormData({
      name: design.name || '',
      description: design.description || '',
      images: design.fileUrl ? [design.fileUrl] : [],
      designType: design.designType || '',
      size: design.size || '',
      isApproved: design.isApproved || false
    })
    setEditDialogOpen(true)
  }

  const handleDelete = (design: any) => {
    if (design.id && design.name && window.confirm(`Are you sure you want to delete "${design.name}"?`)) {
      deleteDesignMutation.mutate({ id: design.id })
    }
  }

  const handleApproval = (design: any, isApproved: boolean) => {
    if (design.id) {
      updateDesignMutation.mutate({
        id: design.id,
        isApproved
      })
    }
  }

  const handleCreate = () => {
    console.log('Form data before validation:', formData)
    
    if (!formData.name || formData.images.length === 0) {
      toast.error('Name and image are required')
      console.log('Validation failed:', { name: formData.name, images: formData.images })
      return
    }
    
    const mutationData = {
      name: formData.name,
      description: formData.description || undefined,
      images: formData.images,
      designType: formData.designType || undefined,
      size: formData.size || undefined,
      isApproved: formData.isApproved
    }
    
    console.log('Sending mutation data:', mutationData)
    createDesignMutation.mutate(mutationData)
  }

  const handleUpdate = () => {
    if (!selectedDesign) return
    updateDesignMutation.mutate({
      id: selectedDesign.id,
      name: formData.name || undefined,
      description: formData.description || undefined,
      images: formData.images.length > 0 ? formData.images : undefined,
      designType: formData.designType || undefined,
      size: formData.size || undefined,
      isApproved: formData.isApproved
    })
  }

  // Filter designs based on approval status
  const filteredDesigns = designsData?.designs?.filter(design => {
    if (filterApproval === 'approved') return design.isApproved
    if (filterApproval === 'pending') return !design.isApproved
    return true
  }) || []

  // Search filter
  const searchFilteredDesigns = filteredDesigns.filter(design =>
    design.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    design.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    design.designType?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gallery Management</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Design
        </Button>
      </div>

      {/* Gallery Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Image className="w-4 h-4 mr-2" />
              Total Designs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalDesigns || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Check className="w-4 h-4 mr-2" />
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.approvedDesigns || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <X className="w-4 h-4 mr-2" />
              Pending Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats?.pendingDesigns || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search designs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {designTypes?.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterApproval} onValueChange={setFilterApproval}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by approval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {searchFilteredDesigns.map((design) => (
          <Card key={design.id} className="overflow-hidden">
            <div className="aspect-square bg-gray-100 relative">
              {design.thumbnailUrl || design.fileUrl ? (
                <img
                  src={design.thumbnailUrl || design.fileUrl || ''}
                  alt={design.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <Badge variant={design.isApproved ? 'default' : 'secondary'}>
                  {design.isApproved ? 'Approved' : 'Pending'}
                </Badge>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold truncate">{design.name}</h3>
              {design.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {design.description}
                </p>
              )}
              <div className="flex gap-2 mt-2">
                {design.designType && (
                  <Badge variant="outline" className="text-xs">
                    {design.designType}
                  </Badge>
                )}
                {design.size && (
                  <Badge variant="outline" className="text-xs">
                    {design.size}
                  </Badge>
                )}
              </div>
              <div className="flex justify-between items-center mt-4">
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => handleView(design)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(design)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDelete(design)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex gap-1">
                  {!design.isApproved && (
                    <Button 
                      size="sm" 
                      onClick={() => handleApproval(design, true)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                  {design.isApproved && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleApproval(design, false)}
                      className="text-yellow-600 hover:text-yellow-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {searchFilteredDesigns.length === 0 && (
        <div className="text-center py-12">
          <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No designs found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}

      {/* View Design Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Design Details</DialogTitle>
            <DialogDescription>
              View detailed information about this tattoo design.
            </DialogDescription>
          </DialogHeader>
          {selectedDesign && (
            <div className="space-y-6">
              {(selectedDesign.fileUrl || selectedDesign.thumbnailUrl) && (
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={selectedDesign.fileUrl || selectedDesign.thumbnailUrl || ''}
                    alt={selectedDesign.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p>{selectedDesign.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant={selectedDesign.isApproved ? 'default' : 'secondary'}>
                    {selectedDesign.isApproved ? 'Approved' : 'Pending'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <p>{selectedDesign.designType || 'Not specified'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Size</Label>
                  <p>{selectedDesign.size || 'Not specified'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p>{selectedDesign.createdAt ? format(new Date(selectedDesign.createdAt), 'PPP') : 'Unknown'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Artist</Label>
                  <p>Fernando Govea</p>
                </div>
              </div>
              {selectedDesign.description && (
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="mt-1">{selectedDesign.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Design Dialog */}
      <Dialog open={createDialogOpen || editDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setCreateDialogOpen(false)
          setEditDialogOpen(false)
          resetForm()
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{createDialogOpen ? 'Create Design' : 'Edit Design'}</DialogTitle>
            <DialogDescription>
              {createDialogOpen ? 'Add a new tattoo design to the gallery.' : 'Update this tattoo design information.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Design name"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Design description"
                rows={3}
              />
            </div>
            <div>
              <Label>Upload Image</Label>
              <ImageDropzone
                value={formData.images}
                onUpload={async (file) => {
                  setIsUploading(true)
                  const uploadToast = toast.loading('Uploading image...', {
                    description: `Uploading ${file.name}`
                  })
                  
                  try {
                    const result = await uploadFile(file)
                    console.log('Upload result:', result)
                    if (result.error) {
                      toast.error('Upload failed', {
                        id: uploadToast,
                        description: result.error
                      })
                      throw new Error(result.error)
                    } else if (result.url) {
                      console.log('Setting images to:', result.url)
                      setFormData(prevData => ({ 
                        ...prevData, 
                        images: [result.url]
                      }))
                      toast.success('Image uploaded successfully', {
                        id: uploadToast,
                        description: `${file.name} is ready to use`
                      })
                      return result.url
                    } else {
                      console.error('Upload result missing URL:', result)
                      toast.error('Upload failed', {
                        id: uploadToast,
                        description: 'No URL returned from upload'
                      })
                      throw new Error('No URL returned from upload')
                    }
                  } catch (error) {
                    console.error('Upload error:', error)
                    const errorMessage = error instanceof Error ? error.message : 'Failed to upload image'
                    toast.error('Upload failed', {
                      id: uploadToast,
                      description: errorMessage
                    })
                    throw error
                  } finally {
                    setIsUploading(false)
                  }
                }}
                onRemove={() => {
                  setFormData(prevData => ({ ...prevData, images: [] }))
                  return []
                }}
                disabled={isUploading}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="designType">Design Type</Label>
                <Select value={formData.designType} onValueChange={(value) => setFormData({ ...formData, designType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {designTypeOptions.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="size">Size</Label>
                <Select value={formData.size} onValueChange={(value) => setFormData({ ...formData, size: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {sizeOptions.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isApproved"
                checked={formData.isApproved}
                onCheckedChange={(checked) => setFormData({ ...formData, isApproved: checked })}
              />
              <Label htmlFor="isApproved">Approved for public display</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => {
                setCreateDialogOpen(false)
                setEditDialogOpen(false)
                resetForm()
              }}>
                Cancel
              </Button>
              <Button 
                onClick={createDialogOpen ? handleCreate : handleUpdate}
                disabled={createDesignMutation.isPending || updateDesignMutation.isPending || !formData.name || formData.images.length === 0 || isUploading}
              >
                {(createDesignMutation.isPending || updateDesignMutation.isPending || isUploading) ? 'Saving...' : (createDialogOpen ? 'Create' : 'Update')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}