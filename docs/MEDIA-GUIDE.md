# دليل الميديا 🎬

## المواصفات
- **الفيديو:** 5 إلى 8 ثواني، Loop، بدون صوت، زاوية جانبية (45 درجة)، خلفية بسيطة
- **المخرجات لكل تمرين** (تتولد تلقائياً بـ `npm run media`):
  - `video.webm` (VP9) و `video.mp4` (H.264 احتياطي لـ iPhone): الهدف أقل من 1MB
  - `poster.webp` 720×720 و `thumb.webp` 360×270
- **المسار:** `public/media/exercises/<id>/`

## لو الميديا مو موجودة
التطبيق ما ينكسر: يعرض خريطة العضلات المستهدفة بدل الفيديو تلقائياً. فتقدر تضيف الفيديوهات تدريجياً.

## مصادر مقترحة
- **wger.de** (مفتوح المصدر، صور تمارين، راجع الرخصة CC-BY-SA)
- **Pexels / Pixabay** (فيديوهات مجانية للاستخدام التجاري)
- **ExerciseDB API** (GIFs، اشتراك عبر RapidAPI)
- **الأفضل:** تصوير مدرب بخلفية موحدة لكل التمارين = هوية احترافية

⚠️ احفظ مصدر ورخصة كل ملف في `docs/MEDIA-CREDITS.md`.

## الكاش أوفلاين
Service Worker يخزن الفيديوهات والصور اللي فتحها المستخدم (CacheFirst، 200 ملف، 30 يوم). الميديا مستثناة من التحميل المسبق عشان حجم التطبيق يبقى صغير.

## قائمة التمارين (151)

| المعرّف | العربي | English |
|---|---|---|
| `barbell-bench-press` | بنش بريس بالبار | Barbell Bench Press |
| `incline-dumbbell-press` | ضغط دمبل مائل | Incline Dumbbell Press |
| `dumbbell-bench-press` | ضغط دمبل مستوي | Dumbbell Bench Press |
| `push-up` | ضغط أرضي | Push-Up |
| `chest-press-machine` | جهاز ضغط الصدر | Chest Press Machine |
| `cable-fly` | تفتيح كيبل | Cable Fly |
| `pec-deck` | جهاز الفراشة | Pec Deck |
| `chest-dip` | متوازي للصدر | Chest Dip |
| `lat-pulldown` | سحب أمامي | Lat Pulldown |
| `seated-cable-row` | سحب أرضي بالكيبل | Seated Cable Row |
| `barbell-row` | تجديف بالبار | Barbell Row |
| `dumbbell-row` | تجديف دمبل بيد واحدة | One-Arm Dumbbell Row |
| `pull-up` | عقلة | Pull-Up |
| `assisted-pull-up` | عقلة بالمساعدة | Assisted Pull-Up |
| `t-bar-row` | تجديف T-Bar | T-Bar Row |
| `straight-arm-pulldown` | سحب بذراع مستقيمة | Straight-Arm Pulldown |
| `deadlift` | ديدلفت | Deadlift |
| `back-extension` | تمديد الظهر | Back Extension |
| `overhead-press` | ضغط أكتاف بالبار | Overhead Press |
| `dumbbell-shoulder-press` | ضغط أكتاف دمبل | Dumbbell Shoulder Press |
| `lateral-raise` | رفرفة جانبي | Lateral Raise |
| `front-raise` | رفرفة أمامي | Front Raise |
| `rear-delt-fly` | رفرفة خلفي | Rear Delt Fly |
| `face-pull` | فيس بول | Face Pull |
| `shrug` | ترابيس دمبل | Dumbbell Shrug |
| `barbell-curl` | بايسبس بالبار | Barbell Curl |
| `dumbbell-curl` | بايسبس دمبل | Dumbbell Curl |
| `hammer-curl` | هامر | Hammer Curl |
| `preacher-curl` | بايسبس على المسند | Preacher Curl |
| `triceps-pushdown` | ترايسبس كيبل | Triceps Pushdown |
| `overhead-triceps-extension` | ترايسبس خلف الرأس | Overhead Triceps Extension |
| `skull-crusher` | سكل كراشر | Skull Crusher |
| `bench-dip` | ديبس على البنش | Bench Dip |
| `close-grip-bench-press` | بنش قبضة ضيقة | Close-Grip Bench Press |
| `back-squat` | سكوات بالبار | Back Squat |
| `goblet-squat` | سكوات جوبلت | Goblet Squat |
| `leg-press` | جهاز ضغط الأرجل | Leg Press |
| `romanian-deadlift` | ديدلفت روماني | Romanian Deadlift |
| `walking-lunge` | طعنات أمامية | Walking Lunge |
| `bulgarian-split-squat` | سكوات بلغاري | Bulgarian Split Squat |
| `leg-extension` | جهاز الرجل الأمامي | Leg Extension |
| `leg-curl` | جهاز الرجل الخلفي | Leg Curl |
| `hip-thrust` | هيب ثرست | Hip Thrust |
| `standing-calf-raise` | سمانة واقف | Standing Calf Raise |
| `plank` | بلانك | Plank |
| `crunch` | كرنش | Crunch |
| `hanging-knee-raise` | رفع الركبة معلق | Hanging Knee Raise |
| `russian-twist` | روسيان تويست | Russian Twist |
| `cable-crunch` | كرنش كيبل | Cable Crunch |
| `dead-bug` | ديد بق | Dead Bug |
| `bodyweight-squat` | سكوات بوزن الجسم | Bodyweight Squat |
| `glute-bridge` | جسر المؤخرة | Glute Bridge |
| `bodyweight-lunge` | طعنات بوزن الجسم | Bodyweight Reverse Lunge |
| `pike-push-up` | ضغط بايك للأكتاف | Pike Push-Up |
| `superman` | سوبرمان | Superman |
| `bodyweight-calf-raise` | سمانة بوزن الجسم | Bodyweight Calf Raise |
| `single-leg-rdl` | ديدلفت روماني برجل وحدة | Single-Leg Romanian Deadlift |
| `decline-bench-press` | بنش مائل لتحت | Decline Bench Press |
| `incline-barbell-press` | بنش مائل بالبار | Incline Barbell Press |
| `machine-incline-press` | جهاز ضغط مائل | Incline Machine Press |
| `low-high-cable-fly` | تفتيح كيبل من تحت لفوق | Low-to-High Cable Fly |
| `dumbbell-fly` | تفتيح دمبل | Dumbbell Fly |
| `dumbbell-pullover` | بول أوفر دمبل | Dumbbell Pullover |
| `incline-push-up` | ضغط مائل (يدينك مرفوعة) | Incline Push-Up |
| `decline-push-up` | ضغط مائل (رجلينك مرفوعة) | Decline Push-Up |
| `diamond-push-up` | ضغط الماسة | Diamond Push-Up |
| `smith-bench-press` | بنش على السميث | Smith Machine Bench Press |
| `svend-press` | سفيند برس | Svend Press |
| `high-cable-crossover` | كيبل كروس من فوق | High Cable Crossover |
| `dumbbell-floor-press` | ضغط دمبل على الأرض | Dumbbell Floor Press |
| `chin-up` | عقلة قبضة عكسية | Chin-Up |
| `inverted-row` | تجديف معكوس | Inverted Row |
| `chest-supported-row` | تجديف دمبل على بنش مائل | Chest-Supported Row |
| `machine-row` | جهاز التجديف | Machine Row |
| `close-grip-pulldown` | سحب أمامي قبضة ضيقة | Close-Grip Pulldown |
| `single-arm-cable-row` | تجديف كيبل بيد وحدة | Single-Arm Cable Row |
| `pendlay-row` | تجديف بندلاي | Pendlay Row |
| `rack-pull` | راك بول | Rack Pull |
| `good-morning` | جود مورننق | Good Morning |
| `cable-pullover` | بول أوفر كيبل | Cable Pullover |
| `reverse-grip-pulldown` | سحب أمامي قبضة عكسية | Reverse-Grip Pulldown |
| `bird-dog` | بيرد دوق | Bird Dog |
| `single-arm-pulldown` | سحب أمامي بيد وحدة | Single-Arm Pulldown |
| `renegade-row` | رينيقيد رو | Renegade Row |
| `arnold-press` | ضغط أرنولد | Arnold Press |
| `machine-shoulder-press` | جهاز ضغط الأكتاف | Machine Shoulder Press |
| `cable-lateral-raise` | رفرفة جانبي كيبل | Cable Lateral Raise |
| `reverse-pec-deck` | فراشة عكسي | Reverse Pec Deck |
| `landmine-press` | لاندماين برس | Landmine Press |
| `incline-y-raise` | رفع Y على بنش مائل | Incline Y-Raise |
| `barbell-shrug` | ترابيس بار | Barbell Shrug |
| `cable-rear-delt-fly` | رفرفة خلفي كيبل | Cable Rear Delt Fly |
| `seated-lateral-raise` | رفرفة جانبي جالس | Seated Lateral Raise |
| `push-press` | بوش برس | Push Press |
| `ez-bar-curl` | بايسبس بار EZ | EZ-Bar Curl |
| `concentration-curl` | بايسبس تركيز | Concentration Curl |
| `incline-dumbbell-curl` | بايسبس على بنش مائل | Incline Dumbbell Curl |
| `cable-curl` | بايسبس كيبل | Cable Curl |
| `spider-curl` | سبايدر كيرل | Spider Curl |
| `reverse-curl` | بايسبس قبضة عكسية | Reverse Curl |
| `wrist-curl` | تمرين المعصم | Wrist Curl |
| `rope-hammer-curl` | هامر بالحبل | Rope Hammer Curl |
| `rope-pushdown` | ترايسبس بالحبل | Rope Pushdown |
| `overhead-cable-extension` | ترايسبس كيبل خلف الرأس | Overhead Cable Extension |
| `dumbbell-kickback` | كيك باك ترايسبس | Dumbbell Kickback |
| `machine-dip` | جهاز الديبس | Machine Dip |
| `farmer-walk` | مشي المزارع | Farmer's Walk |
| `machine-curl` | جهاز البايسبس | Machine Curl |
| `zottman-curl` | زوتمان كيرل | Zottman Curl |
| `tate-press` | تيت برس | Tate Press |
| `front-squat` | سكوات أمامي | Front Squat |
| `hack-squat` | جهاز الهاك سكوات | Hack Squat |
| `smith-squat` | سكوات سميث | Smith Machine Squat |
| `sumo-squat` | سكوات سومو | Sumo Squat |
| `step-up` | صعود البنش | Step-Up |
| `dumbbell-reverse-lunge` | طعنات خلفية بالدمبل | Dumbbell Reverse Lunge |
| `lateral-lunge` | طعنات جانبية | Lateral Lunge |
| `sumo-deadlift` | ديدلفت سومو | Sumo Deadlift |
| `dumbbell-rdl` | ديدلفت روماني بالدمبل | Dumbbell Romanian Deadlift |
| `seated-leg-curl` | جهاز الرجل الخلفي جالس | Seated Leg Curl |
| `nordic-curl` | نورديك كيرل | Nordic Curl |
| `cable-kickback` | كيك باك مؤخرة كيبل | Cable Glute Kickback |
| `hip-abduction` | جهاز فتح الأرجل | Hip Abduction Machine |
| `hip-adduction` | جهاز ضم الأرجل | Hip Adduction Machine |
| `seated-calf-raise` | سمانة جالس | Seated Calf Raise |
| `leg-press-calf-raise` | سمانة على جهاز الأرجل | Leg Press Calf Raise |
| `wall-sit` | الجلوس على الجدار | Wall Sit |
| `jump-squat` | سكوات بقفزة | Jump Squat |
| `single-leg-glute-bridge` | جسر المؤخرة برجل وحدة | Single-Leg Glute Bridge |
| `donkey-kick` | ركلة الحمار | Donkey Kick |
| `dumbbell-hip-thrust` | هيب ثرست بالدمبل | Dumbbell Hip Thrust |
| `curtsy-lunge` | طعنات كيرتسي | Curtsy Lunge |
| `assisted-pistol-squat` | بستل سكوات بالمساعدة | Assisted Pistol Squat |
| `frog-pump` | فروق بمب | Frog Pump |
| `side-plank` | بلانك جانبي | Side Plank |
| `bicycle-crunch` | كرنش الدراجة | Bicycle Crunch |
| `lying-leg-raise` | رفع الرجلين مستلقي | Lying Leg Raise |
| `mountain-climber` | متسلق الجبل | Mountain Climber |
| `ab-wheel-rollout` | عجلة البطن | Ab Wheel Rollout |
| `pallof-press` | بالوف برس | Pallof Press |
| `cable-woodchop` | حطّاب الكيبل | Cable Woodchop |
| `hollow-hold` | هولو هولد | Hollow Hold |
| `reverse-crunch` | كرنش عكسي | Reverse Crunch |
| `flutter-kicks` | ركلات الرفرفة | Flutter Kicks |
| `heel-touch` | لمس الكعب | Heel Touches |
| `captains-chair-raise` | رفع الركبة على الجهاز | Captain's Chair Knee Raise |
| `plank-shoulder-tap` | بلانك لمس الكتف | Plank Shoulder Tap |
| `dead-hang` | التعلق الثابت | Dead Hang |
| `burpee` | بيربي | Burpee |
| `high-knees` | رفع الركب | High Knees |
| `bear-crawl` | مشية الدب | Bear Crawl |
