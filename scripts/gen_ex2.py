# التمارين الإضافية (المرحلة 6). الصيغة: id|ar|en|primary|secondary|equipment|diff|mech|sets|reps|rest|steps(;)|mistakes(;)|breathing|alts
R = r"""
decline-bench-press|بنش مائل لتحت|Decline Bench Press|chest|triceps,shoulders|barbell|2|compound|3|8-10|90|ثبّت رجليك على البنش المائل لتحت;انزل البار لأسفل صدرك ببطء;ادفع للأعلى لين تمد ذراعيك|نزول البار على الرقبة;ترتيد البار|IN|barbell-bench-press,dumbbell-bench-press
incline-barbell-press|بنش مائل بالبار|Incline Barbell Press|chest|shoulders,triceps|barbell|2|compound|4|6-10|120|اضبط البنش على 30 درجة;نزّل البار لأعلى صدرك والكوع 45 درجة;ادفع للأعلى بخط مستقيم|زاوية عالية تشغل الكتف أكثر;رفع المؤخرة|IN|incline-dumbbell-press
machine-incline-press|جهاز ضغط مائل|Incline Machine Press|chest|shoulders,triceps|machine|1|compound|3|10-12|75|اضبط المقعد بحيث المقابض بأعلى الصدر;ادفع للأمام والأعلى;ارجع ببطء بدون ما ترتاح الأوزان|رفع الكتفين|IN|incline-dumbbell-press
low-high-cable-fly|تفتيح كيبل من تحت لفوق|Low-to-High Cable Fly|chest|shoulders|cable|2|isolation|3|12-15|60|اضبط البكرات تحت وامسك المقابض;ارفع يديك بقوس لين تتقابل بمستوى الذقن;نزّل ببطء|ثني الكوع كثير|EX|cable-fly,pec-deck
dumbbell-fly|تفتيح دمبل|Dumbbell Fly|chest|shoulders|dumbbell|2|isolation|3|10-12|60|استلقِ والدمبلز فوق صدرك والكوع مثني خفيف;افتح يديك للجانب لين تحس بتمدد;اجمعها بنفس القوس|النزول عميق جداً يضغط على الكتف;مد الكوع بالكامل|IN|cable-fly,pec-deck
dumbbell-pullover|بول أوفر دمبل|Dumbbell Pullover|chest,lats|triceps|dumbbell|2|isolation|3|10-12|60|استلقِ وامسك دمبل بيديك فوق صدرك;نزّله خلف رأسك ببطء والكوع مثني خفيف;ارجعه فوق صدرك|تقويس الظهر كثير|IN|straight-arm-pulldown
incline-push-up|ضغط مائل (يدينك مرفوعة)|Incline Push-Up|chest|triceps,shoulders|bodyweight|1|compound|3|10-15|45|حط يديك على بنش أو طاولة ثابتة;جسمك مستقيم والبطن مشدود;انزل لين صدرك يقرب من الحافة وادفع|نزول الحوض|IN|push-up
decline-push-up|ضغط مائل (رجلينك مرفوعة)|Decline Push-Up|chest|shoulders,triceps|bodyweight|2|compound|3|8-12|60|حط رجليك على بنش ويديك على الأرض;انزل بصدرك للأرض;ادفع وارجع|رفع الحوض|IN|push-up,incline-dumbbell-press
diamond-push-up|ضغط الماسة|Diamond Push-Up|triceps,chest|shoulders|bodyweight|2|compound|3|8-12|60|يديك تحت صدرك والأصابع تشكل ماسة;انزل والكوع قريب من جسمك;ادفع للأعلى|فتح الكوع للجانب|IN|close-grip-bench-press,push-up
smith-bench-press|بنش على السميث|Smith Machine Bench Press|chest|triceps,shoulders|machine|1|compound|3|8-12|90|استلقِ والبار فوق منتصف صدرك;فك القفل ونزّل ببطء;ادفع للأعلى|البنش في مكان خاطئ تحت البار|IN|barbell-bench-press
svend-press|سفيند برس|Svend Press|chest|shoulders|dumbbell|1|isolation|3|12-15|45|اضغط دمبل خفيف بين كفوفك أمام صدرك;ادفعه للأمام وأنت تضغط بقوة;ارجعه لصدرك|الضغط بين اليدين يخف|EX|cable-fly
high-cable-crossover|كيبل كروس من فوق|High Cable Crossover|chest|shoulders|cable|1|isolation|3|12-15|60|اضبط البكرات فوق وامسك المقابض;انزل يديك بقوس لأسفل وقدام;اعصر الصدر ثم ارجع ببطء|هز الجسم|EX|cable-fly,pec-deck
dumbbell-floor-press|ضغط دمبل على الأرض|Dumbbell Floor Press|chest|triceps|dumbbell|1|compound|3|8-12|75|استلقِ على الأرض والركبة مثنية;انزل الدمبلز لين الكوع يلمس الأرض بخفة;ادفع للأعلى|ترطيم الكوع بالأرض|IN|dumbbell-bench-press
chin-up|عقلة قبضة عكسية|Chin-Up|lats,biceps|upperBack|bodyweight|3|compound|3|5-10|120|امسك البار والكفوف باتجاهك بعرض الكتف;اسحب جسمك لين ذقنك فوق البار;انزل ببطء بالكامل|التأرجح;نصف الحركة|EX|assisted-pull-up,lat-pulldown
inverted-row|تجديف معكوس|Inverted Row|upperBack,lats|biceps|bodyweight|2|compound|3|8-12|75|علّق نفسك تحت بار منخفض أو طاولة متينة;جسمك مستقيم;اسحب صدرك للبار ثم انزل|نزول الحوض|EX|seated-cable-row,dumbbell-row
chest-supported-row|تجديف دمبل على بنش مائل|Chest-Supported Row|upperBack,lats|biceps|dumbbell|1|compound|3|10-12|75|انبطح على بنش مائل والدمبلز تحتك;اسحب الدمبلز لخصرك واعصر لوحي الكتف;نزّل ببطء|رفع الصدر عن البنش|EX|dumbbell-row,seated-cable-row
machine-row|جهاز التجديف|Machine Row|upperBack,lats|biceps|machine|1|compound|3|10-12|75|اضبط المقعد وصدرك على المسند;اسحب المقابض لجسمك;ارجع ببطء|هز الجسم|EX|seated-cable-row
close-grip-pulldown|سحب أمامي قبضة ضيقة|Close-Grip Pulldown|lats|biceps|cable|1|compound|3|10-12|75|امسك المقبض الضيق (V);اسحب لأعلى صدرك والكوع لتحت;ارجع ببطء|الرجوع للخلف كثير|EX|lat-pulldown
single-arm-cable-row|تجديف كيبل بيد وحدة|Single-Arm Cable Row|lats,upperBack|biceps|cable|1|compound|3|10-12/جهة|60|اضبط الكيبل بمستوى الصدر;اسحب المقبض لخصرك;ارجع ومد ذراعك|لف الجسم كثير|EX|dumbbell-row
pendlay-row|تجديف بندلاي|Pendlay Row|upperBack,lats|lowerBack,biceps|barbell|3|compound|4|5-8|120|ميّل جسمك لين يكون موازي للأرض والبار على الأرض;اسحب البار بقوة لبطنك;رجّعه للأرض كل تكرار|تقويس الظهر|EX|barbell-row
rack-pull|راك بول|Rack Pull|lowerBack,traps|glutes,hamstrings,forearms|barbell|2|compound|3|5-8|150|حط البار على الحامل بمستوى الركبة;امسكه والظهر مستقيم;اسحب لين تقف وتقفل الحوض|تقويس الظهر|EX|deadlift
good-morning|جود مورننق|Good Morning|hamstrings,lowerBack|glutes|barbell|2|compound|3|8-10|90|البار على ظهرك والركبة مثنية خفيف;ادفع حوضك للخلف وميّل جسمك;ارجع بشد المؤخرة|تقويس الظهر;وزن ثقيل|IN|romanian-deadlift
cable-pullover|بول أوفر كيبل|Cable Pullover|lats|triceps|cable|1|isolation|3|12-15|60|امسك الحبل والكيبل فوق;انزل يديك لفخذيك بقوس;ارجع ببطء|ثني الكوع كثير|EX|straight-arm-pulldown
reverse-grip-pulldown|سحب أمامي قبضة عكسية|Reverse-Grip Pulldown|lats|biceps|cable|1|compound|3|10-12|75|امسك البار والكفوف باتجاهك;اسحب لأعلى صدرك;ارجع ببطء|السحب بالذراع بس|EX|lat-pulldown
bird-dog|بيرد دوق|Bird Dog|lowerBack,abs|glutes|bodyweight|1|isolation|3|10/جهة|45|على يديك وركبك والظهر مستقيم;مد يد ورجل عكسية;ثبّت ثانيتين وبدّل|لف الحوض|EX|dead-bug,superman
single-arm-pulldown|سحب أمامي بيد وحدة|Single-Arm Pulldown|lats|biceps|cable|2|isolation|3|10-12/جهة|60|امسك المقبض بيد وحدة فوق;اسحب الكوع لجنبك;ارجع بالكامل|لف الجسم|EX|lat-pulldown
renegade-row|رينيقيد رو|Renegade Row|upperBack,lats|abs,shoulders|dumbbell|3|compound|3|8/جهة|75|وضعية الضغط ويديك على دمبلز;اسحب دمبل لخصرك وثبّت جسمك;بدّل الجهة|لف الحوض|EX|dumbbell-row
arnold-press|ضغط أرنولد|Arnold Press|shoulders|triceps|dumbbell|2|compound|3|8-12|75|ابدأ والدمبلز أمام وجهك والكفوف لك;لف الكفوف للخارج وأنت تدفع فوق;ارجع بنفس الحركة|تقويس الظهر|IN|dumbbell-shoulder-press
machine-shoulder-press|جهاز ضغط الأكتاف|Machine Shoulder Press|shoulders|triceps|machine|1|compound|3|10-12|75|اضبط المقعد والمقابض بمستوى الكتف;ادفع للأعلى;نزّل ببطء|رفع الظهر عن المسند|IN|dumbbell-shoulder-press
cable-lateral-raise|رفرفة جانبي كيبل|Cable Lateral Raise|shoulders||cable|2|isolation|3|12-15/جهة|45|قف جنب الكيبل وامسكه باليد البعيدة;ارفع ذراعك للجانب لين الكتف;نزّل ببطء|هز الجسم|EX|lateral-raise
reverse-pec-deck|فراشة عكسي|Reverse Pec Deck|shoulders|upperBack|machine|1|isolation|3|12-15|60|اجلس ووجهك للجهاز;افتح يديك للخلف والكوع مثني خفيف;ارجع ببطء|السحب بالظهر|EX|rear-delt-fly,face-pull
landmine-press|لاندماين برس|Landmine Press|shoulders,chest|triceps|barbell|2|compound|3|8-10/جهة|75|حط طرف البار بزاوية وامسك الطرف الثاني بيد;ادفعه للأعلى والأمام;نزّله لكتفك|تقويس الظهر|IN|dumbbell-shoulder-press
incline-y-raise|رفع Y على بنش مائل|Incline Y-Raise|shoulders|upperBack,traps|dumbbell|1|isolation|3|12-15|45|انبطح على بنش مائل ودمبلز خفيفة;ارفع يديك بشكل حرف Y;نزّل ببطء|وزن ثقيل|EX|face-pull
barbell-shrug|ترابيس بار|Barbell Shrug|traps|forearms|barbell|1|isolation|3|10-15|60|امسك البار أمام فخذيك;ارفع كتفيك لأذنيك;نزّل ببطء|تدوير الكتفين|EX|shrug
cable-rear-delt-fly|رفرفة خلفي كيبل|Cable Rear Delt Fly|shoulders|upperBack|cable|2|isolation|3|12-15|45|اضبط الكيبلين بمستوى الكتف وتقاطع يديك;افتح يديك للخلف;ارجع ببطء|ثني الكوع كثير|EX|rear-delt-fly,face-pull
seated-lateral-raise|رفرفة جانبي جالس|Seated Lateral Raise|shoulders||dumbbell|1|isolation|3|12-15|45|اجلس على طرف البنش والدمبلز جنبك;ارفعها للجانب لين الكتف;نزّل ببطء|رفع الكتفين|EX|lateral-raise
push-press|بوش برس|Push Press|shoulders|triceps,quads|barbell|3|compound|3|5-8|120|البار على أعلى صدرك;انزل ربع سكوات بسرعة;ادفع برجليك والبار فوق رأسك|تقويس الظهر|IN|overhead-press
ez-bar-curl|بايسبس بار EZ|EZ-Bar Curl|biceps|forearms|barbell|1|isolation|3|8-12|60|امسك البار المتعرج;ارفع والكوع ثابت;نزّل ببطء|هز الجسم|EX|barbell-curl
concentration-curl|بايسبس تركيز|Concentration Curl|biceps||dumbbell|1|isolation|3|10-12/جهة|45|اجلس وكوعك على فخذك الداخلي;ارفع الدمبل لكتفك;نزّل ببطء|تحريك الكتف|EX|dumbbell-curl
incline-dumbbell-curl|بايسبس على بنش مائل|Incline Dumbbell Curl|biceps||dumbbell|2|isolation|3|10-12|60|اجلس على بنش مائل 45 درجة والذراع مدلاة;ارفع الدمبلز والكوع ثابت;نزّل لين تمد بالكامل|تقديم الكوع|EX|dumbbell-curl
cable-curl|بايسبس كيبل|Cable Curl|biceps|forearms|cable|1|isolation|3|10-15|45|امسك البار بالكيبل السفلي;ارفع والكوع جنبك;نزّل ببطء|الميلان للخلف|EX|barbell-curl
spider-curl|سبايدر كيرل|Spider Curl|biceps||dumbbell|2|isolation|3|10-12|45|انبطح على بنش مائل والذراع مدلاة;ارفع الدمبلز;اعصر فوق ونزّل|التأرجح|EX|preacher-curl
reverse-curl|بايسبس قبضة عكسية|Reverse Curl|forearms,biceps||barbell|1|isolation|3|10-12|45|امسك البار والكفوف لتحت;ارفع والكوع ثابت;نزّل ببطء|هز الجسم|EX|hammer-curl
wrist-curl|تمرين المعصم|Wrist Curl|forearms||dumbbell|1|isolation|3|15-20|45|اجلس وساعدك على فخذك والكف لفوق;ارفع المعصم بس;نزّل ببطء|تحريك الساعد|EX|reverse-curl
rope-hammer-curl|هامر بالحبل|Rope Hammer Curl|biceps,forearms||cable|1|isolation|3|12-15|45|امسك الحبل بالكيبل السفلي;ارفع والكفوف متقابلة;نزّل ببطء|تحريك الكوع|EX|hammer-curl
rope-pushdown|ترايسبس بالحبل|Rope Pushdown|triceps||cable|1|isolation|3|12-15|45|امسك الحبل والكوع جنبك;ادفع لتحت وافتح الحبل آخر الحركة;ارجع ببطء|تحريك الكوع للأمام|EX|triceps-pushdown
overhead-cable-extension|ترايسبس كيبل خلف الرأس|Overhead Cable Extension|triceps||cable|2|isolation|3|12-15|60|ظهرك للكيبل وامسك الحبل خلف رأسك;مد ذراعيك للأمام والأعلى;ارجع ببطء|فتح الكوع|EX|overhead-triceps-extension
dumbbell-kickback|كيك باك ترايسبس|Dumbbell Kickback|triceps||dumbbell|1|isolation|3|12-15/جهة|45|ميّل جسمك والكوع جنبك بزاوية 90;مد ذراعك للخلف;ارجع ببطء|نزول الكوع|EX|triceps-pushdown
machine-dip|جهاز الديبس|Machine Dip|triceps|chest,shoulders|machine|1|compound|3|10-12|60|اجلس وامسك المقابض;ادفع لتحت لين تمد ذراعيك;ارجع ببطء|رفع الكتفين|IN|bench-dip,triceps-pushdown
farmer-walk|مشي المزارع|Farmer's Walk|forearms,traps|abs,glutes|dumbbell|1|compound|3|30-40 ث|60|امسك دمبلز ثقيلة جنبك;امشِ بخطوات قصيرة والظهر مستقيم;الكتف لتحت والبطن مشدود|الميلان لجهة|تنفس بشكل طبيعي وثابت.|shrug
machine-curl|جهاز البايسبس|Machine Curl|biceps||machine|1|isolation|3|10-12|45|اضبط المقعد والكوع على المسند;ارفع المقابض;نزّل ببطء|ترك الوزن يطيح|EX|preacher-curl
zottman-curl|زوتمان كيرل|Zottman Curl|biceps,forearms||dumbbell|2|isolation|3|10-12|45|ارفع الدمبلز والكف لفوق;لف الكف لتحت فوق;نزّل ببطء بالقبضة العكسية|السرعة|EX|hammer-curl
tate-press|تيت برس|Tate Press|triceps|chest|dumbbell|2|isolation|3|10-12|60|استلقِ والدمبلز فوق صدرك والكفوف لقدام;نزّل الدمبلز لصدرك بثني الكوع للجانب;ادفع للأعلى|وزن ثقيل|EX|skull-crusher
front-squat|سكوات أمامي|Front Squat|quads|glutes,abs|barbell|3|compound|4|5-8|150|البار على مقدمة كتفك والكوع مرفوع;انزل والصدر مرفوع;ادفع وارجع|نزول الكوع;الميلان للأمام|DEEP|back-squat,goblet-squat
hack-squat|جهاز الهاك سكوات|Hack Squat|quads|glutes|machine|2|compound|3|8-12|120|ظهرك على المسند والكتف تحت الوسائد;انزل لين الركبة 90 درجة;ادفع بالكعب|رفع الكعب|IN|leg-press
smith-squat|سكوات سميث|Smith Machine Squat|quads,glutes|hamstrings|machine|1|compound|3|8-12|90|البار على ظهرك وقدميك قدام شوي;انزل لين الفخذ موازي;ادفع وارجع|الركبة للداخل|DEEP|back-squat,leg-press
sumo-squat|سكوات سومو|Sumo Squat|adductors,glutes|quads|dumbbell|1|compound|3|12-15|60|قدميك واسعة والأصابع للخارج وامسك دمبل بين رجليك;انزل مستقيم;ادفع وارجع|دخول الركبة|IN|goblet-squat
step-up|صعود البنش|Step-Up|quads,glutes|hamstrings|dumbbell|1|compound|3|10/رجل|60|امسك دمبلز وقف أمام بنش;اطلع برجل وحدة وادفع بالكعب;انزل بتحكم|الدفع بالرجل الخلفية|IN|walking-lunge,bulgarian-split-squat
dumbbell-reverse-lunge|طعنات خلفية بالدمبل|Dumbbell Reverse Lunge|quads,glutes|hamstrings|dumbbell|1|compound|3|10/رجل|60|امسك دمبلز;ارجع بخطوة للخلف وانزل;ادفع بالرجل الأمامية وارجع|الميلان للأمام|IN|walking-lunge
lateral-lunge|طعنات جانبية|Lateral Lunge|adductors,quads|glutes|bodyweight|1|compound|3|10/جهة|45|قف ورجليك مضمومة;خذ خطوة كبيرة للجانب وانزل على هالرجل;ادفع وارجع|الركبة تتعدى الأصابع|IN|sumo-squat
sumo-deadlift|ديدلفت سومو|Sumo Deadlift|glutes,hamstrings|adductors,lowerBack,quads|barbell|3|compound|3|5-8|150|قدميك واسعة والقبضة بين رجليك;الظهر مستقيم والصدر للأمام;ادفع الأرض وارفع|تقويس الظهر|DEEP|deadlift,romanian-deadlift
dumbbell-rdl|ديدلفت روماني بالدمبل|Dumbbell Romanian Deadlift|hamstrings,glutes|lowerBack|dumbbell|1|compound|3|10-12|75|امسك الدمبلز أمام فخذيك;ادفع حوضك للخلف ونزّل الدمبلز قريب من رجليك;ارجع بشد المؤخرة|تقويس الظهر|IN|romanian-deadlift,single-leg-rdl
seated-leg-curl|جهاز الرجل الخلفي جالس|Seated Leg Curl|hamstrings||machine|1|isolation|3|12-15|60|اجلس والمسند فوق الكاحل;اثنِ رجليك لتحت;ارجع ببطء|رفع الحوض|EX|leg-curl
nordic-curl|نورديك كيرل|Nordic Curl|hamstrings|glutes|bodyweight|3|isolation|3|4-8|90|اركع وثبّت كاحلك تحت شي ثابت;انزل للأمام ببطء بجسم مستقيم;ادفع بيديك وارجع|ثني الحوض|IN|leg-curl
cable-kickback|كيك باك مؤخرة كيبل|Cable Glute Kickback|glutes|hamstrings|cable|1|isolation|3|12-15/رجل|45|اربط الكاحل بالكيبل السفلي;ادفع رجلك للخلف واعصر المؤخرة;ارجع ببطء|تقويس الظهر|EX|glute-bridge,hip-thrust
hip-abduction|جهاز فتح الأرجل|Hip Abduction Machine|glutes||machine|1|isolation|3|15-20|45|اجلس والوسائد على جنب ركبتك;افتح رجليك للخارج;ارجع ببطء|السرعة|EX|lateral-lunge
hip-adduction|جهاز ضم الأرجل|Hip Adduction Machine|adductors||machine|1|isolation|3|15-20|45|اجلس والوسائد داخل ركبتك;ضم رجليك;ارجع ببطء|ترك الوزن يرجع بسرعة|EX|sumo-squat
seated-calf-raise|سمانة جالس|Seated Calf Raise|calves||machine|1|isolation|4|15-20|45|اجلس والوسادة فوق ركبتك;نزّل الكعب لين تحس بتمدد;ارفع لأعلى نقطة|الحركة القصيرة|تنفس بشكل طبيعي.|standing-calf-raise
leg-press-calf-raise|سمانة على جهاز الأرجل|Leg Press Calf Raise|calves||machine|1|isolation|3|15-20|45|حط أطراف أصابعك على حافة المنصة;ادفع بأطراف الأصابع;ارجع ببطء|ثني الركبة|تنفس بشكل طبيعي.|standing-calf-raise
wall-sit|الجلوس على الجدار|Wall Sit|quads|glutes|bodyweight|1|isolation|3|30-60 ث|60|اسند ظهرك على الجدار;انزل لين الركبة 90 درجة;اثبت|الركبة تتعدى الأصابع|تنفس بهدوء.|bodyweight-squat
jump-squat|سكوات بقفزة|Jump Squat|quads,glutes|calves|bodyweight|2|compound|3|10-12|60|انزل سكوات;انفجر لفوق بقفزة;انزل بنعومة على أطراف أصابعك|النزول بقوة على الكعب|EX|bodyweight-squat
single-leg-glute-bridge|جسر المؤخرة برجل وحدة|Single-Leg Glute Bridge|glutes|hamstrings|bodyweight|1|isolation|3|12/رجل|45|استلقِ ورجل مثنية والثانية مرفوعة;ادفع بكعبك وارفع حوضك;نزّل ببطء|نزول الحوض لجهة|EX|glute-bridge,hip-thrust
donkey-kick|ركلة الحمار|Donkey Kick|glutes||bodyweight|1|isolation|3|15/رجل|30|على يديك وركبك;ارفع رجل للسقف والركبة مثنية;اعصر ونزّل|تقويس الظهر|EX|cable-kickback
dumbbell-hip-thrust|هيب ثرست بالدمبل|Dumbbell Hip Thrust|glutes|hamstrings|dumbbell|1|compound|3|12-15|60|اسند ظهرك على البنش والدمبل على حوضك;ادفع حوضك للأعلى;اعصر ونزّل|تقويس الظهر|EX|hip-thrust,glute-bridge
curtsy-lunge|طعنات كيرتسي|Curtsy Lunge|glutes,quads|adductors|bodyweight|2|compound|3|10/رجل|45|ارجع برجل للخلف وبالعرض خلف الثانية;انزل ببطء;ادفع وارجع|الركبة للداخل|IN|bodyweight-lunge
assisted-pistol-squat|بستل سكوات بالمساعدة|Assisted Pistol Squat|quads,glutes||bodyweight|3|compound|3|5-8/رجل|90|امسك شي ثابت وقف على رجل وحدة;انزل والرجل الثانية قدامك;ادفع بالكعب وارجع|رفع الكعب|IN|bulgarian-split-squat
frog-pump|فروق بمب|Frog Pump|glutes||bodyweight|1|isolation|3|20-25|30|استلقِ وضم باطن قدميك والركبة للخارج;ارفع حوضك واعصر;نزّل|الدفع بالظهر|EX|glute-bridge
side-plank|بلانك جانبي|Side Plank|obliques|abs,shoulders|bodyweight|1|isolation|3|20-40 ث|30|استلقِ على جنبك والكوع تحت الكتف;ارفع حوضك لين جسمك مستقيم;اثبت|نزول الحوض|تنفس بهدوء.|plank
bicycle-crunch|كرنش الدراجة|Bicycle Crunch|obliques,abs||bodyweight|1|isolation|3|20|45|استلقِ ويديك جنب رأسك;قرّب الكوع للركبة العكسية وأنت تمد الرجل الثانية;بدّل ببطء|سحب الرقبة|EX|russian-twist
lying-leg-raise|رفع الرجلين مستلقي|Lying Leg Raise|abs||bodyweight|2|isolation|3|10-15|45|استلقِ ويديك تحت حوضك;ارفع رجليك مستقيمة لين 90;نزّلها ببطء بدون ما تلمس الأرض|تقويس أسفل الظهر|EX|hanging-knee-raise
mountain-climber|متسلق الجبل|Mountain Climber|abs|shoulders,quads|bodyweight|1|compound|3|30 ث|30|وضعية الضغط;قرّب ركبة لصدرك وبدّل بسرعة;خلّ الحوض منخفض|رفع الحوض|تنفس بإيقاع.|plank
ab-wheel-rollout|عجلة البطن|Ab Wheel Rollout|abs|lats,shoulders|bodyweight|3|isolation|3|6-10|60|اركع وامسك العجلة;دحرجها للأمام ببطء والبطن مشدود;ارجع بشد البطن|تقويس الظهر|EX|plank
pallof-press|بالوف برس|Pallof Press|obliques,abs||cable|1|isolation|3|10/جهة|45|قف جنب الكيبل وامسك المقبض على صدرك;ادفع يديك للأمام وقاوم اللف;ارجع|لف الجسم|EX|side-plank
cable-woodchop|حطّاب الكيبل|Cable Woodchop|obliques|abs,shoulders|cable|1|isolation|3|12/جهة|45|اضبط الكيبل فوق وامسك المقبض بيديك;لف جسمك وانزل بالمقبض للركبة العكسية;ارجع بتحكم|السحب بالذراع بس|EX|russian-twist
hollow-hold|هولو هولد|Hollow Hold|abs||bodyweight|2|isolation|3|20-40 ث|45|استلقِ وارفع كتفك ورجلك عن الأرض;الصق أسفل ظهرك بالأرض;اثبت|رفع أسفل الظهر|تنفس بهدوء.|dead-bug
reverse-crunch|كرنش عكسي|Reverse Crunch|abs||bodyweight|1|isolation|3|12-15|45|استلقِ والركبة مثنية فوق;ارفع حوضك لصدرك;نزّل ببطء|التأرجح|EX|crunch
flutter-kicks|ركلات الرفرفة|Flutter Kicks|abs||bodyweight|1|isolation|3|30 ث|30|استلقِ وارفع رجليك قليلاً;حرّك رجليك فوق وتحت بالتناوب;خلّ أسفل الظهر لاصق|تقويس الظهر|تنفس بإيقاع.|lying-leg-raise
heel-touch|لمس الكعب|Heel Touches|obliques||bodyweight|1|isolation|3|20|30|استلقِ والركبة مثنية;ارفع كتفيك قليلاً;المس كعبك يمين ويسار|سحب الرقبة|EX|russian-twist
captains-chair-raise|رفع الركبة على الجهاز|Captain's Chair Knee Raise|abs|obliques|machine|1|isolation|3|10-15|45|اسند ساعدك على الجهاز وظهرك على المسند;ارفع ركبتك لصدرك;نزّل ببطء|التأرجح|EX|hanging-knee-raise
plank-shoulder-tap|بلانك لمس الكتف|Plank Shoulder Tap|abs|shoulders,obliques|bodyweight|2|isolation|3|20|45|وضعية الضغط ورجليك واسعة شوي;المس كتفك بيدك العكسية;بدّل وخلّ الحوض ثابت|تأرجح الحوض|EX|plank
dead-hang|التعلق الثابت|Dead Hang|forearms,lats|shoulders|bodyweight|1|isolation|3|20-40 ث|60|امسك بار العقلة;علّق جسمك والكتف مرتاح;اثبت|التأرجح|تنفس بهدوء.|farmer-walk
burpee|بيربي|Burpee|quads,chest|shoulders,abs|bodyweight|2|compound|3|8-12|60|انزل سكوات وحط يديك;ارجع برجليك لوضع الضغط;ارجع وقُم بقفزة|نزول الحوض|تنفس بإيقاع.|jump-squat,mountain-climber
high-knees|رفع الركب|High Knees|quads|calves,abs|bodyweight|1|compound|3|30 ث|30|اركض بمكانك;ارفع ركبك لمستوى الحوض;حرك يديك|الانحناء للخلف|تنفس بإيقاع.|mountain-climber
bear-crawl|مشية الدب|Bear Crawl|shoulders,abs|quads|bodyweight|2|compound|3|20-30 ث|45|على يديك ورجليك والركبة فوق الأرض بقليل;امشِ للأمام بيد ورجل عكسية;خلّ الظهر مستقيم|رفع الحوض|تنفس بإيقاع.|mountain-climber
"""
BR={'IN':"شهيق وأنت تنزل الوزن، زفير وأنت تدفع أو تسحب.",'EX':"زفير وقت المجهود، شهيق وأنت ترجع.",'DEEP':"خذ نفس عميق وشد البطن قبل النزول، وازفر وأنت طالع."}
import json
E=json.load(open('gymmate/src/data/exercises.json'))
ids={e['id'] for e in E}
new=[]
for line in R.strip().split('\n'):
    p=line.split('|')
    assert len(p)==15,(len(p),line[:40])
    i,ar,en,pr,sec,eq,d,mech,sets,reps,rest,steps,mist,br,alts=p
    assert i not in ids,i
    new.append(dict(id=i,name={"ar":ar,"en":en},primaryMuscles=pr.split(','),secondaryMuscles=[x for x in sec.split(',') if x],equipment=eq,difficulty=int(d),mechanic=mech,
      defaults=dict(sets=int(sets),reps=reps,restSec=int(rest)),steps=steps.split(';'),mistakes=mist.split(';'),breathing=BR.get(br,br),alternatives=alts.split(','),
      media=dict(video=f"/media/exercises/{i}/video.webm",videoMp4=f"/media/exercises/{i}/video.mp4",poster=f"/media/exercises/{i}/poster.webp",thumb=f"/media/exercises/{i}/thumb.webp")))
    ids.add(i)
MUS={'chest','shoulders','biceps','triceps','forearms','abs','obliques','traps','lats','upperBack','lowerBack','glutes','quads','hamstrings','adductors','calves'}
for e in new:
    for m in e['primaryMuscles']+e['secondaryMuscles']: assert m in MUS,(e['id'],m)
    for a in e['alternatives']: assert a in ids,(e['id'],a)
    assert e['equipment'] in {'barbell','dumbbell','machine','cable','bodyweight'}
E+=new
json.dump(E,open('gymmate/src/data/exercises.json','w'),ensure_ascii=False,indent=1)
print(len(new),len(E))
