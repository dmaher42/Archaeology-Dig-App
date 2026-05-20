from __future__ import annotations

import json
import shutil
from copy import deepcopy
from pathlib import Path

from PIL import Image, ImageChops


ROOT = Path(__file__).resolve().parents[1]
ATLAS_JSON = ROOT / "public/assets/expedition/player/asha-hooded-warrior-explorer-spritesheet.json"
ATLAS_PNG = ROOT / "public/assets/expedition/player/asha-hooded-warrior-explorer-spritesheet.png"
LOCOMOTION_SOURCE = ROOT / "public/assets/expedition/player/asha-hooded-warrior-explorer-production-locomotion-source.png"
SPRINT_SOURCE = ROOT / "public/assets/expedition/player/asha-hooded-warrior-explorer-production-sprint-source.png"
AIR_SOURCE = ROOT / "public/assets/expedition/player/asha-hooded-warrior-explorer-production-air-source.png"
ATTACK_SOURCE = ROOT / "public/assets/expedition/player/asha-hooded-warrior-explorer-production-attack-source.png"
LEGACY_SOURCE = ROOT / "public/assets/expedition/player/asha-hooded-warrior-explorer-generated-sheet.png"
UTILITY_SOURCE_JSON = ROOT / "public/assets/expedition/player/asha-hooded-warrior-explorer-utility-source.json"
UTILITY_SOURCE_PNG = ROOT / "public/assets/expedition/player/asha-hooded-warrior-explorer-utility-source.png"


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


GENERATED_ROWS = {
    "walk": 0,
    "survey_walk": 0,
}

BASE_ROWS = ["idle", "hurt", "interact", "climb", "push_pull"]
ATTACK_SOURCE_COLUMNS = list(range(8))
JUMP_AIR_COLUMNS = list(range(8))
FALL_AIR_COLUMNS = [3, 4, 5, 6, 7, 6, 5, 4]
LAND_AIR_COLUMNS = [0, 1, 2, 3, 3, 3, 3, 3]
UTILITY_ROW_SOURCE_COLUMNS = {
    "hurt": [4, 4, 4, 4, 4, 4, 4, 4],
    "interact": [3, 3, 3, 3, 3, 3, 3, 3],
    "climb": [5, 5, 5, 5, 5, 5, 5, 5],
    "push_pull": [6, 6, 6, 6, 6, 6, 6, 6],
}


def frame_key(row_name: str, index: int) -> str:
    return f"{row_name}_{index:02d}"


def remove_checkerboard_background(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, a = pixels[x, y]
            brightest = max(r, g, b)
            darkest = min(r, g, b)
            if brightest > 214 and brightest - darkest < 28:
                pixels[x, y] = (r, g, b, 0)
            elif brightest > 196 and brightest - darkest < 18:
                pixels[x, y] = (r, g, b, min(a, 60))
    return rgba


def remove_chroma_green_background(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, a = pixels[x, y]
            if g > 150 and g > r * 1.35 and g > b * 1.35:
                pixels[x, y] = (r, g, b, 0)
            elif g > 120 and g > r * 1.18 and g > b * 1.18:
                pixels[x, y] = (r, g, b, min(a, 60))
    return rgba


def keep_largest_visible_component(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    alpha = rgba.getchannel("A").point(lambda value: 255 if value > 72 else 0)
    width, height = rgba.size
    seen = bytearray(width * height)
    alpha_pixels = alpha.load()
    best_pixels: list[tuple[int, int]] = []

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
            if len(pixels) > len(best_pixels):
                best_pixels = pixels

    if not best_pixels:
        return rgba

    mask = Image.new("L", rgba.size, 0)
    mask_pixels = mask.load()
    for x, y in best_pixels:
        mask_pixels[x, y] = 255

    kept = Image.new("RGBA", rgba.size, (0, 0, 0, 0))
    kept.alpha_composite(rgba)
    kept.putalpha(ImageChops.multiply(rgba.getchannel("A"), mask))
    return kept


def keep_cyan_slash_effect(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            is_slash = b >= 145 and g >= 120 and b >= r + 18
            if not is_slash:
                pixels[x, y] = (r, g, b, 0)
    return keep_largest_visible_component(rgba)


def trim_to_visible(image: Image.Image) -> Image.Image:
    alpha = image.getchannel("A")
    bbox = alpha.point(lambda value: 255 if value > 28 else 0).getbbox()
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
    max_source_width = cell_w - 24
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


def sheet_cell(source: Image.Image, *, rows: int, row: int, column: int) -> Image.Image:
    cell_w = source.width / 8
    cell_h = source.height / rows
    left = round(column * cell_w)
    top = round(row * cell_h)
    right = round((column + 1) * cell_w)
    bottom = round((row + 1) * cell_h)
    return source.crop((left, top, right, bottom))


def visible_component_cells(source: Image.Image, *, expected_count: int) -> list[Image.Image]:
    rgba = source.convert("RGBA")
    alpha = rgba.getchannel("A").point(lambda value: 255 if value > 72 else 0)
    width, height = rgba.size
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
            if count > 500:
                components.append((count, min_x, min_y, max_x + 1, max_y + 1))

    components = sorted(components, key=lambda component: component[1])
    if len(components) != expected_count:
        raise ValueError(f"Expected {expected_count} sprite components, found {len(components)}")

    cells = []
    for _count, left, top, right, bottom in components:
        pad = 10
        box = (
            max(0, left - pad),
            max(0, top - pad),
            min(width, right + pad),
            min(height, bottom + pad),
        )
        cells.append(rgba.crop(box))
    return cells


def attack_source_cell(source: Image.Image, source_column: int) -> Image.Image:
    cell = sheet_cell(source, rows=1, row=0, column=source_column)
    return keep_largest_visible_component(remove_chroma_green_background(cell))


def copy_existing_cell(
    target: Image.Image,
    source_image: Image.Image,
    source_region: dict,
    *,
    target_row: int,
    column: int,
    cell_w: int,
    cell_h: int,
) -> dict:
    source_box = (
        source_region["x"],
        source_region["y"],
        source_region["x"] + source_region["w"],
        source_region["y"] + source_region["h"],
    )
    cell = source_image.crop(source_box)
    target_x = column * cell_w
    target_y = target_row * cell_h
    target.alpha_composite(cell, (target_x, target_y))
    target_region = deepcopy(source_region)
    target_region["x"] = target_x
    target_region["y"] = target_y
    return target_region


def main() -> None:
    metadata = json.loads(ATLAS_JSON.read_text(encoding="utf-8"))
    utility_metadata = json.loads(UTILITY_SOURCE_JSON.read_text(encoding="utf-8"))
    source_image = Image.open(UTILITY_SOURCE_PNG).convert("RGBA")
    locomotion_source = remove_chroma_green_background(remove_checkerboard_background(Image.open(LOCOMOTION_SOURCE)))
    sprint_source = remove_chroma_green_background(Image.open(SPRINT_SOURCE))
    sprint_cells = visible_component_cells(sprint_source, expected_count=8)
    air_source = remove_chroma_green_background(Image.open(AIR_SOURCE))
    attack_source = Image.open(ATTACK_SOURCE).convert("RGBA")
    attack_cells = visible_component_cells(remove_chroma_green_background(attack_source), expected_count=8)
    cell_w = utility_metadata["frame"]["width"]
    cell_h = utility_metadata["frame"]["height"]
    ground_line_y = utility_metadata["frame"]["groundLineY"]
    max_source_height = utility_metadata["draw"]["sourceHeight"]

    rebuilt_image = Image.new("RGBA", source_image.size, (0, 0, 0, 0))
    rebuilt_regions = {}
    pose_sources = {}

    for row_name in ["idle"]:
        target_row = ROW_INDEX[row_name]
        for column in range(8):
            source_key = frame_key(row_name, 0 if row_name == "idle" else column)
            target_key = frame_key(row_name, column)
            rebuilt_regions[target_key] = copy_existing_cell(
                rebuilt_image,
                source_image,
                utility_metadata["regions"][source_key],
                target_row=target_row,
                column=column,
                cell_w=cell_w,
                cell_h=cell_h,
            )
            pose_sources[target_key] = source_key

    for row_name, source_columns in UTILITY_ROW_SOURCE_COLUMNS.items():
        for column, source_column in enumerate(source_columns):
            target_key = frame_key(row_name, column)
            sprite = keep_largest_visible_component(sheet_cell(air_source, rows=2, row=1, column=source_column))
            rebuilt_regions[target_key] = paste_sprite_cell(
                rebuilt_image,
                sprite,
                row_index=ROW_INDEX[row_name],
                column=column,
                cell_w=cell_w,
                cell_h=cell_h,
                ground_line_y=ground_line_y,
                max_source_height=max_source_height,
            )
            pose_sources[target_key] = f"production_air_source_row_1_col_{source_column}"

    for row_name, source_row in GENERATED_ROWS.items():
        for column in range(8):
            target_key = frame_key(row_name, column)
            sprite = keep_largest_visible_component(sheet_cell(locomotion_source, rows=4, row=source_row, column=column))
            rebuilt_regions[target_key] = paste_sprite_cell(
                rebuilt_image,
                sprite,
                row_index=ROW_INDEX[row_name],
                column=column,
                cell_w=cell_w,
                cell_h=cell_h,
                ground_line_y=ground_line_y,
                max_source_height=max_source_height,
            )
            pose_sources[target_key] = f"production_locomotion_source_row_{source_row}_col_{column}"

    for column in range(8):
        target_key = frame_key("run", column)
        sprite = keep_largest_visible_component(sprint_cells[column])
        rebuilt_regions[target_key] = paste_sprite_cell(
            rebuilt_image,
            sprite,
            row_index=ROW_INDEX["run"],
            column=column,
            cell_w=cell_w,
            cell_h=cell_h,
            ground_line_y=ground_line_y,
            max_source_height=max_source_height,
        )
        pose_sources[target_key] = f"production_sprint_source_col_{column}"

    for column, source_column in enumerate(JUMP_AIR_COLUMNS):
        target_key = frame_key("jump", column)
        sprite = keep_largest_visible_component(sheet_cell(air_source, rows=2, row=0, column=source_column))
        rebuilt_regions[target_key] = paste_sprite_cell(
            rebuilt_image,
            sprite,
            row_index=ROW_INDEX["jump"],
            column=column,
            cell_w=cell_w,
            cell_h=cell_h,
            ground_line_y=ground_line_y,
            max_source_height=max_source_height,
        )
        pose_sources[target_key] = f"production_air_source_row_0_col_{source_column}"

    for column, source_column in enumerate(ATTACK_SOURCE_COLUMNS):
        target_key = frame_key("attack_pick_swing", column)
        sprite = keep_largest_visible_component(attack_cells[source_column])
        rebuilt_regions[target_key] = paste_sprite_cell(
            rebuilt_image,
            sprite,
            row_index=ROW_INDEX["attack_pick_swing"],
            column=column,
            cell_w=cell_w,
            cell_h=cell_h,
            ground_line_y=ground_line_y,
            max_source_height=max_source_height,
        )
        pose_sources[target_key] = f"attack_source_col_{source_column}"

    for column, source_column in enumerate(FALL_AIR_COLUMNS):
        target_key = frame_key("fall", column)
        sprite = keep_largest_visible_component(sheet_cell(air_source, rows=2, row=0, column=source_column))
        rebuilt_regions[target_key] = paste_sprite_cell(
            rebuilt_image,
            sprite,
            row_index=ROW_INDEX["fall"],
            column=column,
            cell_w=cell_w,
            cell_h=cell_h,
            ground_line_y=ground_line_y,
            max_source_height=max_source_height,
        )
        pose_sources[target_key] = f"production_air_source_row_0_col_{source_column}"

    for column, source_column in enumerate(LAND_AIR_COLUMNS):
        target_key = frame_key("land", column)
        sprite = keep_largest_visible_component(sheet_cell(air_source, rows=2, row=1, column=source_column))
        rebuilt_regions[target_key] = paste_sprite_cell(
            rebuilt_image,
            sprite,
            row_index=ROW_INDEX["land"],
            column=column,
            cell_w=cell_w,
            cell_h=cell_h,
            ground_line_y=ground_line_y,
            max_source_height=max_source_height,
        )
        pose_sources[target_key] = f"production_air_source_row_1_col_{source_column}"

    rebuilt_rows = []
    for row in metadata["rows"]:
        row_name = row["name"]
        rebuilt_row = deepcopy(row)
        rebuilt_row["row"] = ROW_INDEX[row_name]
        rebuilt_row["frames"] = [frame_key(row_name, index) for index in range(8)]
        if row_name == "idle":
            rebuilt_row["frameCount"] = 1
            rebuilt_row["frames"] = ["idle_00"]
        else:
            rebuilt_row["frameCount"] = 8
        rebuilt_rows.append(rebuilt_row)

    metadata["source"] = "controlled-hybrid-production-asha-atlas-2026-05-20"
    metadata["description"] = (
        "Complete Ancient Egypt hooded warrior/explorer runtime atlas rebuilt through a controlled hybrid "
        "production pipeline using the approved hooded Asha character design. Locomotion, air, landing, "
        "utility, and shield/khopesh combat rows are repacked from dedicated purpose-generated source strips "
        "while the existing Journey hero-atlas contract, renderer, controls, hitboxes, and progression remain unchanged."
    )
    metadata["rows"] = rebuilt_rows
    metadata["regions"] = rebuilt_regions
    metadata["poseSources"] = pose_sources

    temp_atlas_png = ATLAS_PNG.with_suffix(".tmp.png")
    rebuilt_image.save(temp_atlas_png)
    shutil.copyfile(temp_atlas_png, ATLAS_PNG)
    temp_atlas_png.unlink(missing_ok=True)
    ATLAS_JSON.write_text(f"{json.dumps(metadata, indent=2)}\n", encoding="utf-8")
    print(f"Rebuilt {ATLAS_PNG.relative_to(ROOT)}")
    print(f"Updated {ATLAS_JSON.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
