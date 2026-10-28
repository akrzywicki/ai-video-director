import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { PopCaptions } from "../components/PopCaptions";
import type { Timeline } from "../director/types";
import { PoolThreeCanvas } from "../scene/PoolScene3D";

type PoolBuildVideoProps = {
  timeline: Timeline;
};

export const PoolBuildVideo: React.FC<PoolBuildVideoProps> = ({ timeline }) => {
  const frame = useCurrentFrame();
  const { width, height } = timeline.composition;

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #9fd3ff 0%, #87b7ff 45%, #6aa86a 100%)",
      }}
    >
      <PoolThreeCanvas
        width={width}
        height={height}
        frame={frame}
        events={timeline.events}
      />
      <PopCaptions words={timeline.words} />
      {timeline.audio && !timeline.audio.optional ? (
        <Audio src={staticFile(timeline.audio.src)} />
      ) : null}
    </AbsoluteFill>
  );
};
