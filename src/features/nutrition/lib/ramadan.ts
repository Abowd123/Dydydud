import { dateKey } from '@/lib/date';

/** تواريخ رمضان التقريبية (قد تختلف يوم حسب رؤية الهلال) */
export const RAMADAN_DATES: [string, string][] = [
  ['2027-02-08', '2027-03-09'],
  ['2028-01-28', '2028-02-26'],
  ['2029-01-16', '2029-02-14'],
  ['2030-01-06', '2030-02-04']
];

export const isRamadan = (d = new Date()) => {
  const k = dateKey(d);
  return RAMADAN_DATES.some(([a, b]) => k >= a && k <= b);
};

/** قبل رمضان بـ 7 أيام أو خلاله: نقترح تفعيل الوضع */
export const ramadanSoon = (d = new Date()) => {
  const k = dateKey(d);
  return RAMADAN_DATES.some(([a, b]) => {
    const start = new Date(a + 'T00:00:00');
    start.setDate(start.getDate() - 7);
    return k >= dateKey(start) && k <= b;
  });
};
