# GymMate Design System: Chronograph

Inspired by a luxury watch dial: every second counts.

## Colors
| Token | Hex | Role |
|---|---|---|
| obsidian (bg) | #0E0D0B | App background (warm black) |
| graphite (surface) | #1A1815 | Cards, sheets |
| gold | #D4AF6A | Lead accent, primary actions, rings |
| ink | #17130B | Text on gold surfaces |
| ember | #E0823F | Streak, urgency, protein |
| steel | #7DB4D6 | Water |
| chalk | #F2EEE6 | Primary text |

Light theme background: #F4F0E8.

## Type
- Headings: Noto Kufi Arabic (700/800)
- Body: IBM Plex Sans Arabic (400/500/600)
- Numerals: Khand 600 (timers, weights, stats)
- Minimum size 13px (`text-xs`).

## Surfaces
- `.surface-lux`: graphite gradient + gold hairline border + inner highlight
- `.glass`: blurred translucent layer (nav, sheets)
- `.btn-gold`: metallic champagne gradient with moving sheen
- `.eyebrow`: tracked uppercase label in gold
- `.hairline`: 1px gold divider
- Grain: `public/grain.svg` overlaid at low opacity on the body

## Signatures
1. **Tick rings**: every ProgressRing carries chronograph ticks, a gradient arc and a glowing end dot.
2. **Sweeping hand**: RestTimer is a 60-tick dial with a second hand that sweeps in real time.
3. **Gold coin FAB**: center nav button for starting a workout.

## Motion
- Arrival: cards fade up 8px, 60ms stagger.
- Completion: gold dust confetti.
- Ambient: slow sheen on primary buttons, glow pulse on the rest dial's last 10 seconds.
- Respect `prefers-reduced-motion`.
