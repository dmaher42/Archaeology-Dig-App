from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
BOSS_DIR = ROOT / "public" / "assets" / "expedition" / "bosses"
SOURCE_DIR = BOSS_DIR / "source" / "scarab-queen-v2-generated"
OUT_PNG = BOSS_DIR / "scarab-queen-sprites.png"
OUT_JSON = BOSS_DIR / "scarab-queen-sprites.json"

CELL_W = 560
CELL_H = 390
GROUND_Y = 382

SHEET_SPECS = {
    "combat": ("scarab-combat-regeneration-02-accepted-raw.png", 8),
    "walk": ("scarab-walk-regeneration-02-accepted-raw.png", 8),
    "run": ("scarab-run-regeneration-03-accepted-raw.png", 8),
    "windup": ("scarab-attack-windup-regeneration-02-accepted-raw.png", 6),
    "acidSpit": ("scarab-acid-spit-regeneration-01-accepted-raw.png", 8),
    "acid": ("scarab-acid.png", 6),
    "stagger": ("scarab-stagger-regeneration-02-accepted-raw.png", 5),
    "death": ("scarab-death-regeneration-02-accepted-raw.png", 8),
    "portrait": ("scarab-portrait.png", 1),
}

FRAME_PLAN = [
    ("scarabQueenIdle", "portrait", 0),
    ("scarabQueenWalk1", "walk", 1),
    ("scarabQueenWalk2", "walk", 5),
    ("scarabQueenIntro", "stagger", 0),
    ("scarabQueenWindup", "windup", 3),
    ("scarabQueenCharge", "run", 5),
    ("scarabQueenAreaAttack", "acidSpit", 5),
    ("scarabQueenShielded", "portrait", 0),
    ("scarabQueenCounterWindow", "stagger", 2),
    ("scarabQueenHit", "stagger", 3),
    ("scarabQueenDefeated", "death", 7),
]

SEQUENCES = {
    "scarabQueenWalk": ("walk", 8),
    "scarabQueenRun": ("run", 8),
    "scarabQueenWindup": ("windup", 6),
    "scarabQueenAcidSpit": ("acidSpit", 8),
    "scarabQueenAcid": ("acid", 6),
    "scarabQueenStagger": ("stagger", 5),
    "scarabQueenDeath": ("death", 8),
}

COMPONENT_SLICED_SHEETS: set[str] = set()


def remove_checkerboard_background(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    pixels = image.load()
    width, height = image.size
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            neutral = abs(r - g) < 28 and abs(g - b) < 28
            bright_checker = max(r, g, b) > 170 and neutral
            magenta_key = (
                r > 110
                and b > 110
                and g < 132
                and abs(r - b) < 150
                and r > g + 32
                and b > g + 32
            )
            if a < 8 or bright_checker or magenta_key:
                pixels[x, y] = (r, g, b, 0)
    alpha = image.getchannel("A")
    alpha = alpha.filter(ImageFilter.GaussianBlur(0.35))
    alpha = alpha.point(lambda value: 0 if value < 18 else value)
    image.putalpha(alpha)
    return image


def trim_alpha(image: Image.Image, padding: int = 10) -> Image.Image:
    bbox = image.getchannel("A").getbbox()
    if not bbox:
        return Image.new("RGBA", (1, 1), (0, 0, 0, 0))
    left, top, right, bottom = bbox
    return image.crop((
        max(0, left - padding),
        max(0, top - padding),
        min(image.width, right + padding),
        min(image.height, bottom + padding),
    ))


def keep_primary_components(image: Image.Image, frame_key: str = "") -> Image.Image:
    image = image.convert("RGBA")
    width, height = image.size
    alpha = image.getchannel("A")
    seen = bytearray(width * height)
    components: list[dict] = []

    for start_y in range(height):
        for start_x in range(width):
            index = start_y * width + start_x
            if seen[index] or alpha.getpixel((start_x, start_y)) <= 18:
                continue
            stack = [(start_x, start_y)]
            seen[index] = 1
            count = 0
            left = right = start_x
            top = bottom = start_y
            while stack:
                x, y = stack.pop()
                count += 1
                left = min(left, x)
                right = max(right, x)
                top = min(top, y)
                bottom = max(bottom, y)
                for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                    if nx < 0 or nx >= width or ny < 0 or ny >= height:
                        continue
                    next_index = ny * width + nx
                    if seen[next_index] or alpha.getpixel((nx, ny)) <= 18:
                        continue
                    seen[next_index] = 1
                    stack.append((nx, ny))
            components.append({
                "area": count,
                "bbox": (left, top, right + 1, bottom + 1),
            })

    if not components:
        return image

    primary = max(components, key=lambda item: item["area"])
    p_left, p_top, p_right, p_bottom = primary["bbox"]
    acid_frame = "Acid" in frame_key or "acid" in frame_key
    expand_x = 180 if acid_frame else 74
    expand_y = 56
    keep_boxes = []
    for component in components:
        left, top, right, bottom = component["bbox"]
        area = component["area"]
        if not acid_frame and component is not primary:
            continue
        center_x = (left + right) / 2
        center_y = (top + bottom) / 2
        near_primary = (
            p_left - expand_x <= center_x <= p_right + expand_x
            and p_top - expand_y <= center_y <= p_bottom + expand_y
        )
        meaningful_acid = acid_frame and area >= 18 and center_x < p_right + expand_x
        if component is primary or (area >= 42 and near_primary) or meaningful_acid:
            keep_boxes.append(component["bbox"])

    if len(keep_boxes) == len(components):
        return image

    source_pixels = image.load()
    next_image = Image.new("RGBA", image.size, (0, 0, 0, 0))
    next_pixels = next_image.load()
    for left, top, right, bottom in keep_boxes:
        for y in range(top, bottom):
            for x in range(left, right):
                if alpha.getpixel((x, y)) > 18:
                    next_pixels[x, y] = source_pixels[x, y]
    return next_image


def remove_tiny_components(image: Image.Image, min_area: int = 360) -> Image.Image:
    image = image.convert("RGBA")
    width, height = image.size
    alpha = image.getchannel("A")
    seen = bytearray(width * height)
    source_pixels = image.load()
    next_image = Image.new("RGBA", image.size, (0, 0, 0, 0))
    next_pixels = next_image.load()

    for start_y in range(height):
        for start_x in range(width):
            index = start_y * width + start_x
            if seen[index] or alpha.getpixel((start_x, start_y)) <= 18:
                continue
            stack = [(start_x, start_y)]
            component_pixels = []
            seen[index] = 1
            while stack:
                x, y = stack.pop()
                component_pixels.append((x, y))
                for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                    if nx < 0 or nx >= width or ny < 0 or ny >= height:
                        continue
                    next_index = ny * width + nx
                    if seen[next_index] or alpha.getpixel((nx, ny)) <= 18:
                        continue
                    seen[next_index] = 1
                    stack.append((nx, ny))
            if len(component_pixels) >= min_area:
                for x, y in component_pixels:
                    next_pixels[x, y] = source_pixels[x, y]

    return next_image


def find_alpha_components(image: Image.Image, min_area: int = 1600) -> list[dict]:
    width, height = image.size
    alpha = image.getchannel("A")
    seen = bytearray(width * height)
    components: list[dict] = []

    for start_y in range(height):
        for start_x in range(width):
            index = start_y * width + start_x
            if seen[index] or alpha.getpixel((start_x, start_y)) <= 18:
                continue
            stack = [(start_x, start_y)]
            seen[index] = 1
            count = 0
            left = right = start_x
            top = bottom = start_y
            while stack:
                x, y = stack.pop()
                count += 1
                left = min(left, x)
                right = max(right, x)
                top = min(top, y)
                bottom = max(bottom, y)
                for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                    if nx < 0 or nx >= width or ny < 0 or ny >= height:
                        continue
                    next_index = ny * width + nx
                    if seen[next_index] or alpha.getpixel((nx, ny)) <= 18:
                        continue
                    seen[next_index] = 1
                    stack.append((nx, ny))
            if count >= min_area:
                components.append({
                    "area": count,
                    "bbox": (left, top, right + 1, bottom + 1),
                })

    return components


def load_component_frames(sheet: Image.Image, frame_count: int, name: str) -> list[Image.Image] | None:
    components = find_alpha_components(sheet)
    if len(components) < frame_count:
        return None

    selected = sorted(components, key=lambda item: item["area"], reverse=True)[:frame_count]
    selected = sorted(selected, key=lambda item: (item["bbox"][0] + item["bbox"][2]) / 2)
    frames = []
    for component in selected:
        left, top, right, bottom = component["bbox"]
        frame = sheet.crop((
            max(0, left - 18),
            max(0, top - 18),
            min(sheet.width, right + 18),
            min(sheet.height, bottom + 18),
        ))
        frames.append(keep_primary_components(trim_alpha(frame, 8), name))
    return frames


def load_sheet_frames(name: str) -> list[Image.Image]:
    file_name, frame_count = SHEET_SPECS[name]
    sheet = remove_checkerboard_background(Image.open(SOURCE_DIR / file_name))
    if name in COMPONENT_SLICED_SHEETS:
        component_frames = load_component_frames(sheet, frame_count, name)
        if component_frames:
            return component_frames

    frames = []
    for index in range(frame_count):
        left = round(index * sheet.width / frame_count)
        right = round((index + 1) * sheet.width / frame_count)
        frame = trim_alpha(sheet.crop((left, 0, right, sheet.height)), 12)
        if name != "acid":
            frame = remove_tiny_components(frame)
        frames.append(frame)
    return frames


def normalize_frame(sprite: Image.Image, frame_key: str) -> Image.Image:
    cell = Image.new("RGBA", (CELL_W, CELL_H), (0, 0, 0, 0))
    sprite = ImageEnhance.Sharpness(sprite).enhance(1.06)
    sprite = ImageEnhance.Contrast(sprite).enhance(1.04)
    defeated = "Defeated" in frame_key or "Death" in frame_key
    acid = "Acid" in frame_key or "AreaAttack" in frame_key
    max_w = 525 if not acid else 540
    max_h = 350 if not defeated else 260
    scale = min(max_w / max(1, sprite.width), max_h / max(1, sprite.height))
    target = (
        max(1, round(sprite.width * scale)),
        max(1, round(sprite.height * scale)),
    )
    sprite = sprite.resize(target, Image.Resampling.LANCZOS)
    x = round((CELL_W - sprite.width) / 2)
    if acid:
        x = max(8, min(CELL_W - sprite.width - 8, x + 12))
    y = GROUND_Y - sprite.height
    if defeated:
        y = GROUND_Y - sprite.height + 14
    cell.alpha_composite(sprite, (x, y))
    return cell


def clean_fallen_pose(sprite: Image.Image) -> Image.Image:
    sprite = sprite.copy()
    pixels = sprite.load()
    width, height = sprite.size
    for y in range(height):
        for x in range(width):
            if x < 34:
                r, g, b, a = pixels[x, y]
                pixels[x, y] = (r, g, b, 0)
    return trim_alpha(sprite, 10)


def main() -> None:
    source_frames = {name: load_sheet_frames(name) for name in SHEET_SPECS}
    regions = {}
    cells: list[tuple[str, Image.Image]] = []

    for frame_key, source_name, frame_index in FRAME_PLAN:
        cells.append((frame_key, normalize_frame(source_frames[source_name][frame_index], frame_key)))

    for sequence_name, (source_name, count) in SEQUENCES.items():
        for index in range(count):
            key = f"{sequence_name}{index + 1}"
            cells.append((key, normalize_frame(source_frames[source_name][index], key)))

    atlas = Image.new("RGBA", (CELL_W * len(cells), CELL_H), (0, 0, 0, 0))
    for index, (key, cell) in enumerate(cells):
        x = index * CELL_W
        atlas.alpha_composite(cell, (x, 0))
        regions[key] = {"x": x, "y": 0, "w": CELL_W, "h": CELL_H}

    atlas.save(OUT_PNG)
    data = {
        "image": OUT_PNG.name,
        "source": "Accepted Scarab Queen regenerated raster animation sheets normalized into the canonical Journey boss atlas.",
        "coordinateNote": "Fixed transparent 560x390 cells. First eleven keys preserve the canonical boss frame contract; additional keys provide Scarab Queen animation sequences.",
        "frameContract": [key for key, *_ in FRAME_PLAN],
        "sequences": {
            "walk": [f"scarabQueenWalk{index}" for index in range(1, 9)],
            "charge": [f"scarabQueenRun{index}" for index in range(1, 9)],
            "windup": [f"scarabQueenWindup{index}" for index in range(1, 7)],
            "areaAttack": [f"scarabQueenAcidSpit{index}" for index in range(1, 9)],
            "acidProjectile": [f"scarabQueenAcid{index}" for index in range(1, 7)],
            "counterWindow": [f"scarabQueenStagger{index}" for index in range(1, 6)],
            "defeated": [f"scarabQueenDeath{index}" for index in range(1, 9)],
        },
        "baseline": "bottom-center fixed per frame; all runtime frames are transparent cutouts from the provided sheets.",
        "productionReference": "source/scarab-queen-v2-generated/",
        "acceptedRegenerations": {
            key: file_name
            for key, (file_name, _) in SHEET_SPECS.items()
            if "regeneration" in file_name
        },
        "regions": regions,
    }
    OUT_JSON.write_text(json.dumps(data, indent=2), encoding="utf-8")
    print(f"Wrote {OUT_PNG.relative_to(ROOT)} and {OUT_JSON.relative_to(ROOT)} with {len(cells)} frames.")


if __name__ == "__main__":
    main()
