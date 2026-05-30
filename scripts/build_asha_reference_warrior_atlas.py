from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "public/assets/expedition/player/asha-reference-warrior-source"
BASE_ATLAS_JSON = ROOT / "public/assets/expedition/player/asha-v5-spritesheet.json"
TARGET_DIR = ROOT / "public/assets/expedition/player"
TARGET_JSON = TARGET_DIR / "asha-reference-warrior-spritesheet.json"
TARGET_PNG = TARGET_DIR / "asha-reference-warrior-spritesheet.png"
TARGET_REFERENCE = TARGET_DIR / "asha-reference-warrior-reference.png"
TARGET_MASTER_REFERENCE = TARGET_DIR / "asha-reference-warrior-master-reference.png"

TARGET_CELL_WIDTH = 390
TARGET_CELL_HEIGHT = 256
TARGET_GROUND_LINE_Y = 236
TARGET_DRAW_HEIGHT = 130
TARGET_SOURCE_HEIGHT = 224
TARGET_RUN_FRAME_DISTANCE = 26

SOURCES = {
    "idle": SOURCE_DIR / "asha-reference-warrior-idle-still-guard-pass1-normalized-4096x512-candidate-2026-05-30.png",
    "run": SOURCE_DIR / "asha-reference-warrior-run-row-raw.png",
    "jump": SOURCE_DIR / "asha-reference-warrior-jump-row-raw.png",
    "attack_pick_swing": SOURCE_DIR / "asha-reference-warrior-attack-chain-01-quick-cut-clean-normalized-4096x512-candidate-2026-05-29.png",
    "attack_pick_swing_alt": SOURCE_DIR / "asha-reference-warrior-attack-chain-02-diagonal-framebyframe-pass1-normalized-4096x512-candidate-2026-05-30.png",
    "attack_pick_swing_sweep": SOURCE_DIR / "asha-reference-warrior-attack-chain-03-sweep-framebyframe-pass1c-normalized-4096x512-candidate-2026-05-30.png",
    "hurt": SOURCE_DIR / "asha-reference-warrior-hurt-framebyframe-pass1-normalized-2560x512-candidate-2026-05-30.png",
}

SOURCE_FRAME_COUNTS = {
    "idle": 8,
    "run": 8,
    "jump": 8,
    "attack_pick_swing": 8,
    "attack_pick_swing_alt": 8,
    "attack_pick_swing_sweep": 8,
    "hurt": 5,
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
    "attack_pick_swing_alt": 12,
    "attack_pick_swing_sweep": 13,
}

ROW_SOURCE = {
    "idle": ("idle", [0, 1, 2, 3, 4, 5, 6, 7]),
    "walk": ("run", [0, 1, 2, 3, 4, 5, 6, 7]),
    "run": ("run", [0, 1, 2, 3, 4, 5, 6, 7]),
    "survey_walk": ("run", [0, 1, 2, 3, 4, 5, 6, 7]),
    "jump": ("jump", [0, 1, 2, 3, 4, 5, 6, 7]),
    "fall": ("jump", [3, 4, 5, 5, 6, 6, 7, 7]),
    "land": ("jump", [5, 6, 7, 7, 7, 7, 7, 7]),
    "attack_pick_swing": ("attack_pick_swing", [0, 1, 2, 3, 4, 5, 6, 7]),
    "attack_pick_swing_alt": ("attack_pick_swing_alt", [0, 1, 2, 3, 4, 5, 6, 7]),
    "attack_pick_swing_sweep": ("attack_pick_swing_sweep", [0, 1, 2, 3, 4, 5, 6, 7]),
    "hurt": ("hurt", [0, 1, 2, 3, 4]),
    "interact": ("idle", [0, 1, 2, 3, 4, 5]),
    "climb": ("jump", [0, 1, 2, 3, 4, 5, 6, 7]),
    "push_pull": ("attack_pick_swing", [0, 1, 2, 3, 4, 5, 6, 7]),
}

ROW_SPRITE_SCALE = {
    "idle": 1.015,
    "walk": 1.082,
    "run": 1.082,
    "survey_walk": 1.082,
    "jump": 1.016,
    "fall": 1.016,
    "land": 1.016,
    "attack_pick_swing": 1.018,
    "attack_pick_swing_alt": 1.018,
    "attack_pick_swing_sweep": 1.018,
    "hurt": 1.018,
    "interact": 1.018,
    "climb": 1.017,
    "push_pull": 1.018,
}


def frame_key(row_name: str, index: int) -> str:
    return f"{row_name}_{index:02d}"


def remove_chroma_background(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    data = np.array(rgba)
    rgb = data[..., :3].astype(np.int16)
    green_key = (
        (rgb[..., 1] > 130)
        & (rgb[..., 1] - rgb[..., 0] > 42)
        & (rgb[..., 1] - rgb[..., 2] > 42)
    )
    bright_green = (
        (rgb[..., 1] > 185)
        & (rgb[..., 0] < 115)
        & (rgb[..., 2] < 150)
    )
    key_mask = green_key | bright_green
    data[..., 3] = np.where(key_mask, 0, data[..., 3]).astype(np.uint8)
    visible = data[..., 3] > 0
    green_spill = visible & (rgb[..., 1] > rgb[..., 0] + 20) & (rgb[..., 1] > rgb[..., 2] + 20)
    neutral_green = np.maximum(rgb[..., 0], rgb[..., 2]) + 10
    data[..., 1] = np.where(green_spill, np.minimum(data[..., 1], neutral_green), data[..., 1]).astype(np.uint8)
    return Image.fromarray(data, "RGBA").filter(ImageFilter.GaussianBlur(radius=0.08))


def keep_visible_components(image: Image.Image, *, min_pixels: int = 80) -> Image.Image:
    rgba = image.convert("RGBA")
    data = np.array(rgba)
    alpha = data[..., 3] > 20
    height, width = alpha.shape
    seen = np.zeros((height, width), dtype=bool)
    components: list[list[tuple[int, int]]] = []

    for y in range(height):
        for x in range(width):
            if not alpha[y, x] or seen[y, x]:
                continue
            stack = [(x, y)]
            seen[y, x] = True
            pixels: list[tuple[int, int]] = []
            while stack:
                px, py = stack.pop()
                pixels.append((px, py))
                for nx, ny in ((px + 1, py), (px - 1, py), (px, py + 1), (px, py - 1)):
                    if 0 <= nx < width and 0 <= ny < height and alpha[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        stack.append((nx, ny))
            if len(pixels) >= min_pixels:
                components.append(pixels)

    if not components:
        return rgba

    keep = np.zeros((height, width), dtype=bool)
    for component in components:
        for px, py in component:
            keep[py, px] = True

    data[..., 3] = np.where(keep, data[..., 3], 0).astype(np.uint8)
    return Image.fromarray(data, "RGBA")


def improve_gameplay_readability(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    alpha = rgba.getchannel("A")
    rgb = rgba.convert("RGB")
    rgb = ImageEnhance.Brightness(rgb).enhance(1.06)
    rgb = ImageEnhance.Contrast(rgb).enhance(1.12)
    rgb = ImageEnhance.Color(rgb).enhance(1.06)
    rgb = ImageEnhance.Sharpness(rgb).enhance(1.12)
    tuned = rgb.convert("RGBA")
    tuned.putalpha(alpha)
    return tuned


def extract_frames(source_name: str) -> list[Image.Image]:
    source = Image.open(SOURCES[source_name]).convert("RGBA")
    frame_count = SOURCE_FRAME_COUNTS[source_name]
    frames = []
    cell_w = source.width / frame_count
    min_component_pixels = 1000 if source_name == "jump" or source_name.startswith("attack_pick_swing") else 80
    for index in range(frame_count):
        left = max(0, round(index * cell_w))
        right = min(source.width, round((index + 1) * cell_w))
        frame = source.crop((left, 0, right, source.height))
        frame = remove_chroma_background(frame)
        frame = keep_visible_components(frame, min_pixels=min_component_pixels)
        frames.append(improve_gameplay_readability(frame))
    return frames


def trim_to_visible(image: Image.Image) -> Image.Image:
    alpha = image.getchannel("A")
    bbox = alpha.point(lambda value: 255 if value > 4 else 0).getbbox()
    return image.crop(bbox) if bbox else image


def measure_bounds(image: Image.Image, *, padding: int = 3) -> dict[str, int]:
    alpha = image.getchannel("A")
    bbox = alpha.point(lambda value: 255 if value > 4 else 0).getbbox()
    if bbox is None:
        return {"x": 0, "y": 0, "w": 1, "h": 1}
    left, top, right, bottom = bbox
    left = max(0, left - padding)
    top = max(0, top - padding)
    right = min(image.width, right + padding)
    bottom = min(image.height, bottom + padding)
    return {"x": left, "y": top, "w": right - left, "h": bottom - top}


def paste_sprite_cell(
    target: Image.Image,
    sprite: Image.Image,
    *,
    row_name: str,
    row_index: int,
    column: int,
    cell_w: int,
    cell_h: int,
    ground_line_y: int,
    max_source_height: int,
) -> dict[str, int]:
    fitted = trim_to_visible(sprite)
    max_source_width = cell_w - 12
    scale = min(
        max_source_height / fitted.height if fitted.height > 0 else 1,
        max_source_width / fitted.width if fitted.width > 0 else 1,
        1,
    ) * ROW_SPRITE_SCALE.get(row_name, 1)
    fitted = fitted.resize(
        (max(1, round(fitted.width * scale)), max(1, round(fitted.height * scale))),
        Image.Resampling.LANCZOS,
    )
    target_x = column * cell_w
    target_y = row_index * cell_h
    paste_x = target_x + round((cell_w - fitted.width) / 2)
    paste_y = target_y + ground_line_y - fitted.height
    target.alpha_composite(fitted, (paste_x, paste_y))
    final_cell = target.crop((target_x, target_y, target_x + cell_w, target_y + cell_h))
    final_bounds = measure_bounds(final_cell)
    return {
        "x": target_x,
        "y": target_y,
        "w": cell_w,
        "h": cell_h,
        "drawBounds": {
            "x": final_bounds["x"],
            "y": final_bounds["y"],
            "w": final_bounds["w"],
            "h": final_bounds["h"],
        },
        "groundLineY": ground_line_y,
    }


def main() -> None:
    metadata = json.loads(BASE_ATLAS_JSON.read_text(encoding="utf-8"))
    cell_w = TARGET_CELL_WIDTH
    cell_h = TARGET_CELL_HEIGHT
    ground_line_y = TARGET_GROUND_LINE_Y
    max_source_height = TARGET_SOURCE_HEIGHT
    max_columns = max(len(source_indices) for _source_name, source_indices in ROW_SOURCE.values())
    target = Image.new("RGBA", (cell_w * max_columns, cell_h * len(ROW_INDEX)), (0, 0, 0, 0))
    extracted = {source_name: extract_frames(source_name) for source_name in SOURCES}
    regions = {}
    pose_sources = {}

    for row_name, row_index in ROW_INDEX.items():
        source_name, source_indices = ROW_SOURCE[row_name]
        for column, source_index in enumerate(source_indices):
            key = frame_key(row_name, column)
            regions[key] = paste_sprite_cell(
                target,
                extracted[source_name][source_index],
                row_name=row_name,
                row_index=row_index,
                column=column,
                cell_w=cell_w,
                cell_h=cell_h,
                ground_line_y=ground_line_y,
                max_source_height=max_source_height,
            )
            pose_sources[key] = f"{SOURCES[source_name].name}:frame_{source_index:02d}"

    base_rows = {row["name"]: row for row in metadata["rows"]}
    rows = []
    for row_name, row_index in ROW_INDEX.items():
        next_row = deepcopy(base_rows.get(row_name, base_rows["attack_pick_swing"]))
        _source_name, source_indices = ROW_SOURCE[row_name]
        next_row["name"] = row_name
        next_row["row"] = row_index
        next_row["frameCount"] = len(source_indices)
        next_row["frames"] = [frame_key(row_name, index) for index in range(len(source_indices))]
        rows.append(next_row)

    metadata["image"] = TARGET_PNG.name
    metadata["source"] = "asha-reference-warrior-attack-chain-test-wiring-2026-05-29"
    metadata["status"] = "candidate-asha-reference-warrior-attack-chain-test"
    metadata["productionReference"] = TARGET_REFERENCE.name
    metadata["masterReference"] = TARGET_MASTER_REFERENCE.name
    metadata["description"] = (
        "New Asha runtime atlas based on the user-provided warrior reference: dark-skinned "
        "braided explorer-warrior, bronze Egyptian armor, teal accents, tan field cloth, "
        "and the locked-reference vertical khopesh polearm. Idle, run, and jump rows use the "
        "new reference-warrior identity; attack rows pack the current three-hit pure-weapon "
        "candidate chain for runtime testing while a cleaner frame-boundary pass is generated. "
        "Utility rows borrow from those rows so the runtime atlas does not mix in older Asha "
        "identities while final utility animation rows await visual approval."
    )
    metadata["frame"]["width"] = cell_w
    metadata["frame"]["height"] = cell_h
    metadata["frame"]["groundLineY"] = ground_line_y
    metadata["draw"]["height"] = TARGET_DRAW_HEIGHT
    metadata["draw"]["sourceHeight"] = max_source_height
    metadata["draw"]["integratedAttackTool"] = True
    metadata["draw"]["suppressExternalWeapon"] = True
    metadata["draw"]["suppressExternalWeaponDuringAttack"] = True
    metadata["draw"]["suppressRuntimeAttackArc"] = True
    metadata["draw"]["frameDistance"] = {
        "run": TARGET_RUN_FRAME_DISTANCE,
        "walk": 24,
        "survey_walk": 34,
    }
    metadata["draw"]["fixedFrame"] = {}
    metadata["draw"]["attackChainRows"] = [
        "attack_pick_swing",
        "attack_pick_swing_alt",
        "attack_pick_swing_sweep",
    ]
    metadata["draw"]["alternateAttackRows"] = metadata["draw"]["attackChainRows"]
    metadata["rows"] = rows
    metadata["regions"] = regions
    metadata["poseSources"] = pose_sources

    target.save(TARGET_PNG)
    trim_to_visible(extracted["idle"][0]).save(TARGET_REFERENCE)
    TARGET_JSON.write_text(f"{json.dumps(metadata, indent=2)}\n", encoding="utf-8")
    print(f"Wrote {TARGET_PNG.relative_to(ROOT)}")
    print(f"Wrote {TARGET_JSON.relative_to(ROOT)}")
    print(f"Wrote {TARGET_REFERENCE.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
