import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import "./fonts";
import { C, FPS, tw, lerp } from "./lib";
import { IconWall } from "./scenes/IconWall";
import { Brand } from "./scenes/Brand";
import { Sources } from "./scenes/Sources";
import { Search } from "./scenes/Search";
import { Credits } from "./scenes/Credits";
import { Plans } from "./scenes/Plans";
import { Outro } from "./scenes/Outro";

// Scene timing in seconds: [start, end]. Neighbouring scenes overlap slightly for the hand-off.
export const SCENES = {
  wall: [0, 2.45],
  brand: [2.15, 4.6],
  sources: [4.45, 7.05],
  search: [6.95, 9.7],
  credits: [9.6, 12.15],
  plans: [12.05, 14.55],
  outro: [14.45, 17.5],
} as const;
export const DURATION = 17.5;

const SCENE_COMPONENTS: Record<keyof typeof SCENES, React.FC<{ t: number; dur: number }>> = {
  wall: IconWall, brand: Brand, sources: Sources, search: Search, credits: Credits, plans: Plans, outro: Outro,
};

/** Site background: #131119 with the transparent "BROKEBASE" watermark rows, slowly drifting. */
const Background: React.FC<{ t: number }> = ({ t }) => {
  const rows = Array.from({ length: 16 });
  const drift = t * 26;
  // soft purple glow that wanders between scenes
  const gx = lerp(960, 1300, (Math.sin(t * 0.6) + 1) / 2);
  const gy = lerp(420, 640, (Math.cos(t * 0.45) + 1) / 2);
  const intro = tw(t, 0, 0.8);
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      <div style={{
        position: "absolute", left: -900, top: -900, width: 3700, height: 2900,
        transform: `rotate(-32deg) translateX(${-(drift % 520)}px)`, opacity: 0.9 * intro,
      }}>
        {rows.map((_, i) => (
          <div key={i} style={{
            fontFamily: "Poppins", fontWeight: 700, fontSize: 150, lineHeight: "180px", whiteSpace: "nowrap",
            color: "rgba(120,120,124,0.045)", marginLeft: (i % 2) * -260, letterSpacing: "0.02em",
          }}>{"BROKEBASE ".repeat(9)}</div>
        ))}
      </div>
      <div style={{
        position: "absolute", left: gx - 700, top: gy - 500, width: 1400, height: 1000, opacity: 0.55 * intro,
        background: "radial-gradient(ellipse 700px 500px at 50% 50%, rgba(163,142,227,0.16), rgba(163,142,227,0.05) 45%, rgba(163,142,227,0) 100%)",
      }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 1150px 700px at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};

export const Promo: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{ fontFamily: "Poppins, sans-serif", color: C.strong }}>
      <Background t={t} />
      {(Object.keys(SCENES) as Array<keyof typeof SCENES>).map((key) => {
        const [a, b] = SCENES[key];
        const Comp = SCENE_COMPONENTS[key];
        return (
          <Sequence key={key} from={Math.round(a * FPS)} durationInFrames={Math.round((b - a) * FPS)} layout="none">
            <Comp t={t - a} dur={b - a} />
          </Sequence>
        );
      })}
      <AbsoluteFill style={{ background: C.bg, opacity: tw(t, DURATION - 0.35, DURATION, "inOut") }} />
      <Audio src={staticFile("soundtrack.wav")} />
    </AbsoluteFill>
  );
};
