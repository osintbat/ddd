import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import { continueRender, delayRender } from "remotion";

const handle = delayRender("Loading Poppins");
Promise.all(["500", "600", "700"].map((w) => document.fonts.load(`${w} 40px "Poppins"`, "brokebase.com $1.99")))
  .then(() => document.fonts.ready)
  .then(() => continueRender(handle))
  .catch(() => continueRender(handle));
