from __future__ import annotations

import json
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
PACK_DIR = ROOT / "public" / "assets" / "expedition" / "environment" / "desert-temple"
IMAGE_NAME = "egypt-sacred-traps-pack.png"
JSON_NAME = "egypt-sacred-traps-pack.json"
CELL = 256
SCALE = 3

REGIONS = {
    "guardianSealIdle": {"x": 0, "y": 0, "w": CELL, "h": CELL},
    "guardianSealActivated": {"x": CELL, "y": 0, "w": CELL, "h": CELL},
    "sacredPedestalIdle": {"x": 0, "y": CELL, "w": CELL, "h": CELL},
    "sacredPedestalActivated": {"x": CELL, "y": CELL, "w": CELL, "h": CELL},
}


def rgba(hex_color: str, alpha: int = 255) -> tuple[int, int, int, int]:
    value = hex_color.lstrip("#")
    return tuple(int(value[index:index + 2], 16) for index in (0, 2, 4)) + (alpha,)


def s(value: float) -> int:
    return round(value * SCALE)


def scaled_box(box: tuple[float, float, float, float]) -> tuple[int, int, int, int]:
    return tuple(s(value) for value in box)


def at_box(ox: int, oy: int, box: tuple[float, float, float, float]) -> tuple[int, int, int, int]:
    x1, y1, x2, y2 = scaled_box(box)
    return ox + x1, oy + y1, ox + x2, oy + y2


def cell_origin(region_key: str) -> tuple[int, int]:
    region = REGIONS[region_key]
    return region["x"] * SCALE, region["y"] * SCALE


def draw_glyph_ticks(draw: ImageDraw.ImageDraw, ox: int, oy: int, active: bool) -> None:
    gold = rgba("#f7d774", 220 if active else 170)
    lapis = rgba("#0e7490", 220 if active else 150)
    center_x = ox + s(128)
    center_y = oy + s(122)
    for index in range(16):
        angle = math.tau * index / 16
        inner = s(67 if active else 63)
        outer = s(86 if active else 77)
        x1 = center_x + round(math.cos(angle) * inner)
        y1 = center_y + round(math.sin(angle) * inner)
        x2 = center_x + round(math.cos(angle) * outer)
        y2 = center_y + round(math.sin(angle) * outer)
        color = lapis if index % 4 == 0 else gold
        draw.line([(x1, y1), (x2, y2)], fill=color, width=s(3 if active else 2))
        if active and index % 4 == 2:
            gx = center_x + round(math.cos(angle) * s(95))
            gy = center_y + round(math.sin(angle) * s(95))
            draw.rectangle([gx - s(4), gy - s(4), gx + s(4), gy + s(4)], fill=rgba("#67e8f9", 180))


def draw_soft_glow(layer: Image.Image, center: tuple[int, int], radius: int, color: tuple[int, int, int, int]) -> None:
    glow = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    cx, cy = center
    glow_draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=color)
    layer.alpha_composite(glow.filter(ImageFilter.GaussianBlur(radius=s(9))))


def draw_guardian_seal(draw: ImageDraw.ImageDraw, layer: Image.Image, ox: int, oy: int, active: bool) -> None:
    outline = rgba("#2a1a0b", 235)
    bronze = rgba("#8a5a20", 255)
    gold = rgba("#d8a02f", 255)
    light_gold = rgba("#f7d774", 255)
    lapis = rgba("#075985", 255)
    cyan = rgba("#67e8f9", 230)

    if active:
        draw_soft_glow(layer, (ox + s(128), oy + s(122)), s(70), rgba("#38bdf8", 55))
        draw_soft_glow(layer, (ox + s(128), oy + s(122)), s(92), rgba("#facc15", 34))

    draw.ellipse(at_box(ox, oy, (42, 36, 214, 208)), fill=rgba("#5f3a16", 135), outline=None)
    draw.ellipse(
        at_box(ox, oy, (50, 30, 206, 186)),
        fill=gold if not active else light_gold,
        outline=outline,
        width=s(5),
    )
    draw.ellipse(at_box(ox, oy, (68, 48, 188, 168)), fill=rgba("#b7791f", 255), outline=bronze, width=s(6))
    draw.ellipse(at_box(ox, oy, (84, 64, 172, 152)), fill=rgba("#f3c65c", 255), outline=outline, width=s(3))

    # Stylised scarab/sun motif, readable as a sacred symbol rather than a realistic insect.
    draw.ellipse(at_box(ox, oy, (108, 78, 148, 128)), fill=lapis, outline=outline, width=s(3))
    draw.pieslice(at_box(ox, oy, (74, 74, 128, 142)), start=104, end=270, fill=rgba("#0e7490", 230), outline=outline, width=s(2))
    draw.pieslice(at_box(ox, oy, (128, 74, 182, 142)), start=270, end=76, fill=rgba("#0e7490", 230), outline=outline, width=s(2))
    draw.line([(ox + s(128), oy + s(65)), (ox + s(128), oy + s(150))], fill=outline, width=s(2))
    for y in (92, 108, 124):
        draw.line([(ox + s(93), oy + s(y)), (ox + s(116), oy + s(y - 4))], fill=light_gold, width=s(2))
        draw.line([(ox + s(140), oy + s(y - 4)), (ox + s(163), oy + s(y))], fill=light_gold, width=s(2))

    draw_glyph_ticks(draw, ox, oy, active)
    if active:
        draw.ellipse(at_box(ox, oy, (96, 52, 160, 116)), outline=cyan, width=s(4))
        draw.arc(at_box(ox, oy, (36, 20, 220, 204)), 24, 156, fill=rgba("#67e8f9", 190), width=s(4))
        draw.arc(at_box(ox, oy, (36, 20, 220, 204)), 204, 336, fill=rgba("#facc15", 170), width=s(4))

    # Small stone base shadow, so the seal reads as a pickup object without looking like treasure.
    draw.rounded_rectangle(at_box(ox, oy, (72, 188, 184, 216)), radius=s(8), fill=rgba("#9a7448", 245), outline=outline, width=s(3))
    draw.line([(ox + s(88), oy + s(199)), (ox + s(168), oy + s(199))], fill=rgba("#caa56b", 210), width=s(3))


def draw_pedestal(draw: ImageDraw.ImageDraw, layer: Image.Image, ox: int, oy: int, active: bool) -> None:
    outline = rgba("#2a1a0b", 235)
    stone = rgba("#b08957", 255)
    stone_dark = rgba("#7a5730", 255)
    stone_light = rgba("#d4b27b", 255)
    gold = rgba("#f7d774", 230)
    lapis = rgba("#075985", 235)
    cyan = rgba("#67e8f9", 210)

    if active:
        draw_soft_glow(layer, (ox + s(128), oy + s(96)), s(76), rgba("#38bdf8", 42))

    draw.ellipse(at_box(ox, oy, (54, 202, 202, 232)), fill=rgba("#4b2f18", 88))
    draw.rounded_rectangle(at_box(ox, oy, (54, 54, 202, 82)), radius=s(8), fill=stone_light, outline=outline, width=s(4))
    draw.polygon(
        [(ox + s(74), oy + s(82)), (ox + s(182), oy + s(82)), (ox + s(166), oy + s(178)), (ox + s(90), oy + s(178))],
        fill=stone,
        outline=outline,
    )
    draw.rounded_rectangle(at_box(ox, oy, (68, 176, 188, 206)), radius=s(6), fill=stone_dark, outline=outline, width=s(4))
    draw.rounded_rectangle(at_box(ox, oy, (82, 199, 174, 222)), radius=s(5), fill=stone_light, outline=outline, width=s(3))

    for x in (94, 128, 162):
        draw.line([(ox + s(x), oy + s(91)), (ox + s(x - 10), oy + s(169))], fill=rgba("#6b4425", 180), width=s(3))
    draw.line([(ox + s(75), oy + s(105)), (ox + s(177), oy + s(105))], fill=rgba("#e2c48a", 180), width=s(3))
    draw.line([(ox + s(83), oy + s(148)), (ox + s(171), oy + s(148))], fill=rgba("#6b4425", 160), width=s(3))

    # Decorative geometric inlays, intentionally not readable text.
    inlay_color = cyan if active else lapis
    for x in (94, 118, 142):
        draw.polygon(
            [(ox + s(x), oy + s(119)), (ox + s(x + 10), oy + s(129)), (ox + s(x), oy + s(139)), (ox + s(x - 10), oy + s(129))],
            fill=inlay_color,
            outline=outline,
        )
    draw.rectangle(at_box(ox, oy, (110, 65, 146, 74)), fill=lapis if not active else cyan, outline=outline, width=s(2))

    if active:
        draw.line([(ox + s(128), oy + s(54)), (ox + s(128), oy + s(22))], fill=rgba("#67e8f9", 190), width=s(5))
        draw.arc(at_box(ox, oy, (72, 30, 184, 130)), 204, 336, fill=gold, width=s(4))
        for points in (
            [(111, 83), (101, 126), (116, 126), (106, 166)],
            [(145, 83), (156, 127), (141, 127), (151, 166)],
        ):
            draw.line([(ox + s(x), oy + s(y)) for x, y in points], fill=cyan, width=s(4), joint="curve")
        draw.line([(ox + s(86), oy + s(190)), (ox + s(170), oy + s(190))], fill=gold, width=s(4))


def main() -> None:
    PACK_DIR.mkdir(parents=True, exist_ok=True)
    atlas = Image.new("RGBA", (CELL * 2 * SCALE, CELL * 2 * SCALE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(atlas)

    draw_guardian_seal(draw, atlas, *cell_origin("guardianSealIdle"), active=False)
    draw_guardian_seal(draw, atlas, *cell_origin("guardianSealActivated"), active=True)
    draw_pedestal(draw, atlas, *cell_origin("sacredPedestalIdle"), active=False)
    draw_pedestal(draw, atlas, *cell_origin("sacredPedestalActivated"), active=True)

    atlas = atlas.resize((CELL * 2, CELL * 2), Image.Resampling.LANCZOS)
    atlas.save(PACK_DIR / IMAGE_NAME)

    data = {
        "image": IMAGE_NAME,
        "source": "scripts/generate_egypt_sacred_trap_assets.py",
        "size": {"w": CELL * 2, "h": CELL * 2},
        "mappingNote": "First Egypt sacred defence asset regions. Prepared for later Journey environment wiring; not wired into gameplay by this asset pass.",
        "regions": REGIONS,
    }
    (PACK_DIR / JSON_NAME).write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {PACK_DIR / IMAGE_NAME}")
    print(f"Wrote {PACK_DIR / JSON_NAME}")


if __name__ == "__main__":
    main()
