# Claude · Opus 5.5 — motion design clip

A Remotion (React + CSS + SVG) build of the production brief „Claude · Opus 5.5”:
1920 × 1080, 60 fps master (30 fps variant with identical timing), 14.1333 s, with an original soundtrack.

## Commands

```bash
npm install
npm run audio        # synthesise public/soundtrack.wav (48 kHz, stereo, 16 bit, ≈ −14 dBFS RMS)
npm run studio       # preview in Remotion Studio
npm run render       # out/opus-5-5.mp4        (OpusClip,   60 fps, 848 frames)
npm run render:30    # out/opus-5-5-30fps.mp4  (OpusClip30, 30 fps, 424 frames)
node scripts/checkpoints.mjs [t …]   # render the §6 verification frames to out/checkpoints/
```

In a headless environment, point Remotion at a local Chromium with
`REMOTION_BROWSER=/path/to/headless_shell`.

## Structure

| File | Spec section |
|---|---|
| `src/lib/anim.ts` | §0 conventions: T tracks (Fritsch–Carlson, Annex B), K keys, `ramp`, `fade`, easings, colour `mix` |
| `src/lib/components.tsx` | radial lights (semiaxes + stops), single-axis Gaussian blur (SVG filter) |
| `src/lib/icons.tsx` | Annex A icons |
| `src/scenes/S1Prompt.tsx` … `S7Signature.tsx` | §4.1 – §4.7, each exports `Lights` + `Elements` |
| `src/Frame.tsx` | one image at time `t`, layer order from §1.4 |
| `src/MotionBlur.tsx` | §1.5 temporal supersampling (1/72 s centred window, N per interval, clamped at the cuts) |
| `scripts/soundtrack.mjs` | §5 soundtrack: pad, sub/808, drums, FM bells, SFX, sidechain, Freeverb, master |

Animation is defined in seconds: frame `n` is evaluated at `t = n / fps`, so both compositions share the same timing.
The hard cuts are at frames 193, 323 and 702 of the 60 fps master (3.2167 s, 5.3833 s, 11.7 s).
