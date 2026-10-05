// Supabase Edge Function (Deno): يرسل تذكيرات التمرين والماء
// النشر: supabase functions deploy send-reminders --no-verify-jwt
// الأسرار: supabase secrets set VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... VAPID_SUBJECT=mailto:you@mail.com CRON_SECRET=...
import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { dueReminders, type ReminderPrefs } from '../_shared/reminders.ts';

Deno.serve(async (req) => {
  if (req.headers.get('Authorization') !== `Bearer ${Deno.env.get('CRON_SECRET')}`) return new Response('unauthorized', { status: 401 });

  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  webpush.setVapidDetails(Deno.env.get('VAPID_SUBJECT')!, Deno.env.get('VAPID_PUBLIC_KEY')!, Deno.env.get('VAPID_PRIVATE_KEY')!);

  const { data: subs, error } = await sb.from('push_subscriptions').select('*');
  if (error) return new Response(error.message, { status: 500 });

  const now = new Date();
  let sent = 0, removed = 0;
  for (const sub of subs ?? []) {
    const due = dueReminders(sub as ReminderPrefs, now);
    if (!due.length) continue;
    const last_sent = { ...(sub.last_sent ?? {}) };
    for (const r of due) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({ title: r.title, body: r.body, url: r.url, tag: r.kind }),
          { TTL: 1800 }
        );
        last_sent[r.kind] = r.key;
        sent++;
      } catch (e) {
        const code = (e as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) { await sb.from('push_subscriptions').delete().eq('id', sub.id); removed++; break; }
      }
    }
    await sb.from('push_subscriptions').update({ last_sent }).eq('id', sub.id);
  }
  return Response.json({ ok: true, checked: subs?.length ?? 0, sent, removed });
});
