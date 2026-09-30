// Renders the §6 verification frames (60 fps master) to out/checkpoints/*.png.
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

const TIMES = [0, 0.2, 0.5, 0.767, 1.1, 1.7, 2.1, 2.6, 3.0, 3.3, 3.6, 4.4, 4.6, 5.0, 5.5, 5.833, 6.3,
  6.6, 6.9, 7.3, 8.0, 8.667, 9.5, 10.1, 11.6, 11.75, 12.1, 12.9, 14.1];
const only = process.argv.slice(2).map(Number);
const times = only.length ? only : TIMES;

const browserExecutable = process.env.REMOTION_BROWSER ?? null;
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id: "OpusClip", browserExecutable });
for (const t of times) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(t * 60));
  const output = path.resolve(`out/checkpoints/t${t.toFixed(3)}.png`);
  await renderStill({ serveUrl, composition, frame, output, browserExecutable });
  console.log("rendered", t, "->", output);
}
