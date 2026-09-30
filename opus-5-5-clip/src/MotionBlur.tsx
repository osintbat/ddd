import React from "react";
import { AbsoluteFill } from "remotion";
import { Frame, CUTS } from "./Frame";

// §1.5 — temporal supersampling over a 1/72 s window centred on the frame time,
// only inside these intervals; the window never crosses a hard cut.
const INTERVALS: Array<[number, number, number]> = [
  [0.0, 0.36, 8], [2.06, 2.17, 8], [2.44, 2.78, 12], [4.18, 4.47, 12], [4.47, 4.64, 10],
  [5.28, 5.3833, 6], [5.5, 5.9, 8], [6.05, 6.42, 10], [6.42, 6.86, 6], [6.9, 7.12, 6],
  [7.8, 8.4, 12], [9.5, 9.85, 8], [11.7, 11.92, 10],
];
const HALF = 1 / 144;

export function samplesFor(t: number): number {
  for (const [a, b, n] of INTERVALS) if (t >= a && t <= b) return n;
  return 1;
}

export function sampleTimes(t: number): number[] {
  const n = samplesFor(t);
  if (n <= 1) return [t];
  let lo = t - HALF, hi = t + HALF;
  for (const c of CUTS) {
    if (t < c) hi = Math.min(hi, c - 1e-6);
    else lo = Math.max(lo, c);
  }
  lo = Math.max(0, lo);
  return Array.from({ length: n }, (_, i) => lo + ((hi - lo) * i) / (n - 1));
}

/** Render k is layered over the previous ones with opacity 1/k → equal-weight average. */
export const MotionBlurFrame: React.FC<{ t: number }> = ({ t }) => {
  const times = sampleTimes(t);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {times.map((ti, i) => (
        <AbsoluteFill key={i} style={{ opacity: 1 / (i + 1) }}>
          <Frame t={ti} />
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};
