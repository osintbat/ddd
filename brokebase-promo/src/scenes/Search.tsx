import React from "react";
import { Abs, C, Icon, IconName, exitStyle, glass, pop } from "../lib";

// 6.95 → 9.7 s: a glass search pill types a query, the search button is pressed,
// and glass result rows cascade in (source, tags, price in credits).

const QUERY = "auto farm";
const RESULTS: Array<{ icon: IconName; title: string; src: string; views: string; tags: Array<[IconName, string]> }> = [
  { icon: "gamepad", title: "Auto Farm Hub", src: "ScriptBlox", views: "48.2k", tags: [["key", "Keyless"], ["shield-check", "Verified"]] },
  { icon: "rocket", title: "Auto Farm + Fly GUI", src: "Rscripts", views: "21.7k", tags: [["key", "Keyless"], ["cpu-bolt", "Mobile"]] },
  { icon: "terminal-square", title: "Auto Farm Lite", src: "ScriptBlox", views: "9.9k", tags: [["shield-check", "Verified"], ["flame", "Trending"]] },
];

const BAR_W = 1000, TOP = 320;

const Chip: React.FC<{ icon: IconName; label: string | number; strong?: boolean }> = ({ icon, label, strong }) => (
  <div style={{
    ...glass(strong ? 0.1 : 0.06), display: "flex", alignItems: "center", gap: 10, height: strong ? 58 : 50,
    padding: strong ? "0 24px" : "0 20px", borderRadius: 999, fontSize: strong ? 26 : 22, fontWeight: strong ? 700 : 600,
    color: strong ? C.white : "#c9c9ce",
  }}>
    <Icon name={icon} size={strong ? 30 : 24} color={strong ? C.purple : "#c9c9ce"} />{label}
  </div>
);

export const Search: React.FC<{ t: number; dur: number }> = ({ t, dur }) => {
  const bar = pop(t, 0.05, 15, 150);
  const typed = QUERY.slice(0, Math.floor(Math.max(0, (t - 0.45) / 0.075)));
  const press = t > 1.3 && t < 1.55 ? 1 - Math.sin(((t - 1.3) / 0.25) * Math.PI) * 0.14 : 1;
  const pressed = t > 1.3;
  return (
    <Abs style={exitStyle(t, dur)}>
      {/* search pill + filter button, as on the site */}
      <div style={{
        ...glass(0.07), position: "absolute", left: 960 - BAR_W / 2 - 60, top: TOP, width: BAR_W, height: 104, borderRadius: 999,
        display: "flex", alignItems: "center", padding: "0 14px 0 44px", boxSizing: "border-box",
        opacity: bar, transform: `translateY(${(1 - bar) * 60}px) scale(${0.9 + 0.1 * bar})`,
      }}>
        <div style={{ flex: 1, fontSize: 40, fontWeight: 500, color: typed ? C.white : "#8e8e94", whiteSpace: "pre" }}>
          {typed || "Search scripts…"}
          {t > 0.3 && t < 1.35 && (
            <span style={{ display: "inline-block", width: 3, height: 44, marginLeft: 4, verticalAlign: "-6px",
              background: C.purple, opacity: Math.floor(t * 3.2) % 2 === 0 || typed.length < QUERY.length ? 1 : 0 }} />
          )}
        </div>
        <div style={{
          ...glass(pressed ? 0.16 : 0.08), width: 78, height: 78, borderRadius: "50%", display: "flex", alignItems: "center",
          justifyContent: "center", transform: `scale(${press})`,
        }}>
          <Icon name="search" size={38} color={pressed ? C.purple : "#c9c9ce"} />
        </div>
      </div>
      <div style={{
        ...glass(0.07), position: "absolute", left: 960 + BAR_W / 2 - 60 + 22, top: TOP + 4, width: 96, height: 96, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: bar, transform: `translateY(${(1 - bar) * 60}px) scale(${0.9 + 0.1 * bar})`,
      }}>
        <Icon name="filter" size={42} color="#c9c9ce" />
      </div>

      {RESULTS.map((r, i) => {
        const p = pop(t, 1.55 + i * 0.12, 15, 160);
        return (
          <div key={r.title} style={{
            ...glass(0.06), position: "absolute", left: 960 - 560, top: TOP + 160 + i * 138, width: 1120, height: 118, borderRadius: 34,
            display: "flex", alignItems: "center", gap: 20, padding: "0 26px 0 24px", boxSizing: "border-box",
            opacity: p, transform: `translateY(${(1 - p) * 80}px) scale(${0.94 + 0.06 * p})`,
          }}>
            <div style={{ ...glass(0.08), width: 72, height: 72, borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name={r.icon} size={40} color={C.purple} />
            </div>
            <div style={{ flex: 1, marginLeft: 6 }}>
              <div style={{ fontSize: 34, fontWeight: 600, color: C.white }}>{r.title}</div>
              <div style={{ fontSize: 22, fontWeight: 500, color: "#8e8e94", marginTop: 2 }}>{r.src} · {r.views} views</div>
            </div>
            {r.tags.map(([ic, label]) => <Chip key={label} icon={ic} label={label} />)}
            <Chip icon="coins" label={1} strong />
          </div>
        );
      })}
    </Abs>
  );
};
