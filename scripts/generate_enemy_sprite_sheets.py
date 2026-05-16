from __future__ import annotations

import json
import math
from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
ENEMY_DIR = ROOT / "public" / "assets" / "expedition" / "enemies"
CHINA_DIR = ENEMY_DIR / "china"
CELL_W = 384
CELL_H = 340
SCALE = 1

FRAMES = ["Idle", "Walk1", "Walk2", "Walk3", "Windup", "Attack", "Hit", "Defeated"]


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
}


def render_family(config, frames=FRAMES):
    scale_size = (CELL_W * len(frames) * SCALE, CELL_H * SCALE)
    large = Image.new("RGBA", scale_size, (0, 0, 0, 0))
    for index, frame in enumerate(frames):
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
        "source": "Codex-generated upgraded regular enemy sprite sheet with fixed transparent cells and consistent baseline.",
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
    for name, config in FAMILIES.items():
        write_family(name, config)
    write_small_pack()


if __name__ == "__main__":
    main()
