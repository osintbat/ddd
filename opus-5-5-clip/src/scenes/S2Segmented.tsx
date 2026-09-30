import React from "react";
import { makeTracks, makeTrack, ramp, fade, easeIn, easeInOut, lerp, mixRGB, css, vel, dirSigma, robotoTop } from "../lib/anim";
import { Blur } from "../lib/components";

// §4.2 — S2: segmented control, visible 2.4 → 4.5 s.

export const CUT1 = 193 / 60; // 3.2167 s
const START = 2.4, END = 4.5;
const W = 1309, H = 205;
const ZOOM = 2.107;

const [preX, preY] = makeTracks([
  [2.4, 966, 1290], [2.45, 965, 1200], [2.5, 964, 1112], [2.533, 963, 1068], [2.567, 961, 1029],
  [2.6, 958, 984], [2.633, 956, 943], [2.667, 953.5, 902.5], [2.7, 950, 863.5], [2.733, 945.5, 830],
  [2.767, 941, 800.5], [2.8, 934, 773.5], [2.833, 926.5, 748.5], [2.867, 917.5, 724], [2.9, 908.5, 703.5],
  [2.933, 897, 683.5], [2.967, 885.5, 664.5], [3.0, 873, 649], [3.033, 858.5, 633.5], [3.067, 843.5, 619.5],
  [3.1, 826.5, 606.5], [3.133, 810, 595.5], [3.167, 790.5, 585], [3.2, 772, 576], [3.2167, 762, 571.5],
]);
const [postX, postY] = makeTracks([
  [3.2167, 690, 626], [3.233, 670, 619], [3.267, 616, 605], [3.3, 566, 593], [3.333, 526, 584],
  [3.367, 491, 577], [3.4, 445, 571.5], [3.433, 398, 569], [3.467, 353, 567.5], [3.5, 308, 568],
  [3.533, 265, 568], [3.567, 224, 568.5], [3.6, 186, 569], [3.633, 153, 570.5], [3.667, 121, 571],
  [3.7, 94, 571], [3.733, 69, 571], [3.767, 47, 571], [3.8, 29, 570.5], [3.833, 16, 570.5],
  [3.867, 4, 570.5], [3.9, -9, 570.5], [3.933, -23, 570.5], [3.967, -38, 570.5], [4.0, -57, 570.5],
  [4.033, -79, 570], [4.067, -104, 570], [4.1, -131, 569.5], [4.133, -162, 569.5], [4.167, -196, 568.5],
  [4.2, -240, 568.5], [4.233, -284, 568], [4.267, -340, 568], [4.3, -408, 567.5], [4.333, -498, 566.5],
  [4.367, -626, 565.5], [4.4, -772, 564.5], [4.433, -939, 563], [4.467, -1129, 562],
]);

const PILL_T = [3.2167, 3.3, 3.367, 3.4, 3.433, 3.467, 3.5, 3.533, 3.567];
const [pillC, pillW] = makeTracks(PILL_T.map((tt, i) => [tt,
  [667.3, 705.4, 750.9, 790.0, 864.3, 938.7, 1013.0, 1064.1, 1084.6][i],
  [268.0, 279.5, 293.2, 305.0, 327.4, 349.8, 372.3, 387.7, 393.9][i]]));
const pillRef = makeTrack(PILL_T.map((tt, i) => [tt, [668, 709, 758, 800, 880, 960, 1040, 1095, 1117][i]] as const));

const fillF = makeTrack([
  [3.37, 100], [3.4, 96.5], [3.433, 88.5], [3.467, 82], [3.5, 77.7], [3.533, 74.2], [3.567, 71.5],
  [3.6, 68.3], [3.667, 64.9], [3.733, 62.7], [3.9, 58.9], [4.1, 57.5],
]);

const LABELS: Array<[string, number]> = [["Chat", 168], ["Cowork", 658], ["Claude Code", 1090.6]];

export function controlPos(t: number) {
  return t < CUT1 ? { cx: preX(t), cy: preY(t), z: 1 } : { cx: postX(t), cy: postY(t), z: ZOOM };
}

export const S2Lights: React.FC<{ t: number }> = ({ t }) => {
  const o = fade(t, 2.42, 2.62, 3.0, 3.22, easeInOut);
  if (o <= 0 || t >= CUT1) return null;
  const top = lerp(600, 760, ramp(t, 2.55, 3.22, easeInOut));
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o, overflow: "hidden" }}>
      <div style={{
        position: "absolute", left: 960 - 1700, top, width: 3400, height: 1500, borderRadius: "50%",
        background: `radial-gradient(ellipse 1700px 750px at 50% 50%, rgba(28,71,201,0.55) 0%, rgba(23,58,158,0.45) 55%, rgba(18,39,95,0.4) 90%, rgba(18,39,95,0) 100%)`,
        boxShadow: "0 -6px 80px 20px rgba(26,47,122,0.2), inset 0 12px 50px rgba(111,140,255,0.07)",
      }} />
    </div>
  );
};

export const S2Elements: React.FC<{ t: number }> = ({ t }) => {
  if (t < START || t >= END) return null;
  const { cx, cy, z } = controlPos(t);

  const opacity = 1 - 0.85 * ramp(t, 4.17, 4.46, easeIn) - 0.15 * ramp(t, 4.4, 4.47);
  const sy = t < 2.8 ? dirSigma(vel(preY, t), 16) : 0;
  const sx = t > 4.1 ? dirSigma(vel(postX, t), 12) : 0;

  // Pill.
  const pc = t < CUT1 ? 667.3 : pillC(t);
  const pw = t < CUT1 ? 268 : pillW(t);
  const pillBlur = t < CUT1 ? 0 : Math.min(10, Math.abs(vel(pillRef, t)) / 260);
  const blue = ramp(t, 3.46, 3.58);
  const A = mixRGB("#59585c", "#6370d6", blue);
  const B = mixRGB("#4e4d51", "#6c77d8", blue);
  const pillBorder = blue > 0.5 ? "rgba(160,170,255,0.18)" : "rgba(255,255,255,0.05)";

  // Blue fill.
  const F = fillF(t);
  const e = F - 4;

  return (
    <Blur sx={sx} sy={sy} style={{ opacity }}>
      <div style={{
        position: "absolute", left: cx - W / 2, top: cy - H / 2, width: W, height: H,
        transform: `scale(${z})`, transformOrigin: "50% 50%",
      }}>
        {/* Rail */}
        <div style={{
          position: "absolute", inset: 0, borderRadius: 102.5,
          background: "linear-gradient(160deg, #2e2d31 0%, #29282c 55%, #252428 100%)",
          boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.05), 0 10px 30px rgba(0,0,0,0.25)",
        }} />
        {/* Blue fill growing from the right */}
        {F < 100 && t >= CUT1 && (
          <div style={{
            position: "absolute", inset: 0, borderRadius: 102.5,
            background: `linear-gradient(to right, rgba(47,50,110,0) ${e}%, rgba(47,50,112,0.6) ${e + 6}%, #353a90 ${e + 12}%, #3b43b0 ${e + 18}%, #414bbd ${e + 26}%, #4652bf 100%)`,
            boxShadow: "inset 0 0 0 2px rgba(120,135,255,0.12)",
          }} />
        )}
        {/* Selection pill */}
        <div style={{
          position: "absolute", left: pc - pw / 2, top: 27.5, width: pw, height: 150, borderRadius: 75,
          background: `linear-gradient(100deg, ${css(A)}, ${css(B)})`,
          boxShadow: `inset 0 0 0 1.5px ${pillBorder}`,
          filter: pillBlur > 0.02 ? `blur(${pillBlur}px)` : undefined,
        }} />
        {LABELS.map(([label, x]) => (
          <div key={label} style={{
            position: "absolute", left: x, top: robotoTop(120.3, 57), fontSize: 57, lineHeight: "57px",
            color: "#f2f2f2", whiteSpace: "pre", transform: "translateX(-50%)",
          }}>{label}</div>
        ))}
      </div>
    </Blur>
  );
};

