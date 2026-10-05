/**
 * فحص الأداء بالكاميرا: منطق نقي (بدون كاميرا) يستقبل نقاط الجسم من MediaPipe Pose
 * ويعد التكرارات ويعطي ملاحظات. كل شي يصير على الجهاز، ولا يطلع أي فيديو منه.
 */
export interface Point { x: number; y: number; z?: number; visibility?: number }
export type Pose = Point[]; // 33 نقطة (BlazePose)

export const L = { nose: 0, lShoulder: 11, rShoulder: 12, lElbow: 13, rElbow: 14, lWrist: 15, rWrist: 16, lHip: 23, rHip: 24, lKnee: 25, rKnee: 26, lAnkle: 27, rAnkle: 28 } as const;

export type Movement = 'squat' | 'pushup' | 'hinge';
export type Cue = 'depth' | 'chestUp' | 'kneesOut' | 'hipsSag' | 'hipsPike' | 'lockout' | 'slow' | 'pushupDepth' | 'kneesSoft' | 'goodRep' | 'visible';

/** أي تمرين من المكتبة يدعم الفحص */
export const FORM_SUPPORTED: Record<string, Movement> = {
  'back-squat': 'squat', 'goblet-squat': 'squat', 'bodyweight-squat': 'squat', 'front-squat': 'squat', 'smith-squat': 'squat', 'sumo-squat': 'squat', 'jump-squat': 'squat',
  'push-up': 'pushup', 'incline-push-up': 'pushup', 'decline-push-up': 'pushup', 'diamond-push-up': 'pushup',
  deadlift: 'hinge', 'romanian-deadlift': 'hinge', 'dumbbell-rdl': 'hinge', 'sumo-deadlift': 'hinge'
};

export function angle(a: Point, b: Point, c: Point): number {
  const ab = Math.atan2(a.y - b.y, a.x - b.x);
  const cb = Math.atan2(c.y - b.y, c.x - b.x);
  let deg = Math.abs(((ab - cb) * 180) / Math.PI);
  if (deg > 180) deg = 360 - deg;
  return deg;
}

/** ميلان الخط a→b عن العمودي (0 = واقف تماماً) */
export function fromVertical(a: Point, b: Point): number {
  return Math.abs((Math.atan2(Math.abs(b.x - a.x), Math.abs(b.y - a.y)) * 180) / Math.PI);
}

const vis = (p?: Point) => p?.visibility ?? 1;

/** نختار الجهة الأوضح للكاميرا (التصوير من الجنب أفضل) */
export function side(pose: Pose): 'l' | 'r' {
  const lv = vis(pose[L.lShoulder]) + vis(pose[L.lHip]) + vis(pose[L.lKnee]) + vis(pose[L.lAnkle]) + vis(pose[L.lElbow]);
  const rv = vis(pose[L.rShoulder]) + vis(pose[L.rHip]) + vis(pose[L.rKnee]) + vis(pose[L.rAnkle]) + vis(pose[L.rElbow]);
  return lv >= rv ? 'l' : 'r';
}

function pts(pose: Pose, s: 'l' | 'r') {
  const k = (n: 'Shoulder' | 'Elbow' | 'Wrist' | 'Hip' | 'Knee' | 'Ankle') => pose[L[`${s}${n}` as keyof typeof L]];
  return { shoulder: k('Shoulder'), elbow: k('Elbow'), wrist: k('Wrist'), hip: k('Hip'), knee: k('Knee'), ankle: k('Ankle') };
}

interface Cfg {
  /** الزاوية اللي نعد عليها */
  primary: (p: ReturnType<typeof pts>) => number;
  down: number; // تحتها = تحت
  up: number; // فوقها = فوق
  needed: (keyof ReturnType<typeof pts>)[];
}

const CFG: Record<Movement, Cfg> = {
  squat: { primary: (p) => angle(p.hip, p.knee, p.ankle), down: 125, up: 160, needed: ['shoulder', 'hip', 'knee', 'ankle'] },
  pushup: { primary: (p) => angle(p.shoulder, p.elbow, p.wrist), down: 115, up: 150, needed: ['shoulder', 'elbow', 'wrist', 'hip', 'ankle'] },
  hinge: { primary: (p) => angle(p.shoulder, p.hip, p.knee), down: 130, up: 160, needed: ['shoulder', 'hip', 'knee', 'ankle'] }
};

export interface RepResult { n: number; score: number; cues: Cue[]; durationMs: number; minAngle: number }
export interface FrameResult { phase: 'up' | 'down' | 'lost'; angle: number | null; rep?: RepResult; live?: Cue }

/** عداد تكرارات بحالة: فوق ← تحت ← فوق = تكرار واحد */
export class FormAnalyzer {
  readonly movement: Movement;
  reps: RepResult[] = [];
  private cfg: Cfg;
  private phase: 'up' | 'down' = 'up';
  private smooth: number | null = null;
  private repStart = 0;
  private minA = 180;
  private topHip = 0;
  private faults = new Set<Cue>();
  private lostFrames = 0;

  private alpha: number;

  constructor(movement: Movement, alpha = 0.45) {
    this.movement = movement;
    this.alpha = alpha;
    this.cfg = CFG[movement];
  }

  frame(pose: Pose | null, t: number): FrameResult {
    if (!pose) return this.lost();
    const p = pts(pose, side(pose));
    if (this.cfg.needed.some((k) => vis(p[k]) < 0.5)) return this.lost();
    this.lostFrames = 0;

    const raw = this.cfg.primary(p);
    this.smooth = this.smooth == null ? raw : this.alpha * raw + (1 - this.alpha) * this.smooth;
    const a = this.smooth;

    if (this.phase === 'up' && a < this.cfg.down) {
      this.phase = 'down';
      this.repStart = this.repStart || t;
    }
    if (this.phase === 'up' && a < this.cfg.up - 5 && !this.repStart) {
      this.repStart = t;
      this.minA = 180;
      this.faults.clear();
    }

    let live: Cue | undefined;
    if (this.repStart) {
      this.minA = Math.min(this.minA, a);
      live = this.checkFrame(p, pose, a);
      if (live) this.faults.add(live);
    }

    // رجع فوق: تكرار كامل
    if (this.phase === 'down' && a > this.cfg.up) {
      this.phase = 'up';
      return { phase: 'up', angle: a, rep: this.finishRep(p, t) };
    }
    // نزل شوي ورجع بدون ما يوصل تحت: نصف تكرار
    if (this.phase === 'up' && this.repStart && a > this.cfg.up && this.minA < this.cfg.up - 15) {
      this.faults.add(this.movement === 'pushup' ? 'pushupDepth' : 'depth');
      this.repStart = 0;
      return { phase: 'up', angle: a, live: this.movement === 'pushup' ? 'pushupDepth' : 'depth' };
    }
    if (this.phase === 'up' && a > this.cfg.up) { this.repStart = 0; this.topHip = angle(p.shoulder, p.hip, p.knee); }
    return { phase: this.phase, angle: a, live };
  }

  private lost(): FrameResult {
    this.lostFrames++;
    return { phase: 'lost', angle: null, live: this.lostFrames > 8 ? 'visible' : undefined };
  }

  /** ملاحظات أثناء الحركة */
  private checkFrame(p: ReturnType<typeof pts>, pose: Pose, a: number): Cue | undefined {
    if (this.movement === 'squat') {
      const atBottom = a < 115;
      if (atBottom && fromVertical(p.hip, p.shoulder) > 55) return 'chestUp';
      // من الأمام: الركب تدخل لداخل
      const lk = pose[L.lKnee], rk = pose[L.rKnee], la = pose[L.lAnkle], ra = pose[L.rAnkle];
      if (atBottom && vis(lk) > 0.6 && vis(rk) > 0.6 && vis(la) > 0.6 && vis(ra) > 0.6) {
        const kneeW = Math.abs(lk.x - rk.x), ankleW = Math.abs(la.x - ra.x);
        if (ankleW > 0.05 && kneeW < ankleW * 0.75) return 'kneesOut';
      }
    }
    if (this.movement === 'pushup') {
      const line = angle(p.shoulder, p.hip, p.ankle);
      if (line < 155) {
        // الورك تحت الخط بين الكتف والكاحل = نازل
        const midY = p.shoulder.y + ((p.hip.x - p.shoulder.x) / ((p.ankle.x - p.shoulder.x) || 1e-6)) * (p.ankle.y - p.shoulder.y);
        return p.hip.y > midY ? 'hipsSag' : 'hipsPike';
      }
    }
    if (this.movement === 'hinge') {
      const knee = angle(p.hip, p.knee, p.ankle);
      if (a < 110 && knee < 110) return 'kneesSoft';
    }
    return undefined;
  }

  private finishRep(p: ReturnType<typeof pts>, t: number): RepResult {
    const durationMs = t - this.repStart;
    const cues = new Set(this.faults);
    if (this.movement === 'squat' && this.minA > 95) cues.add('depth');
    if (this.movement === 'pushup' && this.minA > 95) cues.add('pushupDepth');
    if (this.movement === 'hinge' && angle(p.shoulder, p.hip, p.knee) < 165 && this.topHip < 165) cues.add('lockout');
    if (durationMs < 1200) cues.add('slow');
    const penalty: Partial<Record<Cue, number>> = { depth: 25, pushupDepth: 25, chestUp: 20, kneesOut: 25, hipsSag: 25, hipsPike: 15, lockout: 15, slow: 10, kneesSoft: 15 };
    const score = Math.max(0, 100 - [...cues].reduce((s, c) => s + (penalty[c] ?? 0), 0));
    const rep: RepResult = { n: this.reps.length + 1, score, cues: cues.size ? [...cues] : ['goodRep'], durationMs, minAngle: Math.round(this.minA) };
    this.reps.push(rep);
    this.repStart = 0;
    this.minA = 180;
    this.faults.clear();
    return rep;
  }

  summary() {
    const n = this.reps.length;
    const avg = n ? Math.round(this.reps.reduce((s, r) => s + r.score, 0) / n) : 0;
    const counts = new Map<Cue, number>();
    for (const r of this.reps) for (const c of r.cues) if (c !== 'goodRep') counts.set(c, (counts.get(c) ?? 0) + 1);
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([c]) => c);
    return { reps: n, avg, top };
  }
}
