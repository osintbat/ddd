import React, { useId } from "react";
import { css, RGB } from "./anim";

export type Stop = { c: RGB | string; a: number; f: number };

/** Build a CSS radial gradient string from stops (f = fraction of the semiaxis). */
export function radialCss(rx: number, ry: number, cx: string, cy: string, stops: Stop[]): string {
  const s = stops.map((st) => `${css(st.c, st.a)} ${(st.f * 100).toFixed(3)}%`).join(", ");
  return `radial-gradient(ellipse ${rx}px ${ry}px at ${cx} ${cy}, ${s})`;
}

/**
 * Elliptical radial light centred on (cx, cy) with semiaxes (rx, ry).
 * `full` makes the light cover the whole frame (needed when the last stop is opaque).
 */
export const RadialLight: React.FC<{
  cx: number; cy: number; rx: number; ry: number; stops: Stop[]; opacity?: number; full?: boolean;
  frame?: { w: number; h: number };
}> = ({ cx, cy, rx, ry, stops, opacity = 1, full, frame = { w: 1920, h: 1080 } }) => {
  if (opacity <= 0) return null;
  if (full) {
    return (
      <div style={{
        position: "absolute", left: 0, top: 0, width: frame.w, height: frame.h, opacity,
        background: radialCss(rx, ry, `${cx}px`, `${cy}px`, stops),
      }} />
    );
  }
  const w = rx * 2.1, h = ry * 2.1;
  return (
    <div style={{
      position: "absolute", left: cx - w / 2, top: cy - h / 2, width: w, height: h, opacity,
      background: radialCss(rx, ry, "50%", "50%", stops),
    }} />
  );
};

/** Gaussian blur with independent x / y sigma (single-axis "directional" blur). */
export const Blur: React.FC<{
  sx: number; sy: number; style?: React.CSSProperties; children: React.ReactNode;
}> = ({ sx, sy, style, children }) => {
  const id = "b" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const active = sx > 0.02 || sy > 0.02;
  return (
    <div style={{ position: "absolute", inset: 0, filter: active ? `url(#${id})` : undefined, ...style }}>
      {active && (
        <svg width={0} height={0} style={{ position: "absolute" }}>
          <filter id={id} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation={`${Math.max(0, sx)} ${Math.max(0, sy)}`} />
          </filter>
        </svg>
      )}
      {children}
    </div>
  );
};

/** Absolute helper: place a box of size w×h centred on (x, y). */
export const Centered: React.FC<{
  x: number; y: number; w: number; h: number; style?: React.CSSProperties; children?: React.ReactNode;
}> = ({ x, y, w, h, style, children }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, ...style }}>
    {children}
  </div>
);
