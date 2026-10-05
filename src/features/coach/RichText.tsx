import { Fragment } from 'react';

/** ماركداون مبسط: **عريض**، أسطر، قوائم مرقمة ونقاط */
export function RichText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="flex flex-col gap-1 leading-relaxed">
      {lines.map((line, i) => {
        if (!line.trim()) return <span key={i} className="h-1" />;
        const bullet = /^\s*([-•*]|\d+[.)])\s+/.exec(line);
        const body = bullet ? line.slice(bullet[0].length) : line;
        const parts = body.split(/(\*\*[^*]+\*\*)/g).map((p, k) =>
          p.startsWith('**') && p.endsWith('**') ? <b key={k} className="font-extrabold">{p.slice(2, -2)}</b> : <Fragment key={k}>{p}</Fragment>
        );
        return bullet ? (
          <div key={i} className="flex gap-2"><span className="shrink-0 font-bold text-primary">{/\d/.test(bullet[1]) ? bullet[1] : '•'}</span><span>{parts}</span></div>
        ) : <p key={i}>{parts}</p>;
      })}
    </div>
  );
}
