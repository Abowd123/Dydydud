/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };

export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: 'hidden',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // مكتبات كبيرة في ملفات مستقلة تنكاش لحالها
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
          charts: ['recharts'],
          data: ['dexie', 'dexie-react-hooks', 'zod'],
          supabase: ['@supabase/supabase-js'],
          i18n: ['i18next', 'react-i18next']
        }
      }
    }
  },
  test: { environment: 'node', include: ['src/**/*.test.ts', 'supabase/functions/_shared/**/*.test.ts'] },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icons/favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'GymMate: مساعدك في الجيم',
        short_name: 'GymMate',
        description: 'جدول تمارين وتغذية شخصي للمبتدئين في الجيم',
        lang: 'ar',
        dir: 'rtl',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0E0D0B',
        theme_color: '#0E0D0B',
        categories: ['health', 'fitness', 'lifestyle'],
        id: '/',
        prefer_related_applications: false,
        shortcuts: [
          { name: 'ابدأ تمرين اليوم', short_name: 'تمرين', url: '/workout', icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }] },
          { name: 'التغذية', short_name: 'أكلي', url: '/nutrition', icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }] },
          { name: 'المدرب الذكي', short_name: 'كوتش', url: '/coach', icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }] }
        ],
        screenshots: [
          { src: 'screenshots/home.png', sizes: '1080x1920', type: 'image/png', form_factor: 'narrow', label: 'الرئيسية' },
          { src: 'screenshots/rest.png', sizes: '1080x1920', type: 'image/png', form_factor: 'narrow', label: 'مؤقت الراحة' }
        ],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      // Service Worker مخصص (src/sw.ts) عشان الإشعارات
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectManifest: { globPatterns: ['**/*.{js,css,html,svg,png,woff2,json}'], globIgnores: ['**/media/**', 'landing/**', '**/*.map', 'mediapipe/**', 'models/**'] },
      devOptions: { enabled: true, type: 'module' }
    })
  ]
});
