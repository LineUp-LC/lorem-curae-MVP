---
name: thumbnail-genius
description: >
  YouTube thumbnail research, analysis, and generation workflow. Use this skill whenever the user
  mentions thumbnails, YouTube thumbnail design, thumbnail concepts, CTR optimization, video
  thumbnails, or uses /thumbnail. Also trigger when the user uploads screenshot images of YouTube
  thumbnails for analysis, asks to analyze competitor thumbnails, wants image-gen prompts for
  thumbnails, or mentions anything related to thumbnail A/B testing, click-through rate optimization,
  or video cover art. Even if the user just says "I need a thumbnail for my new video" or pastes a
  video title — use this skill.
tools: [Read, WebSearch, WebFetch]
trigger: "/thumbnail [topic], thumbnail-related requests, competitor screenshot uploads, CTR optimization"
---

# Thumbnail Genius

A research-driven YouTube thumbnail creation workflow that analyzes top performers, extracts winning patterns, and generates production-ready image prompts.

## Quick Start

The user invokes this skill with `/thumbnail [topic or video title]` or any thumbnail-related request. On **first use**, check if brand assets exist in memory (`C:\Users\Brita\.claude\projects\C--Users-Brita-Desktop-lorem-curae-MVP\memory\brand-assets.md`). If not, ask once:

> "Before we start — do you have brand colors (hex codes), a logo, preferred fonts, or a headshot you want me to use across all thumbnails? Upload them now and I'll save them for future sessions. Or say 'skip' to proceed without."

Save any provided assets to `brand-assets.md` in the memory directory. After first use, never ask again — load from memory and reference automatically.

## Modes

The skill operates in three modes depending on what the user provides. Detect the mode automatically based on input — don't ask "which mode do you want?"

### Mode 1: Research + Analysis (user provides keyword/niche OR competitor screenshots)

**If user provides a keyword/niche but no screenshots:**

1. Use WebSearch to find top-performing YouTube videos for that keyword
2. Ask the user to screenshot the top 3-5 highest-view-count thumbnails and upload them
3. If the user can't provide screenshots, research the niche via web search and describe the dominant thumbnail patterns based on findings
4. Wait for uploads (or web research results) before proceeding to analysis

**If user provides competitor thumbnail screenshots (with or without view counts):**

Run a full visual analysis on each thumbnail. For every thumbnail, evaluate and report:

| Dimension | What to assess |
|-----------|---------------|
| **Color palette** | Dominant colors, saturation level, whether it pops on a white/dark YouTube feed |
| **Contrast** | Light/dark ratio, text-to-background contrast, visual hierarchy |
| **Face & emotion** | Is there a face? What emotion? How prominent? Direction of gaze? |
| **Text** | Word count, font size relative to frame, placement, readability at 320px mobile |
| **Composition** | Rule of thirds, split layouts, diagonal tension, negative space usage |
| **Curiosity hook** | What creates the "I need to click this" feeling? Gap between thumbnail and expected title? |
| **Big numbers** | Are stats/numbers used? How prominently? |
| **Brand elements** | Logo placement, consistent style markers |

If view counts are provided, **rank thumbnails by performance** and explain why the top performers win. Identify the 2-3 strongest patterns across all winners.

Output a summary like:

```
## Winner Analysis

1. Thumbnail #X (Y views) — Wins because: [concise reason]
2. Thumbnail #Z (W views) — Wins because: [concise reason]

## Patterns to Steal
1. [Pattern] — seen in X of Y winners
2. [Pattern] — seen in X of Y winners
3. [Pattern] — seen in X of Y winners
```

### Mode 2: Concept Generation (user provides a video title/topic)

Generate **4 distinct thumbnail concepts (A/B/C/D)** that follow the psychology rules below. If competitor analysis was done in the same session, mimic the winning styles exactly but adapt to the user's topic.

For each concept, output:

```
## Concept [A/B/C/D]: "[Short concept name]"

**Visual description:** [Detailed scene/layout description]
**Why it works:** [1-2 sentences on the psychology]
**Style reference:** [Which competitor pattern it mirrors, if applicable]

### Image Generation Prompt (Flux/Midjourney/Grok)

[Complete, copy-paste-ready prompt with ALL of the following baked in:]
- Exact dimensions: 1280x720
- Color palette with hex codes (from winners or brand colors)
- Composition direction (e.g., "rule of thirds, subject left third, text right")
- Face/emotion specification if applicable
- "Bold sans-serif text reading '[TEXT]' in [color], [size relative to frame]"
- "High saturation, high contrast, YouTube thumbnail style"
- "Sharp, clean, mobile-readable at 320px width"
- Lighting direction and mood
```

After all 4, include a **head-to-head comparison**:

```
## Head-to-Head

| | A | B | C | D |
|---|---|---|---|---|
| **Hook type** | ... | ... | ... | ... |
| **Emotion** | ... | ... | ... | ... |
| **Contrast level** | ... | ... | ... | ... |
| **Best for** | ... | ... | ... | ... |
| **CTR prediction** | 4/5 | 3/5 | 5/5 | 3/5 |
```

### Mode 3: Refinement (user asks to iterate on a concept)

Support follow-up commands like:
- "Refine B with more red like competitor #1"
- "Make C use a split layout instead"
- "Combine A's color palette with D's composition"
- "Make it contrast the niche trend" (invert what competitors do)

When refining, output only the updated concept with its new image-gen prompt. Don't regenerate all 4 unless asked.

## Psychology Rules (Always Applied)

These rules are non-negotiable. Every concept must follow them:

1. **Face + emotion always present** — Human faces with clear, exaggerated emotion outperform faceless thumbnails by 2-3x CTR. If the user doesn't have a headshot, suggest a stock photo direction or AI-generated face prompt.

2. **High contrast, high saturation** — Thumbnails compete against dozens of others in a feed. Muted = invisible. Push saturation and contrast higher than feels natural — it reads correctly at small sizes.

3. **Curiosity gap** — The thumbnail must complement the title, NEVER repeat it. If the title says "I quit my job," the thumbnail shows the emotional aftermath, not text saying "I QUIT." The gap between what you see and what the title says creates the click.

4. **Mobile-first readability** — 70%+ of YouTube views are mobile. If text isn't readable at 320px width, it's invisible to most viewers. Max 3-4 words. Bold sans-serif only.

5. **The 3-second rule** — A viewer decides in <3 seconds. One focal point, one emotion, one message. If you need to explain the thumbnail, it's too complex.

6. **Color psychology** — Red/orange = urgency/energy. Blue = trust/calm. Yellow = attention/warning. Green = money/growth. Use intentionally, not randomly.

## Brand Auto-Load

On every invocation, check for saved brand assets in memory:

- **Logo:** Include placement suggestion (typically bottom-right, 10-15% of frame, semi-transparent)
- **Brand colors:** Use as primary or accent colors in all concepts
- **Fonts:** Reference in text overlay specifications
- **Headshot:** Include in face/emotion specifications when relevant

If the user uploads new brand assets, update the memory file immediately.

## PIL Composite Option

If the user asks for "quick composites" or "PIL code," generate a Python script using Pillow that:

1. Creates a 1280x720 canvas
2. Places background color/gradient from the concept
3. Adds text overlays with specified fonts and colors
4. Positions any uploaded images (headshot, logo)
5. Exports as PNG

Keep the PIL code simple and self-contained — rough mockups, not final thumbnails.

## Output Checklist

Before presenting any concept, verify:

- [ ] Dimensions specified as 1280x720
- [ ] High saturation + high contrast mentioned
- [ ] Face/emotion included or explicitly addressed
- [ ] Text is 4 words or fewer, bold sans-serif
- [ ] Curiosity gap present (doesn't repeat expected title)
- [ ] Mobile readability at 320px mentioned
- [ ] Color palette includes hex codes
- [ ] Composition direction specified (rule of thirds, etc.)
- [ ] Brand elements included (if previously provided)
- [ ] Image-gen prompt is copy-paste ready (no placeholders left)

## Example Invocations

```
/thumbnail How I Made $10K in 30 Days With AI
```

```
/thumbnail [uploads 4 competitor screenshots] analyze these for the "passive income" niche
```

```
Refine concept B — use a split layout with my face on the left and the money visual on the right, more yellow like competitor #2
```
