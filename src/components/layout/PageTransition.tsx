import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useDirection } from '@/hooks/useDirection';

export function PageTransition({ children }: { children: ReactNode }) {
  const dir = useDirection();
  return (
    <motion.main
      className="page"
      initial={{ opacity: 0, x: 24 * dir }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {children}
    </motion.main>
  );
}
