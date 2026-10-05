import { detectRedFlags, SAFETY_REPLY, topFlag, type CoachContext } from '../../../supabase/functions/_shared/coach';
import { exercises } from '@/features/exercises/lib/repository';
import type { Exercise } from '@/types/exercise';

/**
 * مدرب محلي (بدون نت وبدون سيرفر): يفهم أشهر الأسئلة ويرد ببيانات المستخدم.
 * لما السيرفر متوفر، الأسئلة تروح للذكاء الاصطناعي، وهذا يبقى احتياطي.
 */
export interface CoachAction { label: string; to?: string; action?: 'lighten' | 'homeMode' | 'checkin' }
export interface CoachReply { text: string; actions?: CoachAction[]; source: 'local' | 'safety' }

const norm = (s: string) =>
  s.toLowerCase().replace(/[\u064B-\u0652\u0640]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[؟?!.,،]/g, ' ');

type Intent = 'protein' | 'calories' | 'plateau' | 'tired' | 'sore' | 'alternative' | 'supplements' | 'cardio' | 'sleep' | 'motivation' | 'meal' | 'ramadan' | 'today' | 'form' | 'greeting' | 'water' | 'home';

const INTENTS: [Intent, RegExp][] = [
  ['greeting', /^(هلا|مرحبا|السلام|هاي|hi|hello|hey)\b/],
  ['form', /(كيف|طريقه|شلون) (اسوي|اعمل|العب|اداء|يكون)|how (do|to) (i )?(do|perform)|form/],
  ['protein', /بروتين|protein/],
  ['calories', /سعرات|سعره|كالوري|calorie|كم اكل|ريجيم|دايت|diet/],
  ['plateau', /ثابت|ما (ينزل|نزل|يزيد|زاد)|وقف (الوزن|نزول)|plateau|stuck|not losing/],
  ['tired', /تعبان|مرهق|ما (نمت|عندي طاقه)|كسلان|tired|exhausted|no energy/],
  ['sore', /متكسر|عضلاتي (توجعني|تالمني)|الم عضلي|شد عضلي|sore|doms/],
  ['alternative', /بديل|مشغول|ما عندي (جهاز|بار)|alternative|replace|busy/],
  ['supplements', /مكمل|كرياتين|واي|supplement|creatine|whey|bcaa/],
  ['cardio', /كارديو|جري|مشي|سير|cardio|running|walk/],
  ['sleep', /نوم|انام|sleep/],
  ['water', /ماء|مويه|اشرب|water|hydrat/],
  ['motivation', /حماس|ملل|مليت|ابي اوقف|motivat|bored|give up|quit/],
  ['meal', /وجب|فطور|غدا|عشا|سناك|اكل ايش|meal|breakfast|lunch|dinner|snack/],
  ['ramadan', /رمضان|صيام|صايم|افطار|سحور|ramadan|fasting|iftar|suhoor/],
  ['home', /بالبيت|في البيت|بدون (جيم|معدات)|at home|no gym/],
  ['today', /اليوم|وش (عندي|تمريني)|today|workout today/]
];

export function detectIntent(text: string): Intent | null {
  const t = norm(text);
  return INTENTS.find(([, re]) => re.test(t))?.[0] ?? null;
}

/** يدور اسم تمرين داخل السؤال (عربي أو إنجليزي) */
export function findExercise(text: string): Exercise | undefined {
  const t = norm(text);
  return [...exercises]
    .sort((a, b) => b.name.ar.length - a.name.ar.length)
    .find((e) => {
      const ar = norm(e.name.ar);
      const short = ar.split(' ').slice(0, 2).join(' ');
      return t.includes(ar) || (short.length > 3 && t.includes(short)) || t.includes(e.name.en.toLowerCase());
    });
}

export function localCoach(question: string, c: CoachContext): CoachReply {
  const ar = c.lang === 'ar';
  const flag = topFlag(detectRedFlags(question));
  if (flag) return { text: SAFETY_REPLY[c.lang][flag], source: 'safety' };

  const ex = findExercise(question);
  const intent = detectIntent(question);
  const t = c.targets;
  const w = c.profile?.weightKg;

  if (ex && (intent === 'form' || intent === null || intent === 'alternative')) {
    if (intent === 'alternative') {
      const alts = ex.alternatives.map((id) => exercises.find((e) => e.id === id)?.name[c.lang]).filter(Boolean);
      return { text: ar ? `بدائل **${ex.name.ar}**: ${alts.join('، ')}. تقدر تبدّل من زر 🔁 أثناء الحصة.` : `Alternatives to **${ex.name.en}**: ${alts.join(', ')}. Swap with 🔁 during your workout.`, actions: [{ label: ar ? 'افتح التمرين' : 'Open exercise', to: `/exercises/${ex.id}` }], source: 'local' };
    }
    return {
      text: (ar ? `**${ex.name.ar}**\n` : `**${ex.name.en}**\n`) + ex.steps.map((s, i) => `${i + 1}. ${s}`).join('\n') + (ar ? `\n\n⚠️ انتبه: ${ex.mistakes.join('، ')}` : `\n\n⚠️ Avoid: ${ex.mistakes.join(', ')}`),
      actions: [{ label: ar ? 'شوف الفيديو' : 'Watch video', to: `/exercises/${ex.id}` }],
      source: 'local'
    };
  }

  const R: Record<Intent, () => CoachReply> = {
    greeting: () => ({ text: ar ? 'هلا بطل 💪 اسألني عن تمرينك، أكلك، أو أي تمرين وكيف تسويه.' : 'Hey champ 💪 Ask me about your workout, food, or how to do any exercise.', source: 'local' }),
    form: () => ({ text: ar ? 'قولي اسم التمرين (مثلاً "كيف أسوي السكوات") وأشرح لك خطوة بخطوة.' : 'Tell me the exercise name (e.g. "how to do squats") and I’ll walk you through it.', source: 'local' }),
    protein: () => ({ text: ar ? `هدفك اليومي **${t?.proteinG ?? Math.round((w ?? 70) * 1.8)} جم بروتين**. وزّعه على 3 إلى 4 وجبات (30 إلى 45 جم بكل وجبة). أسهل مصادر: صدر دجاج، تونة، بيض، زبادي يوناني، عدس.` : `Your daily target is **${t?.proteinG ?? Math.round((w ?? 70) * 1.8)} g protein**. Split it across 3 to 4 meals (30 to 45 g each). Easy sources: chicken, tuna, eggs, Greek yogurt, lentils.`, actions: [{ label: ar ? 'وجباتي' : 'My meals', to: '/nutrition' }], source: 'local' }),
    calories: () => ({ text: ar ? `سعراتك **${t?.calories ?? '؟'} سعرة** يومياً (بروتين ${t?.proteinG}، كارب ${t?.carbsG}، دهون ${t?.fatG} جم). الوجبات بصفحة التغذية محسوبة عليها، وتقدر تبدّل أي وجبة.` : `Your target is **${t?.calories ?? '?'} kcal** (P ${t?.proteinG} / C ${t?.carbsG} / F ${t?.fatG} g). Meals in Nutrition already match it.`, actions: [{ label: ar ? 'التغذية' : 'Nutrition', to: '/nutrition' }], source: 'local' }),
    plateau: () => ({ text: ar ? 'ثبات الوزن أسبوع أو أسبوعين طبيعي (ماء، ملح، هرمونات). شوف **متوسط 7 أيام** بصفحة التقدم مو الوزن اليومي. لو ثابت 3 أسابيع: تأكد إنك ملتزم بالوجبات، زِد مشي 2000 خطوة يومياً، ونم 7 ساعات+. لو ما تغير، نقص 100 إلى 150 سعرة.' : 'A 1 to 2 week plateau is normal (water, salt). Watch the 7-day average. If flat for 3 weeks: check adherence, add 2000 steps/day, sleep 7h+, then cut 100 to 150 kcal.', actions: [{ label: ar ? 'التقدم' : 'Progress', to: '/progress' }], source: 'local' }),
    tired: () => ({ text: ar ? `${c.readiness != null && c.readiness < 50 ? `جاهزيتك اليوم ${c.readiness}/100. ` : ''}لو تعبان، الأفضل تتمرن **بحصة أخف** (جولة أقل ووزن أخف 5 إلى 15%) بدل ما تفوّت. ولو مرهق جداً، خذ مشي خفيف 20 دقيقة وارجع بكرة.` : 'If you’re tired, do a **lighter session** (one less set, 5 to 15% less weight) instead of skipping. If wiped out, take a 20 min walk and come back tomorrow.', actions: [{ label: ar ? 'قيّم جاهزيتي' : 'Check readiness', action: 'checkin' }], source: 'local' }),
    sore: () => ({ text: ar ? 'ألم العضلات بعد يوم أو يومين (DOMS) طبيعي، خصوصاً بالبداية، ويخف مع الوقت. حركة خفيفة، إطالات، ماء، ونوم يسرّعون التعافي. تقدر تتمرن عادي بس خفّف لو الألم قوي. الألم الحاد بالمفصل شي ثاني: وقّف وراجع طبيب.' : 'Muscle soreness 1 to 2 days later (DOMS) is normal and fades as you adapt. Light movement, stretching, water and sleep help. Sharp joint pain is different: stop and see a doctor.', source: 'local' }),
    alternative: () => ({ text: ar ? 'أثناء الحصة اضغط زر 🔁 جنب اسم التمرين وتطلع لك بدائل لنفس العضلة. أو قولي اسم التمرين وأعطيك البدائل.' : 'During your workout tap 🔁 next to the exercise for same-muscle alternatives, or tell me the exercise name.', source: 'local' }),
    supplements: () => ({ text: ar ? 'الأهم: الأكل والنوم. لو تبي مكمل: **كرياتين 3 إلى 5 جم يومياً** (الأكثر إثباتاً)، و**واي بروتين** لو ما تكمّل بروتينك. الـ BCAA غالباً ما تحتاجه.' : 'Food and sleep first. If anything: **creatine 3 to 5 g daily** and **whey** if you miss protein. BCAAs are usually unnecessary.', actions: [{ label: ar ? 'دليل المكملات' : 'Supplements guide', to: '/nutrition' }], source: 'local' }),
    cardio: () => ({ text: ar ? `${c.profile?.goal === 'cut' ? 'للتنشيف: ' : ''}مشي سريع 25 إلى 40 دقيقة بأيام الراحة، أو 10 دقائق بعد الحديد. خلّه بنبض تقدر تتكلم فيه. الكارديو القوي قبل الحديد يضعف أداءك.` : 'Brisk walk 25 to 40 min on rest days, or 10 min after lifting, at a conversational pace. Hard cardio before lifting hurts performance.', source: 'local' }),
    sleep: () => ({ text: ar ? 'العضلات تكبر وأنت نايم. هدفك **7 إلى 9 ساعات**. نفس وقت النوم يومياً، لا كافيين بعد العصر، وشاشات أقل قبل النوم بساعة.' : 'Muscles grow while you sleep. Aim for **7 to 9 hours**, consistent bedtime, no caffeine after mid-afternoon.', source: 'local' }),
    water: () => ({ text: ar ? `هدفك **${((t?.waterMl ?? 2500) / 1000).toFixed(1)} لتر** يومياً، و+500 مل أيام التمرين. كوب أول ما تصحى، وكوب قبل التمرين بنص ساعة.` : `Your goal is **${((t?.waterMl ?? 2500) / 1000).toFixed(1)} L** a day, +500 ml on training days.`, actions: [{ label: ar ? 'سجّل ماء' : 'Log water', to: '/nutrition' }], source: 'local' }),
    motivation: () => ({ text: ar ? 'طبيعي الحماس يطلع وينزل. اللي يفرق هو **الالتزام** مو الحماس: لو مليت، سوّ نص الحصة بس. كل حصة تحسب بسلسلتك 🔥. وجرّب تحدي 30 يوم يعطيك هدف قريب.' : 'Motivation comes and goes; consistency wins. On low days, do half the session. Try a 30-day challenge for a close goal.', actions: [{ label: ar ? 'التحديات' : 'Challenges', to: '/challenges' }], source: 'local' }),
    meal: () => ({ text: ar ? 'وجباتك اليوم جاهزة بصفحة التغذية على مقاس سعراتك. ما عجبتك وجبة؟ اضغط "بدّل" وتطلع لك وحدة ثانية بنفس الأرقام.' : 'Today’s meals are ready in Nutrition. Don’t like one? Tap "Swap".', actions: [{ label: ar ? 'وجباتي' : 'My meals', to: '/nutrition' }], source: 'local' }),
    ramadan: () => ({ text: ar ? 'برمضان: تمرّن **قبل الإفطار بساعة** (خفيف) أو **بعد التراويح** (الأفضل للحديد). افطر على تمر وماء، ووزّع 2 إلى 3 لتر ماء بين الإفطار والسحور. السحور: بروتين + نشويات بطيئة (شوفان، خبز أسمر). فعّل وضع رمضان من الإعدادات.' : 'In Ramadan: train lightly 1h before iftar or after taraweeh (best for lifting). Break fast with dates and water, spread 2 to 3 L between iftar and suhoor. Enable Ramadan mode in Settings.', actions: [{ label: ar ? 'الإعدادات' : 'Settings', to: '/profile' }], source: 'local' }),
    home: () => ({ text: ar ? 'ما تقدر تروح الجيم؟ فعّل **وضع البيت** من صفحة التمرين: نفس العضلات بتمارين بدون معدات.' : 'Can’t make it to the gym? Turn on **Home mode** on the Workout page.', actions: [{ label: ar ? 'وضع البيت' : 'Home mode', action: 'homeMode', to: '/workout' }], source: 'local' }),
    today: () => ({ text: c.today ? (ar ? `تمرينك اليوم: ${c.today}. يلا! 💪` : `Today: ${c.today}. Let’s go! 💪`) : ar ? 'اليوم راحة أو ما عندك خطة. الراحة جزء من التمرين.' : 'Rest day today, recovery is part of training.', actions: [{ label: ar ? 'ابدأ' : 'Start', to: '/workout' }], source: 'local' })
  };

  if (intent) return R[intent]();
  return {
    text: ar
      ? 'ما فهمت عليك تماماً 🤔 جرّب تسألني عن: البروتين، السعرات، تمرين معين وكيف تسويه، التعب، المكملات، أو رمضان.'
      : "I didn't quite get that 🤔 Try asking about protein, calories, how to do an exercise, fatigue, supplements or Ramadan.",
    source: 'local'
  };
}
