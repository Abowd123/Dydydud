import { dueReminders, type ReminderPrefs } from '../../../supabase/functions/_shared/reminders';
import { db } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/sync/engine';
import { useSettings } from '@/store/settings';

const VAPID = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;
export const pushSupported = () => 'Notification' in window && 'serviceWorker' in navigator;
export const serverPushAvailable = () => pushSupported() && 'PushManager' in window && !!VAPID && !!supabase;

export async function requestPermission() {
  if (!pushSupported()) return 'denied' as NotificationPermission;
  return Notification.permission === 'default' ? Notification.requestPermission() : Notification.permission;
}

async function currentPrefs(): Promise<Omit<ReminderPrefs, 'last_sent'>> {
  const { reminders, lang } = useSettings.getState();
  const program = await db.programs.get('current');
  return {
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    lang,
    workout_time: reminders.workoutTime,
    training_days: program?.week.filter((w) => w.type === 'train').map((w) => w.weekday) ?? [],
    water_interval_h: reminders.waterEveryH,
    water_start: reminders.waterStart,
    water_end: reminders.waterEnd
  };
}

const b64ToUint8 = (b64: string) => {
  const pad = '='.repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
};

/** يسجّل الجهاز لإشعارات السيرفر (تشتغل حتى والتطبيق مقفل) */
export async function syncPushSubscription() {
  const uid = getCurrentUserId();
  if (!serverPushAvailable() || !uid || Notification.permission !== 'granted') return false;
  const reg = await navigator.serviceWorker.ready;
  const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToUint8(VAPID!) }));
  const json = sub.toJSON();
  const prefs = await currentPrefs();
  const { error } = await supabase!.from('push_subscriptions').upsert(
    { user_id: uid, endpoint: sub.endpoint, p256dh: json.keys?.p256dh, auth: json.keys?.auth, ...prefs },
    { onConflict: 'endpoint' }
  );
  return !error;
}

export async function showLocal(title: string, body: string, url: string) {
  const reg = await navigator.serviceWorker?.ready;
  const opts: NotificationOptions = { body, icon: '/icons/icon-192.png', badge: '/icons/icon-192.png', data: { url }, tag: url };
  if (reg) await reg.showNotification(title, opts);
  else new Notification(title, opts);
}

/** بديل محلي: لو ما فيه سيرفر، نذكّر والتطبيق مفتوح (أو بالخلفية القريبة) */
export function startLocalReminders() {
  const KEY = 'gymmate-reminders-sent';
  const tick = async () => {
    if (!pushSupported() || Notification.permission !== 'granted') return;
    if (serverPushAvailable() && getCurrentUserId()) return; // السيرفر يتكفل
    const last_sent = JSON.parse(localStorage.getItem(KEY) || '{}');
    const due = dueReminders({ ...(await currentPrefs()), last_sent }, new Date(), 2);
    for (const r of due) {
      await showLocal(r.title, r.body, r.url);
      last_sent[r.kind] = r.key;
    }
    localStorage.setItem(KEY, JSON.stringify(last_sent));
  };
  void tick();
  return setInterval(tick, 60_000);
}
