import React from "react";
import { Composition } from "remotion";
import { Promo, DURATION } from "./Promo";

export const RemotionRoot: React.FC = () => (
  <Composition id="BrokebasePromo" component={Promo} width={1920} height={1080} fps={60}
    durationInFrames={Math.round(DURATION * 60)} />
);
