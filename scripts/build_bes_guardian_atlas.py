from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "asset-sources/expedition/enemies/bes-guardian-source"
TARGET_DIR = ROOT / "public/assets/expedition/enemies"
TARGET_JSON = TARGET_DIR / "bes-guardian-sprites.json"
TARGET_PNG = TARGET_DIR / "bes-guardian-sprites.png"

SOURCES = {
    "idle": SOURCE_DIR / "bes-guardian-idle-source.png",
    "move": SOURCE_DIR / "bes-guardian-move-source.png",
    "attack": SOURCE_DIR / "bes-guardian-attack-source.png",
    "damage": SOURCE_DIR / "bes-guardian-damage-death-source.png",
}

FRAME_COUNT = 8
CELL_W = 416
CELL_H = 400
REGION_W = 356
REGION_H = 330
REGION_X_PAD = (CELL_W - REGION_W) // 2
REGION_Y = 38

FRAME_SOURCES = [
    ("besGuardianIdle", "idle", 1),
    ("besGuardianWalk1", "move", 1),
    ("besGuardianWalk2", "move", 3),
    ("besGuardianWalk3", "move", 5),
    ("besGuardianWindup", "attack", 1),
    ("besGuardianAttack", "attack", 4),
    ("besGuardianHit", "damage", 1),
    ("besGuardianDefeated", "damage", 7),
]


def remove_checkerboard_background(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    data = np.array(rgba)
    rgb = data[..., :3].astype(np.int16)
    brightest = rgb.max(axis=2)
    darkest = rgb.min(axis=2)
    low_chroma = (brightest - darkest) < 38
    pale_checker = (brightest > 214) & low_chroma
    data[..., 3] = np.where(pale_checker, 0, data[..., 3])
    return Image.fromarray(data, "RGBA")


def trim(image: Image.Image) -> Image.Image:
    alpha = image.getchannel("A")
    bbox = alpha.point(lambda value: 255 if value > 18 else 0).getbbox()
    return image.crop(bbox) if bbox else Image.new("RGBA", (1, 1), (0, 0, 0, 0))


def keep_centered_components(image: Image.Image, *, min_pixels: int = 80) -> Image.Image:
    rgba = image.convert("RGBA")
    alpha = rgba.getchannel("A").point(lambda value: 255 if value > 36 else 0)
    width, height = rgba.size
    seen = bytearray(width * height)
    alpha_pixels = alpha.load()
    components: list[tuple[list[tuple[int, int]], int, int]] = []

    for start_y in range(height):
        for start_x in range(width):
            start_index = start_y * width + start_x
            if seen[start_index] or alpha_pixels[start_x, start_y] == 0:
                continue
            queue = [(start_x, start_y)]
            seen[start_index] = 1
            pixels: list[tuple[int, int]] = []
            for x, y in queue:
                pixels.append((x, y))
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= nx < width and 0 <= ny < height:
                        index = ny * width + nx
                        if not seen[index] and alpha_pixels[nx, ny] != 0:
                            seen[index] = 1
                            queue.append((nx, ny))
            if len(pixels) >= min_pixels:
                min_x = min(x for x, _y in pixels)
                max_x = max(x for x, _y in pixels)
                components.append((pixels, min_x, max_x))

    if not components:
        return rgba

    largest = max(len(pixels) for pixels, _min_x, _max_x in components)
    selected = []
    for pixels, min_x, max_x in components:
        touches_crop_edge = min_x <= 2 or max_x >= width - 3
        center_x = (min_x + max_x) / 2
        is_main_body = len(pixels) == largest
        is_readable_detail = len(pixels) >= largest * 0.18 or width * 0.08 <= center_x <= width * 0.92
        if is_readable_detail and (not touches_crop_edge or is_main_body):
            selected.append(pixels)
    mask = Image.new("L", rgba.size, 0)
    mask_pixels = mask.load()
    for pixels in selected:
        for x, y in pixels:
            mask_pixels[x, y] = 255

    kept = Image.new("RGBA", rgba.size, (0, 0, 0, 0))
    kept.alpha_composite(rgba)
    kept.putalpha(mask)
    return kept


def extract_frame(source: Image.Image, frame_index: int) -> Image.Image:
    cell_w = source.width / FRAME_COUNT
    left = max(0, round(frame_index * cell_w))
    right = min(source.width, round((frame_index + 1) * cell_w))
    cell = source.crop((left, 0, right, source.height))
    return trim(keep_centered_components(cell))


def fit_sprite(sprite: Image.Image) -> Image.Image:
    fitted = trim(sprite)
    max_w = REGION_W - 18
    max_h = REGION_H - 18
    scale = min(
        1,
        max_w / fitted.width if fitted.width > 0 else 1,
        max_h / fitted.height if fitted.height > 0 else 1,
    )
    if scale < 1:
        fitted = fitted.resize(
            (max(1, round(fitted.width * scale)), max(1, round(fitted.height * scale))),
            Image.Resampling.LANCZOS,
        )
    return fitted


def main() -> None:
    sources = {key: remove_checkerboard_background(Image.open(path)) for key, path in SOURCES.items()}
    atlas = Image.new("RGBA", (CELL_W * len(FRAME_SOURCES), CELL_H), (0, 0, 0, 0))
    regions = {}

    for column, (key, source_key, frame_index) in enumerate(FRAME_SOURCES):
        sprite = fit_sprite(extract_frame(sources[source_key], frame_index))
        region_x = column * CELL_W + REGION_X_PAD
        region_y = REGION_Y
        x = region_x + (REGION_W - sprite.width) // 2
        y = region_y + REGION_H - sprite.height - 9
        atlas.alpha_composite(sprite, (x, y))
        regions[key] = {"x": region_x, "y": region_y, "w": REGION_W, "h": REGION_H}

    TARGET_DIR.mkdir(parents=True, exist_ok=True)
    atlas.save(TARGET_PNG)
    TARGET_JSON.write_text(
        json.dumps(
            {
                "image": TARGET_PNG.name,
                "source": "Production Bes guardian atlas generated from Bes source sheets and normalized into the existing Journey enemy frame contract.",
                "coordinateNote": "Eight fixed cells: Idle, Walk1, Walk2, Walk3, Windup, Attack, Hit, Defeated. Regions share one bottom-center anchor.",
                "frameContract": ["Idle", "Walk1", "Walk2", "Walk3", "Windup", "Attack", "Hit", "Defeated"],
                "baseline": "bottom-center shared per family; no baked large shadow",
                "regions": regions,
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {TARGET_JSON.relative_to(ROOT)} and {TARGET_PNG.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
