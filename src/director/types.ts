export type WordCue = {
  text: string;
  startFrame: number;
  endFrame: number;
  color?: string;
};

export type SceneEventKind =
  | "yard"
  | "excavate"
  | "rebar"
  | "concrete"
  | "pipes"
  | "water"
  | "flow";

export type SceneEvent = {
  id: string;
  kind: SceneEventKind;
  startFrame: number;
  endFrame: number;
};

export type Timeline = {
  id: string;
  title: string;
  fps: number;
  durationInFrames: number;
  composition: {
    width: number;
    height: number;
  };
  audio?: {
    src: string;
    optional?: boolean;
  };
  words: WordCue[];
  events: SceneEvent[];
  meta?: Record<string, unknown>;
};
