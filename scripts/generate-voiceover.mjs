#!/usr/bin/env node
/**
 * Optional voiceover generation (skipped without ELEVENLABS_API_KEY).
 * Writes public/voiceover.mp3 and reminds you to re-run Whisper + build-timeline.
 */
import fs from "node:fs";
import path from "node:path";

const key = process.env.ELEVENLABS_API_KEY;
const voiceId = process.env.ELEVENLABS_VOICE_ID ?? "21m00Tcm4TlvDq8ikWAM";
const root = path.resolve(import.meta.dirname, "..");
const scriptPath = path.join(root, "content/pool-build/script.md");
const outPath = path.join(root, "public/voiceover.mp3");

if (!key) {
  console.log("ELEVENLABS_API_KEY not set — skipping TTS (offline render uses captions-only).");
  process.exit(0);
}

const script = fs.readFileSync(scriptPath, "utf8");
const match = script.match(/>\s*(.+)/);
const text = match?.[1]?.trim();
if (!text) {
  console.error("Could not extract narration from content/pool-build/script.md");
  process.exit(1);
}

const res = await fetch(
  `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
  {
    method: "POST",
    headers: {
      "xi-api-key": key,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
    }),
  },
);

if (!res.ok) {
  console.error("ElevenLabs error", res.status, await res.text());
  process.exit(1);
}

const buf = Buffer.from(await res.arrayBuffer());
fs.writeFileSync(outPath, buf);
console.log(`Wrote ${outPath}. Next: npm run pipeline:timestamps`);
