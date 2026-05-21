from __future__ import annotations

import json
import shutil
from copy import deepcopy
from pathlib import Path

from PIL import Image, ImageChops


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "output/asha-production/v2-sprite-sources"
LOCOMOTION_SOURCE = SOURCE_DIR / "asha-v2-locomotion-source.png"
ACTION_SOURCE = SOURCE_DIR / "asha-v2-action-source.png"
UTILITY_SOURCE = SOURCE_DIR / "asha-v2-utility-source.png"
REFERENCE_SOURCE = ROOT / "output/asha-production/asha-reference-v2-animation-ready.png"

BASE_ATLAS_JSON = ROOT / "public/assets/expedition/player/asha-hooded-warrior-explorer-spritesheet.json"
TARGET_DIR = ROOT / "public/assets/expedition/player"
TARGET_JSON = TARGET_DIR / "asha-v2-production-candidate-spritesheet.json"
TARGET_PNG = TARGET_DIR / "asha-v2-production-candidate-spritesheet.png"
TARGET_REFERENCE = TARGET_DIR / "asha-v2-production-reference.png"


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

ROW_SOURCES = {
    "idle": (LOCOMOTION_SOURCE, 0),
    "walk": (LOCOMOTION_SOURCE, 1),
    "run": (LOCOMOTION_SOURCE, 2),
    "survey_walk": (LOCOMOTION_SOURCE, 3),
    "jump": (ACTION_SOURCE, 0),
    "fall": (ACTION_SOURCE, 1),
    "land": (ACTION_SOURCE, 2),
    "attack_pick_swing": (ACTION_SOURCE, 3),
    "hurt": (UTILITY_SOURCE, 0),
    "interact": (UTILITY_SOURCE, 1),
    "climb": (UTILITY_SOURCE, 2),
    "push_pull": (UTILITY_SOURCE, 1),
}


def frame_key(row_name: str, index: int) -> str:
    return f"{row_name}_{index:02d}"


def remove_chroma_green_background(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, a = pixels[x, y]
            if g > 150 and g > r * 1.32 and g > b * 1.32:
                pixels[x, y] = (r, g, b, 0)
            elif g > 120 and g > r * 1.14 and g > b * 1.14:
                pixels[x, y] = (r, g, b, 0)
            elif g > 70 and g > r * 2.2 and g > b * 2.2:
                pixels[x, y] = (r, g, b, 0)
    return rgba


def keep_visible_components(image: Image.Image, *, keep_all: bool = False) -> Image.Image:
    rgba = image.convert("RGBA")
    alpha = rgba.getchannel("A").point(lambda value: 255 if value > 62 else 0)
    width, height = rgba.size
    seen = bytearray(width * height)
    alpha_pixels = alpha.load()
    components: list[list[tuple[int, int]]] = []

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
            if len(pixels) > 350:
                components.append(pixels)

    if not components:
        return rgba

    selected = components if keep_all else [max(components, key=len)]
    mask = Image.new("L", rgba.size, 0)
    mask_pixels = mask.load()
    for component in selected:
        for x, y in component:
            mask_pixels[x, y] = 255

    kept = Image.new("RGBA", rgba.size, (0, 0, 0, 0))
    kept.alpha_composite(rgba)
    kept.putalpha(ImageChops.multiply(rgba.getchannel("A"), mask))
    return kept


def trim_to_visible(image: Image.Image) -> Image.Image:
    alpha = image.getchannel("A")
    bbox = alpha.point(lambda value: 255 if value > 20 else 0).getbbox()
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


def sheet_cell(source: Image.Image, *, row: int, column: int) -> Image.Image:
    cell_w = source.width / 8
    cell_h = source.height / 4
    pad_x = round(cell_w * 0.22)
    pad_y = round(cell_h * 0.08)
    left = max(0, round(column * cell_w) - pad_x)
    top = max(0, round(row * cell_h) - pad_y)
    right = min(source.width, round((column + 1) * cell_w) + pad_x)
    bottom = min(source.height, round((row + 1) * cell_h) + pad_y)
    return source.crop((left, top, right, bottom))


def row_component_cells(source: Image.Image, *, row: int, expected_count: int = 8) -> list[Image.Image]:
    cell_h = source.height / 4
    top = round(row * cell_h)
    bottom = round((row + 1) * cell_h)
    band = source.crop((0, top, source.width, bottom)).convert("RGBA")
    alpha = band.getchannel("A").point(lambda value: 255 if value > 62 else 0)
    width, height = band.size
    seen = bytearray(width * height)
    alpha_pixels = alpha.load()
    components: list[tuple[int, int, int, int, int]] = []

    for start_y in range(height):
        for start_x in range(width):
            start_index = start_y * width + start_x
            if seen[start_index] or alpha_pixels[start_x, start_y] == 0:
                continue
            queue = [(start_x, start_y)]
            seen[start_index] = 1
            count = 0
            min_x = max_x = start_x
            min_y = max_y = start_y
            for x, y in queue:
                count += 1
                min_x = min(min_x, x)
                max_x = max(max_x, x)
                min_y = min(min_y, y)
                max_y = max(max_y, y)
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= nx < width and 0 <= ny < height:
                        index = ny * width + nx
                        if not seen[index] and alpha_pixels[nx, ny] != 0:
                            seen[index] = 1
                            queue.append((nx, ny))
            if count > 700:
                components.append((count, min_x, min_y, max_x + 1, max_y + 1))

    components = sorted(components, key=lambda component: component[0], reverse=True)[:expected_count]
    components = sorted(components, key=lambda component: (component[1] + component[3]) / 2)
    if len(components) != expected_count:
        return [
            keep_visible_components(sheet_cell(source, row=row, column=column))
            for column in range(expected_count)
        ]

    cells = []
    for _count, left, top, right, bottom in components:
        pad = 14
        cells.append(band.crop((
            max(0, left - pad),
            max(0, top - pad),
            min(width, right + pad),
            min(height, bottom + pad),
        )))
    return cells


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
    max_source_width = cell_w - 20
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

    sources = {
        path: remove_chroma_green_background(Image.open(path))
        for path in {source for source, _row in ROW_SOURCES.values()}
    }
    target = Image.new("RGBA", (cell_w * 8, cell_h * len(ROW_INDEX)), (0, 0, 0, 0))
    regions = {}
    pose_sources = {}

    for row_name, target_row in ROW_INDEX.items():
        source_path, source_row = ROW_SOURCES[row_name]
        source = sources[source_path]
        for column in range(8):
            key = frame_key(row_name, column)
            raw_cell = sheet_cell(source, row=source_row, column=column)
            sprite = keep_visible_components(raw_cell)
            regions[key] = paste_sprite_cell(
                target,
                sprite,
                row_index=target_row,
                column=column,
                cell_w=cell_w,
                cell_h=cell_h,
                ground_line_y=ground_line_y,
                max_source_height=max_source_height,
            )
            pose_sources[key] = f"{source_path.name}:row_{source_row}:col_{column}"

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
    metadata["source"] = "asha-v2-generated-source-strip-candidate-2026-05-21"
    metadata["status"] = "production-candidate-needs-in-game-review"
    metadata["productionReference"] = TARGET_REFERENCE.name
    metadata["description"] = (
        "Asha V2 playable candidate atlas generated from the approved V2 character reference and "
        "repacked into the existing Journey 256px player atlas contract for in-game review."
    )
    metadata["draw"]["height"] = 112
    metadata["rows"] = rows
    metadata["regions"] = regions
    metadata["poseSources"] = pose_sources

    target.save(TARGET_PNG)
    shutil.copyfile(REFERENCE_SOURCE, TARGET_REFERENCE)
    TARGET_JSON.write_text(f"{json.dumps(metadata, indent=2)}\n", encoding="utf-8")
    print(f"Wrote {TARGET_PNG.relative_to(ROOT)}")
    print(f"Wrote {TARGET_JSON.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
