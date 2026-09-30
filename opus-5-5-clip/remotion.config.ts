import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("png");
Config.setPixelFormat("yuv420p");
Config.setCodec("h264");
Config.setCrf(14);
Config.setConcurrency(4);

Config.setEntryPoint("src/index.ts");
Config.setBrowserExecutable(process.env.REMOTION_BROWSER ?? null);
