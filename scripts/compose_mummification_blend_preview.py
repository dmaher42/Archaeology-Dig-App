"""Composite the mummification structure candidate over the real in-game arrival
background plate, replicating the canvas color-grade pipeline, so blend quality can
be judged without an in-game screenshot (preview_screenshot hangs on this machine).

Outputs a stacked 3-panel comparison PNG:
  1. raw paste (no treatment)
  2. the exact grade the live entrance prop uses today
  3. warmer sunset grade + grounding (contact shadow, sand lip, scene haze)
"""

import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

BG = "public/assets/expedition/backgrounds/desert-entry-opening-rebuild/desert-entry-mummification-exterior-arrival-background-raw-2026-06-11.png"
STRUCT = sys.argv[1] if len(sys.argv) > 1 else "public/assets/expedition/environment/desert-temple/mummification-structure-candidates/mummification-structure-candidate-1-broad-ritual-facade-alpha-2026-06-12.png"
OUT = sys.argv[2] if len(sys.argv) > 2 else "public/dev-previews/mummification-blend-preview.png"

PLATE_W, PLATE_H = 1672, 941
STRUCT_W = 1650  # live prop: 1500 * scale 1.1
PLAYER_H = 42


def css_filter(img, saturate=1.0, sepia=0.0, contrast=1.0, brightness=1.0):
    """Apply CSS-filter-equivalent grading to an RGBA image (luminance-preserving
    matrices matching the SVG/CSS filter spec, same as canvas ctx.filter)."""
    arr = np.asarray(img).astype(np.float64)
    rgb, a = arr[..., :3], arr[..., 3:]

    ident = np.eye(3)
    sat_m = np.array([
        [0.213 + 0.787 * saturate, 0.715 - 0.715 * saturate, 0.072 - 0.072 * saturate],
        [0.213 - 0.213 * saturate, 0.715 + 0.285 * saturate, 0.072 - 0.072 * saturate],
        [0.213 - 0.213 * saturate, 0.715 - 0.715 * saturate, 0.072 + 0.928 * saturate],
    ])
    sep_full = np.array([
        [0.393, 0.769, 0.189],
        [0.349, 0.686, 0.168],
        [0.272, 0.534, 0.131],
    ])
    sep_m = ident * (1 - sepia) + sep_full * sepia

    rgb = rgb @ sat_m.T
    rgb = rgb @ sep_m.T
    rgb = (rgb - 127.5) * contrast + 127.5
    rgb = rgb * brightness
    out = np.concatenate([np.clip(rgb, 0, 255), a], axis=-1).astype(np.uint8)
    return Image.fromarray(out, "RGBA")


def with_alpha(img, opacity):
    img = img.copy()
    a = img.getchannel("A").point(lambda v: int(v * opacity))
    img.putalpha(a)
    return img


def drop_shadow(structure, blur=9, dy=5, color=(46, 24, 8), opacity=0.6):
    a = structure.getchannel("A").point(lambda v: int(v * opacity))
    shadow = Image.new("RGBA", structure.size, color + (0,))
    shadow.putalpha(a)
    shadow = shadow.filter(ImageFilter.GaussianBlur(blur))
    canvas = Image.new("RGBA", structure.size, (0, 0, 0, 0))
    canvas.alpha_composite(shadow, (0, dy))
    canvas.alpha_composite(structure)
    return canvas


def vertical_gradient(size, top_rgba, bottom_rgba):
    w, h = size
    t, b = np.array(top_rgba, float), np.array(bottom_rgba, float)
    rows = t[None, :] + (b - t)[None, :] * (np.arange(h, dtype=float) / max(h - 1, 1))[:, None]
    return Image.fromarray(np.tile(rows[:, None, :], (1, w, 1)).astype(np.uint8), "RGBA")


def contact_shadow_layer(size, cx, cy, rx, ry, alpha=140):
    """Soft radial ellipse shadow."""
    w, h = size
    yy, xx = np.mgrid[0:h, 0:w].astype(float)
    d = np.sqrt(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2)
    a = np.clip(1 - d / 0.7, 0, 1) * alpha
    layer = np.zeros((h, w, 4), np.uint8)
    layer[..., 0], layer[..., 1], layer[..., 2] = 40, 20, 6
    layer[..., 3] = a.astype(np.uint8)
    return Image.fromarray(layer, "RGBA")


def make_panel(bg, structure, struct_pos, label, draw_grounding=False, haze=False):
    panel = bg.copy()
    if draw_grounding:
        sx, sy = struct_pos
        base_y = sy + structure.height - 8
        panel.alpha_composite(
            contact_shadow_layer(panel.size, cx=sx + structure.width / 2, cy=base_y + 18,
                                 rx=structure.width * 0.52, ry=64, alpha=130))
    panel.alpha_composite(structure, struct_pos)
    if draw_grounding:
        # sand lip burying the rubble base
        lip_h = 52
        lip = vertical_gradient((PLATE_W, lip_h), (196, 150, 88, 0), (196, 150, 88, 210))
        panel.alpha_composite(lip, (0, PLATE_H - lip_h))
    if haze:
        panel.alpha_composite(vertical_gradient(panel.size, (255, 170, 80, 26), (120, 70, 30, 20)))
    # player-scale marker
    d = ImageDraw.Draw(panel)
    px, py = int(PLATE_W * 0.27), PLATE_H - 24
    d.rectangle([px, py - PLAYER_H, px + 17, py], fill=(44, 36, 26, 255), outline=(239, 226, 192, 255), width=2)
    d.text((px - 60, py - PLAYER_H - 26), "player", fill=(255, 233, 189, 255), font=FONT)
    # caption strip
    strip = Image.new("RGBA", (PLATE_W, 44), (20, 16, 10, 255))
    ImageDraw.Draw(strip).text((14, 10), label, fill=(232, 220, 196, 255), font=FONT)
    out = Image.new("RGBA", (PLATE_W, PLATE_H + 44))
    out.paste(strip, (0, 0))
    out.alpha_composite(panel, (0, 44))
    return out


try:
    FONT = ImageFont.truetype("arial.ttf", 26)
except OSError:
    FONT = ImageFont.load_default()

bg = Image.open(BG).convert("RGBA").resize((PLATE_W, PLATE_H), Image.LANCZOS)
raw = Image.open(STRUCT).convert("RGBA")
scale = STRUCT_W / raw.width
structure = raw.resize((STRUCT_W, int(raw.height * scale)), Image.LANCZOS)
sx = (PLATE_W - STRUCT_W) // 2
sy = PLATE_H - structure.height - int(PLATE_H * 0.02)

p1 = make_panel(bg, structure, (sx, sy),
                "1. RAW PASTE - no treatment (the 'cutout stuck in' look)")

graded = with_alpha(css_filter(structure, saturate=0.78, sepia=0.08, contrast=0.96, brightness=0.86), 0.92)
p2 = make_panel(bg, graded, (sx, sy),
                "2. IN-GAME TODAY - live prop grade: saturate(78%) sepia(8%) contrast(96%) brightness(86%), alpha 0.92")

polished = css_filter(structure, saturate=0.82, sepia=0.26, contrast=0.92, brightness=0.82)
polished = with_alpha(drop_shadow(polished), 0.94)
p3 = make_panel(bg, polished, (sx, sy),
                "3. RECOMMENDED - warmer sunset grade + contact shadow + sand lip + scene haze",
                draw_grounding=True, haze=True)

total = Image.new("RGBA", (PLATE_W, p1.height * 3 + 24), (26, 22, 16, 255))
for i, p in enumerate((p1, p2, p3)):
    total.alpha_composite(p, (0, i * (p1.height + 12)))
total.convert("RGB").save(OUT, "PNG")
print("saved", OUT, total.size)
