import { Pill } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge, Card } from '@/components/ui';

const ITEMS = [
  { id: 'whey', tone: 'primary' },
  { id: 'creatine', tone: 'primary' },
  { id: 'vitaminD', tone: 'water' },
  { id: 'omega3', tone: 'water' },
  { id: 'caffeine', tone: 'accent' },
  { id: 'bcaa', tone: 'muted' }
] as const;

export function SupplementsGuide() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3">
      <Card variant="hero">
        <p className="font-bold">{t('supp.intro')}</p>
        <p className="text-sm text-muted">{t('supp.introD')}</p>
      </Card>
      {ITEMS.map(({ id, tone }) => (
        <Card key={id} className="flex gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-elevated"><Pill size={20} className="text-primary" /></span>
          <div className="flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h3 className="font-bold">{t(`supp.${id}.name`)}</h3>
              <Badge tone={tone}>{t(`supp.${id}.verdict`)}</Badge>
            </div>
            <p className="text-sm text-muted">{t(`supp.${id}.desc`)}</p>
            <p className="mt-1 text-sm"><b>{t('supp.dose')}:</b> {t(`supp.${id}.dose`)}</p>
          </div>
        </Card>
      ))}
      <p className="rounded-2xl bg-danger/10 p-3 text-center text-xs text-danger">{t('supp.warn')}</p>
    </div>
  );
}
