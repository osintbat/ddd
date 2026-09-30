import React from "react";
import { Abs, C, Icon, IconName, mixHex, pop, tw } from "../lib";

// 0 → 2.45 s: a sheet of filled icons (like an icon-set preview) pops in, a purple wave
// sweeps across it, then every icon is pulled into the centre where the logo appears.

const GRID: IconName[][] = [
  ["filter", "flame", "trend-up", "cpu-bolt", "code-circle", "gamepad", "search"],
  ["profile-2user", "chart", "chart-bar", "roblox", "shield-check", "key", "lock"],
  ["heart", "coins", "wallet", "crown", "gift", "rocket", "library"],
];
const CELL_W = 236, CELL_H = 250, ICON = 112;
const COLS = GRID[0].length, ROWS = GRID.length;
const X0 = 960 - ((COLS - 1) * CELL_W) / 2, Y0 = 540 - ((ROWS - 1) * CELL_H) / 2 - 18;

export const IconWall: React.FC<{ t: number; dur: number }> = ({ t }) => {
  const pull = tw(t, 1.72, 2.3, "in");
  const labelFade = 1 - tw(t, 1.55, 1.8);
  return (
    <Abs>
      {GRID.map((row, r) => row.map((name, c) => {
        const d = (c + r) * 0.045;
        const s = pop(t, 0.05 + d, 11, 190);
        // purple wave travelling along the diagonal
        const wave = Math.max(0, 1 - Math.abs(t - (0.95 + (c + r) * 0.07)) / 0.18);
        const x = X0 + c * CELL_W, y = Y0 + r * CELL_H;
        const cx = x + (960 - x) * pull, cy = y + (540 - y) * pull;
        const brand = name === "roblox";
        return (
          <div key={`${r}-${c}`} style={{
            position: "absolute", left: cx, top: cy, width: 0, height: 0,
            opacity: 1 - tw(t, 2.1, 2.32),
          }}>
            <div style={{
              position: "absolute", transform: `translate(-50%, -50%) scale(${s * (1 - 0.75 * pull)}) rotate(${(1 - s) * -20 + pull * 90}deg)`,
              filter: pull > 0 ? `blur(${pull * 8}px)` : undefined,
            }}>
              <Icon name={name} size={brand ? ICON * 0.86 : ICON} color={mixHex("#78787c", C.purple, wave)} />
            </div>
            <div style={{
              position: "absolute", top: ICON / 2 + 30, left: 0, transform: "translateX(-50%)", whiteSpace: "nowrap",
              fontSize: 17, fontWeight: 500, color: "#6a6a70", opacity: tw(t, 0.25 + d, 0.6 + d) * labelFade,
            }}>{brand ? "simple-icons:roblox" : `reicon:${name}-filled`}</div>
          </div>
        );
      }))}
    </Abs>
  );
};
