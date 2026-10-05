import { BarChart3 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTranslation } from 'react-i18next';
import type { WorkoutSession } from '@/types/workout';
import { weeklyVolume } from '../lib/stats';
import { ChartCard, chartTheme } from './ChartCard';

export function VolumeCard({ sessions }: { sessions: WorkoutSession[] }) {
  const { t } = useTranslation();
  const data = weeklyVolume(sessions).map((w) => ({ ...w, label: w.week.slice(5) }));
  return (
    <ChartCard title={t('progress.volume')} icon={<BarChart3 size={18} className="text-accent" />} empty={!data.some((d) => d.workouts) && t('progress.strengthEmpty')}>
      <ResponsiveContainer width="100%" height={170}>
        <BarChart data={data} margin={{ left: -10, right: 8, top: 8 }}>
          <defs><linearGradient id="vbar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E0823F" /><stop offset="1" stopColor="#D4AF6A" /></linearGradient></defs>
          <CartesianGrid stroke={chartTheme.grid} vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={chartTheme.axis} tickLine={false} axisLine={false} />
          <YAxis tick={chartTheme.axis} tickLine={false} axisLine={false} tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)} />
          <Tooltip contentStyle={chartTheme.tooltip} cursor={{ fill: 'rgb(var(--elevated))' }}
            formatter={(v, _n, p) => [`${Number(v).toLocaleString()} kg • ${(p.payload as { workouts: number }).workouts} ${t('progress.workouts')}`, t('progress.volume')]} />
          <Bar dataKey="volume" fill="url(#vbar)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
