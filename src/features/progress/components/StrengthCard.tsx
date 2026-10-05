import { Dumbbell } from 'lucide-react';
import { useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';
import { useSettings } from '@/store/settings';
import type { WorkoutSession } from '@/types/workout';
import { getExercise } from '@/features/exercises/lib/repository';
import { strengthSeries, trackedExercises } from '../lib/stats';
import { ChartCard, chartTheme } from './ChartCard';

export function StrengthCard({ sessions }: { sessions: WorkoutSession[] }) {
  const { t } = useTranslation();
  const lang = useSettings((s) => s.lang);
  const ids = trackedExercises(sessions);
  const [sel, setSel] = useState<string | undefined>();
  const id = sel ?? ids[0];
  const data = id ? strengthSeries(sessions, id).map((p) => ({ ...p, label: p.date.slice(5) })) : [];
  const gain = data.length > 1 ? Math.round((data[data.length - 1].est1RM - data[0].est1RM) * 10) / 10 : 0;

  return (
    <ChartCard title={t('progress.strength')} icon={<Dumbbell size={18} className="text-water" />} empty={!ids.length && t('progress.strengthEmpty')}
      right={gain > 0 ? <span className="text-sm font-bold text-primary">+{gain} kg</span> : undefined}>
      <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto" dir="auto">
        {ids.slice(0, 8).map((x) => (
          <button key={x} onClick={() => setSel(x)} className={cn('h-8 shrink-0 rounded-full border px-3 text-xs font-bold', x === id ? 'border-water bg-water/15 text-water' : 'border-border text-muted')}>
            {getExercise(x)?.name[lang]}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
          <CartesianGrid stroke={chartTheme.grid} vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={chartTheme.axis} tickLine={false} axisLine={false} minTickGap={24} />
          <YAxis domain={['dataMin - 5', 'dataMax + 5']} tick={chartTheme.axis} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={chartTheme.tooltip} formatter={(v) => [`${v} kg`, '1RM']} />
          <Line type="monotone" dataKey="est1RM" stroke="#7DB4D6" strokeWidth={3} dot={{ r: 3, fill: '#7DB4D6' }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
      <p className="mt-1 text-center text-xs text-muted" dir="auto">{t('progress.strengthHint')}</p>
    </ChartCard>
  );
}
