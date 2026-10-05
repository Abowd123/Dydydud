import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Send, Sparkles, Trash2, WifiOff } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TopBar } from '@/components/layout/TopBar';
import { Badge, Button } from '@/components/ui';
import { cn } from '@/lib/cn';
import { db, type CoachMessage } from '@/lib/db';
import { dateKey } from '@/lib/date';
import { useSettings } from '@/store/settings';
import { ReadinessSheet } from '@/features/workout/components/ReadinessSheet';
import { aiAvailable, ask } from './coachService';
import { localCoach } from './localCoach';
import { useCoachContext } from './useCoachContext';
import { RichText } from './RichText';

const SUGGESTIONS = ['protein', 'today', 'tired', 'squat', 'plateau', 'supps', 'ramadan', 'sore'] as const;

export function CoachPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const setHomeMode = useSettings((s) => s.setHomeMode);
  const ctx = useCoachContext();
  const messages = useLiveQuery(() => db.coachMessages.orderBy('at').toArray(), [], [] as CoachMessage[]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ai, setAi] = useState(false);
  const [checkin, setCheckin] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => { void aiAvailable().then(setAi); }, []);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length, streaming]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    setInput('');
    setBusy(true);
    const user: CoachMessage = { id: crypto.randomUUID(), role: 'user', content: q, at: Date.now() };
    await db.coachMessages.put(user);
    const history = [...messages, user].map((m) => ({ role: m.role, content: m.content }));
    const res = await ask(history, ctx);
    if ('stream' in res) {
      let full = '';
      try {
        setStreaming('');
        for await (const d of res.stream) { full += d; setStreaming(full); }
      } catch {
        full = '';
      }
      setStreaming(null);
      if (full) await db.coachMessages.put({ id: crypto.randomUUID(), role: 'assistant', content: full, at: Date.now(), source: 'ai' });
      else {
        const r = localCoach(q, ctx);
        await db.coachMessages.put({ id: crypto.randomUUID(), role: 'assistant', content: r.text, at: Date.now(), source: r.source, actions: r.actions });
      }
    } else {
      await new Promise((r) => setTimeout(r, 350));
      await db.coachMessages.put({ id: crypto.randomUUID(), role: 'assistant', content: res.reply.text, at: Date.now(), source: res.source, actions: res.reply.actions });
    }
    setBusy(false);
  };

  const runAction = (a: NonNullable<CoachMessage['actions']>[number]) => {
    if (a.action === 'checkin') return setCheckin(true);
    if (a.action === 'homeMode') setHomeMode(dateKey());
    if (a.to) nav(a.to);
  };

  return (
    <div className="mx-auto flex h-dvh w-full max-w-md flex-col px-4 md:max-w-2xl">
      <TopBar back title={t('pages.coach')}
        right={
          <div className="flex items-center gap-2">
            <Badge tone={ai ? 'primary' : 'muted'}>{ai ? <><Sparkles size={12} /> AI</> : <><WifiOff size={12} /> {t('coach.offline')}</>}</Badge>
            {messages.length > 0 && <button onClick={() => db.coachMessages.clear()} className="grid h-10 w-10 place-items-center rounded-xl bg-elevated" aria-label={t('coach.clear')}><Trash2 size={18} /></button>}
          </div>
        } />

      <div className="no-scrollbar flex-1 overflow-y-auto pb-4">
        {messages.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="grid h-20 w-20 place-items-center rounded-[1.8rem] bg-grad-energy shadow-glow"><Bot size={40} className="text-ink" /></div>
            <h2 className="text-xl font-extrabold">{t('coach.hello')}</h2>
            <p className="max-w-xs text-sm text-muted">{t('coach.intro')}</p>
          </motion.div>
        )}
        <div className="flex flex-col gap-3">
          {messages.map((m) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn('flex flex-col gap-2', m.role === 'user' ? 'items-end' : 'items-start')}>
              <div className={cn('max-w-[85%] rounded-3xl px-4 py-3 text-sm', m.role === 'user' ? 'rounded-ee-md bg-grad-primary text-ink' : m.source === 'safety' ? 'rounded-es-md border border-danger/40 bg-danger/10' : 'rounded-es-md border border-border bg-surface')}>
                {m.role === 'user' ? m.content : <RichText text={m.content} />}
              </div>
              {m.actions?.length ? (
                <div className="flex flex-wrap gap-2">
                  {m.actions.map((a, i) => <Button key={i} size="sm" variant="secondary" onClick={() => runAction(a)}>{a.label}</Button>)}
                </div>
              ) : null}
            </motion.div>
          ))}
          <AnimatePresence>
            {(busy || streaming !== null) && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-[85%] rounded-3xl rounded-es-md border border-border bg-surface px-4 py-3 text-sm">
                {streaming ? <RichText text={streaming} /> : (
                  <span className="flex gap-1">{[0, 1, 2].map((i) => <motion.i key={i} className="h-2 w-2 rounded-full bg-muted" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }} />)}</span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottom} />
        </div>
      </div>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => send(t(`coach.q.${s}`))} disabled={busy}
            className="h-9 shrink-0 rounded-full border border-border bg-surface px-3 text-xs font-bold text-muted hover:text-text disabled:opacity-50">{t(`coach.q.${s}`)}</button>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); void send(input); }} className="flex items-center gap-2 pb-[calc(1rem+var(--safe-bottom))]">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t('coach.placeholder')} maxLength={1000}
          className="h-12 flex-1 rounded-2xl border border-border bg-surface px-4 outline-none focus:border-primary" />
        <Button type="submit" size="icon" disabled={!input.trim() || busy} aria-label={t('coach.send')}><Send size={20} className="rtl:-scale-x-100" /></Button>
      </form>
      <p className="pb-2 text-center text-xs text-muted">{t('coach.disclaimer')}</p>
      <ReadinessSheet open={checkin} onClose={() => setCheckin(false)} onDone={(r) => { setCheckin(false); void send(t('coach.myReadiness', { s: r.score })); }} />
    </div>
  );
}
