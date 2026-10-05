-- تشغيل التذكيرات كل 15 دقيقة (يحتاج pg_cron و pg_net من Database > Extensions)
-- غيّر <PROJECT_REF> و <CRON_SECRET>
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'gymmate-reminders',
  '*/15 * * * *',
  $$ select net.http_post(
       url := 'https://<PROJECT_REF>.supabase.co/functions/v1/send-reminders',
       headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer <CRON_SECRET>'),
       body := '{}'::jsonb
     ); $$
);
