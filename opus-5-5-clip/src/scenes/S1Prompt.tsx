import React from "react";
import {
  makeTrack, makeTracks, keys, ramp, fade, easeOut, easeInOut, mix, vel, robotoTop,
} from "../lib/anim";
import { Blur, RadialLight } from "../lib/components";
import {
  PlusIcon, GlobeIcon, BrushIcon, ImageSparkIcon, AppStoreIcon, MicIcon, SendIcon,
} from "../lib/icons";

// §4.1 — S1: prompt box, visible 0 → 2.8 s.

const BOX_W = 1489, BOX_H = 304;
const END = 2.8;

// Camera 0 → 0.467: scale around screen point (966.5, 568).
const zoomS = makeTrack([
  [0, 4.2], [0.033, 1.85], [0.067, 1.62], [0.1, 1.4], [0.133, 1.26], [0.167, 1.19], [0.2, 1.14],
  [0.233, 1.1], [0.267, 1.066], [0.3, 1.046], [0.333, 1.031], [0.367, 1.013], [0.4, 1.007],
  [0.433, 1.003], [0.467, 1.0],
]);

// Camera 0.567 → 2.8 (continuing from left 222 / top 416 at 0.467).
const [camLeft, camTop] = makeTracks([
  [0.467, 222, 416],
  [0.567, 224, 416], [0.6, 229, 415], [0.633, 237, 413], [0.667, 250, 410], [0.7, 264, 407],
  [0.733, 280, 404], [0.767, 294, 401], [0.8, 307, 398], [0.833, 317, 396], [0.867, 326, 394],
  [0.9, 335, 392], [0.933, 342, 390], [0.967, 348, 389], [1.0, 354, 388], [1.033, 358, 387],
  [1.067, 362, 386], [1.1, 365, 384.5], [1.133, 367.5, 384], [1.167, 367, 382], [1.2, 357, 376],
  [1.233, 339, 367], [1.267, 312, 355], [1.3, 282, 342], [1.333, 249, 328], [1.367, 222, 316],
  [1.4, 194, 305], [1.433, 171, 294], [1.467, 151, 286], [1.5, 132, 278], [1.533, 116, 272],
  [1.567, 101, 265], [1.6, 89, 260], [1.633, 78, 256], [1.667, 67, 251], [1.7, 58, 246],
  [1.733, 50, 242], [1.767, 43, 236], [1.8, 36, 231], [1.833, 30, 225], [1.867, 25, 218],
  [1.9, 21, 211], [1.933, 16, 203], [1.967, 13, 194], [2.0, 10, 182], [2.033, 7, 170],
  [2.067, 4, 151], [2.1, 1, 124], [2.133, -1, 104], [2.167, -1.8, 96], [2.2, -2, 93],
  [2.233, -2, 88], [2.267, -2, 82], [2.3, -2, 75], [2.333, -2, 67], [2.367, -2, 57], [2.4, -2, 45],
  [2.433, -2, 26], [2.467, -2, 2], [2.5, -2, -26], [2.533, -2, -46], [2.567, -2, -73],
  [2.6, -2, -121], [2.633, -2, -177], [2.667, -2, -290], [2.7, -2, -440], [2.733, -2, -620],
  [2.8, -2, -950],
]);

const camScale = makeTrack([
  [0.567, 1.0], [0.7, 1.046], [0.8, 1.092], [0.9, 1.122], [1.0, 1.142], [1.1, 1.158], [1.2, 1.167],
  [1.3, 1.181], [1.4, 1.207], [1.5, 1.234], [1.6, 1.25], [1.7, 1.257], [1.8, 1.262], [1.9, 1.27],
  [2.0, 1.273], [2.1, 1.278], [2.2, 1.276], [2.3, 1.272], [2.4, 1.264], [2.5, 1.26], [2.8, 1.26],
]);

export function boxCamera(t: number) {
  if (t <= 0.467) {
    const s = zoomS(t);
    return { left: 966.5 - 744.5 * s, top: 568 - 152 * s, s };
  }
  return { left: camLeft(t), top: camTop(t), s: camScale(t) };
}
const topTrack = (t: number) => boxCamera(t).top;

const introBlur = (t: number) => keys(t, [
  [0, 26], [0.067, 17], [0.1, 12], [0.133, 8.5], [0.167, 6.5], [0.2, 4.8], [0.233, 3.4],
  [0.267, 2.4], [0.3, 1.5], [0.333, 0.7], [0.37, 0],
]);

const introBgAlpha = (t: number) => keys(t, [
  [0, 0], [0.033, 0.08], [0.067, 0.22], [0.1, 0.51], [0.133, 0.76], [0.167, 0.94], [0.2, 1],
  [0.233, 0.98], [0.267, 0.91], [0.3, 0.73], [0.333, 0.59], [0.367, 0.4], [0.4, 0.28],
  [0.433, 0.17], [0.467, 0.1], [0.5, 0.055], [0.54, 0],
]);

// Capsule ("writer") trajectory.
const [capX, capY, capR, capL] = makeTracks([
  [0.08, 1330, -70, -38, 150], [0.133, 1017, 32, -30, 160], [0.167, 699, 80, -20, 150],
  [0.2, 518, 94, -12, 135], [0.233, 335, 88, -4, 115], [0.267, 232, 76, 0, 100],
  [0.3, 155, 76, 0, 86], [0.333, 114, 76, 0, 74], [0.37, 58, 76, 0, 60],
]);

const HEY = "Hey Claude, can you help.....";
const SHOW = "Show me what Opus 5.5 can do ";
const typeP = makeTrack([
  [0.817, 1 / 34], [0.833, 1 / 34], [0.867, 3 / 34], [0.9, 11 / 34], [0.933, 19 / 34],
  [0.967, 25 / 34], [1.0, 29 / 34], [1.033, 31 / 34], [1.067, 33 / 34], [1.1, 1],
]);

function boxText(t: number): string {
  if (t < 0.633) return HEY;
  if (t < 0.817) {
    const k = keys(t, [[0.633, 1], [0.667, 24 / 26], [0.7, 15 / 26], [0.733, 10 / 26], [0.767, 3 / 26], [0.8, 0]]);
    return HEY.slice(0, Math.round(1 + k * 28));
  }
  return SHOW.slice(0, Math.max(1, Math.round(typeP(t) * 29)));
}

const ICONS: Array<{ x: number; y: number; size: number; start: number; C: React.FC<{ size: number }> }> = [
  { x: 82, y: 239, size: 66, start: 0.1, C: PlusIcon },
  { x: 183, y: 239, size: 68, start: 0.115, C: GlobeIcon },
  { x: 279, y: 240, size: 58, start: 0.13, C: BrushIcon },
  { x: 377, y: 236, size: 70, start: 0.15, C: ImageSparkIcon },
  { x: 480, y: 231, size: 72, start: 0.17, C: AppStoreIcon },
  { x: 1308, y: 211, size: 72, start: 0.275, C: MicIcon },
  { x: 1408, y: 201, size: 78, start: 0.285, C: SendIcon },
];
const rise = (t: number, start: number) => 130 * (1 - ramp(t, start, start + 0.09, easeOut));

const ROW_CENTERS = [62, 161, 262];
const MENU_ROWS = ["Sonnet 5", "Fable 5.1", "Opus 5.5"];

const groupTransform = (t: number) => {
  const c = boxCamera(t);
  return `translate(${c.left}px, ${c.top}px) scale(${c.s})`;
};

/** Soft lights: intro vignette + halo (screen space), white & blue lights behind the box (box space). */
export const S1Lights: React.FC<{ t: number }> = ({ t }) => {
  if (t >= END) return null;
  const a = introBgAlpha(t);
  const white = 0.5 * fade(t, 1.38, 1.52, 1.58, 1.74);
  const blue = fade(t, 1.93, 2.12, 2.4, 2.62, easeInOut);
  return (
    <>
      {a > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: a }}>
          <RadialLight full cx={960} cy={561.6} rx={1152} ry={820.8} stops={[
            { c: "#2d35a0", a: 0, f: 0 }, { c: "#2d35a0", a: 0, f: 0.64 },
            { c: "#2d35a0", a: 0.55, f: 0.86 }, { c: "#3440c8", a: 0.8, f: 1.0 },
          ]} />
          <RadialLight cx={960} cy={540} rx={422.4} ry={410.4} stops={[
            { c: "#ffffff", a: 0.2, f: 0 }, { c: "#ffffff", a: 0.1, f: 0.45 }, { c: "#ffffff", a: 0, f: 1.0 },
          ]} />
        </div>
      )}
      {(white > 0 || blue > 0) && (
        <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: groupTransform(t) }}>
          <RadialLight cx={775} cy={350} rx={300} ry={300} opacity={white} stops={[
            { c: "#ffffff", a: 0.14, f: 0 }, { c: "#ffffff", a: 0.07, f: 0.566 }, { c: "#ffffff", a: 0, f: 0.99 },
          ]} />
          <RadialLight cx={775} cy={640} rx={620} ry={380} opacity={blue} stops={[
            { c: "#2b52e0", a: 0.85, f: 0 }, { c: "#1f3fae", a: 0.55, f: 0.3 },
            { c: "#16235e", a: 0.25, f: 0.62 }, { c: "#16235e", a: 0, f: 1.0 },
          ]} />
        </div>
      )}
    </>
  );
};

export const S1Elements: React.FC<{ t: number }> = ({ t }) => {
  if (t >= END) return null;

  // Group blur: isotropic intro blur, then vertical whip blur.
  const ib = introBlur(t);
  const vb = t > 2.4 ? Math.min(12, Math.abs(vel(topTrack, t)) * 0.0013) : 0;
  const groupOpacity = keys(t, [[2.467, 1], [2.5, 0.9], [2.533, 0.79], [2.567, 0.77], [2.6, 0.67], [2.633, 0.54], [2.7, 0.3]]);

  // Text reveal / cyan edge.
  const text = boxText(t);
  let textStyle: React.CSSProperties = { color: "#f2f2f2" };
  if (t < 0.47) {
    let xr: number, cyan: string;
    if (t < 0.37) {
      xr = capX(t) + 0.18 * capL(t);
      cyan = "#2ef2f0";
    } else {
      xr = 58;
      cyan = mix("#f2f2f2", "#2ef2f0", 1 - ramp(t, 0.37, 0.47));
    }
    textStyle = {
      color: "transparent",
      backgroundImage: `linear-gradient(to right, ${cyan} ${xr - 10}px, ${cyan} ${xr + 8}px, #f2f2f2 ${xr + 70}px)`,
      backgroundSize: `${BOX_W}px 100%`,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      clipPath: t < 0.37 ? `inset(-40px -40px -40px ${xr}px)` : undefined,
    };
  }

  // Capsule.
  const capOpacity = t >= 0.08 && t < 0.37 ? fade(t, 0.11, 0.135, 0.32, 0.37) : 0;

  // Menu.
  const menuOpacity = fade(t, 1.52, 1.6, 2.45, 2.62);
  const open = ramp(t, 1.53, 1.66, easeOut);
  const menuBlur = 6 * (1 - ramp(t, 1.53, 1.66));
  const row = keys(t, [[1.6, 0], [1.93, 0], [1.985, 1, easeInOut], [2.0, 1], [2.05, 2, easeInOut]]);
  const rowCenter = row <= 1
    ? ROW_CENTERS[0] + (ROW_CENTERS[1] - ROW_CENTERS[0]) * row
    : ROW_CENTERS[1] + (ROW_CENTERS[2] - ROW_CENTERS[1]) * (row - 1);
  const maxColor = mix("#cfcfcf", "#12c9d6", ramp(t, 2.03, 2.07));

  return (
    <Blur sx={ib} sy={Math.max(ib, vb)} style={{ opacity: groupOpacity }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: BOX_W, height: BOX_H, transformOrigin: "0 0", transform: groupTransform(t) }}>
        {/* Box + clipped icon bar */}
        <div style={{ position: "absolute", inset: 0, borderRadius: 40, background: "#403c3b", overflow: "hidden" }}>
          {ICONS.map(({ x, y, size, start, C }, i) => (
            <div key={i} style={{ position: "absolute", left: x - size / 2, top: y - size / 2 + rise(t, start) }}>
              <C size={size} />
            </div>
          ))}
          {/* Icon 6: "5.5" + small ring */}
          <div style={{ position: "absolute", left: 0, top: rise(t, 0.2), width: BOX_W, height: BOX_H }}>
            <div style={{
              position: "absolute", left: 545, top: robotoTop(245, 68), fontSize: 68, lineHeight: "68px",
              color: "#ffffff", transform: "scaleX(0.84)", transformOrigin: "0 0", whiteSpace: "pre",
            }}>5.5</div>
            <div style={{
              position: "absolute", left: 628, top: 204, width: 20, height: 20, boxSizing: "border-box",
              border: "4.5px solid #ffffff", borderRadius: "50%",
            }} />
          </div>
          {/* Icon 7: filled dot */}
          <div style={{
            position: "absolute", left: 1228 - 27, top: 224 - 27 + rise(t, 0.265), width: 54, height: 54,
            borderRadius: "50%", background: "#ffffff",
          }} />
        </div>

        {/* Text + cursor */}
        <div style={{
          position: "absolute", left: 0, top: robotoTop(98, 61), width: BOX_W, height: 61,
          fontSize: 61, lineHeight: "61px", whiteSpace: "pre",
        }}>
          {/* Full box width so gradient / clip coordinates are box px */}
          <div style={{ position: "absolute", left: 0, top: 0, width: BOX_W, paddingLeft: 51, boxSizing: "border-box", ...textStyle }}>
            {text}
          </div>
          {t >= 0.825 && <Cursor text={text} />}
        </div>

        {/* Capsule */}
        {capOpacity > 0 && (
          <div style={{
            position: "absolute", left: capX(t) - capL(t) / 2, top: capY(t) - 18, width: capL(t), height: 36,
            borderRadius: 18, background: "linear-gradient(to right, #2ef2f0, #1fd8f2)",
            boxShadow: "0 0 18px 6px rgba(46,242,240,0.75), 0 0 70px 26px rgba(26,184,255,0.35)",
            filter: "blur(1.5px)", transform: `rotate(${capR(t)}deg)`, opacity: capOpacity,
          }} />
        )}

        {/* Model menu (not clipped by the box) */}
        {menuOpacity > 0 && (
          <div style={{
            position: "absolute", left: 574, top: 293, width: 402, height: 328, opacity: menuOpacity,
            filter: menuBlur > 0.01 ? `blur(${menuBlur}px)` : undefined,
            clipPath: open < 1 ? `inset(-100px -100px ${328 - open * 328}px -100px)` : undefined,
          }}>
            <div style={{
              position: "absolute", inset: 0, borderRadius: 24, background: "#403c3b",
              boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
            }} />
            <div style={{
              position: "absolute", left: 9, width: 384, top: rowCenter - 48, height: 96, borderRadius: 20,
              background: "#2a292d",
            }} />
            {MENU_ROWS.map((label, i) => (
              <div key={label} style={{
                position: "absolute", left: 37, top: robotoTop(ROW_CENTERS[i] + 10.4, 47), fontSize: 47,
                lineHeight: "47px", color: "#f2f2f2", whiteSpace: "pre",
              }}>
                {label}
                {i === 2 && (
                  <span style={{ fontSize: 27, marginLeft: 13, position: "relative", top: -10, color: maxColor }}>max</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Blur>
  );
};

/** Solid, non-blinking cursor 5 px after the last character (trailing spaces included). */
const Cursor: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: "absolute", left: 51, top: 0, whiteSpace: "pre", color: "transparent" }}>
    <span>{text}</span>
    <span style={{
      position: "absolute", marginLeft: 5, top: 42.7 - robotoTop(98, 61), width: 3.5, height: 64,
      background: "#f2f2f2",
    }} />
  </div>
);

