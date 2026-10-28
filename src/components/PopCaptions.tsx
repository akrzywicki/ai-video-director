import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { WordCue } from "../director/types";
import { activeWord } from "../director/timeline-utils";

type PopCaptionsProps = {
  words: WordCue[];
};

export const PopCaptions: React.FC<PopCaptionsProps> = ({ words }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cue = activeWord(words, frame);

  if (!cue) {
    return null;
  }

  const localFrame = frame - cue.startFrame;
  const pop = spring({
    frame: localFrame,
    fps,
    config: { damping: 14, stiffness: 220, mass: 0.35 },
  });
  const scale = interpolate(pop, [0, 1], [0.8, 1]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 220,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          fontFamily:
            'Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          fontWeight: 900,
          fontSize: 92,
          letterSpacing: -1,
          color: cue.color ?? "#ffffff",
          textAlign: "center",
          textTransform: "none",
          WebkitTextStroke: "6px #000000",
          paintOrder: "stroke fill",
          textShadow:
            "0 6px 0 rgba(0,0,0,0.55), 0 10px 28px rgba(0,0,0,0.45)",
          maxWidth: "92%",
          lineHeight: 1.05,
        }}
      >
        {cue.text}
      </div>
    </AbsoluteFill>
  );
};
