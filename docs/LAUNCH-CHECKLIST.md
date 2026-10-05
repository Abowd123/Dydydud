# Launch checklist v2.1.0

## Quality gates
- [ ] Unit tests green (`npm test`), 143 tests
- [ ] E2E green on Pixel 7 + iPhone 14 (`npm run e2e`): onboarding, live workout, nutrition, data export/wipe, offline, a11y
- [ ] Lighthouse (mobile): Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 90, SEO ≥ 95
- [ ] Bundle: entry JS ≤ 180KB gzip (`npm run bundle`)
- [ ] CLS < 0.1, LCP < 2.5s on simulated 4G

## Accessibility
- [ ] Text ≥ 13px, interface ≥ 14px, touch targets ≥ 44px
- [ ] Gold on obsidian contrast ≥ 4.5:1 for text (gold #D4AF6A on #0E0D0B ≈ 9.6:1)
- [ ] Every icon-only button has `aria-label`
- [ ] `prefers-reduced-motion` disables sheen, sweeps and confetti
- [ ] RTL and LTR both checked; numerals render LTR

## Legal & privacy
- [ ] /privacy and /terms reviewed by a lawyer
- [ ] Medical disclaimer visible in onboarding and terms
- [ ] In-app export, import, wipe (/data) + cloud delete (/account)
- [ ] Coach requests contain no name/email

## Store
- [ ] assetlinks.json has the real Play signing SHA-256
- [ ] Screenshots: public/screenshots (1080×1920), OG image 1200×630
- [ ] Store listing copy from docs/STORE-LISTING.md
- [ ] Support email live: support@gymmate.app

## Ops
- [ ] `public/models/pose_landmarker_lite.task` exists after install (form check)
- [ ] food-vision deployed + VISION_* secrets set
- [ ] Cloudflare Pages: NODE_VERSION=20 + VITE_* env vars set, custom domain + Always HTTPS
- [ ] Supabase keep-alive workflow secrets set
- [ ] Supabase RLS enabled on all tables, backups on
- [ ] Coach daily limit + safety filter on
- [ ] pg_cron reminders job running
- [ ] Error logging (console → Sentry later)
