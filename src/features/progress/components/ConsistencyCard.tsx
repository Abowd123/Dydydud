import { CalendarCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';
import type { WorkoutSession } from '@/types/workout';
import { consistencyGrid } from '../lib/stats';
import { ChartCard } from './ChartCard';

export function ConsistencyCard({ sessions }: { sessions: WorkoutSession[] }) {
  const { t } = useTranslation();
  const grid = consistencyGrid(sessions);
  const count = grid.flat().filter((c) => c.trained).length;
  return (
    <ChartCard title={t('progress.consistency')} icon={<CalendarCheck size={18} className="text-primary" />}
      right={<span className="text-sm text-muted">{t('progress.in12w', { n: count })}</span>}>
      <div className="flex justify-between gap-1">
        {grid.map((week, w) => (
          <div key={w} className="flex flex-1 flex-col gap-1">
            {week.map((c) => (
              <span key={c.date} title={c.date} className={cn('aspect-square rounded-[5px]', c.future ? 'bg-transparent' : c.trained ? 'bg-primary shadow-[0_0_6px_#D4AF6A88]' : 'bg-elevated')} />
            ))}
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
