import { Suspense } from 'react';
import AdminLoading from '../loading';

export default function SettingsPage() {
  return (
    <Suspense fallback={<AdminLoading />}>
    </Suspense>
  );
}