import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { MotionBlurFrame } from "./MotionBlur";
import "./fonts";

/** Frame n is evaluated at t = n / fps (animation is defined in seconds). */
export const Clip: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <MotionBlurFrame t={frame / fps} />
      <Audio src={staticFile("soundtrack.wav")} />
    </AbsoluteFill>
  );
};
