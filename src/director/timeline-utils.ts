import type { SceneEvent, SceneEventKind } from "./types";

export const eventProgress = (frame: number, event: SceneEvent): number => {
  if (frame < event.startFrame) {
    return 0;
  }
  if (frame >= event.endFrame) {
    return 1;
  }
  const span = event.endFrame - event.startFrame;
  if (span <= 0) {
    return 1;
  }
  return (frame - event.startFrame) / span;
};

export const findEvent = (
  events: SceneEvent[],
  kind: SceneEventKind,
): SceneEvent | undefined => {
  return events.find((e) => e.kind === kind);
};

export const activeWord = (
  words: { text: string; startFrame: number; endFrame: number; color?: string }[],
  frame: number,
) => {
  return words.find((w) => frame >= w.startFrame && frame <= w.endFrame);
};
