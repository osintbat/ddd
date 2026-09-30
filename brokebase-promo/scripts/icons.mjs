// Extracts the filled icons used by the video into src/icons.json.
// UI icons: reicon (Iconify, "-filled" variants). Brand glyphs: Simple Icons.
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import * as si from "simple-icons";

const require = createRequire(import.meta.url);
const reicon = JSON.parse(readFileSync(require.resolve("@iconify-json/reicon/icons.json"), "utf8"));

const REICON = [
  "filter", "flame", "trend-up", "cpu-bolt", "code-circle", "gamepad", "profile-2user", "chart", "chart-bar",
  "close-circle", "shield-check", "key", "search", "lock", "unlock", "heart", "coin", "coins", "wallet", "crown",
  "gift", "star", "bolt", "rocket", "library", "puzzle", "cloud", "terminal-square", "copy", "check-circle",
  "sparkles", "magic-star", "diamonds", "home", "setting", "user", "calendar-check", "bookmark", "document-code",
  "download", "bell", "folder", "cards", "play-circle",
];
const BRANDS = { roblox: si.siRoblox, lua: si.siLua, discord: si.siDiscord };

const out = {};
for (const name of REICON) {
  const icon = reicon.icons[`${name}-filled`];
  if (!icon) throw new Error(`missing reicon ${name}-filled`);
  out[name] = { w: icon.width ?? reicon.width ?? 24, h: icon.height ?? reicon.height ?? 24, body: icon.body };
}
for (const [name, icon] of Object.entries(BRANDS)) {
  out[name] = { w: 24, h: 24, body: `<path fill="currentColor" d="${icon.path}"/>` };
}
writeFileSync(new URL("../src/icons.json", import.meta.url), JSON.stringify(out, null, 1));
console.log(`wrote ${Object.keys(out).length} icons`);
