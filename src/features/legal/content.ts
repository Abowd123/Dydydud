/** نصوص قانونية مبسطة. راجعها مع محامي قبل النشر الرسمي. */
export type LegalDoc = { title: string; updated: string; sections: { h: string; p: string[] }[] };
type Lang = 'ar' | 'en';
const UPDATED = '2026-10-05'; // v2.1
const CONTACT = 'support@gymmate.app';

export const privacy: Record<Lang, LegalDoc> = {
  ar: {
    title: 'سياسة الخصوصية',
    updated: UPDATED,
    sections: [
      { h: 'باختصار', p: ['بياناتك تنحفظ على جهازك أولاً. ما نبيع بياناتك، وما نعرض إعلانات، وتقدر تصدّرها أو تمسحها بأي وقت.'] },
      { h: 'وش نجمع', p: ['بيانات الملف: العمر، الجنس، الطول، الوزن، الهدف، الأيام والمعدات، والإصابات اللي تختارها.', 'سجل التمارين والأكل والماء والقياسات وصور التقدم.', 'لو سجلت دخول: إيميلك فقط، عشان المزامنة.'] },
      { h: 'وين تنحفظ', p: ['على جهازك داخل التطبيق (IndexedDB). صور التقدم ما تطلع من جهازك إلا لو فعلت المزامنة بنفسك.', 'لو فعلت المزامنة، تنحفظ نسخة مشفرة في Supabase ومحمية بحيث ما يشوفها غيرك.'] },
      { h: 'المدرب الذكي', p: ['لما تسأل المدرب، نرسل سؤالك مع ملخص خطتك (بدون اسم أو إيميل) لمزود الذكاء الاصطناعي عشان يرد. ما نستخدم محادثاتك لتدريب أي نموذج.'] },
      { h: 'صوّر وجبتك', p: ['لما تصوّر وجبتك، نرسل الصورة مصغّرة لنموذج ذكاء اصطناعي عشان يتعرف على الأكل ويرجع النتيجة. الصورة ما تنحفظ عندنا ولا عند المزود، وتقدر تسجل أكلك يدوي بدون صورة.'] },
      { h: 'فحص الأداء بالكاميرا', p: ['الفحص يحلل حركتك على جهازك فقط. ولا إطار فيديو يطلع من جوالك أو ينحفظ.'] },
      { h: 'الإشعارات', p: ['التذكيرات اختيارية وتقدر توقفها من صفحة التذكيرات أو من إعدادات جهازك.'] },
      { h: 'حقوقك', p: ['تصدير كل بياناتك كملف من صفحة "بياناتي".', 'مسح كل البيانات المحلية بضغطة، وحذف البيانات السحابية من صفحة الحساب.'] },
      { h: 'الأطفال', p: ['التطبيق للأعمار من 16 سنة وفوق. اللي أصغر لازم يستخدمه بإشراف ولي الأمر.'] },
      { h: 'تواصل معنا', p: [`لأي سؤال عن الخصوصية: ${CONTACT}`] }
    ]
  },
  en: {
    title: 'Privacy Policy',
    updated: UPDATED,
    sections: [
      { h: 'In short', p: ['Your data lives on your device first. We never sell it, show no ads, and you can export or erase it any time.'] },
      { h: 'What we collect', p: ['Profile data: age, sex, height, weight, goal, days, equipment and the injuries you select.', 'Workout, food, water, body metric logs and progress photos.', 'If you sign in: your email only, for sync.'] },
      { h: 'Where it is stored', p: ['On your device inside the app (IndexedDB). Progress photos never leave your device unless you turn on sync.', 'With sync on, a copy is stored in Supabase behind row-level security so only you can read it.'] },
      { h: 'AI coach', p: ['When you ask the coach, your question plus a summary of your plan (no name or email) is sent to the AI provider to answer. Chats are never used to train models.'] },
      { h: 'Meal photos', p: ['When you snap a meal, a downscaled photo is sent to an AI model to identify the food and return the result. Photos are not stored by us or the provider, and you can always log manually without a photo.'] },
      { h: 'Camera form check', p: ['Form check analyzes your movement on your device only. No video frame ever leaves your phone or is saved.'] },
      { h: 'Notifications', p: ['Reminders are optional and can be turned off in Reminders or in your device settings.'] },
      { h: 'Your rights', p: ['Export everything as a file from "My data".', 'Erase all local data in one tap, and delete cloud data from Account.'] },
      { h: 'Children', p: ['GymMate is for ages 16 and up. Younger users need a parent or guardian.'] },
      { h: 'Contact', p: [`Privacy questions: ${CONTACT}`] }
    ]
  }
};

export const terms: Record<Lang, LegalDoc> = {
  ar: {
    title: 'شروط الاستخدام',
    updated: UPDATED,
    sections: [
      { h: 'تنبيه صحي مهم', p: ['GymMate يعطيك معلومات عامة عن التمارين والتغذية، وما يغني عن الطبيب أو المدرب المعتمد أو أخصائي التغذية.', 'استشر طبيبك قبل ما تبدأ، خصوصاً لو عندك مرض مزمن أو إصابة أو حمل. وقف التمرين فوراً لو حسيت بألم حاد أو دوخة أو ضيق نفس.'] },
      { h: 'مسؤوليتك', p: ['أنت مسؤول عن أداء التمارين بالطريقة الصحيحة وبأوزان تناسبك وعن سلامة المعدات اللي تستخدمها.'] },
      { h: 'المدرب الذكي', p: ['ردود المدرب تتولد آلياً وممكن تغلط. لا تعتمد عليها في أي قرار طبي.'] },
      { h: 'الاستخدام المقبول', p: ['لا تحاول تخترق الخدمة أو تسيء استخدامها أو تتجاوز حدود الاستخدام اليومية.'] },
      { h: 'الملكية', p: ['التصميم والمحتوى والشروحات ملك GymMate. صور وفيديوهات التمارين مرخصة لاستخدامها داخل التطبيق.'] },
      { h: 'التغييرات', p: ['ممكن نحدث هذي الشروط، وبنبلغك داخل التطبيق قبل أي تغيير مهم.'] },
      { h: 'تواصل معنا', p: [CONTACT] }
    ]
  },
  en: {
    title: 'Terms of Use',
    updated: UPDATED,
    sections: [
      { h: 'Important health notice', p: ['GymMate provides general fitness and nutrition information and is not a substitute for a doctor, certified trainer or dietitian.', 'Talk to your doctor before starting, especially with a chronic condition, injury or pregnancy. Stop immediately if you feel sharp pain, dizziness or shortness of breath.'] },
      { h: 'Your responsibility', p: ['You are responsible for using correct form, choosing suitable loads and the safety of your equipment.'] },
      { h: 'AI coach', p: ['Coach replies are machine-generated and can be wrong. Never rely on them for medical decisions.'] },
      { h: 'Acceptable use', p: ['Do not attempt to hack, abuse or bypass the service or its daily limits.'] },
      { h: 'Ownership', p: ['Design, content and guides belong to GymMate. Exercise media is licensed for in-app use.'] },
      { h: 'Changes', p: ['We may update these terms and will notify you in-app before any material change.'] },
      { h: 'Contact', p: [CONTACT] }
    ]
  }
};
