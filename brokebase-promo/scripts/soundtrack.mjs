// Soundtrack for the brokebase.com promo: 120 BPM, A minor, synced SFX.
// Pure Node synthesis, deterministic. Output: public/soundtrack.wav (48 kHz, stereo, 16 bit).
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SR = 48000, DUR = 17.5, N = Math.ceil(DUR * SR), TAU = Math.PI * 2;
const L = new Float64Array(N), R = new Float64Array(N);
const dL = new Float64Array(N), dR = new Float64Array(N);   // ducked bus (pad, bass)
const sL = new Float64Array(N), sR = new Float64Array(N);   // reverb send

let seed = 0xb20ce;
const rnd = () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const noise = () => rnd() * 2 - 1;
const NI = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };
const freq = (n) => { const m = /^([A-G])(#)?(\d)$/.exec(n); return 440 * 2 ** ((NI[m[1]] + (m[2] ? 1 : 0) + (m[3] - 4) * 12) / 12); };
const pg = (p) => { const a = ((p + 1) * Math.PI) / 4; return [Math.cos(a), Math.sin(a)]; };

function add(t0, len, fn, { gain = 1, pan = 0, duck = false, send = 0 } = {}) {
  const s0 = Math.round(t0 * SR), n = Math.round(len * SR);
  for (let i = 0; i < n; i++) {
    const s = s0 + i; if (s < 0 || s >= N) continue;
    const v = fn(i / SR, i) * gain; if (!v) continue;
    const [gl, gr] = pg(typeof pan === "function" ? pan(i / n) : pan);
    const a = duck ? dL : L, b = duck ? dR : R;
    a[s] += v * gl; b[s] += v * gr;
    if (send) { sL[s] += v * gl * send; sR[s] += v * gr * send; }
  }
}

class Biquad {
  constructor(type) { this.type = type; this.x1 = this.x2 = this.y1 = this.y2 = 0; }
  set(f, q) {
    f = Math.min(Math.max(f, 10), SR * 0.45);
    const w = (TAU * f) / SR, c = Math.cos(w), s = Math.sin(w), al = s / (2 * q), a0 = 1 + al;
    let b0, b1, b2;
    if (this.type === "lp") { b0 = (1 - c) / 2; b1 = 1 - c; b2 = b0; }
    else if (this.type === "hp") { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = b0; }
    else { b0 = al; b1 = 0; b2 = -al; }
    Object.assign(this, { b0: b0 / a0, b1: b1 / a0, b2: b2 / a0, a1: (-2 * c) / a0, a2: (1 - al) / a0 });
    return this;
  }
  run(x) {
    const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y; return y;
  }
}
function saw(f, ph = rnd()) {
  const dt = f / SR;
  return () => {
    let v = 2 * ph - 1;
    if (ph < dt) { const t = ph / dt; v -= t + t - t * t - 1; } else if (ph > 1 - dt) { const t = (ph - 1) / dt; v -= t * t + t + t + 1; }
    ph += dt; if (ph >= 1) ph -= 1; return v;
  };
}

// ---------- grid: 120 BPM, bar = 2 s, drop at 2.2 s ----------
const B = 0.5, DROP = 2.2, BREAK = 14.45, FINAL = 15.9;

// ---------- instruments ----------
function kick(t0, vol = 1) {
  let ph = 0;
  add(t0, 0.6, (t) => { ph += (TAU * (46 + 130 * Math.exp(-t / 0.03))) / SR; return Math.tanh(1.7 * Math.sin(ph) * Math.exp(-t / 0.22) + (t < 0.003 ? noise() * 0.5 : 0)); }, { gain: 0.85 * vol });
}
function hat(t0, vol, pan, open = false) {
  const hp = new Biquad("hp").set(8500, 0.7);
  add(t0, open ? 0.35 : 0.1, (t) => hp.run(noise()) * Math.exp(-t / (open ? 0.12 : 0.025)), { gain: vol * 0.3, pan });
}
function clap(t0, vol = 0.6) {
  const bp = new Biquad("bp").set(1300, 1.1);
  add(t0, 0.45, (t) => {
    let e = 0; for (const o of [0, 0.01, 0.021]) if (t >= o && t < o + 0.01) e = Math.max(e, Math.exp(-(t - o) / 0.004));
    if (t >= 0.021) e = Math.max(e, 0.8 * Math.exp(-(t - 0.021) / 0.1));
    return bp.run(noise()) * e;
  }, { gain: vol * 2, send: 0.3 });
}
function pad(t0, len, notes, vol = 1) {
  const oscs = notes.map((n) => [-9, 0, 9].map((c) => saw(freq(n) * 2 ** (c / 1200))));
  const lp = new Biquad("lp");
  add(t0, len + 0.4, (t, i) => {
    if (i % 16 === 0) lp.set(900 + 1400 * Math.min(1, t / 1.2), 0.7);
    const env = Math.min(1, t / 0.3) * (t > len ? Math.max(0, 1 - (t - len) / 0.4) : 1);
    let v = 0; for (const o of oscs) v += (o[0]() + o[1]() + o[2]()) / 3;
    return lp.run(v) * env;
  }, { gain: 0.05 * vol, duck: true, send: 0.5 });
}
function bass(t0, len, note, vol = 0.5) {
  let ph = 0; const f = freq(note);
  add(t0, len + 0.02, (t) => { ph += (TAU * f) / SR; return Math.tanh(1.5 * Math.sin(ph)) * Math.min(1, t / 0.005) * (t > len ? Math.max(0, 1 - (t - len) / 0.02) : 1); }, { gain: vol, duck: true });
}
function pluck(t0, note, vol, pan = 0) {
  const o = saw(freq(note), 0), lp = new Biquad("lp");
  add(t0, 0.9, (t, i) => { if (i % 8 === 0) lp.set(300 + 5000 * Math.exp(-t / 0.08), 0.8); return lp.run(o()) * Math.exp(-t / 0.25) * Math.min(1, t / 0.002); }, { gain: vol * 0.3, pan, send: 0.45 });
}
function bell(t0, note, vol, pan = 0) {
  const f = freq(note); let pc = 0, pm = 0;
  add(t0, 1.6, (t) => { pm += (TAU * 3.5 * f) / SR; pc += (TAU * f) / SR; return Math.sin(pc + 2 * Math.exp(-t / 0.2) * Math.sin(pm)) * Math.exp(-t / 0.35) * Math.min(1, t / 0.002); }, { gain: vol * 0.16, pan, send: 0.7 });
}
function whoosh(t0, len, f0, f1, vol, p0 = 0, p1 = 0, peak = 0.6) {
  const bp = new Biquad("bp");
  add(t0, len, (t, i) => {
    const x = t / len; if (i % 16 === 0) bp.set(f0 * (f1 / f0) ** x, 1.4);
    return bp.run(noise()) * (x < peak ? (x / peak) ** 2 : (1 - (x - peak) / (1 - peak)) ** 1.6);
  }, { gain: vol * 0.8, pan: (x) => p0 + (p1 - p0) * x, send: 0.25 });
}
function tick(t0, f, vol, pan = 0) {
  let ph = 0; add(t0, 0.05, (t) => { ph += (TAU * f) / SR; return Math.sin(ph) * Math.exp(-t / 0.006) + (t < 0.0015 ? noise() * 0.4 : 0); }, { gain: vol * 0.35, pan });
}
function pop(t0, f, vol, pan = 0) {
  let ph = 0; add(t0, 0.3, (t) => { ph += (TAU * f * (1 + 1.4 * Math.max(0, 1 - t / 0.02))) / SR; return Math.sin(ph) * Math.exp(-t / 0.06); }, { gain: vol * 0.4, pan, send: 0.2 });
}
function impact(t0, vol, tail = 0.8) {
  let ph = 0; const lp = new Biquad("lp");
  add(t0, tail + 0.3, (t, i) => {
    ph += (TAU * (40 + 70 * Math.exp(-t / 0.02))) / SR;
    if (i % 16 === 0) lp.set(4000 * (0.25 ** Math.min(1, t / tail)), 0.7);
    return Math.tanh(1.8 * (Math.sin(ph) * Math.exp(-t / (tail * 0.4)) + 0.6 * lp.run(noise()) * Math.exp(-t / (tail * 0.2)))) * 0.8;
  }, { gain: vol, send: 0.35 });
}
function riser(t0, len, vol) {
  const bp = new Biquad("bp"); let ph = 0;
  add(t0, len, (t, i) => { const x = t / len; if (i % 16 === 0) bp.set(400 * 20 ** x, 1.4); ph += (TAU * 110 * 8 ** x) / SR; return (bp.run(noise()) + 0.3 * Math.sin(ph)) * x ** 2.2; }, { gain: vol * 0.6, send: 0.3 });
}

// ---------- music ----------
const PROG = [["A3", "C4", "E4", "G4"], ["F3", "A3", "C4", "E4"], ["C4", "E4", "G4", "B4"], ["G3", "B3", "D4", "F#4"]];
const ROOTS = ["A1", "F1", "C2", "G1"];
// intro: pad + arpeggio under the icon wall
pad(0, DROP, PROG[0], 0.8);
["A4", "C5", "E5", "A5", "E5", "C5", "B4", "E5"].forEach((n, k) => pluck(0.1 + k * 0.25, n, 0.35, k % 2 ? 0.3 : -0.3));
// groove from the drop to the break
let chordIdx = 0;
for (let t = DROP; t < BREAK - 1e-6; t += 2, chordIdx++) {
  const len = Math.min(2, BREAK - t);
  pad(t, len, PROG[chordIdx % 4]);
  for (let b = 0; b < 4 && t + b * B < BREAK - 1e-6; b++) {
    const bt = t + b * B;
    kick(bt);
    if (b % 2 === 1) clap(bt, 0.5);
    hat(bt + B / 2, 0.7, 0.2, b === 3);
    hat(bt + B / 4, 0.3, -0.15); hat(bt + (3 * B) / 4, 0.3, -0.15);
    bass(bt + B / 2, 0.22, ROOTS[chordIdx % 4], 0.45);
  }
}
// break → riser → final chord
pad(BREAK, DUR - BREAK - 0.4, ["A3", "C4", "E4", "B4"], 0.9);
riser(BREAK + 0.35, FINAL - BREAK - 0.35, 0.8);
impact(FINAL, 0.9, 1.2); kick(FINAL, 1.1);
bass(FINAL, 1.4, "A1", 0.5);
[["A4", 0], ["E5", 0.12], ["A5", 0.24], ["C6", 0.36]].forEach(([n, d]) => bell(FINAL + d, n, 0.6, -0.3 + d));

// ---------- SFX synced to the picture ----------
// icon wall pops (same stagger as the scene)
for (let r = 0; r < 3; r++) for (let c = 0; c < 7; c++) tick(0.05 + (c + r) * 0.045, 1800 + (c + r) * 90, 0.25, (c - 3) / 4);
whoosh(1.65, 0.6, 3000, 300, 0.8, 0.5, -0.5, 0.75);   // collapse into the centre
impact(DROP, 0.6, 0.9);                                // logo lands (2.2 s)
whoosh(2.7, 0.4, 600, 3200, 0.4, -0.5, 0.5);           // wordmark slides out
whoosh(4.45, 0.45, 500, 3500, 0.55, -0.8, 0.8, 0.5);   // cards fly in
pop(5.7, 620, 0.7);                                    // search hub
bell(5.85, "E5", 0.5, 0.2);
whoosh(6.95, 0.35, 3500, 600, 0.45, 0.4, -0.4, 0.3);   // search bar
for (let k = 0; k < 9; k++) tick(6.95 + 0.45 + k * 0.075, [2300, 2500, 2700][k % 3], 0.45, 0.2);
tick(8.25, 1500, 0.7); pop(8.26, 800, 0.5);            // search pressed
[8.5, 8.62, 8.74].forEach((t, k) => pluck(t, ["E5", "G5", "B5"][k], 0.4, -0.4 + k * 0.4));
whoosh(9.6, 0.35, 700, 3000, 0.45);                    // credits
pop(9.65, 520, 0.5); pop(9.95, 440, 0.4); pop(10.05, 620, 0.5);
[11.0, 11.05, 11.1, 11.15].forEach((t) => tick(t, 900, 0.35, -0.2));  // lock shakes
[["A5", 0], ["C6", 0.06], ["E6", 0.12], ["A6", 0.18]].forEach(([n, d]) => bell(11.15 + d, n, 0.55, -0.3 + d * 3));
whoosh(12.05, 0.4, 500, 3000, 0.45);                   // plans
[0, 1, 2, 3].forEach((i) => pop(12.25 + i * 0.1, 500 + i * 80, 0.55, -0.45 + i * 0.3));
tick(16.9, 1600, 0.7); pop(16.91, 760, 0.5);           // CTA click

// ---------- sidechain, reverb, master ----------
{
  const g = new Float64Array(N).fill(1);
  for (let t = DROP; t < BREAK; t += B) {
    const s0 = Math.round(t * SR);
    for (let i = 0; i < 0.3 * SR && s0 + i < N; i++) g[s0 + i] = Math.min(g[s0 + i], 0.35 + 0.65 * (i / (0.3 * SR)) ** 0.7);
  }
  for (let s = 0; s < N; s++) { L[s] += dL[s] * g[s]; R[s] += dR[s] * g[s]; }
}
{
  const sc = SR / 44100;
  const mk = (len) => ({ b: new Float64Array(Math.round(len * sc)), i: 0, st: 0 });
  const ch = [0, 23].map((sp) => ({ c: [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617].map((l) => mk(l + sp)), a: [556, 441, 341, 225].map((l) => mk(l + sp)) }));
  const outs = [L, R];
  for (let s = 0; s < N; s++) {
    const inp = (sL[s] + sR[s]) * 0.015;
    for (let k = 0; k < 2; k++) {
      let o = 0;
      for (const c of ch[k].c) { const y = c.b[c.i]; c.st = y * 0.7 + c.st * 0.3; c.b[c.i] = inp + c.st * 0.85; c.i = (c.i + 1) % c.b.length; o += y; }
      for (const a of ch[k].a) { const b = a.b[a.i]; a.b[a.i] = o + b * 0.5; a.i = (a.i + 1) % a.b.length; o = b - o; }
      outs[k][s] += o * 0.3;
    }
  }
}
let sum = 0; for (let s = 0; s < N; s++) sum += L[s] ** 2 + R[s] ** 2;
const gain = 0.21 / Math.sqrt(sum / (2 * N));
let peak = 0;
for (let s = 0; s < N; s++) { L[s] = Math.tanh(1.1 * L[s] * gain) / 1.1; R[s] = Math.tanh(1.1 * R[s] * gain) / 1.1; peak = Math.max(peak, Math.abs(L[s]), Math.abs(R[s])); }
const pk = Math.min(1, 10 ** (-1 / 20) / peak), fi = 0.01 * SR, fo = 0.6 * SR;
const buf = Buffer.alloc(44 + N * 4);
for (let s = 0; s < N; s++) {
  const e = pk * Math.min(1, s / fi) * Math.min(1, (N - s) / fo);
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[s] * e)) * 32767), 44 + s * 4);
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[s] * e)) * 32767), 46 + s * 4);
}
buf.write("RIFF", 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write("WAVE", 8); buf.write("fmt ", 12);
buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(N * 4, 40);
const out = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "soundtrack.wav");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, buf);
console.log(`wrote ${out} (peak ${(20 * Math.log10(peak * pk)).toFixed(1)} dBFS)`);
