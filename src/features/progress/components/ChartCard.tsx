import type { ReactNode } from 'react';
import { Card, CardTitle } from '@/components/ui';

export function ChartCard({ title, icon, right, children, empty }: { title: string; icon?: ReactNode; right?: ReactNode; children: ReactNode; empty?: string | false }) {
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2 text-base">{icon}{title}</CardTitle>
        {right}
      </div>
      {empty ? <p className="py-8 text-center text-sm text-muted">{empty}</p> : <div dir="ltr">{children}</div>}
    </Card>
  );
}

export const chartTheme = {
  grid: 'rgb(var(--border))',
  axis: { fill: 'rgb(var(--muted))', fontSize: 11 },
  tooltip: { background: 'rgb(var(--surface))', border: '1px solid rgb(var(--border))', borderRadius: 12, color: 'rgb(var(--text))', fontSize: 12 }
};
