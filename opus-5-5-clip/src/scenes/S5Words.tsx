import React from "react";
import { makeTrack, keys, ramp, fade, easeOut, lerp, clamp, mix, vel, dirSigma } from "../lib/anim";
import { Blur, RadialLight } from "../lib/components";

// §4.5 — S5: "Fable" and "Sonnet", visible 6.4 → 8.25 s.

const yi = makeTrack([
  [6.43, 575], [6.533, 412], [6.567, 381], [6.6, 365], [6.633, 371], [6.667, 392], [6.7, 432],
  [6.733, 491], [6.767, 536], [6.8, 556], [6.833, 563], [6.867, 561], [6.9, 556], [6.933, 545],
  [6.967, 515], [7.0, 484], [7.033, 470], [7.067, 460], [7.1, 452], [7.2, 440],
]);
const sp = makeTrack([
  [6.43, 0.16], [6.5, 0.45], [6.533, 0.75], [6.567, 0.83], [6.6, 0.91], [6.633, 0.94], [6.7, 0.96],
  [6.733, 0.98], [6.8, 1],
]);

const FABLE: Array<{ ch: string; u: number; r1: number; r2: number; dir: number }> = [
  { ch: "F", u: 0, r1: -0.395, r2: 0.15, dir: 1 },
  { ch: "a", u: 0.25, r1: 0.3, r2: -0.294, dir: -1 },
  { ch: "b", u: 0.5, r1: 0.13, r2: 0.436, dir: 1 },
  { ch: "l", u: 0.75, r1: 0.279, r2: -0.379, dir: -1 },
  { ch: "e", u: 1, r1: 0.062, r2: 0.33, dir: 1 },
];

const sonX = makeTrack([
  [7.0, 925], [7.9, 924], [7.933, 919], [7.967, 912.4], [8.0, 911.3], [8.067, 912], [8.1, 914], [8.133, 920],
]);
const sonY = makeTrack([
  [6.95, 650], [7.0, 612], [7.033, 590], [7.067, 578.5], [7.1, 569], [7.133, 562], [7.167, 556],
  [7.2, 551.6], [7.233, 548.6], [7.267, 545.8], [7.3, 543.7], [7.333, 541.7], [7.367, 539.5],
  [7.4, 537.2], [7.433, 534.5], [7.467, 531], [7.5, 526], [7.533, 521], [7.567, 515], [7.6, 508],
  [7.633, 500], [7.667, 490.4], [7.7, 479.7], [7.733, 467.7], [7.767, 453.6], [7.8, 438.5],
  [7.833, 420.8], [7.867, 402.7], [7.9, 379.7], [7.933, 355.8], [7.967, 326.1], [8.0, 294.2],
  [8.033, 253.2], [8.067, 208.5], [8.1, 149.5], [8.133, 76], [8.167, -10], [8.2, -110],
]);

export const S5Lights: React.FC<{ t: number }> = ({ t }) => {
  const wo = 0.9 * fade(t, 6.44, 6.52, 6.8, 6.92);
  const io = keys(t, [[6.76, 0], [6.87, 0.45], [6.95, 0.75], [7.02, 1], [7.12, 0.9], [7.25, 0.45], [7.38, 0]]);
  const yb = keys(t, [[6.76, 640], [6.87, 620], [7.02, 540], [7.12, 430], [7.3, 330]]);
  return (
    <>
      {wo > 0 && (
        <RadialLight cx={960} cy={yi(t)} rx={260} ry={200} opacity={wo} stops={[
          { c: "#ffffff", a: 0.12, f: 0 }, { c: "#ffffff", a: 0.05, f: 0.636 }, { c: "#ffffff", a: 0, f: 0.99 },
        ]} />
      )}
      {io > 0 && (
        <RadialLight cx={930} cy={yb} rx={780} ry={440} opacity={io} stops={[
          { c: [62, 66, 185], a: 0.78, f: 0 }, { c: [48, 50, 140], a: 0.6, f: 0.453 },
          { c: [34, 34, 86], a: 0.28, f: 0.792 }, { c: [34, 34, 86], a: 0, f: 1.018 },
        ]} />
      )}
    </>
  );
};

export const S5Elements: React.FC<{ t: number }> = ({ t }) => {
  if (t < 6.4 || t >= 8.25) return null;
  return (
    <>
      <Fable t={t} />
      {t >= 6.95 && <Sonnet t={t} />}
    </>
  );
};

const Fable: React.FC<{ t: number }> = ({ t }) => {
  const opacity = keys(t, [[6.42, 0], [6.46, 1], [6.95, 1], [7.0, 0.8], [7.067, 0.42], [7.13, 0]]);
  if (opacity <= 0) return null;
  const y = yi(t);
  const S = lerp(0.55, 1, ramp(t, 6.43, 6.56, easeOut));
  const bright = 1 - 0.45 * ramp(t, 6.97, 7.08);
  const tangle = 1 - ramp(t, 6.43, 6.66, easeOut);
  const arc = fade(t, 6.5, 6.57, 6.62, 6.7);
  const cy = 1 - ramp(t, 6.47, 6.53);
  const color = mix("#f4f4f5", "#2ef2f0", cy);
  const size = 106;

  return (
    <div style={{
      position: "absolute", left: 0, width: 1850, top: y + 28.6 - 0.8415 * size, height: size,
      display: "flex", justifyContent: "center", opacity,
      filter: bright < 1 ? `brightness(${bright})` : undefined,
    }}>
      <div style={{
        fontSize: size, lineHeight: `${size}px`, whiteSpace: "pre",
        transform: `scale(${sp(t) * S}, ${S})`, transformOrigin: "50% 70%",
      }}>
        {FABLE.map(({ ch, u, r1, r2, dir }) => {
          const rot = r1 * 170 * tangle + (u - 0.5) * 70 * arc + r2 * 40 * arc;
          const lift = -Math.sin(Math.PI * u) * 40 * arc + r1 * 22 * arc;
          const jx = r2 * 46 * tangle, jy = r1 * 34 * tangle;
          const settle = 6.8 + 0.1 * Math.sin(Math.PI * u);
          const active = t < settle;
          const b = clamp((t - 6.6) / (settle - 6.6), 0, 1);
          const amp = active ? 62 * Math.sin(Math.PI * b) : 0;
          const val = dir * amp * (0.55 + 0.45 * Math.sin(Math.PI * u));
          const sway = active ? dir * 9 * Math.sin(Math.PI * b) : 0;
          return (
            <span key={ch} style={{
              display: "inline-block",
              transform: `translate(${jx}px, ${jy + val + lift}px) rotate(${rot + sway}deg)`,
              color: cy > 0.5 ? "transparent" : color,
              WebkitTextStroke: cy > 0 ? `${2.5 * cy}px ${color}` : undefined,
              textShadow: cy > 0 ? "0 0 16px rgba(46,242,240,0.6)" : "0 0 16px rgba(255,255,255,0.18)",
            }}>{ch}</span>
          );
        })}
      </div>
    </div>
  );
};

const Sonnet: React.FC<{ t: number }> = ({ t }) => {
  const x = sonX(t), y = sonY(t);
  const L = ramp(t, 6.95, 7.07);
  const sy = t >= 7.7 ? dirSigma(vel(sonY, t), 14) : 0;
  const size = 104;
  return (
    <Blur sx={0} sy={sy}>
      <RadialLight cx={x} cy={y} rx={420} ry={170} stops={[
        { c: "#ffffff", a: 0.045, f: 0 }, { c: "#ffffff", a: 0.02, f: 0.636 }, { c: "#ffffff", a: 0, f: 0.99 },
      ]} />
      <div style={{ position: "absolute", left: x, top: y + 37.4 - 0.8415 * size }}>
        <div style={{
          position: "absolute", left: 0, top: 0, fontSize: size, lineHeight: `${size}px`, whiteSpace: "pre",
          transform: "translateX(-50%)", color: mix("#5b5a66", "#f4f4f5", L), opacity: 0.3 + 0.7 * L,
          textShadow: "0 0 20px rgba(255,255,255,0.18)",
        }}>Sonnet</div>
      </div>
    </Blur>
  );
};
