import React from "react";
import { Composition } from "remotion";
import { Clip } from "./Clip";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="OpusClip" component={Clip} width={1920} height={1080} fps={60} durationInFrames={848} />
    <Composition id="OpusClip30" component={Clip} width={1920} height={1080} fps={30} durationInFrames={424} />
  </>
);
