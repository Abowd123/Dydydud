# نشر GymMate

المسار الأساسي: **Cloudflare Pages** (الموقع) + **Supabase** (الباك اند) + **GitHub** (الكود والـ CI). كلها مجانية.
Vercel باقي كخيار بديل (`vercel.json` موجود)، بس الخطة المجانية فيه ممنوع تستخدمها تجارياً.

---

## 1. GitHub
```bash
git init && git add . && git commit -m "GymMate v2.0.1"
git branch -M main
git remote add origin https://github.com/<you>/gymmate.git
git push -u origin main
```

## 2. Supabase (مرة وحدة)
1. أنشئ مشروع في supabase.com واختر منطقة قريبة (مثل `eu-central-1` أو `ap-south-1`).
2. من جهازك:
   ```bash
   npx supabase login
   npx supabase link --project-ref <PROJECT_REF>
   npx supabase db push
   npx supabase functions deploy coach send-reminders food-vision
   npx supabase secrets set LLM_API_KEY=... LLM_BASE_URL=... COACH_MODEL=... COACH_DAILY_LIMIT=20 \
     VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... VAPID_SUBJECT=mailto:you@mail.com CRON_SECRET=... \
     VISION_API_KEY=<gemini free key> VISION_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai VISION_MODEL=gemini-2.0-flash
   ```
3. عدّل `<PROJECT_REF>` في `supabase/migrations/0002_cron.sql`.
4. **Auth → URL Configuration**:
   - Site URL: `https://gymmate.app` (أو `https://gymmate.pages.dev`)
   - Redirect URLs: `https://gymmate.app/**`, `https://*.gymmate.pages.dev/**`, `http://localhost:5173/**`

## 3. Cloudflare Pages

### الطريقة أ: ربط GitHub مباشرة (الأسهل)
1. dash.cloudflare.com → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → اختر `gymmate`.
2. الإعدادات:
   | الحقل | القيمة |
   |---|---|
   | Framework preset | `Vite` (أو None) |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory | `/` |
3. **Environment variables** (Production + Preview):
   - `NODE_VERSION` = `20`
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_VAPID_PUBLIC_KEY`
4. **Save and Deploy**. بعد دقيقتين يصير التطبيق على `https://gymmate.pages.dev`.
5. أي دفعة على `main` تنشر للإنتاج، وكل فرع ثاني ياخذ رابط معاينة لحاله.

### الطريقة ب: النشر من GitHub Actions
احذف الربط المباشر وخلّ الملف `.github/workflows/deploy-cloudflare.yml` ينشر بعد ما تنجح الاختبارات. أضف هذي الأسرار في **GitHub → Settings → Secrets → Actions**:
- `CLOUDFLARE_API_TOKEN` (Cloudflare → My Profile → API Tokens → قالب *Edit Cloudflare Workers*، وأعطه صلاحية `Cloudflare Pages: Edit`)
- `CLOUDFLARE_ACCOUNT_ID` (موجود في يمين لوحة التحكم)
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_VAPID_PUBLIC_KEY`

أول مرة أنشئ المشروع بالأمر: `npx wrangler pages project create gymmate --production-branch=main`

### الطريقة ج: من جهازك
```bash
npx wrangler login
npm run deploy:cf
```

### الدومين الخاص
**Pages → gymmate → Custom domains → Set up a domain** → `gymmate.app`. لو الدومين عند Cloudflare يتربط تلقائياً، ولو برا أضف `CNAME` يأشر على `gymmate.pages.dev`. شهادة SSL مجانية وتلقائية.
بعدها: **SSL/TLS → Edge Certificates** → فعّل *Always Use HTTPS* و *HSTS*.

### وش مجهز في المشروع
| الملف | الوظيفة |
|---|---|
| `public/_headers` | الحماية (CSP، HSTS، X-Frame)، كاش سنة للملفات، `no-cache` للـ Service Worker، و `noindex` لروابط المعاينة |
| `public/_redirects` | `/home` و `/about` يحولون لصفحة الهبوط |
| `wrangler.toml` | إعداد النشر بالأوامر |
| وضع SPA | ما في `404.html`، فـ Pages يرجع `index.html` لأي مسار مثل `/schedule` تلقائياً |

### Web Analytics (مجاني)
**Pages → gymmate → Metrics → Web Analytics → Enable**. يحترم الخصوصية وبدون كوكيز، والـ CSP يسمح له.

## 4. حماية Supabase المجاني من الإيقاف
المشروع المجاني ينطفي إذا مر عليه 7 أيام بدون نشاط. الملف `.github/workflows/supabase-keepalive.yml` يكلم قاعدة البيانات كل 3 أيام، وكمان يشغل وظيفة التذكيرات كاحتياط للـ `pg_cron`. بس أضف الأسرار `VITE_SUPABASE_URL` و `VITE_SUPABASE_ANON_KEY` و `CRON_SECRET`.

## 5. Google Play (TWA)
```bash
npm i -g @bubblewrap/cli
npm run twa:init
npm run twa:build      # app-release-bundle.aab
```
1. Play Console → ارفع `.aab` على **Internal testing**.
2. انسخ **App signing SHA-256** (Setup → App integrity) وحطه في `public/.well-known/assetlinks.json`، وبعدين انشر. تأكد إنه يفتح من `https://gymmate.app/.well-known/assetlinks.json`.
3. Data safety: نجمع بيانات صحة ولياقة، والإيميل اختياري للمزامنة. ما نشاركها مع أحد ولا نبيعها، وهي مشفرة وقت النقل، والمستخدم يقدر يحذفها.
4. رابط الخصوصية: `https://gymmate.app/privacy`.

## 6. iOS
- من أول يوم: Safari → مشاركة → إضافة للشاشة الرئيسية (iOS 16.4+ يدعم الإشعارات).
- App Store بعدين: Capacitor مع ميزات أصلية (HealthKit، الاهتزاز) عشان يقبلونه حسب الإرشاد 4.2.

## 7. قبل كل إصدار
`npm run typecheck && npm test && npm run build && npm run bundle && npm run e2e && npm run lhci`

## حدود الخطط المجانية (أكتوبر 2026)
| الخدمة | المجاني |
|---|---|
| Cloudflare Pages | باندويث بلا حد، 500 بناء بالشهر، 20 ألف ملف (كل ملف 25MB كحد أقصى)، والاستخدام التجاري مسموح |
| Supabase | قاعدة 500MB، 50 ألف مستخدم شهرياً، 5GB نقل، 1GB تخزين، 500 ألف استدعاء للدوال |
| GitHub Actions | 2000 دقيقة بالشهر للمستودع الخاص، وبلا حد للعام |

> فيديوهات التمارين لو كبرت عن 25MB أو كثرت، انقلها لـ **Cloudflare R2**: أول 10GB مجانية وبدون رسوم نقل.
