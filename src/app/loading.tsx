/**
 * Root app loading state
 * Provides loading UI for the entire application
 * Uses the loading component for consistency
 */
import { LoadingUI } from '@/components/admin/layout/Loading';

export default function Loading() {
  return <LoadingUI type="page" />;
}
