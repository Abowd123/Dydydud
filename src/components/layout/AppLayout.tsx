import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useOutlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { ReloadPrompt } from '@/pwa/ReloadPrompt';

export function AppLayout() {
  const location = useLocation();
  const outlet = useOutlet();
  return (
    <div className="min-h-dvh bg-bg">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={location.pathname} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          {outlet}
        </motion.div>
      </AnimatePresence>
      <BottomNav />
      <ReloadPrompt />
    </div>
  );
}
