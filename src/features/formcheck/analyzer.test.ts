import { describe, expect, it } from 'vitest';
import { angle, FormAnalyzer, fromVertical, L, type Pose } from './analyzer';

const P = (x: number, y: number) => ({ x, y, visibility: 0.99 });
const blank = (): Pose => Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, visibility: 0.1 }));

/** سكوات من الجنب: الكاحل ثابت، الركبة تتحرك لقدام، الورك ينزل */
function squatPose(kneeDeg: number, lean = 20): Pose {
  const p = blank();
  const ankle = P(0.5, 0.9);
  const shin = 0.22, thigh = 0.22;
  const kneeAng = (100 * Math.PI) / 180; // الساق مايلة شوي لقدام
  const knee = P(ankle.x + shin * Math.cos(kneeAng) * -1 * -1 * 0.3, ankle.y - shin);
  // نحسب الورك بحيث زاوية الركبة = kneeDeg
  const shinDir = Math.atan2(ankle.y - knee.y, ankle.x - knee.x);
  const thighDir = shinDir + (kneeDeg * Math.PI) / 180;
  const hip = P(knee.x + thigh * Math.cos(thighDir), knee.y + thigh * Math.sin(thighDir));
  const torso = (lean * Math.PI) / 180;
  const shoulder = P(hip.x + 0.3 * Math.sin(torso), hip.y - 0.3 * Math.cos(torso));
  p[L.lAnkle] = ankle; p[L.lKnee] = knee; p[L.lHip] = hip; p[L.lShoulder] = shoulder;
  p[L.lElbow] = P(shoulder.x, shoulder.y + 0.1); p[L.lWrist] = P(shoulder.x, shoulder.y + 0.2);
  return p;
}

function run(a: FormAnalyzer, seq: number[], lean = 20, dt = 120) {
  let t = 0;
  const reps = [];
  for (const k of seq) { const r = a.frame(squatPose(k, lean), (t += dt)); if (r.rep) reps.push(r.rep); }
  return reps;
}
const down = (to: number) => { const s: number[] = []; for (let k = 175; k >= to; k -= 8) s.push(k); for (let k = to; k <= 175; k += 8) s.push(k); s.push(175, 175, 175, 175); return s; };

describe('form analyzer', () => {
  it('computes joint angles', () => {
    expect(Math.round(angle(P(0, 0), P(0, 1), P(1, 1)))).toBe(90);
    expect(Math.round(angle(P(0, 0), P(0, 1), P(0, 2)))).toBe(180);
    expect(Math.round(fromVertical(P(0, 1), P(0, 0)))).toBe(0);
  });

  it('builds the squat fixture with the requested knee angle', () => {
    const p = squatPose(90);
    expect(Math.round(angle(p[L.lHip], p[L.lKnee], p[L.lAnkle]))).toBe(90);
  });

  it('counts full squats as good reps', () => {
    const a = new FormAnalyzer('squat');
    const reps = run(a, [...down(80), ...down(80), ...down(80)]);
    expect(reps).toHaveLength(3);
    expect(reps[0].cues).toEqual(['goodRep']);
    expect(reps[0].score).toBe(100);
  });

  it('flags shallow squats', () => {
    const a = new FormAnalyzer('squat');
    const reps = run(a, [...down(104), ...down(104)]);
    expect(reps.length).toBeGreaterThan(0);
    expect(reps[0].cues).toContain('depth');
  });

  it('flags forward lean', () => {
    const a = new FormAnalyzer('squat');
    const reps = run(a, down(80), 65);
    expect(reps[0].cues).toContain('chestUp');
  });

  it('flags rushed reps', () => {
    const a = new FormAnalyzer('squat');
    const reps = run(a, down(80), 20, 30);
    expect(reps[0].cues).toContain('slow');
  });

  it('asks the user to step into frame', () => {
    const a = new FormAnalyzer('squat');
    let last;
    for (let i = 0; i < 12; i++) last = a.frame(blank(), i * 100);
    expect(last!.phase).toBe('lost');
    expect(last!.live).toBe('visible');
  });

  it('summarizes the set', () => {
    const a = new FormAnalyzer('squat');
    run(a, [...down(80), ...down(104)]);
    const s = a.summary();
    expect(s.reps).toBe(2);
    expect(s.top).toContain('depth');
  });
});
