import React from "react";
import { Img, staticFile } from "remotion";
import { Abs, C, Icon, IconName, glass, lerp, pop, tw } from "../lib";

// 14.45 → 17.5 s: dashboard features orbit the logo on glass tiles, collapse into it, then the
// wordmark and a glass "Claim your free credit" pill; a cursor clicks it.

const ORBIT: IconName[] = ["flame", "chart-bar", "heart", "shield-check", "key", "library", "wallet", "star"];

export const Outro: React.FC<{ t: number; dur: number }> = ({ t }) => {
  const logo = pop(t, 0.05, 11, 160);
  const collapse = tw(t, 1.05, 1.45, "in");
  const r = lerp(330, 0, collapse) * pop(t, 0.1, 14, 120);
  const rot = t * 40;
  const up = tw(t, 1.3, 1.8, "inOut");
  const logoY = lerp(540, 390, up);
  const word = tw(t, 1.45, 1.95);
  const btn = pop(t, 1.8, 13, 170);
  // cursor: comes from bottom-right, clicks the button at ~2.45 s
  const cur = tw(t, 1.95, 2.4, "inOut");
  const click = t > 2.45 && t < 2.65 ? 1 - Math.sin(((t - 2.45) / 0.2) * Math.PI) * 0.08 : 1;
  const clicked = t > 2.5;
  const bx = 960, by = 760;
  return (
    <Abs>
      {ORBIT.map((name, i) => {
        const a = ((i / ORBIT.length) * 360 + rot) * (Math.PI / 180);
        const s = pop(t, 0.12 + i * 0.05, 12, 180) * (1 - collapse);
        const hi = Math.max(0, 1 - Math.abs(t - (0.35 + i * 0.08)) / 0.2);
        const x = 960 + Math.cos(a) * r, y = logoY + Math.sin(a) * r;
        return (
          <div key={name} style={{
            ...glass(0.07 + 0.05 * hi), position: "absolute", left: x - 52, top: y - 52, width: 104, height: 104, borderRadius: 32,
            display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${s})`, opacity: s > 0.01 ? 1 : 0,
          }}>
            <Icon name={name} size={54} color={hi > 0 ? C.purple : "#9a9aa0"} />
          </div>
        );
      })}
      <div style={{
        ...glass(0.08), position: "absolute", left: 960 - 110, top: logoY - 110, width: 220, height: 220, borderRadius: 64,
        display: "flex", alignItems: "center", justifyContent: "center",
        transform: `scale(${logo * (1 + 0.12 * Math.sin(Math.min(1, collapse) * Math.PI))})`,
      }}>
        <Img src={staticFile("logo.png")} style={{ width: 160, height: 160, display: "block" }} />
      </div>
      <div style={{
        position: "absolute", left: 0, right: 0, top: 540, textAlign: "center", fontSize: 96, fontWeight: 700, color: C.white,
        opacity: word, filter: `blur(${(1 - word) * 14}px)`, transform: `translateY(${(1 - word) * 30}px)`, letterSpacing: "0.01em",
      }}>
        brokebase<span style={{ color: C.text }}>.com</span>
      </div>
      <div style={{
        ...glass(clicked ? 0.14 : 0.09), position: "absolute", left: bx, top: by, height: 96, padding: "0 46px", borderRadius: 999,
        display: "flex", alignItems: "center", gap: 18, whiteSpace: "nowrap", fontSize: 34, fontWeight: 600, color: C.white,
        transform: `translate(-50%, -50%) scale(${btn * click})`, opacity: Math.min(1, btn * 1.5),
      }}>
        <Icon name={clicked ? "check-circle" : "gift"} size={40} color={C.purple} />
        {clicked ? "Free credit claimed" : "Claim your free credit"}
      </div>
      {t > 1.95 && (
        <div style={{ position: "absolute", left: lerp(1500, bx + 150, cur), top: lerp(1080, by + 12, cur), transform: `scale(${click})` }}>
          <svg width={46} height={56} viewBox="0 0 23 28">
            <path d="M2 1 L2 22 L7.5 16.8 L11.3 26 L15 24.4 L11.3 15.5 L19 15.5 Z" fill="#fff" stroke="#131119" strokeWidth={1.4} strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </Abs>
  );
};
