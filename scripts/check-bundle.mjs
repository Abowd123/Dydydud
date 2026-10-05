// ميزانية الحجم: يفشل الـ CI لو أول تحميل كبر عن الحد (gzip)
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';

const LIMIT_ENTRY_KB = 180; // JS أول تحميل
const LIMIT_CHUNK_KB = 160; // أي ملف مفرد
const dir = 'dist/assets';
const html = readFileSync('dist/index.html', 'utf8');
const entry = [...html.matchAll(/(?:src|href)="\/assets\/([^"]+\.js)"/g)].map((m) => m[1]);
let entryKb = 0, fail = false;
for (const f of readdirSync(dir).filter((f) => f.endsWith('.js'))) {
  const kb = gzipSync(readFileSync(join(dir, f))).length / 1024;
  if (entry.includes(f)) entryKb += kb;
  if (kb > LIMIT_CHUNK_KB) { console.error(`✗ ${f} ${kb.toFixed(1)}KB > ${LIMIT_CHUNK_KB}KB`); fail = true; }
  else console.log(`  ${f.padEnd(40)} ${kb.toFixed(1)}KB (raw ${(statSync(join(dir, f)).size / 1024).toFixed(0)}KB)`);
}
console.log(`entry total: ${entryKb.toFixed(1)}KB gzip (limit ${LIMIT_ENTRY_KB})`);
if (entryKb > LIMIT_ENTRY_KB) { console.error('✗ entry over budget'); fail = true; }
process.exit(fail ? 1 : 0);
