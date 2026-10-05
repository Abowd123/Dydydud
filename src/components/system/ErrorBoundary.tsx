import { Component, type ErrorInfo, type ReactNode } from 'react';

/** آخر خط دفاع: بدل شاشة بيضاء، نعرض رسالة وزر إعادة تحميل. بياناتك محفوظة محلياً */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('[GymMate] crash', error, info.componentStack); }
  render() {
    if (!this.state.error) return this.props.children;
    const ar = document.documentElement.lang !== 'en';
    return (
      <main role="alert" className="grid min-h-dvh place-items-center bg-bg px-6 text-center">
        <div className="surface-lux max-w-sm rounded-3xl p-8">
          <p className="eyebrow">GymMate</p>
          <h1 className="h-title mt-2">{ar ? 'صار خلل بسيط' : 'Something went wrong'}</h1>
          <p className="mt-2 text-muted">{ar ? 'بياناتك محفوظة. أعد التحميل وكمل.' : 'Your data is safe. Reload to continue.'}</p>
          <button onClick={() => location.reload()} className="btn-gold mt-6 h-12 w-full rounded-2xl font-semibold text-ink">{ar ? 'إعادة التحميل' : 'Reload'}</button>
        </div>
      </main>
    );
  }
}
