'use client'

import { useState } from 'react'
import { Plus, Search, Edit, Trash2, Eye, Check, X, Image } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { trpc } from '@/lib/trpc/client'
import { uploadFile } from '@/lib/supabase/upload'
import { format } from 'date-fns'
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/blocks/dropzone'
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

export default function GalleryPageContent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterApproval, setFilterApproval] = useState<string>('all')
  const [selectedDesign, setSelectedDesign] = useState<TattooDesign | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [designToDelete, setDesignToDelete] = useState<TattooDesign | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    designType: '',
    size: '',
    isApproved: false
  })
  
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

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
      void toast.success('Design created successfully')
      setCreateDialogOpen(false)
      resetForm()
      void refetch()
    },
    onError: (error) => {
      void console.warn('Create design error:', error)
      void toast.error('Failed to create design')
    }
  })

  const updateDesignMutation = trpc.gallery.update.useMutation({
    onSuccess: () => {
      void toast.success('Design updated successfully')
      setEditDialogOpen(false)
      void refetch()
    },
    onError: (error) => {
      void console.warn('Update design error:', error)
      void toast.error('Failed to update design')
    }
  })

  const deleteDesignMutation = trpc.gallery.delete.useMutation({
    onSuccess: () => {
      void toast.success('Design deleted successfully')
      void refetch()
    },
    onError: (error) => {
      void console.warn('Delete design error:', error)
      void toast.error('Failed to delete design')
    }
  })

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      designType: '',
      size: '',
      isApproved: false
    })
    setUploadedFiles([])
  }

  const handleView = (design: TattooDesign): void => {
    setSelectedDesign(design)
    setViewDialogOpen(true)
  }

  const handleEdit = (design: TattooDesign): void => {
    setSelectedDesign(design)
    setFormData({
      name: design.name ?? '',
      description: design.description ?? '',
      image: design.fileUrl ?? '',
      designType: design.designType ?? '',
      size: design.size ?? '',
      isApproved: design.isApproved ?? false
    })
    setEditDialogOpen(true)
  }

  const handleDelete = (design: TattooDesign): void => {
    setDesignToDelete(design)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = (): void => {
    if (designToDelete?.id) {
      void deleteDesignMutation.mutate({ id: designToDelete.id })
      setDeleteDialogOpen(false)
      setDesignToDelete(null)
    }
  }

  const handleApproval = (design: TattooDesign, isApproved: boolean): void => {
    if (design.id) {
      void updateDesignMutation.mutate({
        id: design.id,
        isApproved
      })
    }
  }

  const handleCreate = async () => {
    if (!formData.name) {
      void toast.error('Name is required')
      return
    }

    if (uploadedFiles.length === 0 && !formData.image) {
      void toast.error('Image is required')
      return
    }

    let imageUrl = formData.image

    // Upload file if there's a new one
    if (uploadedFiles.length > 0 && uploadedFiles[0]) {
      const uploadToast = toast.loading('Uploading image...')
      try {
        const result = await uploadFile(uploadedFiles[0])
        if (result.error) {
          void toast.error('Upload failed', { id: uploadToast })
          return
        }
        if (!result.url) {
          void toast.error('Upload failed - no URL returned', { id: uploadToast })
          return
        }
        imageUrl = result.url
        void toast.success('Image uploaded successfully', { id: uploadToast })
      } catch {
        void toast.error('Upload failed', { id: uploadToast })
        return
      }
    }

    // Final validation - ensure we have a valid image URL
    if (!imageUrl || imageUrl.trim().length === 0) {
      void toast.error('Image is required - upload failed or no image provided')
      return
    }

    // Create the design
    void createDesignMutation.mutate({
      name: formData.name,
      description: formData.description ?? undefined,
      image: imageUrl,
      designType: formData.designType ?? undefined,
      size: formData.size ?? undefined,
      isApproved: formData.isApproved
    })
  }

  const handleUpdate = async () => {
    if (!selectedDesign) return

    let imageUrl = formData.image

    // Upload file if there's a new one
    if (uploadedFiles.length > 0) {
      const uploadToast = toast.loading('Uploading image...')
      const fileToUpload = uploadedFiles[0]
      if (!fileToUpload) {
        void toast.error('No file selected', { id: uploadToast })
        return
      }
      try {
        const result = await uploadFile(fileToUpload)
        if (result.error) {
          void toast.error('Upload failed', { id: uploadToast })
          return
        }
        if (!result.url) {
          void toast.error('Upload failed - no URL returned', { id: uploadToast })
          return
        }
        imageUrl = result.url
        void toast.success('Image uploaded successfully', { id: uploadToast })
      } catch {
        void toast.error('Upload failed', { id: uploadToast })
        return
      }
    }

    void updateDesignMutation.mutate({
      id: selectedDesign.id,
      name: formData.name ?? undefined,
      description: formData.description ?? undefined,
      image: imageUrl ?? undefined,
      designType: formData.designType ?? undefined,
      size: formData.size ?? undefined,
      isApproved: formData.isApproved
    })
  }

  // Filter designs based on approval status
  const filteredDesigns = designsData?.designs?.filter(design => {
    if (filterApproval === 'approved') return design.isApproved
    if (filterApproval === 'pending') return !design.isApproved
    return true
  }) ?? []

  // Search filter
  const searchFilteredDesigns = filteredDesigns.filter(design =>
    design.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (design.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (design.designType?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  )

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }, (_, i) => `loading-card-${i}`).map((key) => (
              <div key={key} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }, (_, i) => `loading-design-${i}`).map((key) => (
              <div key={key} className="h-48 bg-gray-200 rounded"></div>
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
            <div className="text-2xl font-bold">{stats?.totalDesigns ?? 0}</div>
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
            <div className="text-2xl font-bold text-green-600">{stats?.approvedDesigns ?? 0}</div>
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
            <div className="text-2xl font-bold text-yellow-600">{stats?.pendingDesigns ?? 0}</div>
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
              {design.thumbnailUrl ?? design.fileUrl ? (
                <img
                  src={design.thumbnailUrl ?? design.fileUrl ?? ''}
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
              {(selectedDesign.fileUrl ?? selectedDesign.thumbnailUrl) && (
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={selectedDesign.fileUrl ?? selectedDesign.thumbnailUrl ?? ''}
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
                  <p>{selectedDesign.designType ?? 'Not specified'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Size</Label>
                  <p>{selectedDesign.size ?? 'Not specified'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p>{selectedDesign.createdAt ? format(new Date(selectedDesign.createdAt), 'PPP') : 'Unknown'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Artist</Label>
                  <p>Ink 37 Tattoos</p>
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
      <Dialog open={createDialogOpen ?? editDialogOpen} onOpenChange={(open) => {
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
              <Label>Upload Image *</Label>
              <Dropzone
                accept={{ 'image/*': [] }}
                maxFiles={1}
                maxSize={10 * 1024 * 1024} // 10MB
                onDrop={(acceptedFiles) => {
                  setUploadedFiles(acceptedFiles)
                }}
              >
                <DropzoneEmptyState />
                <DropzoneContent />
              </Dropzone>
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
                onClick={() => void (createDialogOpen ? handleCreate() : handleUpdate())}
                disabled={(createDesignMutation.isPending || updateDesignMutation.isPending) || !formData.name}
              >
                {(createDesignMutation.isPending || updateDesignMutation.isPending) ? 'Saving...' : (createDialogOpen ? 'Create' : 'Update')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Design</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{designToDelete?.name}&rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}