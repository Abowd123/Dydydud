import { useSettings } from '@/store/settings';
/** يرجع 1 للـ LTR و -1 للـ RTL، مفيد لاتجاه الحركات */
export const useDirection = () => (useSettings((s) => s.lang) === 'ar' ? -1 : 1);
