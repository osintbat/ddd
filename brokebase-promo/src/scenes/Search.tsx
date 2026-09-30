import React from "react";
import { Abs, C, Icon, IconName, btnBg, cardBg, exitStyle, pop, tw } from "../lib";

// 6.95 → 9.7 s: the site's search pill types a query, the search button is pressed,
// and results cascade in (source, tags, price in credits).

const QUERY = "auto farm";
const RESULTS: Array<{ icon: IconName; title: string; src: string; views: string; tags: Array<[IconName, string]> }> = [
  { icon: "gamepad", title: "Auto Farm Hub", src: "ScriptBlox", views: "48.2k", tags: [["key", "Keyless"], ["shield-check", "Verified"]] },
  { icon: "rocket", title: "Auto Farm + Fly GUI", src: "Rscripts", views: "21.7k", tags: [["key", "Keyless"], ["cpu-bolt", "Mobile"]] },
  { icon: "terminal-square", title: "Auto Farm Lite", src: "ScriptBlox", views: "9.9k", tags: [["shield-check", "Verified"], ["flame", "Trending"]] },
];

const BAR_W = 1000, TOP = 320;

export const Search: React.FC<{ t: number; dur: number }> = ({ t, dur }) => {
  const bar = pop(t, 0.05, 15, 150);
  const typed = QUERY.slice(0, Math.floor(Math.max(0, (t - 0.45) / 0.075)));
  const press = t > 1.3 && t < 1.55 ? 1 - Math.sin(((t - 1.3) / 0.25) * Math.PI) * 0.12 : 1;
  const ripple = tw(t, 1.35, 1.9);
  const focus = tw(t, 0.3, 0.6);
  return (
    <Abs style={exitStyle(t, dur)}>
      {/* search pill + filter button, as on the site */}
      <div style={{
        position: "absolute", left: 960 - BAR_W / 2 - 60, top: TOP, display: "flex", gap: 22, alignItems: "center",
        opacity: bar, transform: `translateY(${(1 - bar) * 60}px) scale(${0.9 + 0.1 * bar})`,
      }}>
        <div style={{
          width: BAR_W, height: 104, borderRadius: 999, background: C.glass, display: "flex", alignItems: "center",
          padding: "0 16px 0 44px", boxSizing: "border-box",
          boxShadow: `0 16px 50px rgba(0,0,0,0.4), inset 0 0 0 ${1.5 + focus}px rgba(163,142,227,${0.35 * focus})`,
        }}>
          <div style={{ flex: 1, fontSize: 40, fontWeight: 500, color: typed ? C.white : "#8e8e94", whiteSpace: "pre" }}>
            {typed || "Search scripts…"}
            {t > 0.3 && t < 1.35 && (
              <span style={{ display: "inline-block", width: 3, height: 44, marginLeft: 4, verticalAlign: "-6px",
                background: C.purple, opacity: Math.floor(t * 3.2) % 2 === 0 || typed.length < QUERY.length ? 1 : 0 }} />
            )}
          </div>
          <div style={{ position: "relative", width: 76, height: 76 }}>
            <div style={{
              position: "absolute", inset: 0, borderRadius: "50%", transform: `scale(${1 + ripple * 1.2})`,
              border: `3px solid rgba(163,142,227,${0.6 * (1 - ripple)})`, opacity: ripple > 0 ? 1 : 0,
            }} />
            <div style={{
              position: "absolute", inset: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              background: t > 1.3 ? `linear-gradient(160deg, #b7a6ee, ${C.purpleDeep})` : btnBg, transform: `scale(${press})`,
            }}>
              <Icon name="search" size={40} color={t > 1.3 ? "#fff" : "#bdbdc2"} />
            </div>
          </div>
        </div>
        <div style={{ width: 96, height: 96, borderRadius: "50%", background: C.glass, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="filter" size={42} color="#bdbdc2" />
        </div>
      </div>

      {RESULTS.map((r, i) => {
        const p = pop(t, 1.55 + i * 0.12, 15, 160);
        return (
          <div key={r.title} style={{
            position: "absolute", left: 960 - 560, top: TOP + 160 + i * 138, width: 1120, height: 118, borderRadius: 26,
            background: cardBg, boxShadow: `inset 0 0 0 1.5px ${C.border}, 0 20px 50px rgba(0,0,0,0.35)`,
            display: "flex", alignItems: "center", gap: 28, padding: "0 34px", boxSizing: "border-box",
            opacity: p, transform: `translateY(${(1 - p) * 80}px) scale(${0.94 + 0.06 * p})`,
          }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: "rgba(163,142,227,0.14)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name={r.icon} size={40} color={C.purple} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 34, fontWeight: 600, color: C.white }}>{r.title}</div>
              <div style={{ fontSize: 22, fontWeight: 500, color: C.text, marginTop: 2 }}>{r.src} · {r.views} views</div>
            </div>
            {r.tags.map(([ic, label]) => (
              <div key={label} style={{
                display: "flex", alignItems: "center", gap: 10, height: 50, padding: "0 20px", borderRadius: 999,
                background: "rgba(255,255,255,0.05)", fontSize: 22, fontWeight: 600, color: "#bdbdc2",
              }}>
                <Icon name={ic} size={24} color={C.purple} />{label}
              </div>
            ))}
            <div style={{
              display: "flex", alignItems: "center", gap: 10, height: 58, padding: "0 24px", borderRadius: 999,
              background: btnBg, fontSize: 26, fontWeight: 700, color: C.purple, marginLeft: 8,
            }}>
              <Icon name="coins" size={30} color={C.purple} />1
            </div>
          </div>
        );
      })}
    </Abs>
  );
};
