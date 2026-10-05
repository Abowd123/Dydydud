import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '@/store/settings';
import { privacy, terms } from './content';

/** صفحة عامة (بدون تسجيل) عشان روابط المتاجر تفتحها مباشرة */
export function LegalPage({ kind }: { kind: 'privacy' | 'terms' }) {
  const lang = useSettings((s) => s.lang) === 'en' ? 'en' : 'ar';
  const doc = (kind === 'privacy' ? privacy : terms)[lang];
  const nav = useNavigate();
  const Back = lang === 'ar' ? ArrowRight : ArrowLeft;
  return (
    <main id="main" className="page pb-16">
      <button onClick={() => (history.length > 1 ? nav(-1) : nav('/'))} aria-label={lang === 'ar' ? 'رجوع' : 'Back'}
        className="mb-6 grid h-11 w-11 place-items-center rounded-xl bg-elevated"><Back size={20} /></button>
      <p className="eyebrow">GymMate</p>
      <h1 className="h-title mt-1">{doc.title}</h1>
      <p className="mt-1 text-sm text-muted">{lang === 'ar' ? 'آخر تحديث' : 'Last updated'}: <span dir="ltr">{doc.updated}</span></p>
      <div className="mt-6 flex flex-col gap-4">
        {doc.sections.map((s) => (
          <section key={s.h} className="surface-lux rounded-3xl p-5">
            <h2 className="mb-2 text-lg font-bold text-gold">{s.h}</h2>
            {s.p.map((x) => <p key={x} className="mb-2 leading-relaxed last:mb-0">{x}</p>)}
          </section>
        ))}
      </div>
    </main>
  );
}
