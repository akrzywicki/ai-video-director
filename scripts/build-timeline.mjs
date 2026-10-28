#!/usr/bin/env node
/**
 * Builds content/pool-build/timeline.json from word-timestamps.json + beat definitions.
 * Run: node scripts/build-timeline.mjs
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const wordsPath = path.join(root, "content/pool-build/word-timestamps.json");
const outPath = path.join(root, "content/pool-build/timeline.json");

const FPS = 30;
const DURATION_SECONDS = 25;
const durationInFrames = FPS * DURATION_SECONDS;

const raw = JSON.parse(fs.readFileSync(wordsPath, "utf8"));

const words = raw.words.map((w) => {
  const startFrame = Math.round(w.start * FPS);
  const endFrame = Math.max(startFrame + 1, Math.round(w.end * FPS) - 1);
  return {
    text: w.word,
    startFrame,
    endFrame,
    ...(w.emphasis ? { color: w.emphasis } : {}),
  };
});

const lastWordEnd = words[words.length - 1]?.endFrame ?? 0;

const events = [
  {
    id: "hook-yard",
    kind: "yard",
    startFrame: 0,
    endFrame: durationInFrames,
  },
  {
    id: "excavate",
    kind: "excavate",
    startFrame: Math.round(0.58 * FPS),
    endFrame: Math.round(2.0 * FPS),
  },
  {
    id: "rebar",
    kind: "rebar",
    startFrame: Math.round(1.95 * FPS),
    endFrame: Math.round(3.4 * FPS),
  },
  {
    id: "concrete",
    kind: "concrete",
    startFrame: Math.round(2.55 * FPS),
    endFrame: Math.round(4.2 * FPS),
  },
  {
    id: "pipes",
    kind: "pipes",
    startFrame: Math.round(3.35 * FPS),
    endFrame: Math.round(5.0 * FPS),
  },
  {
    id: "water",
    kind: "water",
    startFrame: Math.round(4.05 * FPS),
    endFrame: Math.round(6.5 * FPS),
  },
  {
    id: "flow",
    kind: "flow",
    startFrame: Math.round(4.65 * FPS),
    endFrame: durationInFrames,
  },
];

const timeline = {
  id: "pool-build",
  title: "How a backyard pool gets built",
  fps: FPS,
  durationInFrames,
  composition: {
    width: 1080,
    height: 1920,
  },
  audio: {
    src: "voiceover-silent.mp3",
    optional: true,
  },
  words,
  events,
  meta: {
    lastWordEndFrame: lastWordEnd,
    scriptPath: "content/pool-build/script.md",
  },
};

fs.writeFileSync(outPath, `${JSON.stringify(timeline, null, 2)}\n`);
console.log(`Wrote ${outPath} (${durationInFrames} frames @ ${FPS}fps)`);
