import type { Muscle } from '@/types/exercise';

/**
 * أشكال العضلات (النصف الأيسر فقط، viewBox 0 0 200 440، المحور x=100).
 * النصف الأيمن يتولد بانعكاس تلقائي. استبدلها برسم احترافي من Figma لاحقاً بنفس المفاتيح.
 */
type Shape = { d: string };
export type Side = 'front' | 'back';

const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} a${rx},${ry} 0 1,0 ${rx * 2},0 a${rx},${ry} 0 1,0 ${-rx * 2},0`;

export const silhouette: string[] = [
  ellipse(100, 32, 21, 24), // head
  'M90 52 h20 v16 h-20z', // neck
  'M70 72 Q100 60 130 72 L134 196 Q100 210 66 196 Z', // torso
  'M66 72 Q50 74 44 96 L34 196 Q38 204 44 198 L58 120 L68 100 Z', // left arm
  'M134 72 Q150 74 156 96 L166 196 Q162 204 156 198 L142 120 L132 100 Z', // right arm
  'M68 196 Q100 206 132 196 L130 300 L118 420 L104 424 L102 230 L98 230 L96 424 L82 420 L70 300 Z' // legs
];

export const regions: Record<Side, Partial<Record<Muscle, Shape[]>>> = {
  front: {
    traps: [{ d: 'M90 64 L74 74 L90 76 Z' }],
    shoulders: [{ d: ellipse(62, 86, 13, 14) }],
    chest: [{ d: 'M99 78 L76 80 Q68 98 76 114 Q90 120 99 114 Z' }],
    biceps: [{ d: ellipse(55, 124, 8, 19) }],
    forearms: [{ d: 'M50 146 Q42 150 40 176 L38 192 L46 194 L54 160 Z' }],
    abs: [{ d: 'M87 120 h12 v70 h-12 q-3 0 -3 -4 v-62 q0 -4 3 -4z' }],
    obliques: [{ d: 'M82 122 L74 120 Q70 152 76 190 L82 188 Z' }],
    quads: [{ d: 'M97 214 L76 206 Q66 246 74 294 Q86 302 95 294 Q99 254 97 214 Z' }],
    adductors: [{ d: 'M99 222 L94 226 Q94 250 98 266 Z' }],
    calves: [{ d: ellipse(82, 350, 9, 30) }]
  },
  back: {
    traps: [{ d: 'M99 58 L86 66 L72 78 L99 100 Z' }],
    shoulders: [{ d: ellipse(62, 86, 13, 14) }],
    upperBack: [{ d: 'M99 102 L78 86 L80 114 L99 124 Z' }],
    lats: [{ d: 'M80 116 L72 100 Q68 132 84 164 L97 154 L97 128 Z' }],
    lowerBack: [{ d: 'M88 158 h11 v38 h-11 q-3 0 -3 -4 v-30 q0 -4 3 -4z' }],
    triceps: [{ d: ellipse(55, 120, 8, 19) }],
    forearms: [{ d: 'M50 146 Q42 150 40 176 L38 192 L46 194 L54 160 Z' }],
    glutes: [{ d: 'M99 198 L76 196 Q66 216 76 236 Q90 242 99 232 Z' }],
    hamstrings: [{ d: 'M97 240 L76 240 Q70 272 76 298 Q88 304 95 296 Q99 266 97 240 Z' }],
    calves: [{ d: ellipse(82, 348, 11, 32) }]
  }
};

export const musclesOnSide = (side: Side) => Object.keys(regions[side]) as Muscle[];
