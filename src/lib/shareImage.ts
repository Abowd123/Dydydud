/** يرسم بطاقة إنجاز (1080×1350) ويشاركها كصورة، أو ينزلها لو المشاركة مو مدعومة */
export async function shareAchievement(opts: { title: string; subtitle?: string; stats: { label: string; value: string }[]; emoji: string; rtl: boolean }) {
  const W = 1080, H = 1350;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d')!;
  await document.fonts?.ready;
  const bg = g.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0E0D0B'); bg.addColorStop(1, '#171512');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  const glow = g.createRadialGradient(W, 0, 50, W, 0, 900);
  glow.addColorStop(0, 'rgba(34,197,94,0.35)'); glow.addColorStop(1, 'rgba(34,197,94,0)');
  g.fillStyle = glow; g.fillRect(0, 0, W, H);
  const glow2 = g.createRadialGradient(0, H, 50, 0, H, 800);
  glow2.addColorStop(0, 'rgba(249,115,22,0.3)'); glow2.addColorStop(1, 'rgba(249,115,22,0)');
  g.fillStyle = glow2; g.fillRect(0, 0, W, H);

  g.textAlign = 'center';
  g.direction = opts.rtl ? 'rtl' : 'ltr';
  g.font = '220px serif'; g.fillText(opts.emoji, W / 2, 380);
  g.fillStyle = '#F2EEE6'; g.font = '800 84px Cairo, Inter, sans-serif'; g.fillText(opts.title, W / 2, 540);
  if (opts.subtitle) { g.fillStyle = '#A39C8F'; g.font = '500 44px Cairo, Inter, sans-serif'; g.fillText(opts.subtitle, W / 2, 610); }

  const cols = Math.min(opts.stats.length, 2);
  opts.stats.slice(0, 4).forEach((s, i) => {
    const col = i % cols, row = Math.floor(i / cols);
    const x = cols === 1 ? W / 2 : W / 2 + (col === 0 ? -240 : 240) * (opts.rtl ? -1 : 1);
    const y = 760 + row * 220;
    g.fillStyle = 'rgba(255,255,255,0.06)';
    g.beginPath(); g.roundRect(x - 210, y - 110, 420, 180, 36); g.fill();
    g.fillStyle = '#D4AF6A'; g.font = '800 76px Cairo, Inter, sans-serif'; g.fillText(s.value, x, y);
    g.fillStyle = '#A39C8F'; g.font = '500 34px Cairo, Inter, sans-serif'; g.fillText(s.label, x, y + 50);
  });
  const grad = g.createLinearGradient(W / 2 - 200, 0, W / 2 + 200, 0);
  grad.addColorStop(0, '#D4AF6A'); grad.addColorStop(1, '#E0823F');
  g.fillStyle = grad; g.font = '64px "Bebas Neue", Inter, sans-serif'; g.fillText('GYMMATE', W / 2, H - 90);

  const blob = await new Promise<Blob>((r) => c.toBlob((b) => r(b!), 'image/png'));
  const file = new File([blob], 'gymmate.png', { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: opts.title }).catch(() => undefined);
  } else {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'gymmate.png';
    a.click();
  }
}
