import React from "react";
import { Composition } from "remotion";
import { PoolBuildVideo } from "./compositions/PoolBuildVideo";
import { poolBuildTimeline } from "./director/poolBuildTimeline";

export const RemotionRoot: React.FC = () => {
  const t = poolBuildTimeline;
  return (
    <>
      <Composition
        id="PoolBuild"
        component={PoolBuildVideo}
        durationInFrames={t.durationInFrames}
        fps={t.fps}
        width={t.composition.width}
        height={t.composition.height}
        defaultProps={{ timeline: t }}
      />
    </>
  );
};
