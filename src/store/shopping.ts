import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ShoppingState {
  weekKey: string;
  checked: string[];
  toggle: (weekKey: string, id: string) => void;
  reset: (weekKey: string) => void;
}

export const useShoppingChecks = create<ShoppingState>()(
  persist(
    (set, get) => ({
      weekKey: '',
      checked: [],
      toggle: (weekKey, id) => {
        const base = get().weekKey === weekKey ? get().checked : [];
        set({ weekKey, checked: base.includes(id) ? base.filter((x) => x !== id) : [...base, id] });
      },
      reset: (weekKey) => set({ weekKey, checked: [] })
    }),
    { name: 'gymmate-shopping' }
  )
);
