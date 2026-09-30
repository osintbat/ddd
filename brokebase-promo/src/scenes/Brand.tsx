import React from "react";
import { Img, staticFile } from "remotion";
import { Abs, At, C, Icon, WordsIn, exitStyle, glass, lerp, pop, tw } from "../lib";

// 2.15 → 4.6 s: logo springs in (on a glass tile) where the icons collapsed, the wordmark
// slides out of it, then the tagline blurs in word by word inside a glass pill.

export const Brand: React.FC<{ t: number; dur: number }> = ({ t, dur }) => {
  const s = pop(t, 0.05, 10, 160);
  const slide = tw(t, 0.55, 1.15, "inOut");
  const logoX = lerp(960, 470, slide);
  const reveal = tw(t, 0.7, 1.25);
  const pill = pop(t, 1.2, 14, 160);
  const rb = pop(t, 1.25);
  return (
    <Abs style={exitStyle(t, dur)}>
      <At x={logoX} y={450}>
        <div style={{
          ...glass(0.08), width: 230, height: 230, borderRadius: 64, display: "flex", alignItems: "center", justifyContent: "center",
          transform: `scale(${s}) rotate(${(1 - s) * -25}deg)`,
        }}>
          <Img src={staticFile("logo.png")} style={{ width: 170, height: 170, display: "block" }} />
        </div>
      </At>
      {/* wordmark, revealed from behind the logo */}
      <div style={{
        position: "absolute", left: 630, top: 450 - 70, height: 140, display: "flex", alignItems: "center",
        clipPath: `inset(-20px ${(1 - reveal) * 100}% -20px 0)`,
      }}>
        <div style={{
          fontSize: 118, fontWeight: 700, letterSpacing: "0.01em", color: C.white, whiteSpace: "nowrap",
          transform: `translateX(${(1 - reveal) * -80}px)`,
        }}>
          brokebase<span style={{ color: C.text }}>.com</span>
        </div>
      </div>
      <At x={960} y={690}>
        <div style={{
          ...glass(0.07), display: "flex", alignItems: "center", gap: 20, height: 100, padding: "0 44px", borderRadius: 999,
          whiteSpace: "nowrap", opacity: Math.min(1, pill * 1.4), transform: `scale(${0.85 + 0.15 * pill})`,
        }}>
          <div style={{ transform: `scale(${rb}) rotate(${(1 - rb) * 90}deg)` }}>
            <Icon name="roblox" size={42} color={C.purple} />
          </div>
          <WordsIn t={t} delay={1.3} text="Every Roblox script. One place." highlight={{ "Roblox": C.purple }}
            style={{ fontSize: 44, fontWeight: 600, color: C.strong, flexWrap: "nowrap" }} />
        </div>
      </At>
    </Abs>
  );
};
