/**
 * أكلات خليجية وعربية شائعة: قيم تقريبية للحصة المعتادة في البيت أو المطعم.
 * المصدر: متوسطات جداول تغذية عامة (USDA + وصفات منزلية). الأرقام تقديرية ± 15%.
 */
export type DishCategory = 'rice' | 'grain' | 'street' | 'grill' | 'breakfast' | 'bread' | 'mezze' | 'sweet' | 'drink' | 'other';
export interface Dish {
  id: string;
  name: { ar: string; en: string };
  aliases: string[];
  serving: { ar: string; en: string };
  kcal: number; protein: number; carbs: number; fat: number;
  category: DishCategory;
}

export const GULF_DISHES: Dish[] = [
  { id: 'kabsa_chicken', name: { ar: 'كبسة دجاج', en: 'Chicken kabsa' }, aliases: ["كبسه", "كبسة", "kabsa", "machboos chicken"], serving: { ar: 'صحن (رز + ربع دجاج)', en: 'plate (rice + ¼ chicken)' }, kcal: 650, protein: 38, carbs: 75, fat: 20, category: 'rice' },
  { id: 'kabsa_meat', name: { ar: 'كبسة لحم', en: 'Lamb kabsa' }, aliases: ["كبسه لحم", "kabsa lamb", "kabsa meat"], serving: { ar: 'صحن (رز + قطعة لحم)', en: 'plate (rice + lamb piece)' }, kcal: 720, protein: 40, carbs: 75, fat: 28, category: 'rice' },
  { id: 'mandi_chicken', name: { ar: 'مندي دجاج', en: 'Chicken mandi' }, aliases: ["مندي", "mandi", "mandy"], serving: { ar: 'صحن (رز + نص دجاجة صغيرة)', en: 'plate (rice + ½ small chicken)' }, kcal: 680, protein: 42, carbs: 78, fat: 21, category: 'rice' },
  { id: 'mandi_meat', name: { ar: 'مندي لحم', en: 'Lamb mandi' }, aliases: ["مندي لحم", "mandi lamb", "hanith", "حنيذ"], serving: { ar: 'صحن (رز + قطعة لحم)', en: 'plate (rice + lamb piece)' }, kcal: 800, protein: 45, carbs: 78, fat: 33, category: 'rice' },
  { id: 'madfoon', name: { ar: 'مدفون / مظبي', en: 'Madfoon / Mathbi' }, aliases: ["مظبي", "مدفون", "madbi", "mathbi"], serving: { ar: 'صحن', en: 'plate' }, kcal: 700, protein: 44, carbs: 72, fat: 25, category: 'rice' },
  { id: 'madhghout', name: { ar: 'مضغوط دجاج', en: 'Chicken madhghout' }, aliases: ["مضغوط", "madghout"], serving: { ar: 'صحن', en: 'plate' }, kcal: 620, protein: 36, carbs: 72, fat: 19, category: 'rice' },
  { id: 'machboos_fish', name: { ar: 'مجبوس سمك', en: 'Fish machboos' }, aliases: ["مجبوس", "مكبوس", "machboos", "machbous fish"], serving: { ar: 'صحن', en: 'plate' }, kcal: 600, protein: 35, carbs: 72, fat: 17, category: 'rice' },
  { id: 'biryani_chicken', name: { ar: 'برياني دجاج', en: 'Chicken biryani' }, aliases: ["برياني", "biryani", "beryani"], serving: { ar: 'صحن', en: 'plate' }, kcal: 650, protein: 32, carbs: 80, fat: 22, category: 'rice' },
  { id: 'zurbian', name: { ar: 'زربيان', en: 'Zurbian' }, aliases: ["زربيان", "zurbian"], serving: { ar: 'صحن', en: 'plate' }, kcal: 700, protein: 38, carbs: 78, fat: 25, category: 'rice' },
  { id: 'maqluba', name: { ar: 'مقلوبة', en: 'Maqluba' }, aliases: ["مقلوبه", "maqluba", "maklouba"], serving: { ar: 'صحن', en: 'plate' }, kcal: 620, protein: 30, carbs: 70, fat: 24, category: 'rice' },
  { id: 'mansaf', name: { ar: 'منسف', en: 'Mansaf' }, aliases: ["منسف", "mansaf"], serving: { ar: 'صحن', en: 'plate' }, kcal: 750, protein: 40, carbs: 70, fat: 33, category: 'rice' },
  { id: 'saloona_rice', name: { ar: 'صالونة مع رز', en: 'Saloona with rice' }, aliases: ["صالونه", "مرق", "saloona", "salona", "عيش ومرق"], serving: { ar: 'صحن', en: 'plate' }, kcal: 620, protein: 32, carbs: 74, fat: 20, category: 'rice' },
  { id: 'white_rice', name: { ar: 'رز أبيض', en: 'White rice' }, aliases: ["رز", "عيش", "rice"], serving: { ar: 'كوب مطبوخ', en: 'cooked cup' }, kcal: 205, protein: 4, carbs: 45, fat: 0.5, category: 'rice' },
  { id: 'harees', name: { ar: 'هريس', en: 'Harees' }, aliases: ["هريس", "harees", "harris"], serving: { ar: 'صحن (300 جم)', en: 'bowl (300 g)' }, kcal: 380, protein: 25, carbs: 45, fat: 11, category: 'grain' },
  { id: 'jareesh', name: { ar: 'جريش', en: 'Jareesh' }, aliases: ["جريش", "jareesh", "jerish"], serving: { ar: 'صحن (300 جم)', en: 'bowl (300 g)' }, kcal: 360, protein: 14, carbs: 52, fat: 11, category: 'grain' },
  { id: 'thareed', name: { ar: 'ثريد', en: 'Thareed' }, aliases: ["ثريد", "threed", "thareed"], serving: { ar: 'صحن', en: 'plate' }, kcal: 520, protein: 30, carbs: 55, fat: 20, category: 'grain' },
  { id: 'margoog', name: { ar: 'مرقوق', en: 'Margoog' }, aliases: ["مرقوق", "marqooq", "margoog"], serving: { ar: 'صحن', en: 'plate' }, kcal: 450, protein: 25, carbs: 55, fat: 14, category: 'grain' },
  { id: 'qursan', name: { ar: 'قرصان', en: 'Qursan' }, aliases: ["قرصان", "qursan"], serving: { ar: 'صحن', en: 'plate' }, kcal: 460, protein: 24, carbs: 58, fat: 14, category: 'grain' },
  { id: 'mutabbaq_meat', name: { ar: 'مطبق لحم', en: 'Meat mutabbaq' }, aliases: ["مطبق", "مطبق لحم", "murtabak", "mutabbaq"], serving: { ar: 'قطعة', en: 'piece' }, kcal: 350, protein: 14, carbs: 30, fat: 19, category: 'street' },
  { id: 'mutabbaq_sweet', name: { ar: 'مطبق جبن / موز', en: 'Sweet mutabbaq' }, aliases: ["مطبق جبن", "مطبق موز", "مطبق حلو"], serving: { ar: 'قطعة', en: 'piece' }, kcal: 380, protein: 9, carbs: 40, fat: 20, category: 'street' },
  { id: 'sambosa', name: { ar: 'سمبوسة', en: 'Sambosa' }, aliases: ["سمبوسه", "سنبوسة", "samosa", "sambosa"], serving: { ar: '3 حبات', en: '3 pieces' }, kcal: 330, protein: 9, carbs: 30, fat: 19, category: 'street' },
  { id: 'falafel', name: { ar: 'فلافل', en: 'Falafel' }, aliases: ["فلافل", "طعمية", "falafel", "taameya"], serving: { ar: '5 حبات', en: '5 pieces' }, kcal: 330, protein: 13, carbs: 32, fat: 17, category: 'street' },
  { id: 'falafel_sandwich', name: { ar: 'ساندويتش فلافل', en: 'Falafel sandwich' }, aliases: ["ساندويتش فلافل", "falafel wrap"], serving: { ar: 'ساندويتش', en: 'sandwich' }, kcal: 450, protein: 14, carbs: 58, fat: 18, category: 'street' },
  { id: 'shawarma_chicken', name: { ar: 'شاورما دجاج', en: 'Chicken shawarma' }, aliases: ["شاورما", "شاورما دجاج", "shawarma", "shawerma"], serving: { ar: 'ساندويتش', en: 'sandwich' }, kcal: 480, protein: 28, carbs: 45, fat: 20, category: 'street' },
  { id: 'shawarma_meat', name: { ar: 'شاورما لحم', en: 'Meat shawarma' }, aliases: ["شاورما لحم", "beef shawarma"], serving: { ar: 'ساندويتش', en: 'sandwich' }, kcal: 520, protein: 25, carbs: 45, fat: 26, category: 'street' },
  { id: 'shawarma_plate', name: { ar: 'صحن شاورما عربي', en: 'Arabic shawarma plate' }, aliases: ["عربي", "صحن عربي", "شاورما عربي", "arabi plate"], serving: { ar: 'صحن مع بطاطس وثومية', en: 'plate with fries & garlic' }, kcal: 900, protein: 45, carbs: 90, fat: 38, category: 'street' },
  { id: 'broast', name: { ar: 'بروست', en: 'Broast chicken' }, aliases: ["بروست", "بروستد", "broast", "fried chicken"], serving: { ar: '4 قطع + بطاطس', en: '4 pieces + fries' }, kcal: 1100, protein: 55, carbs: 80, fat: 60, category: 'street' },
  { id: 'burger', name: { ar: 'برجر لحم', en: 'Beef burger' }, aliases: ["برجر", "همبرجر", "burger"], serving: { ar: 'ساندويتش', en: 'sandwich' }, kcal: 550, protein: 28, carbs: 40, fat: 30, category: 'street' },
  { id: 'pizza', name: { ar: 'بيتزا', en: 'Pizza' }, aliases: ["بيتزا", "pizza"], serving: { ar: 'شريحتين', en: '2 slices' }, kcal: 570, protein: 24, carbs: 66, fat: 22, category: 'street' },
  { id: 'shish_tawook', name: { ar: 'شيش طاووق', en: 'Shish tawook' }, aliases: ["شيش", "طاووق", "shish tawook", "tawook"], serving: { ar: 'سيخين + خبز', en: '2 skewers + bread' }, kcal: 520, protein: 48, carbs: 40, fat: 17, category: 'grill' },
  { id: 'mixed_grill', name: { ar: 'مشاوي مشكل', en: 'Mixed grill' }, aliases: ["مشاوي", "مشويات", "كباب", "تكة", "mixed grill", "kebab"], serving: { ar: 'صحن', en: 'plate' }, kcal: 550, protein: 50, carbs: 8, fat: 35, category: 'grill' },
  { id: 'grilled_fish', name: { ar: 'سمك مشوي', en: 'Grilled fish' }, aliases: ["سمك", "هامور", "كنعد", "grilled fish", "hammour"], serving: { ar: 'قطعة (200 جم)', en: 'fillet (200 g)' }, kcal: 300, protein: 45, carbs: 0, fat: 12, category: 'grill' },
  { id: 'ful', name: { ar: 'فول مدمس', en: 'Ful medames' }, aliases: ["فول", "ful", "foul"], serving: { ar: 'صحن (250 جم)', en: 'bowl (250 g)' }, kcal: 330, protein: 17, carbs: 40, fat: 11, category: 'breakfast' },
  { id: 'shakshuka', name: { ar: 'شكشوكة', en: 'Shakshuka' }, aliases: ["شكشوكه", "shakshuka"], serving: { ar: 'صحن (بيضتين)', en: 'plate (2 eggs)' }, kcal: 280, protein: 15, carbs: 12, fat: 19, category: 'breakfast' },
  { id: 'balaleet', name: { ar: 'بلاليط', en: 'Balaleet' }, aliases: ["بلاليط", "balaleet"], serving: { ar: 'صحن', en: 'plate' }, kcal: 450, protein: 12, carbs: 65, fat: 16, category: 'breakfast' },
  { id: 'tamees', name: { ar: 'تميس', en: 'Tamees bread' }, aliases: ["تميس", "tamees", "tamis"], serving: { ar: 'رغيف', en: 'loaf' }, kcal: 330, protein: 10, carbs: 62, fat: 4, category: 'bread' },
  { id: 'tamees_cheese', name: { ar: 'تميس بالجبن', en: 'Tamees with cheese' }, aliases: ["تميس جبن", "تميس بالجبن"], serving: { ar: 'رغيف', en: 'loaf' }, kcal: 480, protein: 16, carbs: 64, fat: 18, category: 'bread' },
  { id: 'arabic_bread', name: { ar: 'خبز عربي', en: 'Arabic bread' }, aliases: ["خبز", "خبز عربي", "pita", "khubz"], serving: { ar: 'رغيف', en: 'loaf' }, kcal: 165, protein: 5, carbs: 33, fat: 1, category: 'bread' },
  { id: 'hummus', name: { ar: 'حمص', en: 'Hummus' }, aliases: ["حمص", "hummus"], serving: { ar: 'صحن (150 جم)', en: 'bowl (150 g)' }, kcal: 260, protein: 8, carbs: 22, fat: 16, category: 'mezze' },
  { id: 'mutabal', name: { ar: 'متبل', en: 'Mutabal' }, aliases: ["متبل", "بابا غنوج", "mutabal", "baba ghanoush"], serving: { ar: 'صحن (150 جم)', en: 'bowl (150 g)' }, kcal: 180, protein: 4, carbs: 12, fat: 13, category: 'mezze' },
  { id: 'fattoush', name: { ar: 'فتوش', en: 'Fattoush' }, aliases: ["فتوش", "fattoush", "سلطة"], serving: { ar: 'صحن', en: 'plate' }, kcal: 200, protein: 4, carbs: 20, fat: 12, category: 'mezze' },
  { id: 'tabbouleh', name: { ar: 'تبولة', en: 'Tabbouleh' }, aliases: ["تبوله", "tabbouleh"], serving: { ar: 'صحن', en: 'plate' }, kcal: 170, protein: 3, carbs: 16, fat: 11, category: 'mezze' },
  { id: 'warak_enab', name: { ar: 'ورق عنب', en: 'Stuffed vine leaves' }, aliases: ["ورق عنب", "دوالي", "warak enab"], serving: { ar: '6 حبات', en: '6 pieces' }, kcal: 230, protein: 4, carbs: 30, fat: 10, category: 'mezze' },
  { id: 'molokhia', name: { ar: 'ملوخية مع رز ودجاج', en: 'Molokhia with rice & chicken' }, aliases: ["ملوخيه", "molokhia"], serving: { ar: 'صحن', en: 'plate' }, kcal: 600, protein: 35, carbs: 65, fat: 20, category: 'rice' },
  { id: 'bechamel_pasta', name: { ar: 'مكرونة بشاميل', en: 'Pasta béchamel' }, aliases: ["مكرونه بشاميل", "مكرونة", "باستا", "pasta"], serving: { ar: 'صحن', en: 'plate' }, kcal: 600, protein: 25, carbs: 60, fat: 28, category: 'other' },
  { id: 'luqaimat', name: { ar: 'لقيمات', en: 'Luqaimat' }, aliases: ["لقيمات", "لقمة القاضي", "luqaimat"], serving: { ar: '6 حبات', en: '6 pieces' }, kcal: 330, protein: 4, carbs: 48, fat: 14, category: 'sweet' },
  { id: 'kunafa', name: { ar: 'كنافة', en: 'Kunafa' }, aliases: ["كنافه", "knafeh", "kunafa"], serving: { ar: 'قطعة (150 جم)', en: 'piece (150 g)' }, kcal: 520, protein: 10, carbs: 58, fat: 28, category: 'sweet' },
  { id: 'basbousa', name: { ar: 'بسبوسة', en: 'Basbousa' }, aliases: ["بسبوسه", "هريسة حلو", "basbousa"], serving: { ar: 'قطعة', en: 'piece' }, kcal: 330, protein: 4, carbs: 50, fat: 13, category: 'sweet' },
  { id: 'dates', name: { ar: 'تمر', en: 'Dates' }, aliases: ["تمر", "تمرات", "dates", "رطب"], serving: { ar: '3 حبات', en: '3 dates' }, kcal: 200, protein: 1.5, carbs: 53, fat: 0.2, category: 'sweet' },
  { id: 'karak', name: { ar: 'شاي كرك', en: 'Karak tea' }, aliases: ["كرك", "شاي حليب", "karak", "chai"], serving: { ar: 'كوب', en: 'cup' }, kcal: 180, protein: 4, carbs: 26, fat: 6, category: 'drink' },
  { id: 'arabic_coffee', name: { ar: 'قهوة عربية', en: 'Arabic coffee' }, aliases: ["قهوه", "قهوة عربية", "gahwa", "qahwa"], serving: { ar: 'فنجانين', en: '2 cups' }, kcal: 10, protein: 0, carbs: 1, fat: 0, category: 'drink' },
  { id: 'laban', name: { ar: 'لبن', en: 'Laban' }, aliases: ["لبن", "روب", "laban", "buttermilk"], serving: { ar: 'كوب (250 مل)', en: 'cup (250 ml)' }, kcal: 120, protein: 8, carbs: 12, fat: 4, category: 'drink' },
  { id: 'orange_juice', name: { ar: 'عصير برتقال', en: 'Orange juice' }, aliases: ["عصير", "برتقال", "orange juice"], serving: { ar: 'كوب', en: 'cup' }, kcal: 110, protein: 2, carbs: 26, fat: 0.3, category: 'drink' }
];

export const dishById = (id: string) => GULF_DISHES.find((d) => d.id === id);
