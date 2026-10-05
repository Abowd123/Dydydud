# Changelog

## 2.1.0 Free power features
- 📸 Snap your meal: Gulf food photo recognition (53 dishes, portions, offline search, `food-vision` Edge Function, Gemini free tier supported, daily limit, never stores photos), synced `foodLogs`
- 🔁 Missed a day? No worries: sequence-based smart rescheduling (Saturday week, max 2 days in a row, gentle drops, comeback deload after 10+ days), banner + undo, schedule toggle
- 📹 Camera form check: on-device MediaPipe pose, rep counter, squat/push-up/hinge cues, per-rep score, Arabic voice cues, set summary
- Migration 0004, CSP `wasm-unsafe-eval`, SW cache for pose model, privacy policy updated
- Tests: 143

## 2.0.1 Cloudflare Pages
- `public/_headers` (CSP, HSTS, caching, noindex on previews) and `public/_redirects`
- `wrangler.toml` + `npm run deploy:cf` / `preview:cf`
- GitHub Action: deploy to Cloudflare Pages after tests
- GitHub Action: Supabase keep-alive every 3 days + reminders backup
- CSP allows Cloudflare Web Analytics
- PUBLISHING.md rewritten for Cloudflare first, Vercel kept as alternative

## 2.0.0 Launch (Phase 7)
- Route-level code splitting + vendor chunks, hidden sourcemaps, bundle budget script
- Error boundary with safe reload, route loading fallback
- Public /privacy and /terms (ar/en), links from Welcome and More
- "My data" page: export JSON backup (incl. photos), import, wipe device
- SEO: meta, Open Graph, JSON-LD, canonical/hreflang, robots.txt, sitemap.xml, OG image
- Static landing page /landing (ar + en) with live chronograph dial
- Manifest: id, shortcuts, screenshots
- Vercel: security headers, CSP, caching rules, SPA rewrites
- Google Play TWA: twa-manifest.json + assetlinks.json
- Playwright E2E (6 specs incl. offline + axe a11y), Lighthouse CI budgets, GitHub Actions CI
- UI Kit hidden in production; app version shown in More
- `?lang=en` deep link

## 1.3.0 Visual luxury upgrade (Chronograph)
## 1.2.0 Phase 6: AI coach
## 1.1.0 Phase 5: sync and progress
## 1.0.0 Phases 0 to 4
