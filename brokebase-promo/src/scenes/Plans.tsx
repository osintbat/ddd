import React from "react";
import { Abs, C, Icon, IconName, WordsIn, exitStyle, glass, pop, tw } from "../lib";

// 12.05 → 14.55 s: the four credit packs from the Plans page pop in as glass cards; Pro lifts.

const PLANS: Array<{ name: string; icon: IconName; price: string; unit: string; credits: string; badge?: string; hot?: boolean }> = [
  { name: "Daily", icon: "gift", price: "Free", unit: "every day", credits: "1 credit / 24h" },
  { name: "Starter", icon: "bolt", price: "$1.99", unit: "one-time", credits: "10 credits" },
  { name: "Pro", icon: "rocket", price: "$4.99", unit: "one-time", credits: "30 credits +5", badge: "Most popular", hot: true },
  { name: "Ultra", icon: "crown", price: "$9.99", unit: "one-time", credits: "70 credits +15", badge: "Best value" },
];
const W = 360, H = 430, GAP = 34;

export const Plans: React.FC<{ t: number; dur: number }> = ({ t, dur }) => {
  const x0 = 960 - (PLANS.length * W + (PLANS.length - 1) * GAP) / 2;
  const lift = tw(t, 1.1, 1.5, "inOut");
  return (
    <Abs style={exitStyle(t, dur)}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 150 }}>
        <WordsIn t={t} delay={0.05} text="Pick a pack. Keep it forever." highlight={{ "forever.": C.purple }}
          style={{ fontSize: 64, fontWeight: 700, color: C.white }} />
      </div>
      {PLANS.map((p, i) => {
        const s = pop(t, 0.2 + i * 0.1, 13, 160);
        const up = p.hot ? lift : 0;
        const bs = pop(t, 0.6 + i * 0.1);
        return (
          <React.Fragment key={p.name}>
            <div style={{
              ...glass(p.hot ? 0.07 + 0.04 * up : 0.06), position: "absolute", left: x0 + i * (W + GAP), top: 330 - up * 26,
              width: W, height: H, borderRadius: 40, padding: 34, boxSizing: "border-box", display: "flex", flexDirection: "column",
              opacity: Math.min(1, s * 1.4), transform: `translateY(${(1 - s) * 120}px) scale(${(0.85 + 0.15 * s) * (1 + up * 0.04)})`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <div style={{ ...glass(0.08), width: 70, height: 70, borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name={p.icon} size={38} color={C.purple} />
                </div>
                <div style={{ fontSize: 34, fontWeight: 600, color: C.white }}>{p.name}</div>
              </div>
              <div style={{ marginTop: 40, display: "flex", alignItems: "baseline", gap: 12 }}>
                <div style={{ fontSize: 62, fontWeight: 700, color: C.white, letterSpacing: "-0.01em" }}>{p.price}</div>
                <div style={{ fontSize: 21, fontWeight: 500, color: "#8e8e94", whiteSpace: "nowrap" }}>{p.unit}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14, fontSize: 25, fontWeight: 600, color: "#cfcfd4" }}>
                <Icon name="coins" size={28} color={C.purple} />{p.credits}
              </div>
              <div style={{ flex: 1 }} />
              <div style={{
                ...glass(p.hot ? 0.14 : 0.07), height: 70, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center",
                gap: 12, fontSize: 25, fontWeight: 600, color: p.hot ? C.white : "#cfcfd4",
              }}>
                {p.hot && <Icon name="rocket" size={26} color={C.purple} />}
                {p.price === "Free" ? "Claim free credit" : `Get ${p.name}`}
              </div>
            </div>
            {p.badge && (
              <div style={{
                ...glass(0.1), position: "absolute", left: x0 + i * (W + GAP) + W / 2, top: 330 - up * 26 - 24,
                transform: `translateX(-50%) scale(${bs})`, opacity: Math.min(1, bs * 1.4),
                display: "flex", alignItems: "center", gap: 8, height: 46, padding: "0 20px", borderRadius: 999, whiteSpace: "nowrap",
                fontSize: 19, fontWeight: 600, color: C.white,
              }}>
                <Icon name={p.hot ? "sparkles" : "diamonds"} size={20} color={C.purple} />{p.badge}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </Abs>
  );
};
