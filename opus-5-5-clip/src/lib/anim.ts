// Animation primitives from the spec (§0 and Annex B).
// Everything is a pure function of time t in seconds.

export type Ease = (p: number) => number;

/** CSS-style cubic-bezier(x1, y1, x2, y2) easing. */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): Ease {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (s: number) => ((ax * s + bx) * s + cx) * s;
  const sy = (s: number) => ((ay * s + by) * s + cy) * s;
  const dsx = (s: number) => (3 * ax * s + 2 * bx) * s + cx;
  return (p: number) => {
    if (p <= 0) return 0;
    if (p >= 1) return 1;
    let s = p;
    for (let i = 0; i < 8; i++) {
      const e = sx(s) - p;
      if (Math.abs(e) < 1e-7) return sy(s);
      const d = dsx(s);
      if (Math.abs(d) < 1e-6) break;
      s -= e / d;
    }
    let lo = 0, hi = 1;
    s = p;
    for (let i = 0; i < 40; i++) {
      const v = sx(s);
      if (Math.abs(v - p) < 1e-7) break;
      if (v < p) lo = s; else hi = s;
      s = (lo + hi) / 2;
    }
    return sy(s);
  };
}

export const easeOut = cubicBezier(0.2, 0.7, 0.3, 1);
export const easeInOut = cubicBezier(0.33, 0, 0.67, 1);
export const easeIn = cubicBezier(0.6, 0, 0.9, 0.35);

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/** 0 before a, linear to 1 at b, 1 after. Optional easing. */
export function ramp(t: number, a: number, b: number, ease?: Ease): number {
  const p = b === a ? (t >= b ? 1 : 0) : clamp((t - a) / (b - a));
  return ease ? ease(p) : p;
}

/** 0→1 between a and b, 1 between b and c, 1→0 between c and d. */
export function fade(t: number, a: number, b: number, c: number, d: number, ease?: Ease): number {
  if (t < b) return ramp(t, a, b, ease);
  if (t <= c) return 1;
  return 1 - ramp(t, c, d, ease);
}

/** T tables: monotone cubic spline (Fritsch–Carlson), Annex B. */
export type Track = (t: number) => number;
export function makeTrack(samples: ReadonlyArray<readonly [number, number]>): Track {
  const n = samples.length, xs = samples.map((s) => s[0]), ys = samples.map((s) => s[1]);
  if (n === 1) return () => ys[0];
  const d: number[] = [];
  for (let i = 0; i < n - 1; i++) d[i] = (ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]);
  const m = new Array<number>(n);
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
    if (s > 9) { const k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; }
  }
  return (t: number) => {
    if (t <= xs[0]) return ys[0];
    if (t >= xs[n - 1]) return ys[n - 1];
    let lo = 0, hi = n - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (xs[mid] <= t) lo = mid; else hi = mid; }
    const h = xs[hi] - xs[lo], s = (t - xs[lo]) / h, s2 = s * s, s3 = s2 * s;
    return (2 * s3 - 3 * s2 + 1) * ys[lo] + (s3 - 2 * s2 + s) * h * m[lo]
      + (-2 * s3 + 3 * s2) * ys[hi] + (s3 - s2) * h * m[hi];
  };
}

/** Build several T tracks from rows [t, v1, v2, ...]. */
export function makeTracks(rows: ReadonlyArray<ReadonlyArray<number>>): Track[] {
  const cols = rows[0].length - 1;
  const out: Track[] = [];
  for (let c = 0; c < cols; c++) out.push(makeTrack(rows.map((r) => [r[0], r[c + 1]] as const)));
  return out;
}

/** K tables: linear between keys; a key's easing applies to the segment arriving at it. */
export type Key = readonly [number, number] | readonly [number, number, Ease];
export function keys(t: number, kf: ReadonlyArray<Key>): number {
  if (t <= kf[0][0]) return kf[0][1];
  for (let i = 1; i < kf.length; i++) {
    const [t1, v1, e] = kf[i] as [number, number, Ease | undefined];
    const [t0, v0] = kf[i - 1];
    if (t <= t1) {
      const p = t1 === t0 ? 1 : (t - t0) / (t1 - t0);
      return v0 + (v1 - v0) * (e ? e(p) : p);
    }
  }
  return kf[kf.length - 1][1];
}
export const keyTrack = (kf: ReadonlyArray<Key>): Track => (t) => keys(t, kf);

/** Numerical velocity (units per second) of a time function. */
export function vel(f: Track, t: number, h = 1 / 480): number {
  return (f(t + h) - f(t - h)) / (2 * h);
}

/** Directional blur sigma from spec §1.5: σ = min(max, |v|·0.0013). */
export const dirSigma = (v: number, max: number) => Math.min(max, Math.abs(v) * 0.0013);

// ---- Colors ----
export type RGB = [number, number, number];
export function hex(h: string): RGB {
  const s = h.replace("#", "");
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}
export function mixRGB(a: RGB | string, b: RGB | string, p: number): RGB {
  const A = typeof a === "string" ? hex(a) : a;
  const B = typeof b === "string" ? hex(b) : b;
  return [lerp(A[0], B[0], p), lerp(A[1], B[1], p), lerp(A[2], B[2], p)];
}
export function css(c: RGB | string, alpha = 1): string {
  const [r, g, b] = typeof c === "string" ? hex(c) : c;
  return `rgba(${r.toFixed(2)}, ${g.toFixed(2)}, ${b.toFixed(2)}, ${alpha})`;
}
export const mix = (a: RGB | string, b: RGB | string, p: number) => css(mixRGB(a, b, p));

/** Roboto with line-height 1: baseline sits 0.8415 × size below the box top. */
export const ROBOTO_BASELINE = 0.8415;
export const robotoTop = (baseline: number, size: number) => baseline - ROBOTO_BASELINE * size;
