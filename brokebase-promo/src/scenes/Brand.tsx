import React from "react";
import { Img, staticFile } from "remotion";
import { Abs, At, C, Icon, WordsIn, exitStyle, lerp, pop, tw } from "../lib";

// 2.15 → 4.6 s: logo springs in where the icons collapsed, the wordmark slides out of it,
// then the tagline blurs in word by word.

export const Brand: React.FC<{ t: number; dur: number }> = ({ t, dur }) => {
  const s = pop(t, 0.05, 10, 160);
  const slide = tw(t, 0.55, 1.15, "inOut");
  const logoX = lerp(960, 480, slide);
  const reveal = tw(t, 0.7, 1.25);
  const ring = tw(t, 0.05, 0.75);
  return (
    <Abs style={exitStyle(t, dur)}>
      {/* shock ring from the collapse */}
      <At x={960} y={470}>
        <div style={{
          width: 200 + ring * 700, height: 200 + ring * 700, borderRadius: "50%",
          border: `${3 * (1 - ring) + 0.5}px solid rgba(163,142,227,${0.55 * (1 - ring)})`,
        }} />
      </At>
      <At x={logoX} y={470}>
        <div style={{ position: "relative", transform: `scale(${s}) rotate(${(1 - s) * -25}deg)` }}>
          <div style={{
            position: "absolute", inset: -90, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(163,142,227,0.35), rgba(163,142,227,0) 70%)",
          }} />
          <Img src={staticFile("logo.png")} style={{ width: 190, height: 190, display: "block", position: "relative" }} />
        </div>
      </At>
      {/* wordmark, revealed from behind the logo */}
      <div style={{
        position: "absolute", left: 610, top: 470 - 70, height: 140, display: "flex", alignItems: "center",
        clipPath: `inset(-20px ${(1 - reveal) * 100}% -20px 0)`,
      }}>
        <div style={{
          fontSize: 118, fontWeight: 700, letterSpacing: "0.01em", color: C.white, whiteSpace: "nowrap",
          transform: `translateX(${(1 - reveal) * -80}px)`,
        }}>
          brokebase<span style={{ color: C.text }}>.com</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", justifyContent: "center", alignItems: "center", gap: 22 }}>
        <div style={{ opacity: tw(t, 1.25, 1.6), transform: `scale(${pop(t, 1.25)}) rotate(${(1 - pop(t, 1.25)) * 90}deg)` }}>
          <Icon name="roblox" size={46} color={C.purple} />
        </div>
        <WordsIn t={t} delay={1.3} text="Every Roblox script. One place." highlight={{ "Roblox": C.purple }}
          style={{ fontSize: 50, fontWeight: 600, color: C.strong }} />
      </div>
    </Abs>
  );
};
