import React from "react";
import { makeTrack, keys, Key, mixRGB, css, Track } from "../lib/anim";

// §4.7 — S7: "Anthropic" signature, from 11.7 s.

export const CUT3 = 11.7;

const CENTERS = [833.0, 875.2, 905.5, 935.8, 967.8, 1000.0, 1038.9, 1067.1, 1093.9];
const CHARS = ["A", "n", "t", "h", "r", "o", "p", "i", "c"];

type Pose = { dx: number; dy: number; s: number; rx: number; ry: number; rz: number; lum: number; pink: number; visible: boolean };

const A_KEYS = {
  dx: [[11.68, -300], [11.7, -128], [11.733, -70], [11.767, 39], [11.8, 59], [11.833, 59], [11.867, 29], [11.9, -16],
    [11.933, -47], [11.967, -60], [12.0, -59], [12.033, -49], [12.067, -34], [12.1, -19], [12.133, -11], [12.167, -3], [12.25, 0]] as Key[],
  s: [[11.7, 4.2], [11.733, 3.2], [11.767, 1.9], [11.8, 2.1], [11.833, 2.4], [11.867, 2.55], [11.9, 2.27], [11.933, 2.0],
    [11.967, 1.75], [12.0, 1.5], [12.033, 1.31], [12.067, 1.22], [12.1, 1.12], [12.133, 1.06], [12.167, 1.02], [12.2, 1.0]] as Key[],
  ry: [[11.7, 86], [11.733, 80], [11.767, 66], [11.8, 64], [11.833, 54], [11.867, 26], [11.9, 0]] as Key[],
  lum: [[11.7, 0.75], [11.733, 0.8], [11.767, 0.77], [11.8, 0.9], [11.833, 0.97], [11.867, 1]] as Key[],
};

const C_KEYS = {
  dx: [[11.74, 150], [11.767, 109], [11.8, 66], [11.833, 30], [11.867, 33], [11.9, 49], [11.933, 60], [11.967, 58],
    [12.0, 40], [12.033, 14.5], [12.067, -6], [12.1, -21.5], [12.133, -29.5], [12.167, -29.5], [12.2, -24],
    [12.233, -16], [12.267, -6.5], [12.3, -2], [12.35, 0]] as Key[],
  dy: [[11.767, -13], [11.8, -16], [11.833, -7], [11.9, 0]] as Key[],
  s: [[11.767, 2.1], [11.8, 1.65], [11.833, 1.3], [11.867, 1.24], [11.9, 1.35], [11.933, 1.5], [11.967, 1.65],
    [12.0, 1.68], [12.033, 1.58], [12.067, 1.47], [12.1, 1.42], [12.133, 1.34], [12.167, 1.26], [12.2, 1.18],
    [12.233, 1.1], [12.267, 1.05], [12.3, 1.02], [12.35, 1.0]] as Key[],
  ry: [[11.767, 40], [11.8, 20], [11.833, 45], [11.867, 62], [11.9, 62], [11.933, 50], [11.967, 30], [12.0, 0]] as Key[],
  rz: [[11.767, 28], [11.8, 20], [11.833, 8], [11.867, 0]] as Key[],
  lum: [[11.767, 0.47], [11.8, 0.62], [11.833, 0.9], [11.867, 1]] as Key[],
  pink: [[11.95, 0], [12.0, 0.1], [12.067, 0.35], [12.1, 0.5], [12.167, 0.6], [12.267, 0.62], [12.4, 0.8], [12.6, 1]] as Key[],
};

// Middle letters n, t, h, r, o, p, i.
const MID: Record<string, { start: number; H: number; Ls: number; Rd: number; Sm: number }> = {
  n: { start: 11.88, H: 195, Ls: 48, Rd: 0, Sm: 2.4 },
  t: { start: 11.965, H: 193.5, Ls: 44, Rd: 0, Sm: 2.085 },
  h: { start: 12.05, H: 192, Ls: 40, Rd: 0, Sm: 1.77 },
  r: { start: 12.16, H: 136, Ls: 24, Rd: 0, Sm: 1.595 },
  o: { start: 12.271, H: 80, Ls: 8, Rd: 0, Sm: 1.42 },
  p: { start: 12.385, H: 67.5, Ls: 4, Rd: 30, Sm: 1.36 },
  i: { start: 12.5, H: 55, Ls: 0, Rd: 60, Sm: 1.3 },
};
const CURVES = {
  D: [[-0.01, 1.35], [0.02, 1], [0.053, 0.42], [0.087, 0.05], [0.12, 0]] as Key[],
  B: [[0.02, -0.5], [0.053, 0.25], [0.087, 0.85], [0.12, 1], [0.153, 0.9], [0.22, 0.55], [0.29, 0.15], [0.36, 0]] as Key[],
  R: [[0.02, 1], [0.055, 0.38], [0.088, 0.3], [0.12, 0.13], [0.155, 0.02], [0.2, 0]] as Key[],
  G: [[0.02, 1], [0.053, 1], [0.087, 0.62], [0.12, 0.45], [0.153, 0.33], [0.22, 0.14], [0.3, 0]] as Key[],
  rx: [[0, 35], [0.05, 10], [0.1, 0]] as Key[],
  rz: [[0, -75], [0.05, -25], [0.1, 0]] as Key[],
  lum: [[0, 0.45], [0.04, 0.85], [0.08, 1]] as Key[],
};

// Pink → white curves W0…W5 (T).
const W: Track[] = [
  makeTrack([[12.8, 0], [13.0, 0.3], [13.333, 0.68], [13.5, 0.84], [13.667, 0.94], [14.1, 1]]),
  makeTrack([[12.9, 0], [13.0, 0.12], [13.333, 0.4], [13.5, 0.6], [13.667, 0.76], [14.1, 0.88]]),
  makeTrack([[12.95, 0], [13.333, 0.19], [13.5, 0.35], [13.667, 0.55], [14.1, 0.73]]),
  makeTrack([[13.333, 0], [13.5, 0.1], [13.667, 0.24], [14.1, 0.43]]),
  makeTrack([[13.45, 0], [13.667, 0.08], [14.1, 0.18]]),
  makeTrack([[13.5, 0], [13.667, 0.06], [14.1, 0.16]]),
];
function whiteness(i: number, t: number) {
  const p = (i / 8) * 5, f = Math.floor(p), w = p - f;
  const a = W[f](t), b = f + 1 < W.length ? W[f + 1](t) : a;
  return a + (b - a) * w;
}

function pose(ch: string, t: number): Pose {
  if (ch === "A") {
    return {
      dx: keys(t, A_KEYS.dx), dy: 0, s: keys(t, A_KEYS.s), rx: 0, ry: keys(t, A_KEYS.ry), rz: 0,
      lum: keys(t, A_KEYS.lum), pink: 1, visible: t >= CUT3,
    };
  }
  if (ch === "c") {
    return {
      dx: keys(t, C_KEYS.dx), dy: keys(t, C_KEYS.dy), s: keys(t, C_KEYS.s), rx: 0, ry: keys(t, C_KEYS.ry),
      rz: keys(t, C_KEYS.rz), lum: keys(t, C_KEYS.lum), pink: keys(t, C_KEYS.pink), visible: t >= 11.755,
    };
  }
  const m = MID[ch];
  const tau = t - m.start;
  return {
    dx: -m.Ls * keys(tau, CURVES.B) + m.Rd * keys(tau, CURVES.R),
    dy: -m.H * keys(tau, CURVES.D),
    s: 1 + (m.Sm - 1) * keys(tau, CURVES.G),
    rx: keys(tau, CURVES.rx), ry: 0, rz: keys(tau, CURVES.rz),
    lum: keys(tau, CURVES.lum), pink: 1, visible: tau >= -0.005,
  };
}

export const S7Elements: React.FC<{ t: number }> = ({ t }) => {
  if (t < CUT3) return null;
  return (
    <div style={{ position: "absolute", inset: 0, background: "#000000", perspective: 600, perspectiveOrigin: "961.5px 574.6px" }}>
      {CHARS.map((ch, i) => {
        const p = pose(ch, t);
        if (!p.visible) return null;
        const base = mixRGB("#f4f4f5", "#ff9396", p.pink);
        const lit = mixRGB("#4a2324", base, p.lum);
        const color = css(mixRGB(lit, "#f4f4f5", whiteness(i, t)));
        return (
          <div key={i} style={{
            position: "absolute", left: CENTERS[i], top: 535, height: 79.2,
            fontFamily: "Inter, 'Helvetica Neue', Arial, sans-serif", fontSize: 66, lineHeight: "79.2px",
            whiteSpace: "pre", color, transformOrigin: "50% 62%",
            transform: `translateX(-50%) translate(${p.dx}px, ${p.dy}px) scale(${p.s}) rotateX(${p.rx}deg) rotateY(${p.ry}deg) rotateZ(${p.rz}deg)`,
          }}>{ch}</div>
        );
      })}
    </div>
  );
};
