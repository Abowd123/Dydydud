/**
 * المدرب الذكي: الأمان + بناء السياق + تعليمات النموذج.
 * مشترك بين Edge Function والتطبيق (المدرب المحلي يستخدم نفس فلتر الأمان).
 */
export type RedFlag = 'emergency' | 'medical' | 'injury' | 'eating' | 'drugs' | 'pregnancy' | 'minor';

const norm = (s: string) =>
  s.toLowerCase().replace(/[\u064B-\u0652\u0640]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');

const FLAGS: [RedFlag, RegExp][] = [
  ['emergency', /(الم|وجع|ضغط) (ب|في )?(الصدر|صدري)|chest pain|اغمي|اغماء|دوخه شديده|faint|ضيق (في )?(التنفس|النفس)|can'?t breathe|خدر|تنميل (في )?(يدي|ذراعي|وجهي)|numb/],
  ['medical', /سكري|ضغط الدم|(مرض|مشاكل|عمليه) (في )?(ال)?(قلب|كلى|كبد)|ربو|diabet|heart (condition|disease|problem)|blood pressure|asthma|kidney|اخذ (دواء|ادويه)|medication/],
  ['injury', /(الم|وجع) (حاد|شديد)|sharp pain|طقطق(ه|ت) و(الم|وجع)|انتفاخ|تورم|swell|ورم|كسر (في|ب)|انكسر|fracture|خلع (في|ب)|dislocat|تمزق|tear|انزلاق غضروفي|disc|ما اقدر احرك/],
  ['eating', /اتقيا|استفرغ (بعد|عشان)|ما اكل (ابد|نهائي)|اجوع نفسي|purg|starv|anorex|bulim|500 سعر/],
  ['drugs', /ستيرويد|هرمون(ات)? (نمو|ذكوري)|تستوستيرون|منشطات|steroid|sarms?|testosterone|trenbolone|clenbuterol|كلين/],
  ['pregnancy', /حامل|فتره الحمل|اثناء الحمل|pregnan|رضاعه|ارضع|breastfeed/],
  ['minor', /(عمري|عندي) (1[0-3]|[5-9]) (سنه|سنين)|i'?m 1[0-3]\b/]
];

export function detectRedFlags(text: string): RedFlag[] {
  const t = norm(text);
  return FLAGS.filter(([, re]) => re.test(t)).map(([f]) => f);
}

export const SAFETY_REPLY: Record<'ar' | 'en', Record<RedFlag, string>> = {
  ar: {
    emergency: '🚨 اللي تقوله ممكن يكون خطير. **وقّف التمرين الحين** واطلب مساعدة طبية فوراً. لو الأعراض قوية اتصل بالإسعاف (997 بالسعودية، 999 بالإمارات وقطر والبحرين، 112 أغلب الدول).',
    medical: '🩺 مع وجود حالة صحية أو أدوية، لازم تستشير طبيبك قبل ما تزيد شدة التمرين أو تغير أكلك. أقدر أعطيك نصايح عامة، بس قرار طبيبك أهم.',
    injury: '⚠️ الألم الحاد أو التورم مو طبيعي. **وقّف أي تمرين يسبب الألم**، وحط ثلج 15 دقيقة، وراجع طبيب أو أخصائي علاج طبيعي. ألم العضلات الخفيف بعد يوم أو يومين (DOMS) طبيعي، لكن الألم الحاد بالمفصل لا.',
    eating: '💚 صحتك أهم من أي رقم على الميزان. الحرمان الشديد أو التخلص من الأكل يضر جسمك وعضلاتك. أنصحك تتكلم مع طبيب أو أخصائي تغذية. خطتك عندنا ما تنزل عن حد أدنى آمن من السعرات.',
    drugs: '🚫 ما أقدر أساعد بالمنشطات أو الهرمونات. لها أضرار خطيرة على القلب والكبد والهرمونات. التقدم الطبيعي بالأكل والنوم والتمرين المنتظم أبطأ، بس آمن ويدوم.',
    pregnancy: '🤰 التمرين أثناء الحمل أو الرضاعة يحتاج متابعة طبيبتك. خطط التطبيق مو مصممة لهالفترة، فاسألي طبيبتك وش المسموح لك.',
    minor: '🧒 لأنك صغير بالعمر، لازم يكون التمرين بإشراف ولي أمرك أو مدرب معتمد، وبأوزان خفيفة وتركيز على الطريقة الصحيحة.'
  },
  en: {
    emergency: '🚨 This could be serious. **Stop training now** and get medical help immediately. If symptoms are strong, call emergency services (911 / 112 / 999).',
    medical: '🩺 With a health condition or medication, check with your doctor before increasing intensity or changing your diet.',
    injury: '⚠️ Sharp pain or swelling is not normal. Stop any exercise that hurts, ice for 15 minutes, and see a doctor or physio. Mild muscle soreness 1 to 2 days later (DOMS) is normal; sharp joint pain is not.',
    eating: '💚 Your health matters more than the scale. Extreme restriction or purging harms your body. Please talk to a doctor or dietitian. Your plan never goes below a safe calorie minimum.',
    drugs: "🚫 I can't help with steroids or hormones. They carry serious risks. Natural progress is slower, but safe and lasting.",
    pregnancy: '🤰 Training during pregnancy or breastfeeding needs your doctor’s guidance. These plans aren’t designed for that period.',
    minor: '🧒 At your age, train under a parent’s or certified coach’s supervision, with light weights and a focus on form.'
  }
};

/** أخطر علامة لها الأولوية */
export const PRIORITY: RedFlag[] = ['emergency', 'injury', 'eating', 'drugs', 'pregnancy', 'minor', 'medical'];
export const topFlag = (flags: RedFlag[]) => PRIORITY.find((p) => flags.includes(p)) ?? null;
/** هذي العلامات توقف الرد كلياً (ما نرسلها للنموذج) */
export const BLOCKING: RedFlag[] = ['emergency', 'eating', 'drugs'];

export interface CoachContext {
  lang: 'ar' | 'en';
  profile?: { gender: string; age: number; heightCm: number; weightKg: number; goal: string; level: string; equipment: string; injuries: string[]; diet: string; trainingDays: number };
  targets?: { calories: number; proteinG: number; carbsG: number; fatG: number; waterMl: number };
  today?: string; // وصف تمرين اليوم
  recent?: string[]; // ملخص آخر الحصص
  readiness?: number | null;
  ramadan?: boolean;
}

export function buildSystemPrompt(c: CoachContext): string {
  const ar = c.lang === 'ar';
  const lines = [
    ar
      ? 'أنت "كوتش GymMate"، مدرب لياقة وتغذية خبير وودود للمبتدئين. تتكلم بلهجة خليجية بسيطة وواضحة.'
      : 'You are "GymMate Coach", a friendly expert fitness and nutrition coach for beginners.',
    ar ? 'قواعد:' : 'Rules:',
    ar ? '- ردود قصيرة وعملية (3 إلى 6 جمل أو نقاط)، وابدأ بالجواب مباشرة.' : '- Short, practical answers (3 to 6 sentences or bullets). Answer first.',
    ar ? '- استخدم بيانات المستخدم تحت عشان تخصص النصيحة (أرقامه، أهدافه، تمرين اليوم).' : "- Personalize with the user's data below.",
    ar ? '- ممنوع التشخيص الطبي. أي ألم حاد، أعراض قلب، دوخة، أو إصابة: انصحه يوقف ويراجع طبيب.' : '- Never diagnose. Sharp pain, cardiac symptoms, dizziness, injury: tell them to stop and see a doctor.',
    ar ? '- ممنوع المنشطات والهرمونات والحميات القاسية (تحت الحد الآمن من السعرات).' : '- No steroids, hormones or extreme diets.',
    ar ? '- لا تخترع أرقام أو دراسات. لو مو متأكد قل كذا.' : "- Don't invent numbers or studies. Say when unsure.",
    ar ? '- لو السؤال برا اللياقة والتغذية والنوم، رجّعه بلطف للموضوع.' : '- Gently redirect off-topic questions.'
  ];
  if (c.profile) {
    const p = c.profile;
    lines.push(ar ? '\nبيانات المستخدم:' : '\nUser data:',
      `- ${p.gender}, ${p.age}y, ${p.heightCm}cm, ${p.weightKg}kg, goal=${p.goal}, level=${p.level}, equipment=${p.equipment}, days/week=${p.trainingDays}, diet=${p.diet}, injuries=${p.injuries.join(',') || 'none'}`);
  }
  if (c.targets) lines.push(`- targets: ${c.targets.calories} kcal, protein ${c.targets.proteinG}g, carbs ${c.targets.carbsG}g, fat ${c.targets.fatG}g, water ${c.targets.waterMl}ml`);
  if (c.today) lines.push(`- today: ${c.today}`);
  if (c.recent?.length) lines.push(`- recent workouts: ${c.recent.slice(0, 5).join(' | ')}`);
  if (c.readiness != null) lines.push(`- readiness today: ${c.readiness}/100`);
  if (c.ramadan) lines.push(ar ? '- المستخدم صايم (وضع رمضان مفعّل).' : '- User is fasting (Ramadan mode).');
  return lines.join('\n');
}

export interface ChatMsg { role: 'user' | 'assistant'; content: string }
/** نحافظ على آخر الرسائل بس (توفير وحماية من الرسائل الطويلة) */
export function trimHistory(msgs: ChatMsg[], maxMsgs = 12, maxChars = 6000): ChatMsg[] {
  const out: ChatMsg[] = [];
  let chars = 0;
  for (const m of [...msgs].reverse()) {
    const content = m.content.slice(0, 1500);
    if (out.length >= maxMsgs || chars + content.length > maxChars) break;
    out.unshift({ role: m.role, content });
    chars += content.length;
  }
  while (out.length && out[0].role !== 'user') out.shift();
  return out;
}
