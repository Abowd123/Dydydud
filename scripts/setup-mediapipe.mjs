// يجهز ملفات فحص الأداء محلياً (يشتغل تلقائياً بعد npm install):
// 1) ينسخ wasm من @mediapipe/tasks-vision إلى public/mediapipe/wasm
// 2) ينزل موديل Pose Landmarker Lite (~5.6MB) إلى public/models مرة وحدة
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';

const WASM_SRC = 'node_modules/@mediapipe/tasks-vision/wasm';
const WASM_DST = 'public/mediapipe/wasm';
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';
const MODEL_DST = 'public/models/pose_landmarker_lite.task';

if (existsSync(WASM_SRC)) {
  mkdirSync(WASM_DST, { recursive: true });
  cpSync(WASM_SRC, WASM_DST, { recursive: true });
  console.log('✓ mediapipe wasm copied');
} else console.warn('! @mediapipe/tasks-vision not installed yet');

if (!existsSync(MODEL_DST)) {
  mkdirSync('public/models', { recursive: true });
  try {
    const r = await fetch(MODEL_URL);
    if (!r.ok) throw new Error(String(r.status));
    writeFileSync(MODEL_DST, Buffer.from(await r.arrayBuffer()));
    console.log('✓ pose model downloaded');
  } catch (e) {
    console.warn(`! could not download pose model (${e}). Download it manually to ${MODEL_DST}`);
  }
}
