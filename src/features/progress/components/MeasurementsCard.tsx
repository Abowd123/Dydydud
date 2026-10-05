import { Ruler } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { navyBodyFat } from '@/lib/calculations';
import type { Profile } from '@/types/profile';
import type { BodyMetric } from '../lib/stats';
import { ChartCard } from './ChartCard';

const FIELDS = ['waistCm', 'chestCm', 'armCm', 'hipCm', 'neckCm'] as const;

export function MeasurementsCard({ metrics, profile }: { metrics: BodyMetric[]; profile?: Profile }) {
  const { t } = useTranslation();
  const latest = (f: (typeof FIELDS)[number]) => [...metrics].reverse().find((m) => m[f])?.[f];
  const first = (f: (typeof FIELDS)[number]) => metrics.find((m) => m[f])?.[f];
  const any = FIELDS.some((f) => latest(f));
  const bf = profile ? navyBodyFat(profile.gender, profile.heightCm, latest('waistCm'), latest('neckCm'), latest('hipCm')) : null;
  return (
    <ChartCard title={t('progress.measurements')} icon={<Ruler size={18} className="text-accent" />} empty={!any && t('progress.measureEmpty')}>
      <div className="grid grid-cols-3 gap-2" dir="auto">
        {FIELDS.filter((f) => latest(f)).map((f) => {
          const d = Math.round(((latest(f) ?? 0) - (first(f) ?? 0)) * 10) / 10;
          return (
            <div key={f} className="rounded-2xl bg-elevated p-3 text-center">
              <p className="text-xs text-muted">{t(`progress.f.${f}`)}</p>
              <p className="text-xl font-extrabold">{latest(f)}<span className="text-xs text-muted"> cm</span></p>
              {d !== 0 && <p className={`text-xs font-bold ${d < 0 ? 'text-primary' : 'text-accent'}`}>{d > 0 ? '+' : ''}{d}</p>}
            </div>
          );
        })}
        {bf !== null && (
          <div className="rounded-2xl bg-grad-hero p-3 text-center ring-1 ring-primary/30">
            <p className="text-xs text-muted">{t('progress.bodyFat')}</p>
            <p className="text-xl font-extrabold text-primary">{bf}%</p>
            <p className="text-xs text-muted">US Navy</p>
          </div>
        )}
      </div>
    </ChartCard>
  );
}
