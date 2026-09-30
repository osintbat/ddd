// Original soundtrack for "Claude · Opus 5.5" — spec §5.
// Pure Node synthesis, deterministic (seeded noise). Output: public/soundtrack.wav (48 kHz, stereo, 16 bit).
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SR = 48000;
const DUR = 14.1333;
const N = Math.ceil(DUR * SR);
const TAU = Math.PI * 2;

// ---------- buses ----------
const dryL = new Float64Array(N), dryR = new Float64Array(N);     // unaffected
const duckL = new Float64Array(N), duckR = new Float64Array(N);   // pad + sub, sidechained
const sendL = new Float64Array(N), sendR = new Float64Array(N);   // reverb send

// ---------- utils ----------
let seed = 0x5eed1234;
function rnd() { // mulberry32
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const noise = () => rnd() * 2 - 1;
const NOTE_IDX = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };
function freq(name) {
  const m = /^([A-G])(#|b)?(-?\d)$/.exec(name);
  let semi = NOTE_IDX[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0) + (Number(m[3]) - 4) * 12;
  return 440 * Math.pow(2, semi / 12);
}
function panGains(p) { const a = ((p + 1) * Math.PI) / 4; return [Math.cos(a), Math.sin(a)]; }
const idx = (t) => Math.round(t * SR);

/** Add a mono signal fn(localTime, i) for `len` seconds starting at t0, panned (optionally varying). */
function add(t0, len, fn, { gain = 1, pan = 0, bus = "dry", send = 0 } = {}) {
  const s0 = idx(t0), n = Math.round(len * SR);
  for (let i = 0; i < n; i++) {
    const s = s0 + i;
    if (s < 0 || s >= N) continue;
    const v = fn(i / SR, i) * gain;
    if (v === 0) continue;
    const p = typeof pan === "function" ? pan(i / n) : pan;
    const [gl, gr] = panGains(p);
    const L = v * gl, R = v * gr;
    if (bus === "duck") { duckL[s] += L; duckR[s] += R; } else { dryL[s] += L; dryR[s] += R; }
    if (send) { sendL[s] += L * send; sendR[s] += R * send; }
  }
}

/** Stereo variant: fn returns [l, r]. */
function addStereo(t0, len, fn, { gain = 1, bus = "dry", send = 0 } = {}) {
  const s0 = idx(t0), n = Math.round(len * SR);
  for (let i = 0; i < n; i++) {
    const s = s0 + i;
    if (s < 0 || s >= N) continue;
    const [l, r] = fn(i / SR, i);
    const L = l * gain, R = r * gain;
    if (bus === "duck") { duckL[s] += L; duckR[s] += R; } else { dryL[s] += L; dryR[s] += R; }
    if (send) { sendL[s] += L * send; sendR[s] += R * send; }
  }
}

// RBJ biquad with settable parameters.
class Biquad {
  constructor(type) { this.type = type; this.x1 = this.x2 = this.y1 = this.y2 = 0; }
  set(f, q) {
    f = Math.min(Math.max(f, 10), SR * 0.45);
    const w = (TAU * f) / SR, c = Math.cos(w), s = Math.sin(w), al = s / (2 * q);
    let b0, b1, b2;
    const a0 = 1 + al, a1 = -2 * c, a2 = 1 - al;
    if (this.type === "lp") { b0 = (1 - c) / 2; b1 = 1 - c; b2 = (1 - c) / 2; }
    else if (this.type === "hp") { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = (1 + c) / 2; }
    else { b0 = al; b1 = 0; b2 = -al; } // band-pass, 0 dB peak
    this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0; this.a1 = a1 / a0; this.a2 = a2 / a0;
    return this;
  }
  run(x) {
    const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y;
    return y;
  }
}

// Band-limited saw (polyBLEP).
function sawOsc(f, phase0 = rnd()) {
  let ph = phase0; const dt = f / SR;
  return () => {
    let v = 2 * ph - 1;
    if (ph < dt) { const t = ph / dt; v -= t + t - t * t - 1; }
    else if (ph > 1 - dt) { const t = (ph - 1) / dt; v -= t * t + t + t + 1; }
    ph += dt; if (ph >= 1) ph -= 1;
    return v;
  };
}

// ---------- grid ----------
const BEAT = 0.4, BAR = 1.6, T0 = 0.11;
const bar = (n) => T0 + n * BAR;

// ---------- kicks (also sidechain triggers) ----------
const kickTimes = [1.71];
for (let b = 2; b <= 6; b++) for (const o of [0, 0.6, 1.0]) kickTimes.push(+(bar(b) + o).toFixed(3));
const allKicks = [...kickTimes, 11.71];

function kick(t0, vol = 1) {
  let ph = 0;
  add(t0, 0.9, (t) => {
    const f = 44 + 120 * Math.exp(-t / 0.032);
    ph += (TAU * f) / SR;
    let v = Math.sin(ph) * Math.exp(-t / 0.3);
    if (t < 0.0035) v += noise() * 0.6 * (1 - t / 0.0035);
    return Math.tanh(1.6 * v) * 0.9;
  }, { gain: vol });
}

// ---------- pad ----------
const CHORDS = [
  [0.11, BAR, "A1", ["A3", "C4", "E4", "G4", "B4"], 0.8, 1],
  [1.71, BAR, "F1", ["F3", "A3", "C4", "E4"], 1, 1],
  [3.31, BAR, "C2", ["E3", "G3", "B3", "D4"], 1, 1],
  [4.91, BAR, "E1", ["G3", "B3", "D4", "F#4"], 1, 1],
  [6.51, BAR, "A1", ["G3", "B3", "C4", "E4"], 1, 1],
  [8.11, BAR, "F1", ["A3", "C4", "E4", "G4"], 1, 1],
  [9.71, BAR, "D2", ["F3", "A3", "C4", "E4"], 1, 1],
  [11.31, BEAT, "E1", ["E3", "A3", "B3", "D4"], 1, 1],
  [11.71, DUR - 11.71, "A1", ["A3", "B3", "C4", "E4", "A4"], 1, 1.2],
];

for (const [start, len, , notes, vol, cutMul] of CHORDS) {
  const t0 = start - 0.05, hold = len + 0.05, rel = 0.35, total = hold + rel;
  const oscs = notes.map((n, k) => ({
    pan: notes.length > 1 ? -0.6 + (1.2 * k) / (notes.length - 1) : 0,
    saws: [-8, 0, 8].map((c) => sawOsc(freq(n) * Math.pow(2, c / 1200))),
  }));
  const fl = new Biquad("lp"), fr = new Biquad("lp");
  addStereo(t0, total, (t, i) => {
    if (i % 16 === 0) {
      const cut = (700 + 1300 * Math.min(1, t / 0.8)) * (1 + 0.2 * Math.sin(TAU * 0.3 * (t0 + t))) * cutMul;
      fl.set(cut, 0.8); fr.set(cut, 0.8);
    }
    const env = Math.min(1, t / 0.45) * (t > hold ? Math.max(0, 1 - (t - hold) / rel) : 1);
    let l = 0, r = 0;
    for (const o of oscs) {
      const v = (o.saws[0]() + o.saws[1]() + o.saws[2]()) / 3;
      const [gl, gr] = panGains(o.pan);
      l += v * gl; r += v * gr;
    }
    return [fl.run(l) * env, fr.run(r) * env];
  }, { gain: 0.085 * vol, bus: "duck", send: 0.5 });
}

// ---------- sub bass ----------
function sub(t0, len, f0, { vol = 0.4, glideFrom = null, glideTime = 0.05, bus = "duck" } = {}) {
  let ph = 0;
  add(t0, len + 0.03, (t) => {
    const f = glideFrom ? f0 * Math.pow(glideFrom, Math.max(0, 1 - t / glideTime)) : f0;
    ph += (TAU * f) / SR;
    const env = Math.min(1, t / 0.006) * (t > len ? Math.max(0, 1 - (t - len) / 0.03) : 1);
    return Math.tanh(1.4 * Math.sin(ph)) * env;
  }, { gain: vol, bus });
}
sub(0.11, 3.26 - 0.11, freq("A1"), { vol: 0.36 });
sub(1.71, 3.26 - 1.71, freq("F1"), { vol: 0.4 });
const BAR_ROOTS = { 2: "C2", 3: "E1", 4: "A1", 5: "F1", 6: "D2" };
for (let b = 2; b <= 6; b++) {
  const root = freq(BAR_ROOTS[b]);
  for (const [o, six] of [[0, 0], [0.6, 6], [1.0, 10]]) {
    sub(bar(b) + o, six === 10 ? 0.48 : 0.44, root, { vol: 0.42, glideFrom: six === 0 ? 1.5 : null, bus: "dry" });
  }
}

// ---------- drums ----------
for (const k of kickTimes) kick(k);

function clap(t0, vol = 0.6) {
  const bl = new Biquad("bp").set(1250, 1.2), br = new Biquad("bp").set(1350, 1.2);
  addStereo(t0, 0.6, (t) => {
    let env = 0;
    for (const o of [0, 0.011, 0.023]) if (t >= o && t < o + 0.011) env = Math.max(env, Math.exp(-(t - o) / 0.004));
    env = Math.max(env, t >= 0.023 ? Math.exp(-(t - 0.023) / 0.11) * 0.8 : 0);
    const n1 = noise(), n2 = noise();
    return [bl.run(n1) * env, br.run(n2) * env];
  }, { gain: vol * 2.2, send: 0.25 });
}
for (let b = 2; b <= 6; b++) clap(bar(b) + 0.8);

function hat(t0, vol, pan) {
  const hp = new Biquad("hp").set(8200, 0.7);
  add(t0, 0.2, (t) => hp.run(noise()) * Math.exp(-t / 0.032), { gain: vol * 0.32, pan });
}
{
  const ACC = [1, 0.35, 0.65, 0.35];
  let k = 0;
  for (let t = 1.71; t < 11.31 - 1e-6; t += 0.1, k++) {
    const vol = (t < 3.31 ? 0.45 : 0.75) * ACC[k % 4];
    hat(t, vol, k % 2 === 0 ? 0.25 : -0.1);
    const inExtra = (t >= 4.91 && t < 6.51) || (t >= 8.11 && t < 9.71);
    if (inExtra && k % 4 === 3) hat(t + 0.05, vol * 0.8, -0.1);
  }
  for (let r = 0; r < 8; r++) hat(10.51 + r * 0.05, 0.25 + (0.35 * r) / 7, r % 2 ? -0.2 : 0.2);
}

// ---------- FM bells ----------
function bell(t0, note, vol, pan, decay = 1.3) {
  const f = freq(note);
  let pc = 0, pm = 0, pp = 0;
  add(t0, decay * 1.6, (t) => {
    pm += (TAU * 3.5 * f) / SR;
    const I = 2.2 * Math.exp(-t / 0.25);
    pc += (TAU * f) / SR;
    pp += (TAU * 2.01 * f) / SR;
    const v = Math.sin(pc + I * Math.sin(pm)) + 0.3 * Math.sin(pp);
    return v * Math.min(1, t / 0.002) * Math.exp(-t / (decay / 4.5));
  }, { gain: vol * 0.16, pan, send: 0.7 });
}
[
  [0.13, "E5", 0.8, 0.3], [0.91, "B5", 0.5, -0.3], [1.71, "C6", 0.55, 0.35], [2.51, "A5", 0.5, -0.25],
  [3.55, "E6", 0.6, 0.2], [4.91, "B5", 0.45, -0.35], [6.61, "G5", 0.5, 0.3], [8.63, "E6", 0.45, 0],
  [9.71, "A5", 0.45, -0.3], [12.91, "C6", 0.5, 0.25, 1.6], [13.31, "B5", 0.42, -0.25, 1.6], [13.71, "A5", 0.4, 0, 2.0],
].forEach(([t, n, v, p, d]) => bell(t, n, v, p, d));

// ---------- SFX recipes ----------
function whoosh(t0, len, f0, f1, vol, p0 = 0, p1 = 0, peak = 0.5) {
  const bp = new Biquad("bp");
  add(t0, len, (t, i) => {
    const x = t / len;
    if (i % 16 === 0) bp.set(f0 * Math.pow(f1 / f0, x), 1.6);
    const env = x < peak ? Math.pow(x / peak, 2) : Math.pow(Math.max(0, 1 - (x - peak) / (1 - peak)), 1.6);
    return bp.run(noise()) * env;
  }, { gain: vol * 0.7, pan: (x) => p0 + (p1 - p0) * x, send: 0.2 });
}
function click(t0, f, vol, pan = 0) {
  let ph = 0;
  add(t0, 0.05, (t) => {
    ph += (TAU * f) / SR;
    return Math.sin(ph) * Math.exp(-t / 0.006) + (t < 0.0015 ? noise() * 0.5 : 0);
  }, { gain: vol * 0.35, pan });
}
function pop(t0, f, vol, pan = 0) {
  let ph = 0;
  add(t0, 0.4, (t) => {
    const ff = f * (1 + 1.2 * Math.max(0, 1 - t / 0.018));
    ph += (TAU * ff) / SR;
    return Math.sin(ph) * Math.exp(-t / 0.07);
  }, { gain: vol * 0.45, pan, send: 0.2 });
}
function sparkle(t0, len, rate, vol) {
  const count = Math.round(len * rate);
  for (let k = 0; k < count; k++) {
    const t = t0 + rnd() * len, f = 2400 + rnd() * 4200, p = (rnd() * 2 - 1) * 0.8, a = 0.4 + 0.6 * rnd();
    let ph = 0;
    add(t, 0.2, (tt) => { ph += (TAU * f) / SR; return Math.sin(ph) * Math.exp(-tt / 0.03); },
      { gain: vol * 0.07 * a, pan: p, send: 0.5 });
  }
}
function impact(t0, vol, tail) {
  let ph = 0;
  const lp = new Biquad("lp");
  add(t0, tail + 0.4, (t, i) => {
    const f = 38 + 60 * Math.exp(-t / 0.02);
    ph += (TAU * f) / SR;
    const boom = Math.sin(ph) * Math.exp(-t / (tail * 0.45));
    if (i % 16 === 0) lp.set(3900 * Math.pow(900 / 3900, Math.min(1, t / tail)), 0.7);
    const crack = lp.run(noise()) * Math.exp(-t / (tail * 0.25));
    return Math.tanh(1.8 * (boom + 0.7 * crack)) * 0.8;
  }, { gain: vol, send: 0.35 });
}
function zap(t0, len, f0, f1, vol, p0, p1) {
  const bp = new Biquad("bp");
  let a = 0, b = 0;
  add(t0, len, (t, i) => {
    const x = t / len, f = f0 * Math.pow(f1 / f0, x);
    a += f / SR; b += (f * 1.012) / SR; a -= Math.floor(a); b -= Math.floor(b);
    if (i % 16 === 0) bp.set(2.5 * f, 2.5);
    const env = Math.min(1, x / 0.08) * Math.pow(1 - x, 1.3);
    return bp.run((2 * a - 1) + (2 * b - 1)) * env;
  }, { gain: vol * 0.55, pan: (x) => p0 + (p1 - p0) * x, send: 0.3 });
}
function whistle(t0, len, f0, f1, vol) {
  let ph = 0;
  add(t0, len, (t) => {
    const x = t / len, f = f0 + (f1 - f0) * x * x;
    ph += (TAU * f) / SR;
    return Math.sin(ph) * Math.min(1, x / 0.1) * Math.min(1, (1 - x) / 0.15);
  }, { gain: vol * 0.22, send: 0.3 });
}
function pluck(t0, note, vol, pan = 0) {
  const osc = sawOsc(freq(note), 0), lp = new Biquad("lp");
  add(t0, 1.2, (t, i) => {
    if (i % 8 === 0) lp.set(300 + 5200 * Math.exp(-t / 0.07), 0.8);
    return lp.run(osc()) * Math.exp(-t / 0.28) * Math.min(1, t / 0.002);
  }, { gain: vol * 0.3, pan, send: 0.45 });
}
function riser(t0, len, vol) {
  const bp = new Biquad("bp");
  let ph = 0;
  add(t0, len, (t, i) => {
    const x = t / len;
    if (i % 16 === 0) bp.set(400 * Math.pow(20, x), 1.5);
    ph += (TAU * 110 * Math.pow(8, x)) / SR;
    return (bp.run(noise()) + 0.3 * Math.sin(ph)) * Math.pow(x, 2.2);
  }, { gain: vol * 0.6, send: 0.3 });
}
function crash(t0, vol) {
  const hl = new Biquad("hp").set(6500, 0.7), hr = new Biquad("hp").set(6500, 0.7);
  addStereo(t0, 3, (t) => { const e = Math.exp(-t / 0.7); return [hl.run(noise()) * e, hr.run(noise()) * e]; },
    { gain: vol * 0.5, send: 0.4 });
}

// ---------- SFX list (§5.6) ----------
whoosh(0.0, 0.42, 5200, 380, 0.9, 0.3, -0.2, 0.25);
whoosh(0.1, 0.3, 1800, 5200, 0.45, 0.7, -0.7, 0.4);
sparkle(0.12, 0.26, 70, 0.9);
[[0.64, 1500], [0.67, 1460], [0.7, 1420], [0.73, 1380], [0.77, 1340]].forEach(([t, f]) => click(t, f, 0.55, -0.2));
[0.83, 0.87, 0.9, 0.93, 0.97, 1.0, 1.03, 1.07].forEach((t, k) => click(t, [2300, 2480, 2660][k % 3], 0.5, 0.2));
click(1.1, 3100, 0.35, 0.3);
whoosh(1.52, 0.2, 900, 2600, 0.25);
pop(1.54, 520, 0.6);
click(1.97, 2600, 0.5); click(2.03, 2900, 0.55);
sparkle(2.04, 0.25, 40, 0.8);
impact(2.1, 0.22, 0.4);
whoosh(2.4, 0.42, 300, 3200, 1.0, -0.3, 0.3, 0.55);
whoosh(2.55, 0.35, 2400, 500, 0.45, 0.2, -0.2, 0.3);
impact(3.215, 0.35, 0.6);
click(3.22, 1700, 0.5);
whoosh(3.33, 0.26, 700, 4200, 0.55, -0.4, 0.6, 0.6);
pluck(3.4, "E5", 0.5, -0.2); pluck(3.45, "G5", 0.5, 0.05); pluck(3.5, "B5", 0.5, 0.3);
whoosh(4.08, 0.38, 3000, 500, 0.8, 0.5, -0.9, 0.7);
zap(4.2, 0.62, 1800, 520, 1.0, 0.9, -0.9);
zap(4.33, 0.55, 1400, 380, 0.7, 0.9, -0.9);
sparkle(4.35, 0.5, 30, 0.7);
whoosh(5.22, 0.2, 800, 3800, 0.6, 0.4, -0.4, 0.85);
impact(5.383, 0.28, 0.5);
whoosh(5.5, 0.26, 600, 3200, 0.55, -0.2, 0.2, 0.75);
whoosh(5.63, 0.4, 900, 5200, 0.55, -0.6, 0.6, 0.35);
pop(5.735, 420, 0.8);
whistle(6.0, 0.4, 1500, 260, 1.0);
impact(6.39, 0.55, 0.7); clap(6.39, 0.6);
sparkle(6.42, 0.45, 55, 0.9);
[["A5", 6.72], ["C6", 6.76], ["E6", 6.8], ["G5", 6.85], ["B5", 6.9]].forEach(([n, t], k) => pluck(t, n, 0.35, -0.5 + k * 0.25));
whoosh(6.9, 0.28, 500, 2600, 0.5);
whoosh(7.78, 0.42, 400, 4400, 0.8, 0, 0, 0.85);
whoosh(8.12, 0.3, 3600, 700, 0.55, 0, 0, 0.3);
click(8.3, 1900, 0.5);
pop(8.62, 700, 0.8);
[["A5", 8.62], ["C6", 8.645], ["E6", 8.67], ["A6", 8.695]].forEach(([n, t], k) => pluck(t, n, 0.4, -0.6 + k * 0.4));
sparkle(8.62, 0.45, 45, 0.9);
whoosh(9.02, 0.45, 600, 2800, 0.45, 0.6, 0.2, 0.7);
whoosh(9.35, 0.8, 1200, 500, 0.35, 0.9, -0.9, 0.5);
riser(11.12, 0.58, 0.9);
impact(11.71, 0.95, 1.4); kick(11.71, 1.0); crash(11.71, 0.55);
sub(11.71, 1.2, freq("A1"), { vol: 0.6, glideFrom: 2, glideTime: 0.12, bus: "dry" });
[["A4", 11.72], ["E5", 11.77], ["C5", 11.925], ["E5", 12.01], ["G5", 12.095], ["A5", 12.205], ["B5", 12.316], ["C6", 12.43], ["E6", 12.545]]
  .forEach(([n, t], k) => pluck(t, n, 0.45, -0.6 + k * 0.15));

// ---------- sidechain on pad + sub ----------
{
  const REC = 0.28, REL = 0.12;
  const gain = new Float64Array(N).fill(1);
  for (const k of allKicks) {
    const s0 = idx(k), n = Math.round((REC + REL) * SR);
    for (let i = 0; i < n && s0 + i < N; i++) {
      const t = i / SR;
      const g = t < REC ? 0.35 + 0.65 * Math.pow(t / REC, 0.7) * 0.9 : 0.35 + 0.65 * (0.9 + 0.1 * Math.min(1, (t - REC) / REL));
      gain[s0 + i] = Math.min(gain[s0 + i], g);
    }
  }
  for (let s = 0; s < N; s++) { dryL[s] += duckL[s] * gain[s]; dryR[s] += duckR[s] * gain[s]; }
}

// ---------- Freeverb (8 combs, fb 0.86, damp 0.3; 4 allpasses) ----------
{
  const scale = SR / 44100, spread = 23;
  const COMBS = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617];
  const APS = [556, 441, 341, 225];
  const makeComb = (len) => ({ buf: new Float64Array(Math.round(len * scale)), i: 0, store: 0 });
  const makeAp = (len) => ({ buf: new Float64Array(Math.round(len * scale)), i: 0 });
  const chans = [0, spread].map((sp) => ({
    combs: COMBS.map((l) => makeComb(l + sp)), aps: APS.map((l) => makeAp(l + sp)),
  }));
  const fb = 0.86, damp = 0.3, wet = 0.32;
  const outs = [dryL, dryR];
  for (let s = 0; s < N; s++) {
    const inp = (sendL[s] + sendR[s]) * 0.015;
    for (let c = 0; c < 2; c++) {
      const ch = chans[c];
      let out = 0;
      for (const cb of ch.combs) {
        const y = cb.buf[cb.i];
        cb.store = y * (1 - damp) + cb.store * damp;
        cb.buf[cb.i] = inp + cb.store * fb;
        cb.i = (cb.i + 1) % cb.buf.length;
        out += y;
      }
      for (const ap of ch.aps) {
        const b = ap.buf[ap.i];
        ap.buf[ap.i] = out + b * 0.5;
        ap.i = (ap.i + 1) % ap.buf.length;
        out = b - out;
      }
      outs[c][s] += out * wet;
    }
  }
}

// ---------- master: normalise to RMS 0.2, soft clip, peak ≤ −1 dBFS, fades ----------
let sum = 0;
for (let s = 0; s < N; s++) sum += dryL[s] * dryL[s] + dryR[s] * dryR[s];
const rms = Math.sqrt(sum / (2 * N));
const g = 0.2 / rms;
let peak = 0;
for (let s = 0; s < N; s++) {
  dryL[s] = Math.tanh(1.1 * dryL[s] * g) / 1.1;
  dryR[s] = Math.tanh(1.1 * dryR[s] * g) / 1.1;
  peak = Math.max(peak, Math.abs(dryL[s]), Math.abs(dryR[s]));
}
const ceil = Math.pow(10, -1 / 20);
const pg = peak > ceil ? ceil / peak : 1;
const fadeIn = Math.round(0.01 * SR), fadeOut = Math.round(0.45 * SR);
const pcm = Buffer.alloc(44 + N * 4);
for (let s = 0; s < N; s++) {
  let e = pg;
  if (s < fadeIn) e *= s / fadeIn;
  if (s > N - fadeOut) e *= (N - s) / fadeOut;
  pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, dryL[s] * e)) * 32767), 44 + s * 4);
  pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, dryR[s] * e)) * 32767), 46 + s * 4);
}
pcm.write("RIFF", 0); pcm.writeUInt32LE(36 + N * 4, 4); pcm.write("WAVE", 8);
pcm.write("fmt ", 12); pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(2, 22);
pcm.writeUInt32LE(SR, 24); pcm.writeUInt32LE(SR * 4, 28); pcm.writeUInt16LE(4, 32); pcm.writeUInt16LE(16, 34);
pcm.write("data", 36); pcm.writeUInt32LE(N * 4, 40);

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "soundtrack.wav");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, pcm);

let fr = 0;
for (let s = 0; s < N; s++) fr += (dryL[s] * pg) ** 2 + (dryR[s] * pg) ** 2;
console.log(`wrote ${out}: ${DUR}s, RMS ${(20 * Math.log10(Math.sqrt(fr / (2 * N)))).toFixed(2)} dBFS, peak ${(20 * Math.log10(peak * pg)).toFixed(2)} dBFS`);
