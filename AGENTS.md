# AI Video Director — agent playbook

This repository teaches **humans and coding agents** (Cursor, Claude Code, Codex, etc.) how to produce short **9:16 explainer videos entirely in code**—not with generative video models.

**Reference inspiration:** [@ErnestoSOFTWARE on X](https://x.com/ErnestoSOFTWARE/status/2114523620026282002) — a fast pool-build vertical with locked isometric cross-section 3D, word-pop captions, and AI voiceover. Do **not** commit the reference MP4 (copyright).

---

## Mental model: you are the director

Default AI edits look bland because the model skips **direction**. Your job:

1. **Study references frame-by-frame** (pause every 1–2s). Write a **shot list**: camera, subject, motion, caption words, sfx (usually none).
2. **Hook-first script** — first sentence earns the swipe-stop; no warm-up.
3. **Beats** — 5–8 visual chapters tied to nouns/verbs in the script.
4. **Timeline** — map each word + beat to **frames** (single source of truth in `content/<topic>/timeline.json`).
5. **Build scene in code** — procedural geometry (Remotion + `@remotion/three`). Pre-rendered Blender is fine for inspiration; this repo proves an agent-friendly **React/Three** path.
6. **Render → inspect frames → iterate** — `npm run render:stills`, fix timing, re-render.

---

## Repo map

| Path | Purpose |
|------|---------|
| `content/<topic>/script.md` | Human-readable hook + beat table |
| `content/<topic>/word-timestamps.json` | Seconds-based word alignment (bundled sample; replace via Whisper) |
| `content/<topic>/timeline.json` | **Canonical** frame timeline: `words[]` + `events[]` |
| `scripts/build-timeline.mjs` | Builds `timeline.json` from word timestamps + beat anchors |
| `scripts/generate-voiceover.mjs` | Optional ElevenLabs TTS (`ELEVENLABS_API_KEY`) |
| `scripts/generate-timestamps.mjs` | Optional Whisper (`OPENAI_API_KEY`) |
| `src/compositions/` | Remotion compositions |
| `src/scene/` | Three.js/R3F scene pieces |
| `src/director/` | Types + timeline helpers |
| `src/components/PopCaptions.tsx` | Bold stroked captions with scale pop |

Example topic: **`pool-build`** → composition id **`PoolBuild`**.

---

## Workflow: topic → finished video

### 1) Pick a topic with visible stages

Good: construction, plumbing, biology process, UI flow.  
Bad: abstract opinions without visual nouns.

### 2) Write the script (spoken, ~20–40s)

- Short sentences. **One idea per line.**
- Prefer concrete verbs: *dig, spray, spin, connect*.
- Read aloud; if you gasp for air, split lines.

Save to `content/<topic>/script.md`. Include a **beat table** (see pool-build).

### 3) Shot list (mandatory)

For each beat, specify:

- **Camera:** locked isometric? slow zoom to detail? (avoid handheld drift)
- **Hero object:** pool shell, pipe, valve, cell membrane, etc.
- **Motion:** what appears, what moves, what draws on (pipes, arrows)
- **Caption words:** 1–2 words on screen; which word gets color emphasis
- **Dead air:** none — extend micro-motion (particles, arrows pulsing) if VO ends early

### 4) Design events (scene graph)

In `timeline.json`, `events[]` entries look like:

```json
{
  "id": "excavate",
  "kind": "excavate",
  "startFrame": 18,
  "endFrame": 60
}
```

Implement `kind` handlers in `src/scene/` (see `BackyardCrossSection.tsx`). Keep kinds **small and reusable** across topics.

### 5) Align words to frames

Offline sample: edit `word-timestamps.json` OR run:

```bash
npm run pipeline:sync   # needs API keys; skips steps when absent
npm run timeline:build  # always safe
```

Remotion reads **`timeline.json` only** at render time (`src/director/poolBuildTimeline.ts`).

### 6) Captions

`PopCaptions.tsx` — white 900-weight, thick black stroke, shadow, ~80%→100% spring pop. Match reference retention style; do not paragraph captions.

### 7) Render & review

```bash
npm install
npm run dev                    # Remotion Studio
npm run render:stills          # PNGs in docs/preview/
npm run render:preview         # first 5s MP4
npm run render:pool            # full composition
```

**Frame review checklist**

- [ ] Caption changes on every word boundary in JSON
- [ ] No event starts before the spoken noun (adjust `startFrame`)
- [ ] Motion continues between words (no frozen 3D)
- [ ] Caption contrast on busy backgrounds (stroke/shadow)
- [ ] 9:16 safe area — captions not under UI chrome if uploading to TikTok/Reels

### 8) New topic recipe

1. Copy `content/pool-build/` → `content/<topic>/`
2. Duplicate composition pattern: new `src/compositions/<Topic>Video.tsx`, register in `src/Root.tsx`
3. Implement scene under `src/scene/<topic>/`
4. Run `timeline:build` + renders

---

## Style notes from the reference (hypothesis verified)

| Element | Target |
|---------|--------|
| Aspect | 1080×1920, 30fps |
| Camera | Locked isometric cross-section; occasional zoom to detail |
| Caption | 1–2 words, bold sans, white + black stroke + shadow, pop scale |
| Audio | Fast AI TTS, **no music** |
| Visuals | Code-friendly primitives; exaggerate motion for clarity |

Physics-heavy dirt/fluid in the original may be Blender sim **or** stylized code motion — prefer readable stylization over perfect simulation when coding under agent time limits.

---

## Common agent mistakes

- Writing essay captions instead of **one word at a time**
- Animating before the script/beats exist (timelines drift)
- One long `useFrame` spaghetti — split by **event kind**
- Forgetting to re-run `build-timeline.mjs` after JSON edits
- Shipping stock UI gradients instead of studying the reference palette

---

## Commands cheat sheet

```bash
npm run timeline:build
npm run pipeline:voice      # ELEVENLABS_API_KEY
npm run pipeline:timestamps # OPENAI_API_KEY + public/voiceover.mp3
npm run render:pool
```

---

## Author context

**Alex Krzywicki** — iOS developer, Russian-speaking creator ([YouTube: iOS на практике](https://www.youtube.com/@iosnapraktike)), GitHub [`akrzywicki`](https://github.com/akrzywicki). This repo is a public tutorial for agent-assisted video direction.

When unsure, re-read this file and **`content/pool-build/script.md`**, then render three still frames and fix timing before adding features.
