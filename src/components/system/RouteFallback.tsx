/** شاشة تحميل قصيرة بين الصفحات المقسمة (code-split) */
export function RouteFallback() {
  return (
    <div className="grid min-h-[60dvh] place-items-center" aria-busy="true" aria-label="loading">
      <span className="h-10 w-10 animate-spin rounded-full border-2 border-gold/20 border-t-gold" />
    </div>
  );
}
