import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useSettings } from '@/store/settings';

export function TopBar({ title, back, right }: { title: string; back?: boolean; right?: ReactNode }) {
  const nav = useNavigate();
  const rtl = useSettings((s) => s.lang) === 'ar';
  const Back = rtl ? ChevronRight : ChevronLeft;
  return (
    <header className="sticky top-0 z-30 -mx-4 mb-4 flex items-center gap-2 bg-bg/80 px-4 py-3 backdrop-blur-xl">
      {back && (
        <button onClick={() => nav(-1)} className="grid h-10 w-10 place-items-center rounded-xl bg-elevated" aria-label="back">
          <Back size={20} />
        </button>
      )}
      <h1 className="h-title flex-1">{title}</h1>
      {right}
    </header>
  );
}
