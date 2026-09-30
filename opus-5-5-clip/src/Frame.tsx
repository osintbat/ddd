import React from "react";
import { S1Lights, S1Elements } from "./scenes/S1Prompt";
import { S2Lights, S2Elements, CUT1 } from "./scenes/S2Segmented";
import { S3Lights, S3Elements, CUT2 } from "./scenes/S3Neon";
import { S4Lights, S4Elements } from "./scenes/S4Ball";
import { S5Lights, S5Elements } from "./scenes/S5Words";
import { S6Lights, S6Elements } from "./scenes/S6Like";
import { S7Elements, CUT3 } from "./scenes/S7Signature";

export const DURATION = 14.1333;
export const CUTS = [CUT1, CUT2, CUT3];

/** One fully rendered image of the clip at time t (seconds). Layer order per §1.4. */
export const Frame: React.FC<{ t: number }> = ({ t }) => (
  <div style={{
    position: "absolute", inset: 0, overflow: "hidden",
    background: t < CUT3 ? "#19171a" : "#000000",
    fontFamily: "Roboto, 'Helvetica Neue', Arial, sans-serif", fontWeight: 400,
    fontKerning: "normal", letterSpacing: 0,
  }}>
    <S1Lights t={t} />
    <S2Lights t={t} />
    <S3Lights t={t} />
    <S4Lights t={t} />
    <S5Lights t={t} />
    <S6Lights t={t} />
    <S1Elements t={t} />
    <S2Elements t={t} />
    <S3Elements t={t} />
    <S4Elements t={t} />
    <S5Elements t={t} />
    <S6Elements t={t} />
    <S7Elements t={t} />
  </div>
);
