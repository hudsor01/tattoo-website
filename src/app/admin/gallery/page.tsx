import dynamic from 'next/dynamic'
import { PageLoading } from '@/components/admin/StandardLoadingStates'

const GalleryPageContent = dynamic(() => import('./GalleryPageContent'), {
  loading: () => <PageLoading text="Loading gallery..." />
})

export default function GalleryPage() {
  return <GalleryPageContent />
}