import { Bell, BellOff, Droplets, Dumbbell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageTransition } from '@/components/layout/PageTransition';
import { TopBar } from '@/components/layout/TopBar';
import { Badge, Button, Card, CardTitle } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useSettings } from '@/store/settings';
import { pushSupported, requestPermission, serverPushAvailable, showLocal, syncPushSubscription } from './reminders';

export function RemindersPage() {
  const { t } = useTranslation();
  const { reminders, setReminders } = useSettings();
  const [perm, setPerm] = useState<NotificationPermission>(pushSupported() ? Notification.permission : 'denied');
  const [serverOk, setServerOk] = useState(false);

  useEffect(() => {
    if (perm === 'granted') void syncPushSubscription().then(setServerOk);
  }, [perm, reminders]);

  const enable = async () => setPerm(await requestPermission());

  return (
    <PageTransition>
      <TopBar back title={t('rem.title')} />
      <div className="flex flex-col gap-4">
        <Card className="flex items-center gap-3">
          {perm === 'granted' ? <Bell className="text-primary" /> : <BellOff className="text-muted" />}
          <div className="flex-1">
            <p className="font-bold">{t(`rem.perm.${perm}`)}</p>
            <p className="text-xs text-muted">{serverOk ? t('rem.server') : serverPushAvailable() ? t('rem.signInHint') : t('rem.localOnly')}</p>
          </div>
          {perm !== 'granted' && pushSupported() && <Button size="sm" onClick={enable} disabled={perm === 'denied'}>{t('rem.enable')}</Button>}
        </Card>

        <Card className="flex flex-col gap-3">
          <CardTitle className="flex items-center gap-2"><Dumbbell size={18} className="text-primary" /> {t('rem.workout')}</CardTitle>
          <div className="flex items-center gap-3">
            <input type="time" value={reminders.workoutTime ?? ''} onChange={(e) => setReminders({ workoutTime: e.target.value || null })}
              className="h-12 flex-1 rounded-2xl border border-border bg-elevated px-4 text-lg font-bold" dir="ltr" />
            {reminders.workoutTime && <Button variant="ghost" size="sm" onClick={() => setReminders({ workoutTime: null })}>{t('rem.off')}</Button>}
          </div>
          <p className="text-xs text-muted">{t('rem.workoutHint')}</p>
        </Card>

        <Card className="flex flex-col gap-3">
          <CardTitle className="flex items-center gap-2"><Droplets size={18} className="text-water" /> {t('rem.water')}</CardTitle>
          <div className="grid grid-cols-4 gap-2">
            {[null, 1, 2, 3].map((h) => (
              <button key={String(h)} onClick={() => setReminders({ waterEveryH: h })}
                className={cn('h-11 rounded-2xl text-sm font-bold', reminders.waterEveryH === h ? 'bg-water text-ink' : 'bg-elevated text-muted')}>
                {h ? t('rem.everyH', { h }) : t('rem.off')}
              </button>
            ))}
          </div>
          {reminders.waterEveryH && (
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="text-muted">{t('rem.from')}</span>
              <select value={reminders.waterStart} onChange={(e) => setReminders({ waterStart: Number(e.target.value) })} className="h-10 rounded-xl bg-elevated px-2" dir="ltr">
                {Array.from({ length: 12 }, (_, i) => i + 6).map((h) => <option key={h} value={h}>{h}:00</option>)}
              </select>
              <span className="text-muted">{t('rem.to')}</span>
              <select value={reminders.waterEnd} onChange={(e) => setReminders({ waterEnd: Number(e.target.value) })} className="h-10 rounded-xl bg-elevated px-2" dir="ltr">
                {Array.from({ length: 10 }, (_, i) => i + 15).map((h) => <option key={h} value={h}>{h}:00</option>)}
              </select>
            </div>
          )}
        </Card>

        {perm === 'granted' && <Button variant="secondary" onClick={() => void showLocal(t('rem.testT'), t('rem.testB'), '/')}>{t('rem.test')}</Button>}
        {!pushSupported() && <Badge tone="danger" className="justify-center py-2">{t('rem.unsupported')}</Badge>}
        <p className="text-center text-xs text-muted">{t('rem.iosNote')}</p>
      </div>
    </PageTransition>
  );
}
