from __future__ import annotations

import json
import math
import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
ENEMY_DIR = ROOT / "public" / "assets" / "expedition" / "enemies"
CHINA_DIR = ENEMY_DIR / "china"
BOSS_DIR = ROOT / "public" / "assets" / "expedition" / "bosses"
PRODUCTION_MUMMY_SOURCE = ENEMY_DIR / "warrior-mummy-production-source-alpha.png"
PRODUCTION_FLYING_SCARAB_SOURCE = ENEMY_DIR / "flying-scarab-production-source-alpha.png"
CELL_W = 384
CELL_H = 340
SCALE = 1

FRAMES = ["Idle", "Walk1", "Walk2", "Walk3", "Windup", "Attack", "Hit", "Defeated"]
SCARAB_QUEEN_FRAMES = [
    ("scarabQueenIdle", "scarabIdle"),
    ("scarabQueenWalk1", "scarabWalk1"),
    ("scarabQueenWalk2", "scarabWalk2"),
    ("scarabQueenIntro", "scarabIdle"),
    ("scarabQueenWindup", "scarabWindup"),
    ("scarabQueenCharge", "scarabAttack"),
    ("scarabQueenAreaAttack", "scarabAttack"),
    ("scarabQueenShielded", "scarabIdle"),
    ("scarabQueenCounterWindow", "scarabHit"),
    ("scarabQueenHit", "scarabHit"),
    ("scarabQueenDefeated", "scarabDefeated"),
]
SCARAB_QUEEN_CELL_W = 560
SCARAB_QUEEN_CELL_H = 390
SCARAB_QUEEN_PRODUCTION_SOURCE = BOSS_DIR / "scarab-queen-production-source.png"
_PRODUCTION_MUMMY_FRAMES = {}
_PRODUCTION_FLYING_SCARAB_FRAMES = {}


def rgba(hex_color: str, alpha: int = 255) -> tuple[int, int, int, int]:
    value = hex_color.lstrip("#")
    return tuple(int(value[index:index + 2], 16) for index in (0, 2, 4)) + (alpha,)


def draw_poly(draw: ImageDraw.ImageDraw, points, fill, outline=None, width=3):
    draw.polygon(points, fill=fill)
    if outline:
        draw.line(points + [points[0]], fill=outline, width=width, joint="curve")


def draw_leg(draw, x, y, length, lift, color, outline, width=7):
    draw.line([(x, y), (x + length * 0.52, y + lift), (x + length, y)], fill=outline, width=width + 4, joint="curve")
    draw.line([(x, y), (x + length * 0.52, y + lift), (x + length, y)], fill=color, width=width, joint="curve")


def draw_glyph_ring(draw, center, radius, color, width=5, active=False):
    cx, cy = center
    for inset in (0, 18 if active else 0):
        if inset:
            draw.ellipse([cx - radius + inset, cy - radius + inset, cx + radius - inset, cy + radius - inset], outline=color, width=max(3, width - 2))
    for index in range(12):
        angle = index * math.tau / 12
        inner = radius - 10
        outer = radius + (8 if active else 2)
        x1 = cx + math.cos(angle) * inner
        y1 = cy + math.sin(angle) * inner * 0.54
        x2 = cx + math.cos(angle) * outer
        y2 = cy + math.sin(angle) * outer * 0.54
        draw.line([(x1, y1), (x2, y2)], fill=color, width=3)


def draw_sacred_sand(draw, y, color, intense=False):
    for index in range(10 if intense else 6):
        x = 82 + index * 42
        h = 18 + (index % 3) * 7
        draw.ellipse([x, y - h, x + 70, y + 12], fill=color)
    if intense:
        draw.arc([78, y - 54, 482, y + 36], 198, 340, fill=rgba("#facc15", 132), width=6)
        draw.arc([58, y - 72, 502, y + 48], 198, 340, fill=rgba("#38bdf8", 88), width=3)


def draw_lapis_shell_marks(draw, x, y, w, h, active=False):
    lapis = rgba("#0891b2", 155 if active else 115)
    gold = rgba("#f5c451", 210)
    draw.arc([x, y, x + w, y + h], 205, 330, fill=lapis, width=8 if active else 6)
    draw.arc([x + 34, y + 16, x + w - 28, y + h - 8], 210, 330, fill=gold, width=5)
    draw.line([(x + w * 0.52, y + 8), (x + w * 0.46, y + h - 8)], fill=lapis, width=5)
    for offset in (0.24, 0.42, 0.62, 0.78):
        sx = x + w * offset
        draw.line([(sx, y + h * 0.22), (sx - 18, y + h * 0.72)], fill=rgba("#f7d774", 170), width=3)


def load_source_scarab_frame(source_key):
    atlas_path = ENEMY_DIR / "desert-scarab-intimidating-sprites.json"
    atlas = json.loads(atlas_path.read_text(encoding="utf-8"))
    image = Image.open(atlas_path.with_name(atlas["image"])).convert("RGBA")
    region = atlas["regions"][source_key]
    return image.crop((region["x"], region["y"], region["x"] + region["w"], region["y"] + region["h"]))


def place_source_scarab(cell, source_key, scale=1.26, dx=0, dy=0):
    source = load_source_scarab_frame(source_key)
    bbox = source.getchannel("A").getbbox()
    if bbox:
        source = source.crop(bbox)
    target_w = int(source.width * scale)
    target_h = int(source.height * scale)
    source = source.resize((target_w, target_h), Image.Resampling.LANCZOS)
    x = (SCARAB_QUEEN_CELL_W - target_w) // 2 + dx
    y = SCARAB_QUEEN_CELL_H - target_h - 34 + dy
    cell.alpha_composite(source, (x, y))
    return x, y, target_w, target_h


def remove_flat_green_background(image):
    """Convert the ImageGen chroma-key source into transparent sprite pixels."""
    image = image.convert("RGBA")
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            if g > 130 and g > r * 1.24 and g > b * 1.24:
                pixels[x, y] = (r, g, b, 0)
            elif g > 105 and g > r * 1.08 and g > b * 1.08:
                pixels[x, y] = (r, min(g, max(r, b) + 14), b, max(0, a - 120))
    return image


def render_scarab_queen_production_frame(index):
    source = Image.open(SCARAB_QUEEN_PRODUCTION_SOURCE)
    frame_w = source.width / len(SCARAB_QUEEN_FRAMES)
    left = int(round(index * frame_w))
    right = int(round((index + 1) * frame_w))
    frame = remove_flat_green_background(source.crop((left, 0, right, source.height)))
    bbox = frame.getchannel("A").getbbox()
    cell = Image.new("RGBA", (SCARAB_QUEEN_CELL_W, SCARAB_QUEEN_CELL_H), (0, 0, 0, 0))
    if not bbox:
        return cell
    frame = frame.crop(bbox)
    max_w = SCARAB_QUEEN_CELL_W - 46
    max_h = SCARAB_QUEEN_CELL_H - 42
    scale = min(max_w / frame.width, max_h / frame.height)
    target_size = (max(1, int(frame.width * scale)), max(1, int(frame.height * scale)))
    frame = frame.resize(target_size, Image.Resampling.LANCZOS)
    x = (SCARAB_QUEEN_CELL_W - frame.width) // 2
    y = SCARAB_QUEEN_CELL_H - frame.height - 24
    cell.alpha_composite(frame, (x, y))
    return cell


def draw_queen_leg(draw, root, joint, foot, color, outline, width=12):
    draw.line([root, joint, foot], fill=outline, width=width + 6, joint="curve")
    draw.line([root, joint, foot], fill=color, width=width, joint="curve")
    fx, fy = foot
    draw.polygon([(fx, fy), (fx + 18, fy - 6), (fx + 5, fy + 10)], fill=rgba("#d8a02f"), outline=outline)


def draw_queen_eye(draw, cx, cy, intense=False):
    glow = rgba("#facc15", 82 if intense else 46)
    eye = rgba("#fde68a" if intense else "#f59e0b", 245)
    draw.ellipse([cx - 15, cy - 12, cx + 15, cy + 12], fill=glow)
    draw.ellipse([cx - 7, cy - 5, cx + 7, cy + 5], fill=eye, outline=rgba("#2a1a0b"), width=2)


def draw_queen_shell(draw, x, y, w, h, active=False, cracked=False, open_shell=False):
    outline = rgba("#2a1a0b")
    dark = rgba("#1b2630")
    bronze = rgba("#8a5a2b")
    gold = rgba("#f5c451")
    lapis = rgba("#0891b2", 235 if active else 190)
    if open_shell:
        draw.ellipse([x - 32, y - 10, x + w * 0.58, y + h], fill=rgba("#263544"), outline=outline, width=8)
        draw.ellipse([x + w * 0.34, y - 18, x + w + 24, y + h - 2], fill=rgba("#263544"), outline=outline, width=8)
        draw.ellipse([x + w * 0.36, y + h * 0.22, x + w * 0.64, y + h * 0.62], fill=rgba("#22d3ee", 205), outline=rgba("#fef3c7"), width=5)
    else:
        draw.ellipse([x, y, x + w, y + h], fill=dark, outline=outline, width=9)
        draw.ellipse([x + 20, y + 12, x + w - 14, y + h - 16], fill=bronze, outline=outline, width=5)
        draw.pieslice([x + 20, y + 8, x + w - 10, y + h - 10], 190, 353, fill=rgba("#111827"), outline=outline, width=4)
    draw.arc([x + 36, y + 18, x + w - 24, y + h - 6], 202, 340, fill=gold, width=7)
    draw.arc([x + 54, y + 36, x + w - 42, y + h - 20], 202, 338, fill=lapis, width=7)
    draw.line([(x + w * 0.52, y + 12), (x + w * 0.49, y + h - 18)], fill=lapis, width=5)
    for offset in (0.25, 0.42, 0.62, 0.78):
        sx = x + w * offset
        draw.line([(sx, y + h * 0.22), (sx - 20, y + h * 0.76)], fill=rgba("#f7d774", 190), width=3)
    draw.ellipse([x + w * 0.42, y + 20, x + w * 0.58, y + 58], fill=rgba("#d8a02f"), outline=outline, width=3)
    for wing_offset in (-12, 0, 12):
        draw.arc([x + w * 0.41 + wing_offset, y + 12, x + w * 0.61 + wing_offset, y + 92], 205, 335, fill=gold, width=3)
    if cracked:
        draw.line([(x + w * 0.46, y + 42), (x + w * 0.56, y + 78), (x + w * 0.5, y + 118)], fill=rgba("#fef3c7", 210), width=4)
        draw.line([(x + w * 0.64, y + 50), (x + w * 0.58, y + 98)], fill=rgba("#fef3c7", 180), width=3)


def draw_scarab_queen_body(draw, frame_key):
    outline = rgba("#2a1a0b")
    dark = rgba("#111827")
    bronze = rgba("#8a5a2b")
    leg = rgba("#7c4a20")
    gold = rgba("#f5c451")
    lapis = rgba("#0891b2")
    active = frame_key in {"scarabQueenWindup", "scarabQueenAreaAttack", "scarabQueenCounterWindow"}
    defeated = frame_key == "scarabQueenDefeated"
    windup = frame_key == "scarabQueenWindup"
    charge = frame_key == "scarabQueenCharge"
    hit = frame_key == "scarabQueenHit"
    open_shell = frame_key == "scarabQueenCounterWindow"

    x = 118
    y = 146
    if frame_key == "scarabQueenWalk1":
        x -= 6
    elif frame_key == "scarabQueenWalk2":
        x += 6
    elif frame_key == "scarabQueenIntro":
        y -= 6
    elif windup:
        x -= 8
        y += 24
    elif charge:
        x += 18
        y -= 2
    elif frame_key == "scarabQueenAreaAttack":
        y -= 8
    elif hit:
        x -= 24
        y += 12
    elif defeated:
        x -= 18
        y += 58

    body_w = 300
    body_h = 148 if not windup else 128
    shell_w = 246
    shell_h = 150 if not windup else 126

    if defeated:
        draw.ellipse([100, 344, 452, 382], fill=rgba("#8b5e34", 80))
        draw.ellipse([x + 16, y + 30, x + body_w - 8, y + body_h + 28], fill=rgba("#1b2630"), outline=outline, width=8)
        draw_queen_shell(draw, x + 20, y - 26, shell_w, shell_h, active=False, cracked=True)
        for root_x in (x + 60, x + 120, x + 196):
            draw_queen_leg(draw, (root_x, y + body_h - 10), (root_x - 24, y + body_h + 8), (root_x + 38, 350), leg, outline, 9)
        draw.line([(x + 118, y + 30), (x + 160, y + 76), (x + 144, y + 118)], fill=rgba("#f7d774", 165), width=5)
        draw.arc([x + 24, y - 28, x + body_w + 8, y + body_h + 36], 205, 342, fill=rgba("#22d3ee", 90), width=5)
        return

    leg_roots = [
        (x + 50, y + body_h - 18),
        (x + 104, y + body_h - 8),
        (x + 168, y + body_h - 6),
        (x + 226, y + body_h - 20),
    ]
    foot_offsets = [(-46, 50), (-24, 62), (36, 60), (78, 44)]
    if frame_key == "scarabQueenWalk1":
        foot_offsets = [(-58, 44), (-12, 66), (24, 52), (90, 52)]
    elif frame_key == "scarabQueenWalk2":
        foot_offsets = [(-34, 58), (-42, 50), (50, 66), (66, 36)]
    elif windup:
        foot_offsets = [(-76, 38), (-54, 60), (54, 60), (100, 36)]
    elif charge:
        foot_offsets = [(-88, 54), (-66, 68), (78, 54), (128, 28)]
    elif hit:
        foot_offsets = [(-28, 52), (-6, 64), (34, 64), (62, 48)]

    for (root_x, root_y), (fx, fy) in zip(leg_roots, foot_offsets):
        joint = (root_x + fx * 0.45, root_y + fy * 0.34 - 20)
        foot = (root_x + fx, min(350, root_y + fy))
        draw_queen_leg(draw, (root_x, root_y), joint, foot, leg, outline, 10)

    head_x = x + body_w - 28
    head_y = y + body_h * 0.47
    draw.ellipse([x + 36, y + 46, x + body_w, y + body_h + 36], fill=dark, outline=outline, width=8)
    draw.ellipse([head_x - 20, head_y - 42, head_x + 88, head_y + 44], fill=dark, outline=outline, width=8)
    draw_queen_shell(draw, x + 20, y - 52, shell_w, shell_h, active=active, cracked=hit, open_shell=open_shell)

    eye_y = head_y - 10
    draw_queen_eye(draw, head_x + 42, eye_y, intense=active)
    draw_queen_eye(draw, head_x + 78, eye_y + 2, intense=active)

    mandible_open = windup or charge or frame_key == "scarabQueenAreaAttack"
    upper_tip = (head_x + (104 if charge else 130), head_y - (58 if mandible_open else 36))
    lower_tip = (head_x + (106 if charge else 132), head_y + (62 if mandible_open else 34))
    draw.line([(head_x + 68, head_y + 4), (head_x + 98, head_y - 24), upper_tip], fill=outline, width=10, joint="curve")
    draw.line([(head_x + 68, head_y + 4), (head_x + 98, head_y - 24), upper_tip], fill=gold, width=6, joint="curve")
    draw.line([(head_x + 62, head_y + 18), (head_x + 102, head_y + 30), lower_tip], fill=outline, width=10, joint="curve")
    draw.line([(head_x + 62, head_y + 18), (head_x + 102, head_y + 30), lower_tip], fill=gold, width=6, joint="curve")
    draw.line([(head_x + 16, head_y + 58), (head_x + 82, head_y + 92)], fill=outline, width=12)
    draw.line([(head_x + 16, head_y + 58), (head_x + 82, head_y + 92)], fill=leg, width=7)
    if charge:
        draw.polygon([(head_x + 90, head_y - 16), (head_x + 142, head_y - 30), (head_x + 112, head_y + 22)], fill=rgba("#facc15", 160), outline=outline)
        draw.line([(82, 226), (32, 212)], fill=rgba("#facc15", 135), width=7)
        draw.line([(104, 282), (42, 288)], fill=rgba("#22d3ee", 120), width=6)
    if windup:
        draw.line([(head_x + 20, head_y + 62), (head_x + 108, head_y + 26)], fill=rgba("#facc15", 210), width=8)
        draw.line([(head_x + 20, head_y + 76), (head_x + 112, head_y + 88)], fill=rgba("#facc15", 210), width=8)
    if frame_key == "scarabQueenIntro":
        draw.polygon([(x + 126, y - 78), (x + 162, y - 110), (x + 202, y - 76)], fill=rgba("#d8a02f"), outline=outline)
    else:
        draw.polygon([(x + 126, y - 74), (x + 164, y - 108), (x + 202, y - 74)], fill=rgba("#d8a02f"), outline=outline)
    if open_shell:
        draw.ellipse([x + 142, y + 22, x + 210, y + 96], fill=rgba("#22d3ee", 210), outline=rgba("#fef3c7"), width=5)


def render_scarab_queen_frame(frame_key, _source_key):
    cell = Image.new("RGBA", (SCARAB_QUEEN_CELL_W, SCARAB_QUEEN_CELL_H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(cell)
    ground_y = SCARAB_QUEEN_CELL_H - 42
    frame_offsets = {
        "scarabQueenIdle": (0, 0, 0.82),
        "scarabQueenWalk1": (-6, 2, 0.82),
        "scarabQueenWalk2": (6, -2, 0.82),
        "scarabQueenIntro": (0, -4, 0.82),
        "scarabQueenWindup": (-8, 14, 0.84),
        "scarabQueenCharge": (10, -4, 0.86),
        "scarabQueenAreaAttack": (0, -2, 0.84),
        "scarabQueenShielded": (0, 0, 0.82),
        "scarabQueenCounterWindow": (0, 4, 0.8),
        "scarabQueenHit": (-12, 8, 0.8),
        "scarabQueenDefeated": (0, -4, 0.70),
    }

    if frame_key == "scarabQueenIntro":
        draw_glyph_ring(draw, (276, 260), 92, rgba("#f7d774", 76), width=3)
    if frame_key == "scarabQueenWindup":
        draw_sacred_sand(draw, ground_y, rgba("#d97706", 72), intense=False)
        draw_glyph_ring(draw, (276, 266), 96, rgba("#facc15", 128), width=4, active=True)
    if frame_key == "scarabQueenCharge":
        draw_sacred_sand(draw, ground_y, rgba("#d97706", 92), intense=True)
    if frame_key == "scarabQueenAreaAttack":
        draw_glyph_ring(draw, (276, 278), 90, rgba("#facc15", 126), width=4, active=True)
        draw.ellipse([98, 294, 462, 362], outline=rgba("#22d3ee", 98), width=4)
        draw.ellipse([138, 304, 422, 352], outline=rgba("#facc15", 150), width=5)
        draw_sacred_sand(draw, ground_y, rgba("#facc15", 96), intense=True)
    if frame_key == "scarabQueenShielded":
        draw.ellipse([94, 82, 466, 352], fill=rgba("#22d3ee", 22), outline=rgba("#67e8f9", 112), width=5)
        draw.ellipse([118, 104, 442, 336], outline=rgba("#facc15", 92), width=3)
    if frame_key == "scarabQueenCounterWindow":
        draw_glyph_ring(draw, (280, 230), 92, rgba("#22d3ee", 128), width=4, active=True)
    if frame_key == "scarabQueenHit":
        draw.line([(92, 96), (152, 148)], fill=rgba("#f97316", 175), width=8)
        draw.line([(438, 96), (376, 152)], fill=rgba("#f97316", 170), width=8)
    if frame_key == "scarabQueenDefeated":
        draw_sacred_sand(draw, ground_y + 8, rgba("#8b5e34", 86), intense=False)

    dx, dy, scale = frame_offsets.get(frame_key, (0, 0, 1.46))
    scarab_x, scarab_y, scarab_w, scarab_h = place_source_scarab(cell, _source_key, scale=scale, dx=dx, dy=dy)
    head_x = scarab_x + scarab_w * 0.82
    head_y = scarab_y + scarab_h * 0.44
    shell_x = scarab_x + scarab_w * 0.38
    shell_y = scarab_y + scarab_h * 0.14
    outline = rgba("#2a1a0b")
    gold = rgba("#facc15", 205)
    lapis = rgba("#22d3ee", 170)

    draw.arc([shell_x + 4, shell_y + 20, shell_x + 104, shell_y + 112], 210, 334, fill=rgba("#facc15", 138), width=3)
    if frame_key == "scarabQueenCounterWindow":
        draw.ellipse(
            [shell_x + 36, shell_y + 26, shell_x + 68, shell_y + 58],
            fill=rgba("#22d3ee", 185),
            outline=rgba("#fef3c7", 230),
            width=4,
        )

    if frame_key == "scarabQueenWindup":
        draw.line([(head_x - 8, head_y + 18), (head_x + 72, head_y - 22)], fill=gold, width=7)
        draw.line([(head_x - 2, head_y + 34), (head_x + 76, head_y + 48)], fill=gold, width=7)
        draw.ellipse([head_x - 8, head_y - 14, head_x + 20, head_y + 12], fill=rgba("#facc15", 120))
    if frame_key == "scarabQueenCharge":
        draw.polygon(
            [(head_x + 42, head_y - 16), (head_x + 112, head_y - 34), (head_x + 76, head_y + 24)],
            fill=rgba("#facc15", 150),
            outline=outline,
        )
        draw.line([(scarab_x + 16, scarab_y + scarab_h * 0.56), (scarab_x - 48, scarab_y + scarab_h * 0.5)], fill=rgba("#22d3ee", 135), width=6)
    if frame_key == "scarabQueenCounterWindow":
        draw.ellipse(
            [shell_x + 12, scarab_y + 58, shell_x + 86, scarab_y + 132],
            fill=rgba("#22d3ee", 180),
            outline=rgba("#fef3c7", 230),
            width=5,
        )
    if frame_key == "scarabQueenHit":
        draw.line([(scarab_x + 80, scarab_y + 24), (scarab_x + 132, scarab_y + 88)], fill=rgba("#fef3c7", 190), width=5)
    return cell


def write_scarab_queen_boss():
    BOSS_DIR.mkdir(parents=True, exist_ok=True)
    atlas = Image.new("RGBA", (SCARAB_QUEEN_CELL_W * len(SCARAB_QUEEN_FRAMES), SCARAB_QUEEN_CELL_H), (0, 0, 0, 0))
    regions = {}
    production_source_used = False
    for index, (frame_key, source_key) in enumerate(SCARAB_QUEEN_FRAMES):
        frame = render_scarab_queen_production_frame(index) if production_source_used else render_scarab_queen_frame(frame_key, source_key)
        atlas.alpha_composite(frame, (index * SCARAB_QUEEN_CELL_W, 0))
        regions[frame_key] = {
            "x": index * SCARAB_QUEEN_CELL_W,
            "y": 0,
            "w": SCARAB_QUEEN_CELL_W,
            "h": SCARAB_QUEEN_CELL_H,
        }
    png_path = BOSS_DIR / "scarab-queen-sprites.png"
    json_path = BOSS_DIR / "scarab-queen-sprites.json"
    atlas.save(png_path)
    json_path.write_text(json.dumps({
        "image": png_path.name,
        "source": "Codex-generated Scarab Queen boss sheet, derived from the upgraded intimidating desert scarab family and extended with sacred Egyptian boss states.",
        "coordinateNote": "Eleven fixed transparent cells preserving the canonical Journey boss frame keys.",
        "frameContract": [frame_key for frame_key, _source_key in SCARAB_QUEEN_FRAMES],
        "baseline": "bottom-center fixed per frame; sacred warning and area effects stay inside the same boss draw box",
        "productionReference": SCARAB_QUEEN_PRODUCTION_SOURCE.name if SCARAB_QUEEN_PRODUCTION_SOURCE.exists() else None,
        "regions": regions,
    }, indent=2), encoding="utf-8")


def draw_scarab(draw, frame, base_y):
    defeated = frame == "Defeated"
    hit = frame == "Hit"
    windup = frame == "Windup"
    attack = frame == "Attack"
    walk = frame.startswith("Walk")
    if defeated:
        dark = rgba("#0f3f46")
        draw.ellipse([102, base_y - 40, 282, base_y - 4], fill=rgba("#1f6f78"), outline=rgba("#082f34"), width=6)
        draw.line([(112, base_y - 6), (276, base_y - 6)], fill=dark, width=10)
        return
    lean = -8 if windup else 16 if attack else -10 if hit else 0
    squash = 1.0
    body_y = base_y - (52 * squash)
    shell = rgba("#1f6f78" if not hit else "#f59e0b")
    dark = rgba("#0f3f46")
    bronze = rgba("#c48a2c")
    for i, offset in enumerate([-72, -42, -12, 18, 48, 78]):
        phase = (i + (1 if frame == "Walk2" else 2 if frame == "Walk3" else 0)) % 3
        lift = -18 if walk and phase == 1 else -6
        draw_leg(draw, 192 + lean + offset * 0.34, body_y + 24, -34 if offset < 0 else 34, lift, bronze, dark, 6)
    draw.ellipse([84 + lean, body_y - 42, 300 + lean, body_y + 56], fill=dark, outline=rgba("#082f34"), width=7)
    draw.ellipse([102 + lean, body_y - 52, 282 + lean, body_y + 42], fill=shell, outline=rgba("#082f34"), width=6)
    draw.arc([126 + lean, body_y - 46, 258 + lean, body_y + 42], 200, 340, fill=rgba("#78d8c7"), width=7)
    draw.line([(192 + lean, body_y - 48), (192 + lean, body_y + 40)], fill=rgba("#08343a"), width=5)
    draw.ellipse([252 + lean, body_y - 28, 326 + lean, body_y + 28], fill=dark, outline=rgba("#082f34"), width=5)
    if attack:
        draw.polygon([(318 + lean, body_y - 8), (358 + lean, body_y - 34), (352 + lean, body_y + 18)], fill=rgba("#d7a442"))


def draw_snake(draw, frame, base_y):
    hit = frame == "Hit"
    defeated = frame == "Defeated"
    attack = frame == "Attack"
    windup = frame == "Windup"
    phase = {"Idle": 0, "Walk1": 0, "Walk2": 1, "Walk3": 2}.get(frame, 0)
    color = rgba("#3f8f62" if not hit else "#f59e0b")
    dark = rgba("#184d35")
    points = []
    for i in range(9):
        x = 72 + i * 32
        wave = math.sin(i * 0.9 + phase * 1.4) * (18 if not defeated else 4)
        y = base_y - 42 + wave
        if windup and i > 5:
            y -= 24
        if attack and i > 5:
            x += 16
            y -= 18
        points.append((x, y))
    draw.line(points, fill=dark, width=36, joint="curve")
    draw.line(points, fill=color, width=26, joint="curve")
    head = points[-1]
    draw.ellipse([head[0] - 24, head[1] - 22, head[0] + 28, head[1] + 24], fill=color, outline=dark, width=5)
    draw.ellipse([head[0] + 10, head[1] - 8, head[0] + 16, head[1] - 2], fill=rgba("#111827"))
    draw.arc([92, base_y - 76, 278, base_y - 10], 190, 350, fill=rgba("#b7d96a"), width=5)
    if defeated:
        draw.line([(86, base_y - 8), (302, base_y - 8)], fill=dark, width=14)


def draw_bat(draw, frame, base_y):
    hit = frame == "Hit"
    defeated = frame == "Defeated"
    phase = {"Idle": 0, "Walk1": 0, "Walk2": 1, "Walk3": 2, "Attack": 1, "Windup": 2}.get(frame, 0)
    wing_lift = [-12, -44, 14][phase]
    body_y = base_y - (42 if defeated else 72)
    wing = rgba("#5b3f86" if not hit else "#f59e0b")
    dark = rgba("#26173f")
    draw_poly(draw, [(184, body_y), (72, body_y + wing_lift), (116, body_y + 62), (174, body_y + 36)], wing, dark, 5)
    draw_poly(draw, [(200, body_y), (312, body_y + wing_lift), (268, body_y + 62), (210, body_y + 36)], wing, dark, 5)
    draw.ellipse([158, body_y - 34, 226, body_y + 44], fill=rgba("#3b285f"), outline=dark, width=5)
    draw.ellipse([166, body_y - 54, 218, body_y - 8], fill=rgba("#4c3575"), outline=dark, width=4)
    draw.polygon([(176, body_y - 46), (166, body_y - 72), (192, body_y - 54)], fill=dark)
    draw.polygon([(208, body_y - 46), (218, body_y - 72), (192, body_y - 54)], fill=dark)
    if frame == "Attack":
        draw.line([(220, body_y + 8), (282, body_y + 24)], fill=rgba("#d1b3ff"), width=6)
    if defeated:
        draw.line([(120, base_y - 4), (260, base_y - 4)], fill=dark, width=10)


def draw_scorpion(draw, frame, base_y):
    hit = frame == "Hit"
    attack = frame == "Attack"
    windup = frame == "Windup"
    defeated = frame == "Defeated"
    phase = {"Walk1": 0, "Walk2": 1, "Walk3": 2}.get(frame, 0)
    color = rgba("#a65f21" if not hit else "#f59e0b")
    dark = rgba("#4a2b13")
    body_y = base_y - (36 if defeated else 54)
    for i, offset in enumerate([-72, -44, -18, 18, 44, 72]):
        lift = -18 if i % 3 == phase else -6
        draw_leg(draw, 190 + offset * 0.28, body_y + 16, -38 if offset < 0 else 38, lift, rgba("#d28a35"), dark, 6)
    draw.ellipse([96, body_y - 30, 270, body_y + 38], fill=color, outline=dark, width=6)
    draw.ellipse([236, body_y - 24, 312, body_y + 30], fill=rgba("#bf7932"), outline=dark, width=5)
    tail = [(132, body_y - 26), (112, body_y - 78), (158, body_y - 110 if windup or attack else body_y - 92), (206, body_y - 86)]
    draw.line(tail, fill=dark, width=18, joint="curve")
    draw.line(tail, fill=rgba("#c9772d"), width=11, joint="curve")
    draw.polygon([(206, body_y - 86), (230, body_y - 110), (226, body_y - 72)], fill=rgba("#facc15" if attack else "#7c3f18"), outline=dark)
    if defeated:
        draw.line([(108, base_y - 5), (290, base_y - 5)], fill=dark, width=11)


def draw_wisp(draw, frame, base_y):
    hit = frame == "Hit"
    attack = frame == "Attack"
    windup = frame == "Windup"
    defeated = frame == "Defeated"
    phase = {"Walk1": 0, "Walk2": 1, "Walk3": 2}.get(frame, 0)
    color = rgba("#e0a12f" if not hit else "#fef3c7", 220)
    outline = rgba("#8a4f13", 230)
    center_y = base_y - 76 + math.sin(phase * 2) * 7
    if windup:
        center_y += 8
    if attack:
        center_y -= 12
    if defeated:
        center_y = base_y - 24
    draw.ellipse([130, center_y - 58, 252, center_y + 58], fill=color, outline=outline, width=6)
    draw.polygon([(168, center_y + 42), (144, center_y + 92), (198, center_y + 58), (224, center_y + 96), (216, center_y + 38)], fill=color)
    for i in range(4):
        a = i * math.pi / 2 + phase
        draw.arc([112 + i * 7, center_y - 76 + i * 5, 272 - i * 7, center_y + 76 - i * 5], math.degrees(a), math.degrees(a) + 70, fill=rgba("#fde68a", 190), width=5)
    if attack:
        draw.ellipse([246, center_y - 14, 312, center_y + 18], fill=rgba("#facc15", 210))


def draw_humanoid(draw, frame, base_y, palette, bulky=False, captain=False):
    hit = frame == "Hit"
    defeated = frame == "Defeated"
    attack = frame == "Attack"
    windup = frame == "Windup"
    phase = {"Walk1": 0, "Walk2": 1, "Walk3": 2}.get(frame, 0)
    skin = rgba("#9b6a3c")
    dark = rgba(palette["outline"])
    cloth = rgba("#f59e0b" if hit else palette["cloth"])
    accent = rgba(palette["accent"])
    scale = 1.18 if bulky else 1.0
    body_y = base_y - 122 * scale
    if defeated:
        draw.rounded_rectangle([98, base_y - 34, 286, base_y - 8], radius=18, fill=cloth, outline=dark, width=6)
        draw.ellipse([252, base_y - 50, 308, base_y - 4], fill=skin, outline=dark, width=4)
        return
    leg_shift = [-14, 14, -4][phase]
    draw_leg(draw, 176, base_y - 72, -26 + leg_shift, 70, rgba(palette["leg"]), dark, 10)
    draw_leg(draw, 210, base_y - 72, 26 - leg_shift, 70, rgba(palette["leg"]), dark, 10)
    draw.rounded_rectangle([146, body_y + 36, 238, body_y + 132], radius=24, fill=cloth, outline=dark, width=6)
    head_y = body_y + 6
    draw.ellipse([156, head_y, 228, head_y + 70], fill=skin, outline=dark, width=5)
    draw.polygon([(148, head_y + 10), (236, head_y + 8), (218, head_y - 16), (166, head_y - 14)], fill=accent, outline=dark)
    arm_l = [(154, body_y + 58), (108 if windup else 122, body_y + 98), (112, body_y + 132)]
    arm_r = [(232, body_y + 60), (292 if attack else 268, body_y + 92), (314 if attack else 268, body_y + 126)]
    draw.line(arm_l, fill=dark, width=18, joint="curve")
    draw.line(arm_l, fill=accent, width=11, joint="curve")
    draw.line(arm_r, fill=dark, width=18, joint="curve")
    draw.line(arm_r, fill=accent, width=11, joint="curve")
    if captain:
        draw.polygon([(196, body_y + 74), (246, body_y + 52), (248, body_y + 92)], fill=rgba("#7f1d1d"), outline=dark)


def draw_guardian(draw, frame, base_y, china=False):
    palette = {
        "outline": "#2f2418",
        "stone": "#6b7280" if not china else "#966f42",
        "accent": "#38bdf8" if not china else "#2dd4bf",
        "glow": "#facc15" if china else "#bfdbfe",
    }
    hit = frame == "Hit"
    defeated = frame == "Defeated"
    attack = frame == "Attack"
    windup = frame == "Windup"
    phase = {"Walk1": 0, "Walk2": 1, "Walk3": 2}.get(frame, 0)
    dark = rgba(palette["outline"])
    stone = rgba("#f59e0b" if hit else palette["stone"])
    if defeated:
        draw.rounded_rectangle([80, base_y - 50, 300, base_y - 10], radius=16, fill=stone, outline=dark, width=7)
        draw.rectangle([126, base_y - 82, 202, base_y - 46], fill=stone, outline=dark, width=6)
        return
    leg_shift = [-10, 10, 0][phase]
    draw.rounded_rectangle([130 - leg_shift, base_y - 74, 172 - leg_shift, base_y - 4], radius=10, fill=stone, outline=dark, width=6)
    draw.rounded_rectangle([212 + leg_shift, base_y - 74, 254 + leg_shift, base_y - 4], radius=10, fill=stone, outline=dark, width=6)
    draw.rounded_rectangle([112, base_y - 206, 272, base_y - 70], radius=24, fill=stone, outline=dark, width=8)
    draw.rectangle([136, base_y - 246, 248, base_y - 194], fill=stone, outline=dark, width=7)
    draw.ellipse([156, base_y - 232, 170, base_y - 218], fill=rgba(palette["glow"]))
    draw.ellipse([214, base_y - 232, 228, base_y - 218], fill=rgba(palette["glow"]))
    arm_l = [(118, base_y - 172), (72 if windup else 92, base_y - 128), (76, base_y - 78)]
    arm_r = [(266, base_y - 172), (318 if attack else 296, base_y - 120), (314 if attack else 292, base_y - 70)]
    draw.line(arm_l, fill=dark, width=28, joint="curve")
    draw.line(arm_l, fill=stone, width=19, joint="curve")
    draw.line(arm_r, fill=dark, width=28, joint="curve")
    draw.line(arm_r, fill=stone, width=19, joint="curve")
    draw.rectangle([150, base_y - 158, 234, base_y - 126], fill=rgba(palette["accent"]), outline=dark, width=4)


def draw_crab(draw, frame, base_y):
    hit = frame == "Hit"
    attack = frame == "Attack"
    windup = frame == "Windup"
    defeated = frame == "Defeated"
    phase = {"Walk1": 0, "Walk2": 1, "Walk3": 2}.get(frame, 0)
    shell = rgba("#1c7f73" if not hit else "#f59e0b")
    dark = rgba("#164e48")
    body_y = base_y - (34 if defeated else 58)
    for i, offset in enumerate([-80, -52, -24, 24, 52, 80]):
        lift = -16 if i % 3 == phase else -5
        draw_leg(draw, 190 + offset * 0.32, base_y - 8, -42 if offset < 0 else 42, lift, rgba("#b5793c"), dark, 6)
    draw.ellipse([98, body_y - 44, 286, body_y + 48], fill=shell, outline=dark, width=7)
    draw.ellipse([132, body_y - 66, 162, body_y - 28], fill=rgba("#fef3c7"), outline=dark, width=4)
    draw.ellipse([222, body_y - 66, 252, body_y - 28], fill=rgba("#fef3c7"), outline=dark, width=4)
    claw_l = [(98, body_y - 10), (48 if windup else 62, body_y - 42), (70, body_y + 4)]
    claw_r = [(286, body_y - 10), (348 if attack else 322, body_y - 42), (314, body_y + 4)]
    draw.line(claw_l, fill=dark, width=15)
    draw.line(claw_r, fill=dark, width=15)
    draw.ellipse([34, body_y - 58, 86, body_y - 8], fill=rgba("#c47c3a"), outline=dark, width=5)
    draw.ellipse([304, body_y - 58, 356, body_y - 8], fill=rgba("#c47c3a"), outline=dark, width=5)
    if defeated:
        draw.line([(92, base_y - 6), (292, base_y - 6)], fill=dark, width=10)


def draw_mummy(draw, frame, base_y):
    hit = frame == "Hit"
    defeated = frame == "Defeated"
    attack = frame == "Attack"
    windup = frame == "Windup"
    phase = {"Walk1": 0, "Walk2": 1, "Walk3": 2}.get(frame, 0)
    dark = rgba("#31251c")
    linen = rgba("#d6c19a" if not hit else "#f59e0b")
    shadow_linen = rgba("#9f7f55")
    gold = rgba("#d9a441")
    rust = rgba("#7c2d12")
    glow = rgba("#38bdf8", 220)
    if defeated:
        draw.rounded_rectangle([96, base_y - 38, 284, base_y - 10], radius=16, fill=linen, outline=dark, width=6)
        draw.line([(118, base_y - 28), (264, base_y - 18)], fill=shadow_linen, width=5)
        draw.ellipse([254, base_y - 55, 314, base_y - 4], fill=linen, outline=dark, width=4)
        return

    leg_shift = [-12, 12, -4][phase]
    torso_y = base_y - 196
    draw_leg(draw, 174, base_y - 74, -22 + leg_shift, 70, linen, dark, 11)
    draw_leg(draw, 212, base_y - 74, 24 - leg_shift, 70, linen, dark, 11)
    draw.rounded_rectangle([138, torso_y + 52, 246, torso_y + 154], radius=24, fill=linen, outline=dark, width=7)
    for offset in range(0, 92, 18):
        draw.line([(142, torso_y + 62 + offset), (244, torso_y + 48 + offset)], fill=shadow_linen, width=4)
    draw.polygon([(156, torso_y + 58), (226, torso_y + 58), (206, torso_y + 116), (176, torso_y + 116)], fill=rgba("#5b2e1b", 210), outline=dark)
    draw.rectangle([170, torso_y + 106, 212, torso_y + 124], fill=gold, outline=dark, width=3)
    head_y = torso_y + 4
    draw.ellipse([154, head_y, 230, head_y + 72], fill=linen, outline=dark, width=5)
    for offset in (12, 28, 44, 58):
        draw.line([(158, head_y + offset), (228, head_y + offset - 10)], fill=shadow_linen, width=4)
    draw.ellipse([176, head_y + 29, 186, head_y + 39], fill=glow)
    draw.ellipse([204, head_y + 29, 214, head_y + 39], fill=glow)
    draw.polygon([(146, head_y + 14), (238, head_y + 12), (222, head_y - 12), (164, head_y - 10)], fill=gold, outline=dark)

    arm_l = [(146, torso_y + 78), (98 if windup else 114, torso_y + 110), (108, torso_y + 148)]
    arm_r = [(240, torso_y + 80), (296 if attack else 270, torso_y + 104), (330 if attack else 276, torso_y + 136)]
    draw.line(arm_l, fill=dark, width=20, joint="curve")
    draw.line(arm_l, fill=linen, width=12, joint="curve")
    draw.line(arm_r, fill=dark, width=20, joint="curve")
    draw.line(arm_r, fill=linen, width=12, joint="curve")
    weapon_start = (274 if not attack else 296, torso_y + 98)
    weapon_end = (312 if not attack else 354, torso_y + 52)
    draw.line([weapon_start, weapon_end], fill=dark, width=8)
    draw.line([weapon_start, weapon_end], fill=rust, width=4)
    draw.polygon([
        (weapon_end[0] - 8, weapon_end[1] + 4),
        (weapon_end[0] + 18, weapon_end[1] - 24),
        (weapon_end[0] + 12, weapon_end[1] + 10),
    ], fill=gold, outline=dark)
    if windup or attack:
        draw.arc([258, torso_y + 30, 366, torso_y + 160], 220, 316, fill=rgba("#facc15", 150), width=5)


def trim_alpha(image: Image.Image, padding: int = 0) -> Image.Image:
    bbox = image.getchannel("A").getbbox()
    if not bbox:
        return image
    left = max(0, bbox[0] - padding)
    top = max(0, bbox[1] - padding)
    right = min(image.width, bbox[2] + padding)
    bottom = min(image.height, bbox[3] + padding)
    return image.crop((left, top, right, bottom))


def keep_largest_alpha_component(image: Image.Image) -> Image.Image:
    """Remove stray source-sheet notes and silhouettes that survived chroma keying."""
    image = image.convert("RGBA")
    alpha = image.getchannel("A")
    width, height = image.size
    visited = bytearray(width * height)
    best = []
    for start_y in range(height):
        for start_x in range(width):
            start_index = start_y * width + start_x
            if visited[start_index] or alpha.getpixel((start_x, start_y)) <= 0:
                continue
            stack = [(start_x, start_y)]
            visited[start_index] = 1
            component = []
            while stack:
                x, y = stack.pop()
                component.append((x, y))
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= nx < width and 0 <= ny < height:
                        index = ny * width + nx
                        if not visited[index] and alpha.getpixel((nx, ny)) > 0:
                            visited[index] = 1
                            stack.append((nx, ny))
            if len(component) > len(best):
                best = component

    if not best:
        return image

    cleaned_alpha = Image.new("L", image.size, 0)
    pixels = cleaned_alpha.load()
    for x, y in best:
        pixels[x, y] = alpha.getpixel((x, y))
    image.putalpha(cleaned_alpha)
    return trim_alpha(image, 4)


def get_production_mummy_frame(frame: str) -> Image.Image:
    if frame in _PRODUCTION_MUMMY_FRAMES:
        return _PRODUCTION_MUMMY_FRAMES[frame].copy()

    source = Image.open(PRODUCTION_MUMMY_SOURCE).convert("RGBA")
    frame_index = FRAMES.index(frame)
    frame_width = source.width / len(FRAMES)
    left = int(round(frame_index * frame_width))
    right = int(round((frame_index + 1) * frame_width))
    sprite = trim_alpha(source.crop((left, 0, right, source.height)), 4)
    sprite = keep_largest_alpha_component(sprite)
    sprite = ImageEnhance.Contrast(sprite).enhance(1.08)
    sprite = ImageEnhance.Color(sprite).enhance(0.92)
    sprite = ImageEnhance.Sharpness(sprite).enhance(1.16)
    _PRODUCTION_MUMMY_FRAMES[frame] = sprite
    return sprite.copy()


def alpha_paste(base: Image.Image, sprite: Image.Image, x: int, y: int):
    base.alpha_composite(sprite, (round(x), round(y)))


def render_production_mummy_cell(frame, base_y):
    cell = Image.new("RGBA", (CELL_W * SCALE, CELL_H * SCALE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(cell)
    defeated = frame == "Defeated"
    hit = frame == "Hit"
    sprite = get_production_mummy_frame(frame)
    target_h = 118 if defeated else 238
    target_w = max(1, round(sprite.width * target_h / max(1, sprite.height)))
    max_w = 286 if defeated else 168
    if target_w > max_w:
        target_w = max_w
        target_h = max(1, round(sprite.height * target_w / max(1, sprite.width)))
    sprite = sprite.resize((target_w, target_h), Image.Resampling.LANCZOS)
    if hit:
        flash = Image.new("RGBA", sprite.size, rgba("#f59e0b", 72))
        flash.putalpha(sprite.getchannel("A").point(lambda alpha: min(alpha, 72)))
        sprite = Image.alpha_composite(sprite, flash)

    x = CELL_W / 2 - sprite.width / 2 + {"Walk1": -12, "Walk2": 0, "Walk3": 12, "Windup": -18, "Attack": 14}.get(frame, 0)
    y = base_y - sprite.height - (4 if defeated else 10) + (4 if hit else 0)
    draw.ellipse([x + 8, base_y - 17, x + sprite.width - 8, base_y + 5], fill=rgba("#120c07", 82))
    alpha_paste(cell, sprite, x, y)

    return cell


def get_production_flying_scarab_frame(frame: str) -> Image.Image:
    if frame in _PRODUCTION_FLYING_SCARAB_FRAMES:
        return _PRODUCTION_FLYING_SCARAB_FRAMES[frame].copy()

    source = Image.open(PRODUCTION_FLYING_SCARAB_SOURCE).convert("RGBA")
    frame_index = FRAMES.index(frame)
    frame_width = source.width / len(FRAMES)
    left = int(round(frame_index * frame_width))
    right = int(round((frame_index + 1) * frame_width))
    sprite = trim_alpha(source.crop((left, 0, right, source.height)), 4)
    sprite = ImageEnhance.Contrast(sprite).enhance(1.06)
    sprite = ImageEnhance.Color(sprite).enhance(0.98)
    sprite = ImageEnhance.Sharpness(sprite).enhance(1.12)
    _PRODUCTION_FLYING_SCARAB_FRAMES[frame] = sprite
    return sprite.copy()


def render_production_flying_scarab_cell(frame, base_y):
    cell = Image.new("RGBA", (CELL_W * SCALE, CELL_H * SCALE), (0, 0, 0, 0))
    hit = frame == "Hit"
    defeated = frame == "Defeated"
    sprite = get_production_flying_scarab_frame(frame)
    max_w = 300 if not defeated else 240
    max_h = 150 if not defeated else 118
    scale = min(max_w / max(1, sprite.width), max_h / max(1, sprite.height))
    target_size = (max(1, round(sprite.width * scale)), max(1, round(sprite.height * scale)))
    sprite = sprite.resize(target_size, Image.Resampling.LANCZOS)
    if hit:
        flash = Image.new("RGBA", sprite.size, rgba("#facc15", 54))
        flash.putalpha(sprite.getchannel("A").point(lambda alpha: min(alpha, 54)))
        sprite = Image.alpha_composite(sprite, flash)

    offsets = {
        "Walk1": (-6, -7),
        "Walk2": (0, 5),
        "Walk3": (6, -4),
        "Windup": (-10, 6),
        "Attack": (18, -2),
        "Hit": (-16, 8),
        "Defeated": (4, 28),
    }
    dx, dy = offsets.get(frame, (0, 0))
    x = CELL_W / 2 - sprite.width / 2 + dx
    y = base_y - sprite.height - (30 if not defeated else 0) + dy
    alpha_paste(cell, sprite, x, y)
    return cell


FAMILIES = {
    "scarab": {
        "path": ENEMY_DIR / "desert-scarab-sprites",
        "prefix": "scarab",
        "draw": draw_scarab,
        "aliases": {"Walk1": "scarabCrawl1", "Walk2": "scarabCrawl2"},
        "base_y": 318,
    },
    "snake": {
        "path": ENEMY_DIR / "sand-snake-sprites",
        "prefix": "snake",
        "draw": draw_snake,
        "aliases": {"Walk1": "snakeSlither1", "Walk2": "snakeSlither2"},
        "base_y": 320,
    },
    "bat": {
        "path": ENEMY_DIR / "temple-bat-sprites",
        "prefix": "bat",
        "draw": draw_bat,
        "aliases": {"Walk1": "batFlap1", "Walk2": "batFlap2"},
        "base_y": 258,
        "flying": True,
    },
    "scorpion": {
        "path": ENEMY_DIR / "scorpion-sprites",
        "prefix": "scorpion",
        "draw": draw_scorpion,
        "base_y": 318,
    },
    "sandWisp": {
        "path": ENEMY_DIR / "sand-wisp-sprites",
        "prefix": "sandWisp",
        "draw": draw_wisp,
        "render_cell": render_production_flying_scarab_cell,
        "source": "Production flying scarab atlas generated from public/assets/expedition/enemies/flying-scarab-production-source-alpha.png and normalized into the existing sand-wisp Journey enemy frame contract.",
        "base_y": 252,
        "flying": True,
    },
    "looter": {
        "path": ENEMY_DIR / "looter-sprites",
        "prefix": "looter",
        "draw": lambda d, f, b: draw_humanoid(d, f, b, {"outline": "#2f2418", "cloth": "#8b5e34", "accent": "#c0842e", "leg": "#4b2f1e"}),
        "base_y": 322,
    },
    "looterCaptain": {
        "path": ENEMY_DIR / "looter-captain-sprites",
        "prefix": "looterCaptain",
        "draw": lambda d, f, b: draw_humanoid(d, f, b, {"outline": "#24130f", "cloth": "#7c2d12", "accent": "#d97706", "leg": "#3f2417"}, captain=True),
        "base_y": 322,
    },
    "cursedStatue": {
        "path": ENEMY_DIR / "cursed-statue-sprites",
        "prefix": "cursedStatue",
        "draw": lambda d, f, b: draw_guardian(d, f, b, china=False),
        "base_y": 324,
    },
    "stoneGuardianEnemy": {
        "path": ENEMY_DIR / "stone-guardian-enemy-sprites",
        "prefix": "stoneGuardianEnemy",
        "draw": lambda d, f, b: draw_guardian(d, f, b, china=False),
        "base_y": 324,
    },
    "riverCrab": {
        "path": CHINA_DIR / "china-river-crab-sprites",
        "prefix": "riverCrab",
        "draw": draw_crab,
        "base_y": 318,
    },
    "watchtowerSentry": {
        "path": CHINA_DIR / "china-watchtower-sentry-sprites",
        "prefix": "watchtowerSentry",
        "draw": lambda d, f, b: draw_humanoid(d, f, b, {"outline": "#18312f", "cloth": "#2f7d73", "accent": "#d6a64a", "leg": "#31514a"}),
        "base_y": 322,
    },
    "clayGuardian": {
        "path": CHINA_DIR / "china-clay-guardian-enemy-sprites",
        "prefix": "clayGuardian",
        "draw": lambda d, f, b: draw_guardian(d, f, b, china=True),
        "base_y": 324,
    },
    "mummy": {
        "path": ENEMY_DIR / "warrior-mummy-sprites",
        "prefix": "mummy",
        "draw": draw_mummy,
        "render_cell": render_production_mummy_cell,
        "source": "Production warrior mummy atlas generated from public/assets/expedition/enemies/warrior-mummy-production-source-alpha.png and normalized into the existing Journey enemy frame contract.",
        "base_y": 324,
    },
}


def render_family(config, frames=FRAMES):
    scale_size = (CELL_W * len(frames) * SCALE, CELL_H * SCALE)
    large = Image.new("RGBA", scale_size, (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        if config.get("render_cell"):
            cell = config["render_cell"](frame, config["base_y"] * SCALE)
        else:
            cell = Image.new("RGBA", (CELL_W * SCALE, CELL_H * SCALE), (0, 0, 0, 0))
            draw = ImageDraw.Draw(cell)
            config["draw"](draw, frame, config["base_y"] * SCALE)
        large.alpha_composite(cell, (index * CELL_W * SCALE, 0))
    return large.resize((CELL_W * len(frames), CELL_H), Image.Resampling.LANCZOS)


def get_family_region(image: Image.Image, row_y: int = 0, frames=FRAMES) -> dict:
    bboxes = []
    for index, _frame in enumerate(frames):
        cell = image.crop((index * CELL_W, row_y, (index + 1) * CELL_W, row_y + CELL_H))
        bbox = cell.getchannel("A").getbbox()
        if bbox:
            bboxes.append(bbox)
    if not bboxes:
        return {"x": 0, "y": row_y, "w": CELL_W, "h": CELL_H}
    left = max(0, min(box[0] for box in bboxes) - 14)
    top = max(0, min(box[1] for box in bboxes) - 14)
    right = min(CELL_W, max(box[2] for box in bboxes) + 14)
    bottom = min(CELL_H, max(box[3] for box in bboxes) + 10)
    return {"x": left, "y": row_y + top, "w": right - left, "h": bottom - top}


def make_regions(prefix, base_region, aliases=None):
    aliases = aliases or {}
    regions = {}
    for index, frame in enumerate(FRAMES):
        key = f"{prefix}{frame}"
        region = {
            "x": index * CELL_W + base_region["x"],
            "y": base_region["y"],
            "w": base_region["w"],
            "h": base_region["h"],
        }
        regions[key] = region
        if frame in aliases:
            regions[aliases[frame]] = region.copy()
    return regions


def write_family(name, config):
    out_base = config["path"]
    out_base.parent.mkdir(parents=True, exist_ok=True)
    image = render_family(config)
    png_path = out_base.with_suffix(".png")
    json_path = out_base.with_suffix(".json")
    image.save(png_path)
    base_region = get_family_region(image)
    atlas = {
        "image": png_path.name,
        "source": config.get("source", "Codex-generated upgraded regular enemy sprite sheet with fixed transparent cells and consistent baseline."),
        "coordinateNote": "Eight fixed cells: Idle, Walk1, Walk2, Walk3, Windup, Attack, Hit, Defeated. Regions share one bottom-center anchor.",
        "frameContract": FRAMES,
        "baseline": "bottom-center shared per family; no baked large shadow",
        "regions": make_regions(config["prefix"], base_region, config.get("aliases")),
    }
    json_path.write_text(json.dumps(atlas, indent=2), encoding="utf-8")


def write_small_pack():
    families = [FAMILIES["scarab"], FAMILIES["snake"], FAMILIES["bat"]]
    atlas = Image.new("RGBA", (CELL_W * len(FRAMES), CELL_H * len(families)), (0, 0, 0, 0))
    regions = {}
    for row, family in enumerate(families):
        image = render_family(family)
        atlas.alpha_composite(image, (0, row * CELL_H))
        row_regions = make_regions(
            family["prefix"],
            get_family_region(image, row_y=row * CELL_H),
            family.get("aliases"),
        )
        for key, region in row_regions.items():
            regions[key] = region
    png_path = ENEMY_DIR / "small-enemy-sprites.png"
    json_path = ENEMY_DIR / "small-enemy-sprites.json"
    atlas.save(png_path)
    json_path.write_text(json.dumps({
        "image": png_path.name,
        "source": "Codex-generated upgraded small enemy fallback atlas with fixed transparent cells and consistent baselines.",
        "coordinateNote": "Rows: scarab, snake, bat. Columns: Idle, Walk1, Walk2, Walk3, Windup, Attack, Hit, Defeated.",
        "frameContract": FRAMES,
        "baseline": "bottom-center shared per family; bat uses a consistent hover baseline",
        "regions": regions,
    }, indent=2), encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description="Generate Journey enemy and boss sprite sheets.")
    parser.add_argument("--scarab-queen-only", action="store_true", help="Only regenerate the Scarab Queen boss atlas.")
    parser.add_argument("--include-bosses", action="store_true", help="Also regenerate boss atlases supported by this script.")
    parser.add_argument("--family", choices=sorted(FAMILIES), help="Only regenerate one regular enemy family.")
    args = parser.parse_args()

    if args.scarab_queen_only:
        write_scarab_queen_boss()
        return

    if args.family:
        write_family(args.family, FAMILIES[args.family])
        return

    for name, config in FAMILIES.items():
        write_family(name, config)
    write_small_pack()
    if args.include_bosses:
        write_scarab_queen_boss()


if __name__ == "__main__":
    main()
