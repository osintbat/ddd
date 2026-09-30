import React from "react";
import { Easing, interpolate, spring } from "remotion";
import ICONS from "./icons.json";

// Palette taken from the site (brokebase.com card page).
export const C = {
  bg: "#131119",
  text: "#78787c",
  strong: "#d6d6da",
  white: "#e4e4e7",
  purple: "#a38ee3",
  purpleDeep: "#6d5bb8",
  icon: "#4c4b4f",
};

export const FPS = 60;
export type IconName = keyof typeof ICONS;

/** Filled SVG icon (reicon / Simple Icons), coloured with currentColor. */
export const Icon: React.FC<{ name: IconName; size: number; color?: string; style?: React.CSSProperties }> = ({
  name, size, color = C.text, style,
}) => {
  const ic = ICONS[name];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${ic.w} ${ic.h}`} style={{ display: "block", color, flexShrink: 0, ...style }}
      dangerouslySetInnerHTML={{ __html: ic.body }} />
  );
};

// ---- time helpers (t in seconds) ----
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/** Spring 0 → 1 starting at `delay` seconds. */
export function pop(t: number, delay = 0, damping = 13, stiffness = 170, mass = 0.9): number {
  if (t < delay) return 0;
  return spring({ frame: (t - delay) * FPS, fps: FPS, config: { damping, stiffness, mass } });
}

const E = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
};
export type EaseName = keyof typeof E;

/** 0 → 1 between a and b (seconds) with easing. */
export function tw(t: number, a: number, b: number, ease: EaseName = "out"): number {
  return interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: E[ease] });
}

export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

export function mixHex(a: string, b: string, p: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const m = pa.map((v, i) => Math.round(lerp(v, pb[i], clamp(p))));
  return `rgb(${m[0]}, ${m[1]}, ${m[2]})`;
}

/** Scene exit: fade + slight zoom over the last `len` seconds before `end`. */
export function exitStyle(t: number, end: number, len = 0.28): React.CSSProperties {
  const p = tw(t, end - len, end, "in");
  if (p <= 0) return {};
  return { opacity: 1 - p, transform: `scale(${1 + 0.05 * p})` };
}

/** Text that blurs + slides in, word by word. */
export const WordsIn: React.FC<{
  text: string; t: number; delay: number; stagger?: number; style?: React.CSSProperties;
  highlight?: Record<string, string>;
}> = ({ text, t, delay, stagger = 0.07, style, highlight = {} }) => (
  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 0.28em", ...style }}>
    {text.split(" ").map((w, i) => {
      const p = tw(t, delay + i * stagger, delay + i * stagger + 0.5);
      return (
        <span key={i} style={{
          display: "inline-block", opacity: p, filter: `blur(${(1 - p) * 12}px)`,
          transform: `translateY(${(1 - p) * 26}px)`, color: highlight[w] ?? undefined,
        }}>{w}</span>
      );
    })}
  </div>
);

export const Abs: React.FC<{ style?: React.CSSProperties; children?: React.ReactNode }> = ({ style, children }) => (
  <div style={{ position: "absolute", inset: 0, ...style }}>{children}</div>
);

/** Centre a child on (x, y). */
export const At: React.FC<{ x: number; y: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({
  x, y, style, children,
}) => (
  <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0 }}>
    <div style={{ position: "absolute", left: 0, top: 0, transform: "translate(-50%, -50%)", ...style }}>{children}</div>
  </div>
);

/**
 * Glassmorphism surface (like the site's "Scripts" pill): translucent white fill + backdrop blur.
 * No border, outline, shadow or glow. Put it on the element that animates opacity, never below a
 * parent with opacity/filter, or the backdrop blur has nothing to sample.
 */
export function glass(alpha = 0.07, tint?: string): React.CSSProperties {
  return {
    background: tint ?? `rgba(255,255,255,${alpha})`,
    backdropFilter: "blur(22px) saturate(150%)",
    WebkitBackdropFilter: "blur(22px) saturate(150%)",
    border: "none",
    outline: "none",
  };
}
