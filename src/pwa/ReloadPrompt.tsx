import { AnimatePresence, motion } from 'framer-motion';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';

export function ReloadPrompt() {
  const { t } = useTranslation();
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker
  } = useRegisterSW();
  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };
  return (
    <AnimatePresence>
      {(offlineReady || needRefresh) && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          className="glass fixed inset-x-4 top-4 z-50 mx-auto flex max-w-md items-center gap-3 rounded-2xl p-3 shadow-soft"
        >
          <p className="flex-1 text-sm font-semibold">{needRefresh ? t('pwa.update') : t('pwa.offline')}</p>
          {needRefresh && (
            <Button size="sm" onClick={() => updateServiceWorker(true)}>
              {t('pwa.reload')}
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={close}>
            {t('common.close')}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
