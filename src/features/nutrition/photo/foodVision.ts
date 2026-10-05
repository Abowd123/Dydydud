import { supabase } from '@/lib/supabase';
import { parseVision, type Recognized } from './recognize';

export type VisionError = 'offline' | 'signin' | 'limit' | 'notFood' | 'failed' | 'not_configured';
export type VisionResult = { ok: true; items: Recognized[]; remaining?: number } | { ok: false; error: VisionError };

export async function visionReady(): Promise<VisionError | null> {
  if (!navigator.onLine) return 'offline';
  if (!supabase) return 'not_configured';
  const { data } = await supabase.auth.getSession();
  return data.session ? null : 'signin';
}

export async function recognizeMeal(image: string, lang: 'ar' | 'en'): Promise<VisionResult> {
  const pre = await visionReady();
  if (pre) return { ok: false, error: pre };
  const { data } = await supabase!.auth.getSession();
  try {
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/food-vision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session!.access_token}`, apikey: import.meta.env.VITE_SUPABASE_ANON_KEY },
      body: JSON.stringify({ image, lang })
    });
    if (res.status === 429) return { ok: false, error: 'limit' };
    if (res.status === 503) return { ok: false, error: 'not_configured' };
    if (!res.ok) return { ok: false, error: 'failed' };
    const body = (await res.json()) as { raw: string; remaining?: number };
    const parsed = parseVision(body.raw);
    if (!parsed) return { ok: false, error: 'failed' };
    if (parsed.notFood) return { ok: false, error: 'notFood' };
    return { ok: true, items: parsed.items, remaining: body.remaining };
  } catch {
    return { ok: false, error: 'failed' };
  }
}
