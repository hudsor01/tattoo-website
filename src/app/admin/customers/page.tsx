import dynamic from 'next/dynamic';
import { AdminCustomersLoading } from '@/components/admin/AdminLoadingStates';

const CustomersOptimistic = dynamic(() => import('@/components/admin/CustomersOptimistic'), {
  loading: () => <AdminCustomersLoading />,
});

export default function CustomersPage() {
  return <CustomersOptimistic />;
}
