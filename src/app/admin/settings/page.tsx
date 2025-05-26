import dynamic from 'next/dynamic';
import { PageLoading } from '@/components/admin/StandardLoadingStates';

const SettingsPageContent = dynamic(() => import('./SettingsPageContent'), {
  loading: () => <PageLoading text="Loading settings..." />,
});

export default function SettingsPage() {
  return <SettingsPageContent />;
}
