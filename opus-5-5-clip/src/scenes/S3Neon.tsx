import React from "react";
import { makeTracks, keys, ramp, fade, easeOut, easeInOut, clamp, Key } from "../lib/anim";
import { RadialLight } from "../lib/components";

// §4.3 — S3: neon streaks and "Opus", visible 4.1 → 5.78 s.

export const CUT2 = 323 / 60; // 5.3833 s

const PATH_TOP = "M 2100 -150 C 1900 250 1700 420 1350 430 L -1400 462";
const PATH_BOT = "M 2060 60 C 1780 420 1480 640 1150 664 L -1400 680";
const LEN_TOP = 3758, LEN_BOT = 3675;

const STREAKS: Array<{
  d: string; len: number; dx: number; dy: number; w: number; delay: number; head: Key[]; tail: Key[];
}> = (() => {
  const topHead: Key[] = [[4.12, 0], [4.33, 1070], [4.47, 1690], [4.6, 2350], [4.75, 3100]];
  const topTail: Key[] = [[4.35, 0], [4.47, 440], [4.6, 1090], [4.73, 1690], [4.87, 2500]];
  const botHead: Key[] = [[4.3, 0], [4.47, 950], [4.6, 1480], [4.73, 2020], [4.87, 2600], [5.0, 3100]];
  const botTail: Key[] = [[4.55, 0], [4.73, 870], [4.87, 1900, easeOut], [5.0, 2220], [5.08, 2500]];
  return [
    { d: PATH_TOP, len: LEN_TOP, dx: 0, dy: 0, w: 3, delay: 0, head: topHead, tail: topTail },
    { d: PATH_TOP, len: LEN_TOP, dx: 0, dy: 16, w: 2.6, delay: 60, head: topHead, tail: topTail },
    { d: PATH_BOT, len: LEN_BOT, dx: 0, dy: 0, w: 3, delay: 0, head: botHead, tail: botTail },
    { d: PATH_BOT, len: LEN_BOT, dx: 10, dy: 18, w: 2.6, delay: 90, head: botHead, tail: botTail },
  ];
})();

const NEON_PASSES = (w: number) => [
  { c: "#12d2dc", sw: 16 * w, a: 0.07 },
  { c: "#12d2dc", sw: 7 * w, a: 0.16 },
  { c: "#12d2dc", sw: 2.4 * w, a: 0.55 },
  { c: "#a9fffb", sw: w, a: 1 },
];

const [preX, preY, preR] = makeTracks([
  [4.367, 2032, 75, -48], [4.4, 1975, 138, -48], [4.433, 1918, 201, -48], [4.467, 1861, 264, -47.6],
  [4.5, 1804, 327, -44.9], [4.533, 1742, 385, -39.7], [4.567, 1672, 434, -31.3], [4.6, 1598, 474, -25],
  [4.633, 1527, 503, -19.9], [4.667, 1462, 523, -15.7], [4.7, 1398, 539, -11.9], [4.733, 1342, 549, -8.7],
  [4.767, 1291, 556, -5.8], [4.8, 1243, 559, -2.5], [4.833, 1199, 560, 0], [4.867, 1162, 560, 0],
  [4.9, 1128, 560, 0], [4.933, 1098, 561, 0], [4.967, 1072, 561, 0], [5.0, 1047, 561, 0],
  [5.033, 1025, 561, 0], [5.067, 1006, 562, 0], [5.1, 988, 562, 0], [5.133, 972, 562, 0],
  [5.167, 958, 562, 0], [5.2, 943, 562, 0], [5.233, 929, 562, 0], [5.267, 914, 562, 0],
  [5.3, 894, 562, 0], [5.333, 871, 562, 0], [5.367, 833, 562, 0], [5.3833, 805, 562, 0],
]);

const [postX, postY, postR, postRY, postS] = makeTracks([
  [5.3833, 1166, 547, 0, 0, 1.42], [5.4, 1161, 547, 0.2, 0, 1.42], [5.433, 1151, 547, 0.5, 3, 1.42],
  [5.467, 1134, 547, 1.1, 11, 1.42], [5.5, 1118, 547, 2.2, 17, 1.42], [5.533, 1102, 537, 3.9, 23, 1.42],
  [5.567, 1079, 509, 6.3, 31, 1.42], [5.6, 1053, 462, 9.9, 40, 1.4], [5.633, 1020, 404, 14.4, 51, 1.3],
  [5.667, 986, 336, 24, 62, 1.05], [5.7, 958, 268, 38, 72, 0.72], [5.733, 936, 212, 55, 80, 0.42],
  [5.767, 934, 186, 70, 85, 0.25],
]);

const LETTERS: Array<[string, number, number]> = [
  ["O", 0.019, -39.5], ["p", 0.145, 30.0], ["u", 0.125, 13.0], ["s", 0.097, 27.9],
];

export const S3Lights: React.FC<{ t: number }> = ({ t }) => {
  const o = fade(t, 5.15, 5.32, 5.55, 5.74);
  const out: React.ReactNode[] = [];
  if (o > 0) {
    const xg = t < CUT2
      ? keys(t, [[5.15, 2250], [CUT2, 1420]])
      : keys(t, [[CUT2, 1190], [5.47, 1030], [5.53, 560], [5.6, 260], [5.74, -200]]);
    out.push(<RadialLight key="blue" cx={xg} cy={545} rx={840} ry={840} opacity={o} stops={[
      { c: "#2b4a78", a: 0.95, f: 0 }, { c: "#1f3a60", a: 0.85, f: 0.424 },
      { c: "#1c3353", a: 0.45, f: 0.735 }, { c: "#1c3353", a: 0, f: 1.018 },
    ]} />);
  }
  // Halo under the word after the cut.
  const h = 0.8 * fade(t, CUT2, 5.43, 5.62, 5.72);
  if (h > 0 && t >= CUT2) {
    const s = postS(t);
    out.push(<RadialLight key="halo" cx={postX(t)} cy={postY(t)} rx={330 * s} ry={150 * s} opacity={h} stops={[
      { c: "#ffffff", a: 0.13, f: 0 }, { c: "#ffffff", a: 0.05, f: 0.636 }, { c: "#ffffff", a: 0, f: 0.99 },
    ]} />);
  }
  return <>{out}</>;
};

export const S3Elements: React.FC<{ t: number }> = ({ t }) => {
  if (t < 4.1 || t >= 5.78) return null;
  return (
    <>
      {t >= 4.12 && t <= 5.1 && (
        <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          {STREAKS.map((s, i) => {
            const a = clamp(keys(t, s.tail) - s.delay, 0, s.len);
            const b = clamp(keys(t, s.head) - s.delay, 0, s.len);
            if (b - a <= 0.01) return null;
            return (
              <g key={i} transform={`translate(${s.dx} ${s.dy})`}>
                {NEON_PASSES(s.w).map((p, j) => (
                  <path key={j} d={s.d} fill="none" stroke={p.c} strokeOpacity={p.a} strokeWidth={p.sw}
                    strokeLinecap="round" strokeDasharray={`${b - a} 100000`} strokeDashoffset={-a} />
                ))}
              </g>
            );
          })}
        </svg>
      )}
      {t >= 4.35 && <OpusWord t={t} />}
    </>
  );
};

const OpusWord: React.FC<{ t: number }> = ({ t }) => {
  const base: React.CSSProperties = {
    position: "absolute", fontSize: 83, lineHeight: "83px", color: "#f4f4f5", whiteSpace: "pre",
  };
  if (t < CUT2) {
    return (
      <div style={{ position: "absolute", left: preX(t), top: preY(t) }}>
        <div style={{
          ...base, left: 0, top: 0, textShadow: "0 0 8px rgba(255,255,255,0.12)",
          transform: `translate(-50%, -50%) rotate(${preR(t)}deg)`,
        }}>Opus</div>
      </div>
    );
  }
  const c = ramp(t, 5.6, 5.725, easeInOut);
  const opacity = 1 - ramp(t, 5.72, 5.77);
  if (opacity <= 0) return null;
  const ry = postRY(t) * (1 - 0.7 * c);
  const s = postS(t) * (1 + 0.5 * c);
  return (
    <div style={{ position: "absolute", left: postX(t), top: postY(t), width: 0, height: 0, perspective: 900, perspectiveOrigin: "0 0" }}>
      <div style={{
        ...base, left: 0, top: 0, opacity, letterSpacing: `${-0.4 * c}em`,
        textShadow: "0 0 18px rgba(255,255,255,0.28)",
        filter: c > 0 ? `blur(${2.5 * c}px)` : undefined,
        transform: `translate(-50%, -50%) rotate(${postR(t)}deg) rotateY(${ry}deg) scale(${s})`,
      }}>
        {LETTERS.map(([ch, dy, rot]) => (
          <span key={ch} style={{
            display: "inline-block",
            transform: `translateY(${dy * c}em) rotate(${rot * c}deg)`,
            WebkitTextStroke: c > 0 ? `${14 * c}px #f4f4f5` : undefined,
          }}>{ch}</span>
        ))}
      </div>
    </div>
  );
};
