from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "public/assets/expedition/player/asha-final-production-source"
BASE_ATLAS_JSON = ROOT / "public/assets/expedition/player/asha-hooded-warrior-explorer-spritesheet.json"
TARGET_DIR = ROOT / "public/assets/expedition/player"
TARGET_JSON = TARGET_DIR / "asha-final-production-spritesheet.json"
TARGET_PNG = TARGET_DIR / "asha-final-production-spritesheet.png"
TARGET_REFERENCE = TARGET_DIR / "asha-final-production-reference.png"
TARGET_DRAW_HEIGHT = 108


SOURCES = {
    "idle": SOURCE_DIR / "asha-final-idle-source.png",
    "run": SOURCE_DIR / "asha-final-run-source.png",
    "jump": SOURCE_DIR / "asha-final-jump-source.png",
    "climb": SOURCE_DIR / "asha-final-climb-source.png",
    "interact": SOURCE_DIR / "asha-final-interact-source.png",
    "hurt": SOURCE_DIR / "asha-final-damage-source.png",
    "death": SOURCE_DIR / "asha-final-death-source.png",
    "portrait": SOURCE_DIR / "asha-final-portrait-source.png",
    "attack_pick_swing": SOURCE_DIR / "asha-final-warrior-sword-attack-source.png",
}

SOURCE_FRAME_COUNTS = {
    "idle": 8,
    "run": 8,
    "jump": 6,
    "climb": 8,
    "interact": 8,
    "hurt": 6,
    "death": 8,
    "portrait": 4,
    "attack_pick_swing": 8,
}

SOURCE_CROP_BOXES = {
    "attack_pick_swing": [
        (0, 282),
        (276, 520),
        (520, 785),
        (760, 1190),
        (1130, 1408),
        (1398, 1580),
        (1538, 1832),
        (1810, 2048),
    ],
}

ROW_INDEX = {
    "idle": 0,
    "walk": 1,
    "run": 2,
    "survey_walk": 3,
    "jump": 4,
    "fall": 5,
    "land": 6,
    "attack_pick_swing": 7,
    "hurt": 8,
    "interact": 9,
    "climb": 10,
    "push_pull": 11,
}

ROW_SOURCE = {
    "idle": ("idle", [0, 1, 2, 3, 4, 5, 6, 7]),
    "walk": ("run", [0, 1, 2, 3, 4, 5, 6, 7]),
    "run": ("run", [0, 1, 2, 3, 4, 5, 6, 7]),
    "survey_walk": ("run", [0, 1, 2, 3, 4, 5, 6, 7]),
    "jump": ("jump", [0, 1, 2, 3, 3, 3, 3, 3]),
    "fall": ("jump", [2, 3, 3, 4, 4, 4, 5, 5]),
    "land": ("jump", [5, 5, 5, 5, 5, 5, 5, 5]),
    "attack_pick_swing": ("attack_pick_swing", [0, 1, 2, 3, 4, 5, 6, 7]),
    "hurt": ("hurt", [0, 1, 2, 3, 4, 5, 5, 5]),
    "interact": ("interact", [0, 1, 2, 3, 4, 5, 6, 7]),
    "climb": ("climb", [0, 1, 2, 3, 4, 5, 6, 7]),
    "push_pull": ("interact", [2, 2, 2, 3, 3, 3, 3, 3]),
}


def frame_key(row_name: str, index: int) -> str:
    return f"{row_name}_{index:02d}"


def remove_checkerboard_background(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    data = np.array(rgba)
    rgb = data[..., :3].astype(np.int16)
    brightest = rgb.max(axis=2)
    darkest = rgb.min(axis=2)
    low_chroma = (brightest - darkest) < 34
    pale_checker = (brightest > 216) & low_chroma
    data[..., 3] = np.where(pale_checker, 0, data[..., 3])
    return Image.fromarray(data, "RGBA")


def remove_cell_edges(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    alpha = rgba.getchannel("A")
    bbox = alpha.point(lambda value: 255 if value > 32 else 0).getbbox()
    if bbox is None:
      return rgba
    return rgba.crop(bbox)


def keep_visible_components(image: Image.Image, *, min_pixels: int = 110) -> Image.Image:
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

    largest = max(len(component) for component, _min_x, _max_x in components)
    largest_component = max(components, key=lambda component: len(component[0]))
    selected = [
        component for component, min_x, max_x in components
        if component is largest_component[0]
        or (
            len(component) >= max(min_pixels, largest * 0.12)
            and width * 0.12 <= (min_x + max_x) / 2 <= width * 0.88
        )
    ]
    mask = Image.new("L", rgba.size, 0)
    mask_pixels = mask.load()
    for component in selected:
        for x, y in component:
            mask_pixels[x, y] = 255

    kept = Image.new("RGBA", rgba.size, (0, 0, 0, 0))
    kept.alpha_composite(rgba)
    kept.putalpha(ImageChops.multiply(rgba.getchannel("A"), mask))
    return kept


def extract_frame(source: Image.Image, *, source_name: str, frame_count: int, frame_index: int) -> Image.Image:
    if source_name in SOURCE_CROP_BOXES:
        left, right = SOURCE_CROP_BOXES[source_name][frame_index]
    else:
        cell_w = source.width / frame_count
        pad_x = 0
        left = max(0, round(frame_index * cell_w) - pad_x)
        right = min(source.width, round((frame_index + 1) * cell_w) + pad_x)
    cell = source.crop((left, 0, right, source.height))
    return remove_cell_edges(keep_visible_components(cell))


def trim_to_visible(image: Image.Image) -> Image.Image:
    alpha = image.getchannel("A")
    bbox = alpha.point(lambda value: 255 if value > 18 else 0).getbbox()
    if bbox is None:
        return image
    return image.crop(bbox)


def measure_bounds(image: Image.Image) -> dict[str, int]:
    alpha = image.getchannel("A")
    bbox = alpha.point(lambda value: 255 if value > 18 else 0).getbbox()
    if bbox is None:
        return {"x": 0, "y": 0, "w": 1, "h": 1}
    left, top, right, bottom = bbox
    return {"x": left, "y": top, "w": right - left, "h": bottom - top}


def paste_sprite_cell(
    target: Image.Image,
    sprite: Image.Image,
    *,
    row_index: int,
    column: int,
    cell_w: int,
    cell_h: int,
    ground_line_y: int,
    max_source_height: int,
) -> dict[str, int]:
    fitted = trim_to_visible(sprite)
    max_source_width = cell_w - 14
    scale = min(
        1,
        max_source_height / fitted.height if fitted.height > 0 else 1,
        max_source_width / fitted.width if fitted.width > 0 else 1,
    )
    if scale < 1:
        fitted = fitted.resize(
            (max(1, round(fitted.width * scale)), max(1, round(fitted.height * scale))),
            Image.Resampling.LANCZOS,
        )

    target_x = column * cell_w
    target_y = row_index * cell_h
    paste_x = target_x + round((cell_w - fitted.width) / 2)
    paste_y = target_y + ground_line_y - fitted.height
    target.alpha_composite(fitted, (paste_x, paste_y))
    local_bounds = measure_bounds(fitted)
    return {
        "x": target_x,
        "y": target_y,
        "w": cell_w,
        "h": cell_h,
        "drawBounds": {
            "x": paste_x - target_x + local_bounds["x"],
            "y": paste_y - target_y + local_bounds["y"],
            "w": local_bounds["w"],
            "h": local_bounds["h"],
        },
        "groundLineY": ground_line_y,
    }


def main() -> None:
    metadata = json.loads(BASE_ATLAS_JSON.read_text(encoding="utf-8"))
    cell_w = int(metadata["frame"]["width"])
    cell_h = int(metadata["frame"]["height"])
    ground_line_y = int(metadata["frame"]["groundLineY"])
    max_source_height = int(metadata["draw"]["sourceHeight"])

    cleaned_sources = {
        name: remove_checkerboard_background(Image.open(path))
        for name, path in SOURCES.items()
    }
    extracted = {
        name: [
            extract_frame(
                cleaned_sources[name],
                source_name=name,
                frame_count=SOURCE_FRAME_COUNTS[name],
                frame_index=index,
            )
            for index in range(SOURCE_FRAME_COUNTS[name])
        ]
        for name in SOURCE_FRAME_COUNTS
    }

    target = Image.new("RGBA", (cell_w * 8, cell_h * len(ROW_INDEX)), (0, 0, 0, 0))
    regions = {}
    pose_sources = {}

    for row_name, target_row in ROW_INDEX.items():
        source_name, source_indices = ROW_SOURCE[row_name]
        for column, source_index in enumerate(source_indices):
            key = frame_key(row_name, column)
            regions[key] = paste_sprite_cell(
                target,
                extracted[source_name][source_index],
                row_index=target_row,
                column=column,
                cell_w=cell_w,
                cell_h=cell_h,
                ground_line_y=ground_line_y,
                max_source_height=max_source_height,
            )
            pose_sources[key] = f"{SOURCES[source_name].name}:frame_{source_index:02d}"

    rows = []
    for row in metadata["rows"]:
        row_name = row["name"]
        next_row = deepcopy(row)
        next_row["row"] = ROW_INDEX[row_name]
        next_row["frames"] = [frame_key(row_name, index) for index in range(8)]
        next_row["frameCount"] = 1 if row_name == "idle" else 8
        if row_name == "idle":
            next_row["frames"] = ["idle_00"]
        rows.append(next_row)

    metadata["image"] = TARGET_PNG.name
    metadata["source"] = "imagegen-final-production-asha-separated-sheets-2026-05-22"
    metadata["status"] = "production-candidate-final-asha-warrior-sword"
    metadata["productionReference"] = TARGET_REFERENCE.name
    metadata["description"] = (
        "Final production Asha runtime atlas packed from separated ImageGen sheets. "
        "Uses the approved premium archaeology-adventure Asha design with a warrior sword "
        "combat row, while preserving the existing Journey hero-atlas row contract."
    )
    metadata["draw"]["height"] = TARGET_DRAW_HEIGHT
    metadata["draw"]["sourceHeight"] = max_source_height
    metadata["draw"]["integratedAttackTool"] = True
    metadata["draw"]["suppressExternalWeapon"] = True
    metadata["draw"]["suppressExternalWeaponDuringAttack"] = True
    metadata["draw"]["suppressRuntimeAttackArc"] = True
    metadata["rows"] = rows
    metadata["regions"] = regions
    metadata["poseSources"] = pose_sources
    metadata["unusedSourceSheets"] = {
        "death": SOURCES["death"].name,
        "portrait": SOURCES["portrait"].name,
    }

    target.save(TARGET_PNG)
    Image.open(SOURCES["portrait"]).save(TARGET_REFERENCE)
    TARGET_JSON.write_text(f"{json.dumps(metadata, indent=2)}\n", encoding="utf-8")
    print(f"Wrote {TARGET_PNG.relative_to(ROOT)}")
    print(f"Wrote {TARGET_JSON.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
