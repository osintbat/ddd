import React from "react";
import { Abs, At, C, Icon, cardBg, exitStyle, pop, tw } from "../lib";

// 9.6 → 12.15 s: "1 credit = 1 script". Coin = script, then a locked script card shakes,
// unlocks with a burst and lands in the library, "yours forever".

const SPARKS = Array.from({ length: 14 }, (_, i) => ({
  a: (i / 14) * Math.PI * 2 + (i % 2) * 0.2,
  d: 120 + (i % 3) * 40,
}));

export const Credits: React.FC<{ t: number; dur: number }> = ({ t, dur }) => {
  const coin = pop(t, 0.05, 10, 170), eq = pop(t, 0.3, 12, 180), doc = pop(t, 0.45, 10, 170);
  const card = pop(t, 0.95, 14, 150);
  const shake = t > 1.25 && t < 1.55 ? Math.sin((t - 1.25) * 70) * 7 * (1 - (t - 1.25) / 0.3) : 0;
  const open = t >= 1.55;
  const burst = tw(t, 1.55, 2.05);
  const glow = open ? 1 - tw(t, 1.7, 2.3) * 0.6 : 0;
  const flip = pop(t, 1.55, 9, 220);
  return (
    <Abs style={exitStyle(t, dur)}>
      {/* equation row */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 200, display: "flex", justifyContent: "center", alignItems: "flex-start", gap: 70 }}>
        {[
          { s: coin, icon: "coins" as const, label: "1 credit" },
          null,
          { s: doc, icon: "document-code" as const, label: "1 script" },
        ].map((item, i) => item ? (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, transform: `scale(${item.s})`, opacity: Math.min(1, item.s * 1.5) }}>
            <div style={{
              width: 190, height: 190, borderRadius: 52, background: cardBg, display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `inset 0 0 0 1.5px ${C.border}, 0 24px 60px rgba(0,0,0,0.4)`,
            }}>
              <Icon name={item.icon} size={104} color={C.purple} style={{ filter: "drop-shadow(0 0 24px rgba(163,142,227,0.45))" }} />
            </div>
            <div style={{ fontSize: 40, fontWeight: 700, color: C.white }}>{item.label}</div>
          </div>
        ) : (
          <div key={i} style={{ fontSize: 120, fontWeight: 700, color: C.text, lineHeight: "190px", transform: `scale(${eq})` }}>=</div>
        ))}
      </div>

      {/* locked → unlocked script */}
      <At x={960} y={760} style={{ opacity: card, transform: `translate(-50%, -50%) translateY(${(1 - card) * 70}px) translateX(${shake}px)` }}>
        <div style={{
          width: 860, height: 130, borderRadius: 30, background: cardBg, display: "flex", alignItems: "center", gap: 28,
          padding: "0 36px", boxSizing: "border-box",
          boxShadow: `inset 0 0 0 1.5px ${open ? `rgba(163,142,227,${0.3 + 0.5 * glow})` : C.border}, 0 24px 60px rgba(0,0,0,0.4), 0 0 ${80 * glow}px rgba(163,142,227,${0.35 * glow})`,
        }}>
          <div style={{ position: "relative", width: 80, height: 80 }}>
            {SPARKS.map((sp, i) => (
              <div key={i} style={{
                position: "absolute", left: 40 + Math.cos(sp.a) * sp.d * burst - 5, top: 40 + Math.sin(sp.a) * sp.d * burst - 5,
                width: 10, height: 10, borderRadius: "50%", background: i % 3 ? C.purple : "#fff",
                opacity: burst > 0 && burst < 1 ? 1 - burst : 0, transform: `scale(${1 - burst * 0.6})`,
              }} />
            ))}
            <div style={{
              position: "absolute", inset: 0, borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center",
              background: open ? `linear-gradient(160deg, #b7a6ee, ${C.purpleDeep})` : "rgba(255,255,255,0.06)",
              transform: open ? `scale(${0.6 + 0.4 * flip}) rotate(${(1 - flip) * -30}deg)` : undefined,
            }}>
              <Icon name={open ? "unlock" : "lock"} size={44} color={open ? "#fff" : "#9a9aa0"} />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 36, fontWeight: 600, color: C.white }}>Auto Farm Hub</div>
            <div style={{ fontSize: 24, fontWeight: 500, color: open ? C.purple : C.text }}>
              {open ? "Unlocked · yours forever" : "Locked · 1 credit"}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, opacity: open ? flip : 0, transform: `scale(${open ? flip : 0})` }}>
            <Icon name="check-circle" size={54} color={C.purple} />
          </div>
        </div>
      </At>
    </Abs>
  );
};
