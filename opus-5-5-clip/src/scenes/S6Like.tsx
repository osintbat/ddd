import React from "react";
import { makeTracks, makeTrack, keys, ramp, fade, easeOut, easeInOut, clamp, mixRGB, css, mix, vel, dirSigma } from "../lib/anim";
import { Blur, RadialLight } from "../lib/components";
import { ThumbsUp } from "../lib/icons";

// §4.6 — S6: like button and "TRY CLAUDE", visible 8.11 → 11.7 s.

const START = 8.11, END = 11.7;

const [btnX, btnY] = makeTracks([
  [8.14, 935.5, 1190], [8.167, 935.5, 990], [8.2, 935.5, 915], [8.233, 935.5, 860], [8.267, 935.5, 817],
  [8.3, 935.5, 779], [8.333, 935.5, 747], [8.4, 935.5, 696.5], [8.467, 935.5, 656], [8.533, 935.5, 624],
  [8.6, 935.5, 599], [8.667, 935.5, 580], [8.733, 935.2, 559], [8.8, 935.2, 544], [8.867, 935.0, 532],
  [8.933, 934.3, 524], [9.0, 932.8, 517.5], [9.067, 931.0, 513], [9.133, 927.9, 510], [9.2, 923.5, 509],
  [9.267, 917.1, 508.8], [9.333, 909.4, 508.7], [9.4, 899.5, 508.7], [9.467, 885.8, 508.5],
  [9.533, 863.5, 508.5], [9.6, 831.6, 508.6], [9.667, 774.4, 508.6], [9.733, 715.7, 508.6],
  [9.8, 680.3, 508.6], [9.867, 658.5, 508.5], [9.933, 643.2, 508.5], [10.0, 632.5, 508.6],
  [10.067, 625.1, 508.6], [10.133, 618.7, 508.6], [10.2, 614.3, 508.5], [10.267, 610.8, 508.5],
  [10.333, 608.6, 508.4], [10.4, 607.1, 508.4], [10.5, 605.9, 508.3], [10.6, 604.9, 508.2],
  [11.0, 603.3, 508.2], [11.7, 600.6, 508.2],
]);
const labelX = makeTrack([
  [9.0, 1431.7], [9.067, 1429.9], [9.133, 1426.8], [9.2, 1422.5], [9.267, 1416.2], [9.333, 1408.5],
  [9.4, 1398.6], [9.467, 1384.9], [9.533, 1362.6], [9.6, 1330.8], [9.667, 1273.6], [9.733, 1214.9],
  [9.8, 1179.5], [9.867, 1157.8], [9.933, 1142.6], [10.0, 1132.0], [10.067, 1124.7], [10.133, 1118.3],
  [10.2, 1114.0], [10.267, 1110.8], [10.333, 1108.7], [10.4, 1107.3], [10.5, 1106.5], [10.6, 1106.1],
  [11.0, 1107.2], [11.7, 1108.0],
]);
const xL = makeTrack([
  [9.25, 1620], [9.3, 1560], [9.4, 1512], [9.5, 1432], [9.6, 1360], [9.7, 1284], [9.8, 1148],
  [9.9, 992], [10.0, 800], [10.1, 644], [10.2, 528], [10.3, 432], [10.4, 400], [10.55, 380],
]);

const BLUE_ICONS: Array<[number, number]> = [[394, 332], [1555, 311], [349, 719], [1603, 668], [668, 895], [1310, 902]];

const tintAt = (t: number) => clamp(1 - Math.abs(xL(t) - btnX(t)) / 170, 0, 1) * fade(t, 9.3, 9.6, 10.3, 10.5);

// Ring gaps at 3 and 9 o'clock (0° = up, clockwise).
const GAP_PROFILE: Array<[number, number]> = [[32, 1], [20, 0.7], [15, 0.35], [10, 0.1], [5, 0]];
const ringMask = (() => {
  const stops: string[] = [];
  const around = (c: number) => {
    const s: string[] = [];
    for (const [d, a] of GAP_PROFILE) s.push(`rgba(0,0,0,${a}) ${c - d}deg`);
    for (const [d, a] of [...GAP_PROFILE].reverse()) s.push(`rgba(0,0,0,${a}) ${c + d}deg`);
    return s;
  };
  stops.push("rgba(0,0,0,1) 0deg", ...around(90), ...around(270), "rgba(0,0,0,1) 360deg");
  return `conic-gradient(from 0deg at 50% 50%, ${stops.join(", ")})`;
})();

export const S6Lights: React.FC<{ t: number }> = ({ t }) => {
  if (t < START || t >= END) return null;
  const bg = fade(t, 8.55, 8.66, 8.98, 9.16);
  const ind = fade(t, 9.28, 9.55, 10.25, 10.55);
  const glow = keys(t, [[8.5, 0], [8.533, 0.12], [8.6, 0.6], [8.667, 1], [8.733, 0.6], [8.8, 0.27], [8.867, 0]]);
  const indigoStops = [
    { c: [44, 46, 140] as [number, number, number], a: 0.55, f: 0 },
    { c: [36, 38, 110] as [number, number, number], a: 0.4, f: 0.396 },
    { c: [30, 30, 80] as [number, number, number], a: 0.16, f: 0.735 },
    { c: [30, 30, 80] as [number, number, number], a: 0, f: 0.99 },
  ];
  return (
    <>
      {bg > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: bg, background: "#1a1e29" }}>
          <RadialLight full cx={0} cy={0} rx={768} ry={486} stops={[
            { c: [20, 64, 200], a: 0.75, f: 0 }, { c: [20, 50, 150], a: 0.35, f: 0.45 }, { c: [20, 50, 150], a: 0, f: 1.0 },
          ]} />
          <RadialLight full cx={1920} cy={1080} rx={691.2} ry={432} stops={[
            { c: [22, 58, 170], a: 0.65, f: 0 }, { c: [20, 45, 130], a: 0.3, f: 0.45 }, { c: [20, 45, 130], a: 0, f: 1.0 },
          ]} />
        </div>
      )}
      {ind > 0 && (
        <>
          <RadialLight cx={xL(t)} cy={257} rx={380} ry={380} opacity={ind} stops={indigoStops} />
          <RadialLight cx={xL(t)} cy={787} rx={380} ry={380} opacity={ind} stops={indigoStops} />
        </>
      )}
      {glow > 0 && (
        <RadialLight cx={btnX(t)} cy={btnY(t) + 45} rx={215} ry={215} opacity={glow} stops={
          [[0.36, 0], [0.31, 0.3], [0.23, 0.5], [0.13, 0.7], [0.03, 0.9], [0, 1.0]].map(([a, f]) => ({ c: "#bed7f0", a, f }))
        } />
      )}
    </>
  );
};

export const S6Elements: React.FC<{ t: number }> = ({ t }) => {
  if (t < START || t >= END) return null;
  const X = btnX(t), Y = btnY(t);
  const sx = dirSigma(vel(btnX, t), 10);
  const sy = t < 8.5 ? dirSigma(vel(btnY, t), 14) : 0;

  const tint = tintAt(t);
  const C = ramp(t, 8.27, 8.37, easeOut);
  const v = keys(t, [[8.37, 83], [8.533, 110], [8.867, 160], [8.933, 176], [9.333, 214], [10.0, 196], [11.0, 204]]);
  const g = keys(t, [[8.5, 0], [8.6, 0.75], [8.667, 1], [8.733, 0.75], [8.8, 0.45], [8.867, 0]]);
  const ringColor = css(mixRGB(mixRGB([v, v, v + 3], "#77d0fa", g), "#b6bbdb", 0.6 * tint));
  const iconColor = mix("#ffffff", "#cdd0ff", tint);

  const blueScale = keys(t, [[8.6, 0], [8.645, 1.12, easeOut], [8.7, 1, easeInOut]]);
  const blueOpacity = 1 - ramp(t, 8.99, 9.17);
  const E = keys(t, [[9.06, 0], [9.2, 0.35], [9.33, 0.62], [9.5, 1]]);

  return (
    <Blur sx={sx} sy={sy}>
      {t >= 8.6 && t < 9.2 && blueOpacity > 0 && BLUE_ICONS.map(([x0, y0], n) => (
        <div key={n} style={{
          position: "absolute", left: x0 - 46, top: y0 - (t - 8.667) * 250 - 46, opacity: blueOpacity,
          transform: `rotate(-6deg) scale(${blueScale})`,
        }}>
          <ThumbsUp size={92} color="#4897e5" />
        </div>
      ))}

      {/* Ring */}
      {C > 0 && (
        <svg width={260} height={260} viewBox="-130 -130 260 260" style={{
          position: "absolute", left: X - 130, top: Y - 130, overflow: "visible", opacity: C,
          transform: `scale(${0.72 + 0.28 * C})`, WebkitMaskImage: ringMask, maskImage: ringMask,
        }}>
          <defs>
            <filter id="ringSoft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation={0.4} /></filter>
            <filter id="ringGlow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation={7} /></filter>
          </defs>
          {g > 0 && <circle r={118} fill="none" stroke={ringColor} strokeWidth={10} opacity={0.6 * g} filter="url(#ringGlow)" />}
          <circle r={122.25} fill="none" stroke={ringColor} strokeWidth={3.5} opacity={0.25} />
          <circle r={118} fill="none" stroke={ringColor} strokeWidth={3} filter="url(#ringSoft)" />
        </svg>
      )}

      {/* Thumbs up icon */}
      <div style={{ position: "absolute", left: X - 2 - 62, top: Y - 2 - 62 }}>
        <ThumbsUp size={124} color={iconColor} />
      </div>

      {/* TRY CLAUDE */}
      {t >= 9.06 && (
        <div style={{ position: "absolute", left: labelX(t), top: 544.7 - 0.8415 * 81 }}>
          <div style={{
            position: "absolute", left: 0, top: 0, fontSize: 81, lineHeight: "81px", whiteSpace: "pre",
            transform: "translateX(-50%)", color: mix("#1f1e23", "#f4f4f5", E),
          }}>TRY CLAUDE</div>
        </div>
      )}
    </Blur>
  );
};
