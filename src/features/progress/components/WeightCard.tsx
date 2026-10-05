import { Plus, Scale, TrendingDown, TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTranslation } from 'react-i18next';
import { Badge, Button } from '@/components/ui';
import type { Goal } from '@/types/profile';
import { movingAverage, weeklyTrend, type BodyMetric } from '../lib/stats';
import { ChartCard, chartTheme } from './ChartCard';

export function WeightCard({ metrics, goal, onAdd }: { metrics: BodyMetric[]; goal?: Goal; onAdd: () => void }) {
  const { t } = useTranslation();
  const pts = metrics.filter((m) => m.weightKg).map((m) => ({ date: m.date, value: m.weightKg! }));
  const data = movingAverage(pts).map((p) => ({ ...p, label: p.date.slice(5) }));
  const trend = weeklyTrend(pts.slice(-28));
  const first = pts[0]?.value, last = pts[pts.length - 1]?.value;
  const change = first && last ? Math.round((last - first) * 10) / 10 : 0;
  const good = trend === null ? null : goal === 'cut' ? trend < 0 : goal === 'bulk' ? trend > 0 : Math.abs(trend) < 0.3;
  const Trend = (trend ?? 0) < 0 ? TrendingDown : TrendingUp;

  return (
    <ChartCard title={t('progress.weight')} icon={<Scale size={18} className="text-primary" />}
      right={<Button size="sm" onClick={onAdd}><Plus size={16} /> {t('progress.log')}</Button>}
      empty={pts.length < 2 && t('progress.weightEmpty')}>
      <div className="mb-3 flex items-end justify-between" dir="auto">
        <div>
          <p className="font-display text-5xl tracking-wide">{last}<span className="text-lg text-muted"> kg</span></p>
          <p className="text-xs text-muted">{change > 0 ? '+' : ''}{change} kg {t('progress.sinceStart')}</p>
        </div>
        {trend !== null && (
          <Badge tone={good ? 'primary' : 'accent'} className="text-sm"><Trend size={14} /> {trend > 0 ? '+' : ''}{trend} {t('progress.perWeek')}</Badge>
        )}
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
          <defs>
            <linearGradient id="wfill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#D4AF6A" stopOpacity={0.35} /><stop offset="1" stopColor="#D4AF6A" stopOpacity={0} /></linearGradient>
          </defs>
          <CartesianGrid stroke={chartTheme.grid} vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={chartTheme.axis} tickLine={false} axisLine={false} minTickGap={24} />
          <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={chartTheme.axis} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={chartTheme.tooltip} />
          <Area type="monotone" dataKey="value" name={t('progress.weight')} stroke="#D4AF6A55" fill="url(#wfill)" dot={{ r: 2, fill: '#D4AF6A' }} />
          <Line type="monotone" dataKey="avg" name={t('progress.avg7')} stroke="#D4AF6A" strokeWidth={3} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
      <p className="mt-1 text-center text-xs text-muted" dir="auto">{t('progress.avgHint')}</p>
    </ChartCard>
  );
}
