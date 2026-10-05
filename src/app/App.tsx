import { MotionConfig } from 'framer-motion';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useApplySettings } from '@/hooks/useApplySettings';
import { ErrorBoundary } from '@/components/system/ErrorBoundary';

export default function App() {
  useApplySettings();
  return (
    <MotionConfig reducedMotion="user">
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </MotionConfig>
  );
}
