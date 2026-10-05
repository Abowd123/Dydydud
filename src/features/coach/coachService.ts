import { supabase } from '@/lib/supabase';
import type { ChatMsg, CoachContext } from '../../../supabase/functions/_shared/coach';
import { detectRedFlags, SAFETY_REPLY, topFlag, BLOCKING } from '../../../supabase/functions/_shared/coach';
import { localCoach, type CoachReply } from './localCoach';

export const aiAvailable = async () => {
  if (!supabase || !navigator.onLine) return false;
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};

/** يقرأ بث SSE من الـ Edge Function ويرجع النص تدريجياً */
async function* streamAI(messages: ChatMsg[], context: CoachContext, signal?: AbortSignal): AsyncGenerator<string> {
  const { data } = await supabase!.auth.getSession();
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/coach`;
  const res = await fetch(url, {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session!.access_token}`, apikey: import.meta.env.VITE_SUPABASE_ANON_KEY },
    body: JSON.stringify({ messages, context })
  });
  if (!res.ok || !res.body) throw new Error(`coach ${res.status}`);
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const parts = buf.split('\n\n');
    buf = parts.pop() ?? '';
    for (const p of parts) {
      const line = p.trim();
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (payload === '[DONE]') return;
      try { yield JSON.parse(payload).delta as string; } catch { /* تجاهل */ }
    }
  }
}

export type AskResult = { stream: AsyncGenerator<string>; source: 'ai' } | { reply: CoachReply; source: 'local' | 'safety' };

/** القرار: أمان ← ذكاء اصطناعي (لو متوفر) ← المدرب المحلي */
export async function ask(messages: ChatMsg[], context: CoachContext, signal?: AbortSignal): Promise<AskResult> {
  const last = messages[messages.length - 1]?.content ?? '';
  const flag = topFlag(detectRedFlags(last));
  if (flag && BLOCKING.includes(flag)) return { reply: { text: SAFETY_REPLY[context.lang][flag], source: 'safety' }, source: 'safety' };
  if (await aiAvailable()) {
    try {
      const gen = streamAI(messages, context, signal);
      return { stream: gen, source: 'ai' };
    } catch {
      /* نرجع للمحلي */
    }
  }
  const reply = localCoach(last, context);
  return { reply, source: reply.source };
}
