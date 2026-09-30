// Renders review frames of the promo to out/checkpoints/*.png.
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

const TIMES = [0.6, 1.2, 1.9, 3.8, 5.0, 6.5, 8.0, 9.2, 10.4, 11.6, 13.5, 15.0, 16.2, 17.0];
const only = process.argv.slice(2).map(Number);
const times = only.length ? only : TIMES;

const browserExecutable = process.env.REMOTION_BROWSER ?? null;
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id: "BrokebasePromo", browserExecutable });
for (const t of times) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(t * 60));
  const output = path.resolve(`out/checkpoints/t${t.toFixed(3)}.png`);
  await renderStill({ serveUrl, composition, frame, output, browserExecutable });
  console.log("rendered", t, "->", output);
}
