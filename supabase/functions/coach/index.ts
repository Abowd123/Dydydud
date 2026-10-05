// Supabase Edge Function: المدرب الذكي (بث مباشر SSE)
// النشر: supabase functions deploy coach
// الأسرار: supabase secrets set LLM_API_KEY=... [LLM_BASE_URL=https://api.openai.com/v1] [COACH_MODEL=gpt-4o-mini] [COACH_DAILY_LIMIT=40]
// يدعم أي مزود متوافق مع OpenAI Chat Completions (OpenAI, Groq, OpenRouter, Together...)
import { createClient } from 'npm:@supabase/supabase-js@2';
import { BLOCKING, buildSystemPrompt, detectRedFlags, SAFETY_REPLY, topFlag, trimHistory, type ChatMsg, type CoachContext } from '../_shared/coach.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
const sse = (text: string) => `data: ${JSON.stringify({ delta: text })}\n\n`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return new Response('method', { status: 405, headers: CORS });

  // 1) التحقق من المستخدم
  const auth = req.headers.get('Authorization') ?? '';
  const url = Deno.env.get('SUPABASE_URL')!;
  const userClient = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return new Response('unauthorized', { status: 401, headers: CORS });

  const { messages, context } = (await req.json()) as { messages: ChatMsg[]; context: CoachContext };
  const lang = context?.lang === 'en' ? 'en' : 'ar';
  const history = trimHistory(messages ?? []);
  const last = history[history.length - 1]?.content ?? '';
  const headers = { ...CORS, 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' };

  // 2) الأمان أولاً: الحالات الخطيرة ما تروح للنموذج
  const flag = topFlag(detectRedFlags(last));
  if (flag && BLOCKING.includes(flag)) return new Response(sse(SAFETY_REPLY[lang][flag]) + 'data: [DONE]\n\n', { headers });

  // 3) حد الاستخدام اليومي
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const limit = Number(Deno.env.get('COACH_DAILY_LIMIT') ?? 40);
  const { data: count } = await admin.rpc('coach_increment', { p_user: user.id, p_limit: limit });
  if (count === -1) {
    const msg = lang === 'ar' ? `وصلت حد اليوم (${limit} رسالة). أرجع لك بكرة 💪 والأسئلة السريعة تشتغل بدون حد.` : `Daily limit reached (${limit}). See you tomorrow 💪`;
    return new Response(sse(msg) + 'data: [DONE]\n\n', { headers });
  }

  // 4) الطلب للنموذج مع البث
  const system = buildSystemPrompt({ ...context, lang }) + (flag ? `\n\nIMPORTANT: user mentioned a ${flag} concern. Start your answer with: ${SAFETY_REPLY[lang][flag]}` : '');
  const upstream = await fetch(`${Deno.env.get('LLM_BASE_URL') ?? 'https://api.openai.com/v1'}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${Deno.env.get('LLM_API_KEY')}` },
    body: JSON.stringify({ model: Deno.env.get('COACH_MODEL') ?? 'gpt-4o-mini', stream: true, temperature: 0.5, max_tokens: 600, messages: [{ role: 'system', content: system }, ...history] })
  });
  if (!upstream.ok || !upstream.body) {
    const msg = lang === 'ar' ? 'المدرب مشغول شوي، جرّب بعد دقيقة.' : 'Coach is busy, try again in a minute.';
    return new Response(sse(msg) + 'data: [DONE]\n\n', { headers });
  }

  // نحول بث OpenAI لصيغة مبسطة { delta }
  const reader = upstream.body.getReader();
  const dec = new TextDecoder();
  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(ctrl) {
      let buf = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const l of lines) {
          const t = l.trim();
          if (!t.startsWith('data:')) continue;
          const payload = t.slice(5).trim();
          if (payload === '[DONE]') continue;
          try {
            const delta = JSON.parse(payload).choices?.[0]?.delta?.content;
            if (delta) ctrl.enqueue(enc.encode(sse(delta)));
          } catch { /* سطر ناقص */ }
        }
      }
      ctrl.enqueue(enc.encode('data: [DONE]\n\n'));
      ctrl.close();
    }
  });
  return new Response(stream, { headers });
});
