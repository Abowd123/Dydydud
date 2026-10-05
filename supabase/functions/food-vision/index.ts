// Supabase Edge Function: صوّر وجبتك
// النشر: supabase functions deploy food-vision
// يشتغل مع أي نموذج رؤية متوافق مع OpenAI. خيار مجاني: Google Gemini Flash
//   supabase secrets set VISION_API_KEY=<gemini key> VISION_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai VISION_MODEL=gemini-2.0-flash [VISION_DAILY_LIMIT=15]
// لو ما حددت VISION_* يستخدم LLM_API_KEY / LLM_BASE_URL و gpt-4o-mini
// الخصوصية: الصورة تمر للنموذج وترجع النتيجة. ما نخزنها أبداً.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { GULF_DISHES } from '../_shared/gulfDishes.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
const MAX_B64 = 1_500_000; // ~1.1MB صورة بعد الضغط

function prompt(lang: 'ar' | 'en') {
  const list = GULF_DISHES.map((d) => `${d.id}: ${d.name.ar} / ${d.name.en} (${d.serving.en})`).join('\n');
  return `You identify foods in a photo for a Gulf/Arabic nutrition app.
Return ONLY JSON: {"items":[{"name":string,"dishId":string|null,"portion":number,"confidence":number,"kcal"?:number,"protein"?:number,"carbs"?:number,"fat"?:number}],"notFood"?:boolean}
Rules:
- Prefer a dishId from the list. "portion" is a multiple of that dish's standard serving (0.25, 0.5, 0.75, 1, 1.5, 2). Judge it by plate size, utensils and hands.
- If a food is not in the list, set dishId null and estimate kcal/protein/carbs/fat for what is visible.
- Max 6 items. Shared platters: estimate one person's share.
- If the image is not food, return {"items":[],"notFood":true}.
- Names in ${lang === 'ar' ? 'Arabic' : 'English'}.
Dishes:
${list}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);

  const url = Deno.env.get('SUPABASE_URL')!;
  const userClient = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return json({ error: 'unauthorized' }, 401);

  const { image, lang } = (await req.json()) as { image?: string; lang?: string };
  if (!image || !/^data:image\/(jpeg|png|webp);base64,/.test(image) || image.length > MAX_B64) return json({ error: 'bad_image' }, 400);

  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const limit = Number(Deno.env.get('VISION_DAILY_LIMIT') ?? 15);
  const { data: count } = await admin.rpc('vision_increment', { p_user: user.id, p_limit: limit });
  if (count === -1) return json({ error: 'limit', limit }, 429);

  const base = (Deno.env.get('VISION_BASE_URL') ?? Deno.env.get('LLM_BASE_URL') ?? 'https://api.openai.com/v1').replace(/\/$/, '');
  const key = Deno.env.get('VISION_API_KEY') ?? Deno.env.get('LLM_API_KEY');
  const model = Deno.env.get('VISION_MODEL') ?? 'gpt-4o-mini';
  if (!key) return json({ error: 'not_configured' }, 503);

  const r = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 600,
      messages: [
        { role: 'system', content: prompt(lang === 'en' ? 'en' : 'ar') },
        { role: 'user', content: [{ type: 'text', text: 'What is in this meal?' }, { type: 'image_url', image_url: { url: image } }] }
      ]
    })
  });
  if (!r.ok) return json({ error: 'upstream', status: r.status }, 502);
  const data = await r.json();
  const text: string = data?.choices?.[0]?.message?.content ?? '';
  // نرجع النص الخام والتطبيق يتحقق منه (zod) ويطابقه مع القاعدة المحلية
  return json({ raw: text, remaining: Math.max(0, limit - (count ?? 0)) });
});
