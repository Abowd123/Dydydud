import type { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageTransition } from '@/components/layout/PageTransition';
import { TopBar } from '@/components/layout/TopBar';
import { EmptyState } from '@/components/ui';

interface Props { title: string; icon: LucideIcon; description: string; phase: number; back?: boolean }

export function PlaceholderPage({ title, icon, description, phase, back }: Props) {
  const { t } = useTranslation();
  return (
    <PageTransition>
      <TopBar title={title} back={back} />
      <EmptyState icon={icon} title={title} description={description} phase={t('common.phase', { n: phase })} />
    </PageTransition>
  );
}
