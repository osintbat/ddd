import React from "react";
import { Img, staticFile } from "remotion";
import { Abs, At, C, Icon, IconName, lerp, pop, tw } from "../lib";

// 14.45 → 17.5 s: dashboard features orbit the logo, collapse into it, then the wordmark
// and a "Claim your free credit" button; a cursor clicks it.

const ORBIT: IconName[] = ["flame", "chart-bar", "heart", "shield-check", "key", "library", "wallet", "star"];

export const Outro: React.FC<{ t: number; dur: number }> = ({ t }) => {
  const logo = pop(t, 0.05, 11, 160);
  const collapse = tw(t, 1.05, 1.45, "in");
  const r = lerp(330, 0, collapse) * pop(t, 0.1, 14, 120);
  const rot = t * 40;
  const up = tw(t, 1.3, 1.8, "inOut");
  const logoY = lerp(540, 400, up);
  const word = tw(t, 1.45, 1.95);
  const btn = pop(t, 1.8, 13, 170);
  // cursor path: comes from bottom-right, clicks the button at ~2.45 s
  const cur = tw(t, 1.95, 2.4, "inOut");
  const click = t > 2.45 && t < 2.65 ? 1 - Math.sin(((t - 2.45) / 0.2) * Math.PI) * 0.08 : 1;
  const ring = tw(t, 2.48, 3.0);
  const bx = 960, by = 760;
  return (
    <Abs>
      {ORBIT.map((name, i) => {
        const a = ((i / ORBIT.length) * 360 + rot) * (Math.PI / 180);
        const s = pop(t, 0.12 + i * 0.05, 12, 180) * (1 - collapse);
        const hi = Math.max(0, 1 - Math.abs(t - (0.35 + i * 0.08)) / 0.2);
        return (
          <At key={name} x={960 + Math.cos(a) * r} y={logoY + Math.sin(a) * r}>
            <div style={{
              width: 104, height: 104, borderRadius: 30, display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(255,255,255,0.05)", transform: `scale(${s})`, opacity: s > 0.01 ? 1 : 0,
              boxShadow: hi > 0 ? `0 0 ${40 * hi}px rgba(163,142,227,${0.5 * hi})` : undefined,
            }}>
              <Icon name={name} size={54} color={hi > 0 ? C.purple : "#8e8e94"} />
            </div>
          </At>
        );
      })}
      <At x={960} y={logoY}>
        <div style={{ position: "relative", transform: `scale(${logo * (1 + 0.15 * Math.sin(Math.min(1, collapse) * Math.PI))})` }}>
          <div style={{ position: "absolute", inset: -110, borderRadius: "50%", background: "radial-gradient(circle, rgba(163,142,227,0.4), rgba(163,142,227,0) 70%)" }} />
          <Img src={staticFile("logo.png")} style={{ width: 170, height: 170, display: "block", position: "relative" }} />
        </div>
      </At>
      <div style={{
        position: "absolute", left: 0, right: 0, top: 530, textAlign: "center", fontSize: 96, fontWeight: 700, color: C.white,
        opacity: word, filter: `blur(${(1 - word) * 14}px)`, transform: `translateY(${(1 - word) * 30}px)`, letterSpacing: "0.01em",
      }}>
        brokebase<span style={{ color: C.text }}>.com</span>
      </div>
      <At x={bx} y={by} style={{ transform: `translate(-50%, -50%) scale(${btn * click})`, opacity: Math.min(1, btn * 1.5) }}>
        <div style={{ position: "relative" }}>
          <div style={{
            position: "absolute", inset: 0, borderRadius: 999, transform: `scale(${1 + ring * 0.35}, ${1 + ring * 0.9})`,
            border: `3px solid rgba(163,142,227,${0.7 * (1 - ring)})`, opacity: ring > 0 ? 1 : 0,
          }} />
          <div style={{
            display: "flex", alignItems: "center", gap: 16, height: 92, padding: "0 44px", borderRadius: 999, whiteSpace: "nowrap",
            background: `linear-gradient(160deg, #b7a6ee, ${C.purpleDeep})`, fontSize: 34, fontWeight: 600, color: "#fff",
            boxShadow: "0 20px 60px rgba(109,91,184,0.55)",
          }}>
            <Icon name="gift" size={40} color="#fff" />Claim your free credit
          </div>
        </div>
      </At>
      {t > 1.95 && (
        <div style={{
          position: "absolute", left: lerp(1500, bx + 150, cur), top: lerp(1080, by + 10, cur),
          transform: `scale(${click})`, filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.5))",
        }}>
          <svg width={46} height={56} viewBox="0 0 23 28">
            <path d="M2 1 L2 22 L7.5 16.8 L11.3 26 L15 24.4 L11.3 15.5 L19 15.5 Z" fill="#fff" stroke="#131119" strokeWidth={1.4} strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </Abs>
  );
};
