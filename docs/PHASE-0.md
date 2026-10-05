# المرحلة 0: الأساس والتصميم ✅

**المدة:** 12 إلى 25 أكتوبر 2026

## اللي انسلّم

- [x] مشروع Vite + React + TypeScript + Tailwind + ESLint + Prettier
- [x] PWA: Manifest عربي RTL، أيقونات (192، 512، maskable، apple)، Service Worker بـ Workbox
- [x] كاش للخطوط والصور والفيديو (CacheFirst) جاهز للمرحلة 1
- [x] نافذة "فيه تحديث جديد" و "التطبيق جاهز أوفلاين"
- [x] i18n عربي/إنجليزي مع تبديل RTL/LTR تلقائي
- [x] ثيم داكن/فاتح/حسب النظام بمتغيرات CSS
- [x] Design Tokens في `src/design/tokens.ts` و `tailwind.config.ts`
- [x] مكونات UI: Button، Card (3 أنواع)، ProgressRing، Modal/Bottom Sheet، Skeleton، Badge، SegmentedControl، EmptyState
- [x] Layout: Bottom Nav زجاجي بزر تمرين بارز، TopBar، انتقالات صفحات
- [x] شاشة ترحيب متحركة + Dashboard تجريبي + الإعدادات + معرض المكونات
- [x] احترام Reduce Motion وأحجام لمس 44px+
- [x] جاهز للنشر على Vercel

## شروط الإنجاز (تأكد منها عندك)

1. `npm run build && npm run preview` ثم Lighthouse ← قسم PWA ناجح (Installable)
2. التطبيق ينزل على الجوال من المتصفح (Add to Home Screen)
3. بدّل اللغة من الإعدادات: الاتجاه يتغير RTL ↔ LTR بدون كسر التصميم
4. افصل النت بعد أول فتحة: التطبيق يفتح عادي

## مطلوب منك (خارج الكود)

- تصميم Figma للشاشات التسع بناءً على الـ Tokens (اختياري، الكود هو المرجع الآن)
- ابدأ تجمع روابط فيديوهات أول 50 تمرين (Pexels، wger، ExerciseDB) للمرحلة 1

## الجاي: المرحلة 1

مكتبة التمارين: `exercises.json` لـ 50 تمرين، صفحة تفاصيل بالفيديو، فلترة، خريطة جسم SVG تفاعلية، و Dexie.js.
