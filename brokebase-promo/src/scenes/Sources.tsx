import React from "react";
import { Abs, C, Icon, IconName, WordsIn, exitStyle, glass, lerp, pop, tw } from "../lib";

// 4.45 → 7.05 s: the site's two source cards (ScriptBlox, Rscripts) fly in as glass panels,
// then a glass search hub pops between them and wires both together: "two libraries, one search".

const W = 600 * 1.3, H = 166 * 1.3;

/** Glass version of the site card: watermark rows, title and a big rotated icon. No border / glow. */
const SourceCard: React.FC<{
  title: string; mark: string; icon: IconName; lit: number; x: number; y: number; opacity: number; rot: number;
}> = ({ title, mark, icon, lit, x, y, opacity, rot }) => (
  <div style={{
    ...glass(0.065 + 0.035 * lit),
    position: "absolute", left: x - W / 2, top: y - H / 2, width: W, height: H, borderRadius: 36, overflow: "hidden",
    opacity, transform: `rotate(${rot}deg)`,
  }}>
    <div style={{ position: "absolute", left: -120, top: -170, width: W + 300, transform: "rotate(-22deg)" }}>
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} style={{
          fontSize: 44, fontWeight: 700, lineHeight: "56px", whiteSpace: "nowrap", color: "rgba(255,255,255,0.035)",
          marginLeft: (i % 2) * -60,
        }}>{`${mark} `.repeat(6)}</div>
      ))}
    </div>
    <div style={{ position: "absolute", left: 44, top: 0, height: H, display: "flex", alignItems: "center", gap: 18, fontSize: 46, fontWeight: 600, color: C.white }}>
      {title}
    </div>
    <div style={{ position: "absolute", right: -30, bottom: -70, transform: "rotate(45deg)" }}>
      <Icon name={icon} size={250} color={`rgba(${lit > 0 ? "163,142,227" : "255,255,255"},${0.1 + 0.18 * lit})`} />
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
      {/* thin connectors from the hub to both cards */}
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        {[-1, 1].map((side) => {
          const x1 = 960 + side * 70, x2 = 960 + side * 150;
          return (
            <line key={side} x1={x1} y1={ly} x2={lerp(x1, x2, wire)} y2={ly} stroke="rgba(255,255,255,0.18)" strokeWidth={4}
              strokeLinecap="round" opacity={wire > 0 ? 1 : 0} />
          );
        })}
      </svg>
      <SourceCard title="ScriptBlox" mark="SCRIPTBLOX" icon="cloud" lit={lit} x={lx - (1 - l) * 900} y={ly} opacity={l} rot={(1 - l) * -8} />
      <SourceCard title="Rscripts" mark="RSCRIPTS" icon="puzzle" lit={lit} x={rx + (1 - r) * 900} y={ly} opacity={r} rot={(1 - r) * 8} />
      <div style={{
        ...glass(0.12), position: "absolute", left: 960 - 64, top: ly - 64, width: 128, height: 128, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${hub})`,
      }}>
        <Icon name="search" size={60} color={lit > 0 ? C.purple : C.white} />
      </div>
    </Abs>
  );
};
