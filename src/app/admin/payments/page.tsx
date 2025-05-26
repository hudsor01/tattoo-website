import dynamic from 'next/dynamic'
import { PageLoading } from '@/components/admin/StandardLoadingStates'

const PaymentsPageContent = dynamic(() => import('./PaymentsPageContent'), {
  loading: () => <PageLoading text="Loading payments..." />
})

export default function PaymentsPage() {
  return <PaymentsPageContent />
}