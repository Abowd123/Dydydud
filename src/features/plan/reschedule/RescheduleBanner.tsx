import { CalendarClock, HeartHandshake, Undo2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui';
import { useSettings } from '@/store/settings';
import type { WeekPlan } from './reschedule';

/** رسالة لطيفة: "فاتك Pull أمس؟ ولا يهمك، نقلناه لليوم" */
export function RescheduleBanner({ plan }: { plan: WeekPlan }) {
  const { t } = useTranslation();
  const setPref = useSettings((s) => s.setPref);
  const enabled = useSettings((s) => s.smartReschedule);
  const m = plan.moved.find((x) => x.to === plan.today.weekday) ?? plan.moved[0];

  if (plan.comeback)
    return (
      <Card className="mb-4 flex gap-3 border-water/40">
        <HeartHandshake className="shrink-0 text-water" />
        <div>
          <p className="font-bold">{t('resched.comebackT', { d: plan.daysSinceLast })}</p>
          <p className="text-sm text-muted">{t('resched.comebackD')}</p>
        </div>
      </Card>
    );
  if (!enabled || (!m && !plan.dropped.length)) return null;
  return (
    <Card className="mb-4 flex gap-3 border-gold/30">
      <CalendarClock className="shrink-0 text-gold" />
      <div className="flex-1">
        {m && <p className="font-bold">{t('resched.movedT', { day: t(`days.${m.dayKey}`), from: t(`weekdays.${m.from}`), to: m.to === plan.today.weekday ? t('resched.today') : t(`weekdays.${m.to}`) })}</p>}
        <p className="text-sm text-muted">{plan.dropped.length ? t('resched.dropped', { n: plan.dropped.length }) : t('resched.movedD')}</p>
      </div>
      <button onClick={() => setPref('smartReschedule', false)} aria-label={t('resched.undo')} title={t('resched.undo')}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-elevated text-muted hover:text-text"><Undo2 size={18} /></button>
    </Card>
  );
}
