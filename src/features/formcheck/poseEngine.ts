import type { Pose } from './analyzer';

/**
 * غلاف MediaPipe Pose Landmarker. يتحمّل بس لما يفتح المستخدم الفحص (ما يثقل التطبيق).
 * الموديل والـ wasm محليين من /mediapipe و /models (شوف scripts/setup-mediapipe.mjs)،
 * يعني ولا إطار فيديو يطلع من الجهاز.
 */
export interface PoseEngine { detect(video: HTMLVideoElement, t: number): Pose | null; close(): void }

export async function createPoseEngine(): Promise<PoseEngine> {
  const { FilesetResolver, PoseLandmarker } = await import('@mediapipe/tasks-vision');
  const fileset = await FilesetResolver.forVisionTasks('/mediapipe/wasm');
  const make = (delegate: 'GPU' | 'CPU') =>
    PoseLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: '/models/pose_landmarker_lite.task', delegate },
      runningMode: 'VIDEO',
      numPoses: 1,
      minPoseDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
  const lm = await make('GPU').catch(() => make('CPU'));
  let last = -1;
  return {
    detect(video, t) {
      if (video.readyState < 2 || t <= last) return null;
      last = t;
      const r = lm.detectForVideo(video, t);
      return (r.landmarks?.[0] as Pose | undefined) ?? null;
    },
    close: () => lm.close()
  };
}

/** خطوط الهيكل اللي نرسمها */
export const BONES: [number, number][] = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [24, 26], [26, 28], [27, 31], [28, 32]
];

export function drawPose(ctx: CanvasRenderingContext2D, pose: Pose | null, w: number, h: number, tone = '#D4AF6A') {
  ctx.clearRect(0, 0, w, h);
  if (!pose) return;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.strokeStyle = tone;
  ctx.shadowColor = tone;
  ctx.shadowBlur = 12;
  for (const [a, b] of BONES) {
    const p = pose[a], q = pose[b];
    if (!p || !q || (p.visibility ?? 1) < 0.5 || (q.visibility ?? 1) < 0.5) continue;
    ctx.beginPath(); ctx.moveTo(p.x * w, p.y * h); ctx.lineTo(q.x * w, q.y * h); ctx.stroke();
  }
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#FFF6E0';
  for (const i of [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28]) {
    const p = pose[i];
    if (!p || (p.visibility ?? 1) < 0.5) continue;
    ctx.beginPath(); ctx.arc(p.x * w, p.y * h, 5, 0, Math.PI * 2); ctx.fill();
  }
}

/** إرشاد صوتي بالعربي (لو الجهاز يدعمه) */
let lastSpoke = 0;
export function speak(text: string, lang: 'ar' | 'en', minGapMs = 2500) {
  if (!('speechSynthesis' in window)) return;
  const now = Date.now();
  if (now - lastSpoke < minGapMs) return;
  lastSpoke = now;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
  u.rate = 1.05;
  const v = speechSynthesis.getVoices().find((x) => x.lang.startsWith(lang));
  if (v) u.voice = v;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}
