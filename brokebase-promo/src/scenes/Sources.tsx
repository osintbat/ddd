import React from "react";
import { Abs, At, C, Icon, IconName, WordsIn, cardBg, exitStyle, lerp, pop, tw } from "../lib";

// 4.45 → 7.05 s: the site's two source cards (ScriptBlox, Rscripts) fly in, then a search
// hub pops between them and wires both together: "two libraries, one search".

const W = 600 * 1.3, H = 166 * 1.3;

/** Replica of the site card: gradient, border, watermark rows, title and a big rotated icon. */
const SourceCard: React.FC<{ title: string; mark: string; icon: IconName; lit: number }> = ({ title, mark, icon, lit }) => (
  <div style={{
    position: "relative", width: W, height: H, borderRadius: 20, overflow: "hidden", background: cardBg,
    boxShadow: `inset 0 0 0 1.5px ${lit > 0 ? `rgba(163,142,227,${0.25 + 0.45 * lit})` : C.border}, 0 30px 80px rgba(0,0,0,0.45)${lit > 0 ? `, 0 0 ${60 * lit}px rgba(163,142,227,${0.25 * lit})` : ""}`,
  }}>
    <div style={{ position: "absolute", left: -120, top: -170, width: W + 300, transform: "rotate(-22deg)" }}>
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} style={{
          fontSize: 44, fontWeight: 700, lineHeight: "56px", whiteSpace: "nowrap", color: "rgba(120,120,124,0.08)",
          marginLeft: (i % 2) * -60,
        }}>{`${mark} `.repeat(6)}</div>
      ))}
    </div>
    <div style={{ position: "absolute", left: 40, top: 0, height: H, display: "flex", alignItems: "center", fontSize: 46, fontWeight: 600, color: "#9a9aa0" }}>
      {title}
    </div>
    <div style={{ position: "absolute", right: -30, bottom: -70, transform: "rotate(45deg)" }}>
      <Icon name={icon} size={250} color={lit > 0 ? `rgba(163,142,227,${0.25 + 0.3 * lit})` : C.icon} />
    </div>
  </div>
);

export const Sources: React.FC<{ t: number; dur: number }> = ({ t, dur }) => {
  const l = pop(t, 0.1, 14, 140), r = pop(t, 0.22, 14, 140);
  const spread = tw(t, 1.0, 1.45, "inOut");
  const hub = pop(t, 1.25, 10, 190);
  const wire = tw(t, 1.35, 1.8);
  const lit = tw(t, 1.7, 2.0);
  const ly = lerp(560, 600, spread);
  const lx = lerp(960 - W / 2 - 14, 960 - W / 2 - 150, spread), rx = lerp(960 + W / 2 + 14, 960 + W / 2 + 150, spread);
  return (
    <Abs style={exitStyle(t, dur)}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 250 }}>
        <WordsIn t={t} delay={0.25} text="Two libraries. One search." highlight={{ "One": C.purple, "search.": C.purple }}
          style={{ fontSize: 64, fontWeight: 700, color: C.white }} />
      </div>
      {/* wires from the hub to both cards */}
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        {[-1, 1].map((side) => {
          const x1 = 960 + side * 70, x2 = 960 + side * 150;
          return (
            <line key={side} x1={x1} y1={ly} x2={lerp(x1, x2, wire)} y2={ly} stroke={C.purple} strokeWidth={4}
              strokeLinecap="round" opacity={wire > 0 ? 0.9 : 0} />
          );
        })}
      </svg>
      <At x={lx - (1 - l) * 900} y={ly} style={{ opacity: l, transform: `translate(-50%, -50%) rotate(${(1 - l) * -8}deg)` }}>
        <SourceCard title="ScriptBlox" mark="SCRIPTBLOX" icon="cloud" lit={lit} />
      </At>
      <At x={rx + (1 - r) * 900} y={ly} style={{ opacity: r, transform: `translate(-50%, -50%) rotate(${(1 - r) * 8}deg)` }}>
        <SourceCard title="Rscripts" mark="RSCRIPTS" icon="puzzle" lit={lit} />
      </At>
      <At x={960} y={ly}>
        <div style={{
          width: 128, height: 128, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
          background: `linear-gradient(160deg, #b7a6ee, ${C.purpleDeep})`, transform: `scale(${hub})`,
          boxShadow: `0 0 0 ${10 + 14 * lit}px rgba(163,142,227,${0.12 * hub}), 0 18px 50px rgba(109,91,184,0.55)`,
        }}>
          <Icon name="search" size={62} color="#ffffff" />
        </div>
      </At>
    </Abs>
  );
};
