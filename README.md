# GymMate 💪 مساعدك الشخصي في الجيم

تطبيق **React PWA** للمبتدئين في الجيم: جدول تمارين، تغذية، ماء، وشرح كل تمرين بالفيديو.
يشتغل بدون نت وينزل على الجوال كتطبيق.

> 📦 النسخة **1.2.0**: المراحل 0 إلى 6. خطة + تغذية + وضع تمرين مباشر + تقدم + مزامنة + تذكيرات + مدرب ذكي + نقاط وتحديات + رمضان.

## التشغيل

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # بناء نسخة الإنتاج في dist/
npm run preview    # تجربة نسخة الإنتاج (مع Service Worker)
npm test           # الاختبارات
npm run media      # ضغط فيديوهات التمارين (يحتاج ffmpeg)
```

المتطلبات: Node.js 18 أو أحدث.

## التقنيات

React 18 • Vite 5 • Dexie.js (IndexedDB) • Supabase • Recharts • TypeScript • Tailwind CSS • Framer Motion • Zustand • i18next • vite-plugin-pwa (Workbox) • Lucide Icons

## هيكل المشروع

```
src/
├── app/              # App + Router
├── components/
│   ├── ui/           # Button, Card, ProgressRing, Modal, Skeleton, Badge, SegmentedControl, EmptyState
│   └── layout/       # AppLayout, BottomNav, TopBar, PageTransition
├── design/tokens.ts  # Design Tokens (ألوان، مسافات، خطوط، حركة)
├── components/body/  # خريطة الجسم التفاعلية SVG
├── data/             # exercises.json (151 تمرين) + foods.json (112 صنف)
├── features/         # كل ميزة في مجلد خاص
├── lib/db.ts         # Dexie (IndexedDB)
├── lib/calculations.ts # BMR, TDEE, ماكروز, ماء
├── features/plan/    # الاستبيان + محرك الخطة
├── features/nutrition/ # مولّد الوجبات + الماء + التسوق
├── features/workout/ # الحصة المباشرة، المؤقت، الأوزان، السلسلة
├── types/            # أنواع TypeScript
├── hooks/            # useApplySettings (ثيم + RTL), useDirection
├── i18n/             # ar.json, en.json
├── pwa/              # ReloadPrompt (تحديث التطبيق + جاهز أوفلاين)
├── store/            # Zustand (الإعدادات محفوظة محلياً)
└── styles.css        # متغيرات الثيم الداكن والفاتح
public/icons/         # أيقونات PWA (عادية + maskable + apple)
supabase/             # SQL + Edge Function للتذكيرات
public/media/         # فيديوهات وصور التمارين
scripts/              # process-media.sh
docs/                 # تقارير المراحل + أدلة
```

## الشاشات

| المسار | الشاشة | المرحلة |
|---|---|---|
| `/welcome` | الترحيب (3 شرائح) | ✅ 0 |
| `/onboarding` | الاستبيان (5 خطوات) | ✅ 2 |
| `/plan-ready` | خطتك جاهزة | ✅ 2 |
| `/` | الرئيسية (تمرين اليوم) | ✅ 2 |
| `/exercises` | مكتبة التمارين + خريطة الجسم | ✅ 1 |
| `/exercises/:id` | صفحة التمرين | ✅ 1 |
| `/schedule` | الجدول الأسبوعي | ✅ 2 |
| `/nutrition` | الوجبات + الماء + التسوق + المكملات | ✅ 3 |
| `/workout` | معاينة الحصة + السجل | ✅ 4 |
| `/workout/live` | وضع التمرين المباشر | ✅ 4 |
| `/workout/summary/:id` | ملخص الحصة | ✅ 4 |
| `/progress` | التقدم (رسوم، قياسات، صور) | ✅ 5 |
| `/account` | الحساب والمزامنة | ✅ 5 |
| `/reminders` | التذكيرات | ✅ 5 |
| `/coach` | المدرب الذكي | ✅ 6 |
| `/achievements` | النقاط والشارات | ✅ 6 |
| `/challenges` | تحديات 30 يوم | ✅ 6 |
| `/profile` | الإعدادات (ثيم + لغة) | ✅ 0 |
| `/ui-kit` | معرض المكونات (وضع التطوير فقط) | ✅ 0 |
| `/data` | بياناتي: تصدير، استيراد، مسح | ✅ 7 |
| `/form-check/:id` | فحص الأداء بالكاميرا | ✅ 2.1 |
| `/nutrition` → صوّر وجبتك | تحليل الأكل الخليجي بالصورة | ✅ 2.1 |
| `/privacy` · `/terms` | الخصوصية والشروط (عامة) | ✅ 7 |
| `/landing/` | صفحة الهبوط (HTML ثابت، ar + en) | ✅ 7 |

## المزامنة (اختياري)

انسخ `.env.example` إلى `.env` وحط مفاتيح Supabase. التفاصيل في `docs/PHASE-5.md`. بدونها التطبيق يشتغل محلي بالكامل.

## جديد 2.1
صوّر وجبتك، والجدولة الذكية، وفحص الأداء بالكاميرا. التفاصيل في `docs/FEATURES-2.1.md`.

## الاختبارات والجودة

```bash
npm test          # اختبارات الوحدة (143)
npm run e2e       # Playwright على Pixel 7 و iPhone 14 (يبني ويشغل preview)
npm run lhci      # Lighthouse CI بحدود: أداء 90+، وصول 95+، SEO 95+
npm run bundle    # ميزانية الحجم بعد البناء
```

الـ CI في `.github/workflows/ci.yml` يشغل كل هذا مع كل PR.

## النشر

المسار الأساسي **Cloudflare Pages + Supabase** (مجاني وتقدر تستخدمه تجارياً). انشر بأمر واحد: `npm run deploy:cf`. والخطوات كاملة (Cloudflare، Supabase، Google Play عبر TWA، و iOS) في `docs/PUBLISHING.md`، وقائمة الإطلاق في `docs/LAUNCH-CHECKLIST.md`، ونصوص المتجر في `docs/STORE-LISTING.md`.

⚠️ GymMate مو بديل عن طبيب أو مدرب معتمد.
