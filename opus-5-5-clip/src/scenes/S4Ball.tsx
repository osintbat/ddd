import React from "react";
import { makeTrack, makeTracks, keys, ramp, fade, mix } from "../lib/anim";
import { RadialLight } from "../lib/components";

// §4.4 — S4: ball and dash, visible 5.6 → 6.8 s.

const dashW = makeTrack([
  [5.62, 0], [5.633, 5], [5.667, 49], [5.7, 97], [5.733, 131], [5.767, 155], [5.8, 175], [5.833, 191],
  [5.867, 203], [5.9, 211], [5.933, 219], [5.967, 225], [6.0, 231], [6.033, 233], [6.067, 237],
  [6.133, 239], [6.45, 239], [6.467, 237], [6.5, 229], [6.533, 215], [6.567, 193], [6.6, 167],
  [6.633, 137], [6.667, 103], [6.7, 65], [6.733, 31], [6.76, 0],
]);

export const [ballX, ballY, ballD] = makeTracks([
  [5.715, 934, 198, 50], [5.733, 934, 190, 112], [5.767, 935, 184, 143], [5.8, 937, 177.4, 149],
  [5.833, 938, 173.4, 152], [5.867, 939.2, 170.8, 152], [5.9, 940.2, 168.2, 147], [5.933, 940.9, 166.5, 138],
  [5.967, 941.3, 165.4, 128], [6.0, 941.8, 167.4, 115], [6.033, 942.1, 173.3, 102], [6.067, 942.5, 182.1, 91],
  [6.1, 942.9, 196, 82], [6.133, 943.4, 213, 77], [6.167, 944, 235.7, 74], [6.2, 944.8, 265.3, 71],
  [6.233, 945.9, 300.3, 66], [6.267, 947.1, 348.3, 61], [6.3, 948.8, 404.7, 57], [6.333, 950.8, 473.4, 54],
  [6.367, 953, 551.7, 46], [6.39, 953.5, 604, 40],
]);

const ARCS: Array<{ d: string; w: number; y0: number; y1: number }> = [
  { d: "M 568 -20 C 538 250 556 520 662 775", w: 3.2, y0: -20, y1: 775 },
  { d: "M 612 70 C 590 300 606 540 690 720", w: 2.6, y0: 70, y1: 720 },
  { d: "M 1196 120 C 1180 420 1250 700 1392 1010", w: 3.2, y0: 120, y1: 1010 },
  { d: "M 1246 230 C 1236 470 1290 690 1390 880", w: 2.6, y0: 230, y1: 880 },
];

const arcDy = (t: number) => keys(t, [
  [5.64, 1180], [5.667, 941], [5.7, 700], [5.733, 330], [5.767, 150], [5.8, 0], [5.833, -200],
  [5.867, -380], [5.9, -520], [5.933, -630], [5.967, -720], [6.0, -800], [6.04, -880],
]);

export const S4Lights: React.FC<{ t: number }> = ({ t }) => {
  const o = fade(t, 5.73, 5.8, 5.98, 6.22);
  if (o <= 0) return null;
  return (
    <RadialLight cx={ballX(t)} cy={ballY(t)} rx={330} ry={330} opacity={o} stops={[
      { c: [92, 92, 190], a: 0.55, f: 0 }, { c: [52, 52, 120], a: 0.42, f: 0.311 },
      { c: [42, 42, 80], a: 0.2, f: 0.636 }, { c: [42, 42, 80], a: 0, f: 0.99 },
    ]} />
  );
};

export const S4Elements: React.FC<{ t: number }> = ({ t }) => {
  if (t < 5.6 || t >= 6.8) return null;
  const W = dashW(t);
  const i = fade(t, 6.37, 6.4, 6.42, 6.55);

  const showArcs = t >= 5.64 && t <= 6.04;
  const dy = arcDy(t);

  const showBall = t >= 5.715 && t < 6.39;
  const x = ballX(t), y = ballY(t), D = ballD(t);
  const w = ramp(t, 5.742, 5.765);
  const a = 1 + 0.16 * ramp(t, 6.15, 6.36);

  const crumpleO = fade(t, 5.715, 5.725, 5.745, 5.762);
  const k = Math.min(1, (0.7 * Math.max(D, 90)) / 92.7);

  return (
    <>
      {showArcs && (
        <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <g transform={`translate(0 ${dy})`}>
            {ARCS.map((arc, n) => (
              <g key={n}>
                <defs>
                  <linearGradient id={`arcg${n}`} gradientUnits="userSpaceOnUse" x1={0} x2={0} y1={arc.y0} y2={arc.y1}>
                    <stop offset="0" stopColor="#2ef2f0" stopOpacity={0} />
                    <stop offset="0.3" stopColor="#2ef2f0" stopOpacity={1} />
                    <stop offset="0.72" stopColor="#2ef2f0" stopOpacity={1} />
                    <stop offset="1" stopColor="#2ef2f0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                {[[18, 0.07], [7, 0.18], [2.2, 0.6], [1, 1]].map(([m, al], j) => (
                  <path key={j} d={arc.d} fill="none" stroke={`url(#arcg${n})`} strokeOpacity={al}
                    strokeWidth={m * arc.w} strokeLinecap="round" />
                ))}
              </g>
            ))}
          </g>
        </svg>
      )}

      {W > 0.5 && (
        <div style={{
          position: "absolute", left: 951.5 - W / 2, top: 609.5 - 4.5, width: W, height: 9, borderRadius: 4.5,
          background: "#ffffff",
          boxShadow: `0 0 10px rgba(255,255,255,${0.55 + 0.4 * i}), 0 0 ${24 + 40 * i}px rgba(255,255,255,${0.18 + 0.3 * i})`,
        }} />
      )}

      {showBall && (
        <div style={{
          position: "absolute", left: x - D / 2, top: y - D / 2, width: D, height: D, borderRadius: "50%",
          background: t < 5.765
            ? mix("#c9c9cc", "#ffffff", w)
            : "radial-gradient(circle farthest-corner at 42% 38%, #ffffff 62%, #e9e9ee 100%)",
          boxShadow: `0 0 14px rgba(255,255,255,${0.1 + 0.45 * w}), inset 0 0 0 2px rgba(180,180,200,${0.35 * w})`,
          transform: `scale(${1 / Math.sqrt(a)}, ${a})`,
        }} />
      )}

      {showBall && crumpleO > 0 && (
        <div style={{ position: "absolute", left: x, top: y + 0.14 * D }}>
          <div style={{
            position: "absolute", left: 0, top: 0, fontSize: 83, lineHeight: "83px", whiteSpace: "pre",
            letterSpacing: "-0.3em", color: "#fbfbfb", WebkitTextStroke: "12px #fbfbfb", filter: "blur(1.6px)",
            opacity: crumpleO,
            transform: `translate(-50%, -50%) rotate(${42 + (t - 5.72) * 900}deg) scale(${k}, ${k * 0.85})`,
          }}>Opus</div>
        </div>
      )}
    </>
  );
};
