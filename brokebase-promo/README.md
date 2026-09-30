# brokebase.com — promo video

Remotion promo for brokebase.com (1920 × 1080, 60 fps, 17.5 s, with an original soundtrack).
It uses a modern glassmorphism look (translucent panels, backdrop blur, no borders, outlines or glows) on the site's palette (#131119 background, #a38ee3 purple, Poppins, "BROKEBASE" watermark,
ScriptBlox / Rscripts cards) and filled SVG icons: **reicon** (`*-filled`, via Iconify) for the UI and
**Simple Icons** for brand glyphs (Roblox).

| Time (s) | Scene |
|---|---|
| 0 – 2.45 | Icon wall pops in, purple wave, everything collapses into the centre |
| 2.15 – 4.6 | Logo + `brokebase.com` wordmark, "Every Roblox script. One place." |
| 4.45 – 7.05 | ScriptBlox + Rscripts cards wired to one search |
| 6.95 – 9.7 | Search bar types "auto farm", results cascade in |
| 9.6 – 12.15 | 1 credit = 1 script, a locked script unlocks |
| 12.05 – 14.55 | Plans: Daily / Starter / Pro / Ultra |
| 14.45 – 17.5 | Feature icons orbit the logo, CTA "Claim your free credit" |

```bash
npm install
npm run icons    # re-extract the used icons into src/icons.json
npm run audio    # synthesise public/soundtrack.wav
npm run studio   # preview
npm run render   # out/brokebase-promo.mp4
node scripts/checkpoints.mjs [t …]   # review stills in out/checkpoints/
```

Headless rendering: set `REMOTION_BROWSER=/path/to/headless_shell`.
