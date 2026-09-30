import React from "react";

// Annex A icons, viewBox 0 0 100 100.

type P = { size: number; color?: string; style?: React.CSSProperties };
const Svg: React.FC<P & { children: React.ReactNode }> = ({ size, style, children }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block", overflow: "visible", ...style }}>
    {children}
  </svg>
);

export const PlusIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M50 6 V94 M6 50 H94" stroke="#fff" strokeWidth={12.5} strokeLinecap="butt" fill="none" />
  </Svg>
);

export const GlobeIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <g stroke="#fff" strokeWidth={5} fill="none">
      <circle cx={50} cy={50} r={46} />
      <ellipse cx={50} cy={50} rx={21} ry={46} />
      <path d="M50 4 V96 M4 50 H96 M10 29 H90 M10 71 H90" />
    </g>
  </Svg>
);

export const BrushIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <g stroke="#fff" strokeWidth={6.5} strokeLinejoin="round" strokeLinecap="round" fill="none">
      <rect x={50} y={4} width={18} height={44} rx={3} transform="rotate(38 59 26)" />
      <path d="M8 92 L30 70 L52 90" />
    </g>
  </Svg>
);

export const ImageSparkIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <g stroke="#fff" strokeWidth={6.5} strokeLinejoin="round" strokeLinecap="round" fill="none">
      <path d="M40 84 H14 Q6 84 6 76 V14 Q6 6 14 6 H80 Q88 6 88 14 V44" />
      <path d="M30 70 Q24 50 38 36 Q38 52 48 46 Q46 30 56 22 Q60 40 66 46" />
      <path d="M46 52 L96 72 L74 78 L64 98 Z" />
    </g>
  </Svg>
);

export const AppStoreIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <g stroke="#fff" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d="M16 94 L60 4" /><path d="M84 94 L40 4" /><path d="M4 60 H96" />
    </g>
  </Svg>
);

export const MicIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <g stroke="#fff" strokeWidth={7} strokeLinecap="round" fill="none">
      <rect x={33} y={3} width={34} height={58} rx={17} fill="#fff" />
      <path d="M20 44 Q20 76 50 76 Q80 76 80 44" />
      <path d="M50 76 V96 M32 96 H68" />
    </g>
  </Svg>
);

export const SendIcon: React.FC<P> = (p) => (
  <Svg {...p}>
    <circle cx={50} cy={50} r={50} fill="#fff" />
    <path d="M50 76 V26 M30 45 L50 25 L70 45" stroke="#000" strokeWidth={9} strokeLinecap="round"
      strokeLinejoin="round" fill="none" />
  </Svg>
);

export const ThumbsUp: React.FC<P> = ({ color = "#fff", ...p }) => (
  <Svg {...p}>
    <rect x={4} y={44} width={17} height={47} rx={2.5} fill={color} />
    <path fill={color} d="M28 47 L46 23 Q50 9 57 9 Q66 11 64 25 L61 39 L86 39 Q96 40 94 49 Q93 54 89 55 Q96 58 93 65 Q91 68 87 68 Q93 71 90 78 Q88 81 84 81 Q88 85 85 90 Q82 93 76 93 L38 93 Q28 93 28 83 Z" />
  </Svg>
);
