import { useState } from 'react';
import { Heart, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageTransition } from '@/components/layout/PageTransition';
import { TopBar } from '@/components/layout/TopBar';
import { Badge, Button, Card, CardDescription, CardTitle, Modal, ProgressRing, Skeleton } from '@/components/ui';
import { colors } from '@/design/tokens';

/** معرض المكونات (Design System حي) للمراجعة والاختبار */
export function UIKitPage() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <PageTransition>
      <TopBar back title={t('pages.uikit')} />
      <div className="flex flex-col gap-6">
        <section>
          <h2 className="mb-3 font-bold text-muted">Colors</h2>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(colors).map(([k, v]) => (
              <div key={k} className="text-center">
                <div className="mb-1 h-12 rounded-xl border border-border" style={{ background: v }} />
                <span className="text-xs text-muted">{k}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="flex flex-wrap gap-2">
          <Button>Primary</Button>
          <Button variant="accent">Accent</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button loading>Loading</Button>
          <Button size="icon" variant="secondary" aria-label="add"><Plus /></Button>
        </section>
        <section className="flex flex-wrap gap-2">
          <Badge>Primary</Badge><Badge tone="accent">Accent</Badge><Badge tone="water">Water</Badge>
          <Badge tone="danger">Danger</Badge><Badge tone="muted">Muted</Badge>
        </section>
        <section className="grid grid-cols-2 gap-3">
          <Card><CardTitle>Solid</CardTitle><CardDescription>بطاقة عادية</CardDescription></Card>
          <Card variant="glass"><CardTitle>Glass</CardTitle><CardDescription>بطاقة زجاجية</CardDescription></Card>
          <Card variant="hero" className="col-span-2"><CardTitle>Hero</CardTitle><CardDescription>بطاقة تمرين اليوم</CardDescription></Card>
        </section>
        <section className="flex justify-around">
          <ProgressRing value={0.3} label="30%" />
          <ProgressRing value={0.65} color="#E0823F" label="65%" />
          <ProgressRing value={0.9} color="#7DB4D6" label="90%" />
        </section>
        <section className="flex flex-col gap-2">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-24 w-full" />
        </section>
        <Button variant="secondary" onClick={() => setOpen(true)}>Open Bottom Sheet</Button>
        <Modal open={open} onClose={() => setOpen(false)} title="Bottom Sheet">
          <p className="mb-4 text-muted">هذا مثال على النافذة المنبثقة.</p>
          <Button fullWidth onClick={() => setOpen(false)}><Heart size={18} /> {t('common.confirm')}</Button>
        </Modal>
      </div>
    </PageTransition>
  );
}
