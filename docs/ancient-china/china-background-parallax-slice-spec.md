# Ancient China — River Valley Background: Parallax Slice Spec

This spec turns the single flat frontier painting (`china-river-valley-parallax-pack.png`,
1672×941) into a proper **multi-layer parallax** backdrop: five separate transparent
PNG layers that scroll at different speeds for depth.

There are **two modes** the engine supports:

- **Mode A — single composited backdrop (LIVE NOW).** The atlas points `skyLayer` at the
  full frontier painting and uses `"runtimeMode": "single-composited-backdrop"`. The whole
  scene is drawn as one static backdrop. This is what's wired right now so there is always
  a real background. No new art needed.
- **Mode B — layered parallax (this spec).** Replace the single painting with the five
  sliced layers below and switch the atlas to `"runtimeMode": "layered-parallax"`.

Canvas is **1120×630** (`CANVAS_WIDTH`×`CANVAS_HEIGHT`). All layers tile horizontally.

---

## The five layers

Author each as its **own transparent RGBA PNG**, **2048 px wide**, with **seamless
left↔right tiling** (the left edge must continue into the right edge). Drop them in:

`public/assets/expedition/backgrounds/china-river-valley/`

| # | File | Size (px) | Alpha | Draws at `y` | Draw height | Parallax | Opacity | Content |
|---|------|-----------|-------|--------------|-------------|----------|---------|---------|
| 1 | `china-bg-01-sky.png` | 2048×640 | **opaque** | 0 | 630 (full) | 0.012 | 1.00 | Hazy dawn sky: pale teal-grey top → warm gold horizon. Soft clouds, a low sun glow upper-right. **No land.** |
| 2 | `china-bg-02-far-mountains.png` | 2048×360 | transparent | 150 | 250 | 0.05 | 0.55 | Distant blue-grey mountain ridgelines along the lower 60%, atmospheric haze. Transparent above the peaks. |
| 3 | `china-bg-03-river-valley.png` | 2048×360 | transparent | 235 | 250 | 0.12 | 0.7 | The Yellow River winding across, with distant settlement rooftops, small pagodas and tree clumps on the far bank. Transparent above. |
| 4 | `china-bg-04-watchtower-ridge.png` | 2048×440 | transparent | 300 | 300 | 0.22 | 0.9 | Nearer ridge: rammed-earth wall sections, 1–2 timber **watchtowers**, ruined gate posts, banners, scrub. Bottom-anchored; transparent above the silhouette. |
| 5 | `china-bg-05-foreground-mist.png` | 2048×340 | transparent | 360 | 270 | 0.4 | 0.5 | Low drifting valley mist + a few foreground reed/grass clumps along the very bottom. Mostly transparent; soft. |

Notes:
- **Tiling:** every layer repeats across the ~66,000 px world, so the left and right 64 px
  must match seamlessly. Avoid a single unique hero element that would visibly repeat — keep
  each layer a *texture-like band* (ridgelines, river, ridge of towers) rather than one
  centred landmark.
- **Bottom-anchored land:** for layers 2–5 the scenery sits in the lower part of the image
  with full transparency above, so distant layers peek over nearer ones.
- **Palette:** warm loess yellow, dusty teal-grey distance, bronze/ochre mid, green scrub —
  matches the `yellow-river-frontier` atmosphere already in `chinaJourneyData.js`.
- Keep the **bottom ~40 px** of layers 4–5 light/sparse so the playable floor and props stay
  readable (the gameplay ground sits at the bottom of the canvas).

---

## Atlas JSON (Mode B)

Replace `china-river-valley-parallax-pack.json` with:

```json
{
  "image": "china-bg-01-sky.png",
  "runtimeMode": "layered-parallax",
  "regions": {
    "skyLayer":        { "x": 0, "y": 0, "w": 2048, "h": 640 },
    "farMountains":    { "image": "china-bg-02-far-mountains.png",   "x": 0, "y": 0, "w": 2048, "h": 360 },
    "riverValley":     { "image": "china-bg-03-river-valley.png",    "x": 0, "y": 0, "w": 2048, "h": 360 },
    "watchtowerRidge": { "image": "china-bg-04-watchtower-ridge.png","x": 0, "y": 0, "w": 2048, "h": 440 },
    "foregroundMist":  { "image": "china-bg-05-foreground-mist.png", "x": 0, "y": 0, "w": 2048, "h": 340 }
  }
}
```

All five region keys must be present or the loader marks the pack not-ready and skips it
(`EXPECTED_CHINA_RIVER_VALLEY_BACKGROUND_KEYS`).

---

## Engine wiring (one branch, additive)

`drawChinaRiverValleyBackgroundFrame` in
`src/components/expedition-journey/useJourneyRenderer.js` gets a `layered-parallax` branch
that draws the five layers at the `y` / height / parallax / opacity in the table above
(the multi-layer draws are currently stubbed out with a "TODO: uncomment when artists slice
the China background" note — this turns them on, gated behind the new runtimeMode so Mode A
and the other civs are untouched):

```js
if (assets.atlas?.runtimeMode === 'layered-parallax') {
  const ok = drawDesertBackgroundLayer(ctx, assets, 'skyLayer', { y: 0, height: CANVAS_HEIGHT }, { ...layerOptions, parallax: 0.012, alpha: 1 });
  if (!ok) return false;
  drawDesertBackgroundLayer(ctx, assets, 'farMountains',    { y: 150, height: 250 }, { ...layerOptions, parallax: 0.05, alpha: 0.55 });
  drawDesertBackgroundLayer(ctx, assets, 'riverValley',     { y: 235, height: 250 }, { ...layerOptions, parallax: 0.12, alpha: 0.7 });
  drawDesertBackgroundLayer(ctx, assets, 'watchtowerRidge', { y: 300, height: 300 }, { ...layerOptions, parallax: 0.22, alpha: 0.9 });
  drawDesertBackgroundLayer(ctx, assets, 'foregroundMist',  { y: 360, height: 270 }, { ...layerOptions, parallax: 0.4,  alpha: 0.5 });
  return true;
}
```

(Each `drawDesertBackgroundLayer` is a no-op that returns `false` if its layer PNG is
missing, so partial drops degrade gracefully.)

---

## Copy-paste image-generation prompts (one per layer)

Shared style: *2D side-scrolling game parallax background layer, semi-realistic painterly
style, warm dawn light, muted earthy palette (loess yellow, dusty teal distance, bronze,
green scrub), historically inspired Ancient China frontier, seamless horizontal tiling
(left edge continues into right edge), no text, no labels, no UI, no watermark, no border.*

1. **Sky** — `china-bg-01-sky.png` (2048×640, opaque):
> Wide seamless tileable dawn sky over an ancient Chinese river valley: pale teal-grey at the top blending to a warm gold haze at the horizon, soft layered clouds, a low diffused sun glow in the upper right. Sky only — no land, no mountains. [+ shared style]

2. **Far mountains** — `china-bg-02-far-mountains.png` (2048×360, transparent above peaks):
> Seamless tileable band of distant blue-grey mountain ridgelines fading into morning haze, layered far/farther ranges, sitting along the lower 60% of the frame, fully transparent above the peaks. Atmospheric, soft, low detail. [+ shared style]

3. **River valley** — `china-bg-03-river-valley.png` (2048×360, transparent above):
> Seamless tileable midground band of the Yellow River winding horizontally across a valley, with small distant settlement rooftops, a couple of low pagodas and clumps of trees on the far bank, gentle reflections. Content in the lower half, transparent above. [+ shared style]

4. **Watchtower ridge** — `china-bg-04-watchtower-ridge.png` (2048×440, transparent above silhouette):
> Seamless tileable nearer ridge in an ancient Chinese frontier: weathered rammed-earth wall sections, one or two timber watchtowers with tiled roofs, ruined gate posts, hanging cloth banners, dry scrub. Bottom-anchored silhouette, transparent above, readable shapes. [+ shared style]

5. **Foreground mist** — `china-bg-05-foreground-mist.png` (2048×340, mostly transparent):
> Seamless tileable foreground layer of thin low valley mist drifting across the bottom, with a few sparse silhouetted reed and grass clumps along the very bottom edge. Mostly transparent, soft and atmospheric, no solid ground. [+ shared style]

---

## Activation checklist
1. Generate the five PNGs at the sizes above, transparent where noted, seamlessly tileable.
2. Drop them in `public/assets/expedition/backgrounds/china-river-valley/`.
3. Replace the atlas JSON with the Mode B version above (`runtimeMode: "layered-parallax"`).
4. Add the `layered-parallax` branch to `drawChinaRiverValleyBackgroundFrame` (above).
5. Hard-reload — Ancient China now shows depth-scrolled mountains/river/towers/mist.
