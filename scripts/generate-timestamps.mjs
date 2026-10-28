#!/usr/bin/env node
/**
 * Optional Whisper word timestamps (skipped without OPENAI_API_KEY).
 * Expects public/voiceover.mp3 (or path in VOICOVER_PATH env).
 */
import fs from "node:fs";
import path from "node:path";

const key = process.env.OPENAI_API_KEY;
const root = path.resolve(import.meta.dirname, "..");
const audioPath =
  process.env.VOICEOVER_PATH ?? path.join(root, "public/voiceover.mp3");
const outPath = path.join(root, "content/pool-build/word-timestamps.json");

if (!key) {
  console.log("OPENAI_API_KEY not set — keeping bundled word-timestamps.json.");
  process.exit(0);
}

if (!fs.existsSync(audioPath)) {
  console.error(`Missing audio at ${audioPath}. Run npm run pipeline:voice first.`);
  process.exit(1);
}

const form = new FormData();
form.append("file", new Blob([fs.readFileSync(audioPath)]), "voiceover.mp3");
form.append("model", "whisper-1");
form.append("response_format", "verbose_json");
form.append("timestamp_granularities[]", "word");

const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
  method: "POST",
  headers: { Authorization: `Bearer ${key}` },
  body: form,
});

if (!res.ok) {
  console.error("Whisper error", res.status, await res.text());
  process.exit(1);
}

const json = await res.json();
const words = (json.words ?? []).map((w) => ({
  word: w.word.trim(),
  start: w.start,
  end: w.end,
}));

const payload = {
  text: json.text?.trim() ?? "",
  language: json.language ?? "en",
  durationSeconds: words.at(-1)?.end ?? 0,
  words,
};

fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Wrote ${outPath}. Next: node scripts/build-timeline.mjs`);
