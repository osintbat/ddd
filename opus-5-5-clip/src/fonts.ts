import "@fontsource/roboto/400.css";
import "@fontsource/inter/400.css";
import { continueRender, delayRender } from "remotion";

// Block rendering until Roboto 400 and Inter 400 are loaded (all positions depend on their metrics).
const handle = delayRender("Loading Roboto + Inter");
Promise.all([
  document.fonts.load('400 61px "Roboto"', "Hey Claude, can you help Show me what Opus 5.5 TRY CLAUDE"),
  document.fonts.load('400 66px "Inter"', "Anthropic"),
])
  .then(() => document.fonts.ready)
  .then(() => continueRender(handle))
  .catch((err) => {
    console.error(err);
    continueRender(handle);
  });
