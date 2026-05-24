from __future__ import annotations

import json
from collections import deque
from copy import deepcopy
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "public/assets/expedition/player/asha-new-idle-source"
SOURCE_IDLE_IMAGE = SOURCE_DIR / "asha-new-idle-raw.png"
SOURCE_RUN_IMAGE = SOURCE_DIR / "asha-new-run-raw.png"
SOURCE_JUMP_IMAGE = SOURCE_DIR / "asha-new-jump-raw.png"
SOURCE_ATTACK_IMAGE = SOURCE_DIR / "asha-new-attack-raw.png"
SOURCE_GENERATED_GRID_IMAGE = SOURCE_DIR / "asha-new-generated-grid-raw.png"
SOURCE_PREMIUM_IDLE_IMAGE = SOURCE_DIR / "asha-premium-idle-regeneration-01-raw.png"
SOURCE_PREMIUM_RUN_IMAGE = SOURCE_DIR / "asha-premium-run-regeneration-03-raw.png"
SOURCE_PREMIUM_JUMP_IMAGE = SOURCE_DIR / "asha-premium-jump-candidate-raw.png"
SOURCE_PREMIUM_ATTACK_IMAGE = SOURCE_DIR / "asha-premium-attack-candidate-raw.png"
BASE_ATLAS_JSON = ROOT / "public/assets/expedition/player/asha-v5-spritesheet.json"
BASE_ATLAS_PNG = ROOT / "public/assets/expedition/player/asha-v5-spritesheet.png"
TARGET_DIR = ROOT / "public/assets/expedition/player"
TARGET_JSON = TARGET_DIR / "asha-new-idle-spritesheet.json"
TARGET_PNG = TARGET_DIR / "asha-new-idle-spritesheet.png"
TARGET_REFERENCE = TARGET_DIR / "asha-new-idle-reference.png"

TARGET_DRAW_HEIGHT = 119
SOURCE_IDLE_FRAME_COUNT = 2
SOURCE_RUN_FRAME_COUNT = 7
SOURCE_JUMP_FRAME_COUNT = 7
SOURCE_ATTACK_FRAME_COUNT = 6
RUN_ROW_SOURCE_INDICES = {
    "walk": [0, 1, 2, 3, 4, 5, 6, 7],
    "run": [0, 1, 2, 3, 4, 5, 6, 7, 2, 5],
    "survey_walk": [0, 1, 2, 3, 4, 5, 6, 7],
}
JUMP_ROW_SOURCE_INDICES = {
    "jump": [0, 1, 2, 3, 4, 5, 6, 6],
    "fall": [3, 4, 5, 5, 6, 6, 6, 6],
    "land": [5, 6, 6, 6, 6, 6, 6, 6],
}
ATTACK_ROW_SOURCE_INDICES = {
    "attack_pick_swing": [0, 1, 2, 3, 4, 5, 6, 7],
}
ATTACK_ALT_ROW_NAME = "attack_pick_swing_alt"


def frame_key(row_name: str, index: int) -> str:
    return f"{row_name}_{index:02d}"


def smooth_rows(values: np.ndarray, window: int = 101) -> np.ndarray:
    pad = window // 2
    padded = np.pad(values, ((pad, pad), (0, 0)), mode="edge")
    return np.array([padded[y : y + window].mean(axis=0) for y in range(values.shape[0])])


def remove_edge_background(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    data = np.array(rgba)
    rgb = data[..., :3].astype(np.float32)
    height, width = rgb.shape[:2]

    strip = max(8, min(18, width // 18))
    left = smooth_rows(rgb[:, :strip].mean(axis=1))
    right = smooth_rows(rgb[:, -strip:].mean(axis=1))
    x_ratio = np.linspace(0, 1, width, dtype=np.float32)[None, :, None]
    background = left[:, None, :] * (1 - x_ratio) + right[:, None, :] * x_ratio

    diff = np.linalg.norm(rgb - background, axis=2)
    brightest = rgb.max(axis=2)
    darkest = rgb.min(axis=2)
    saturation = brightest - darkest
    foreground = (
        (diff > 58)
        | ((saturation > 72) & (diff > 30))
        | ((brightest < 55) & (diff > 20))
    )

    seen = np.zeros((height, width), dtype=bool)
    components: list[list[tuple[int, int]]] = []
    for y in range(height):
        for x in range(width):
            if not foreground[y, x] or seen[y, x]:
                continue
            queue = deque([(x, y)])
            seen[y, x] = True
            pixels: list[tuple[int, int]] = []
            while queue:
                px, py = queue.popleft()
                pixels.append((px, py))
                for nx, ny in ((px + 1, py), (px - 1, py), (px, py + 1), (px, py - 1)):
                    if 0 <= nx < width and 0 <= ny < height and foreground[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        queue.append((nx, ny))
            if len(pixels) > 50:
                components.append(pixels)

    mask = np.zeros((height, width), dtype=bool)
    largest = max((len(component) for component in components), default=0)
    for component in components:
        xs = [pixel[0] for pixel in component]
        center_x = (min(xs) + max(xs)) / 2
        if len(component) > max(50, largest * 0.018) and width * 0.08 < center_x < width * 0.97:
            for px, py in component:
                mask[py, px] = True

    dilated = mask.copy()
    dilated[1:, :] |= mask[:-1, :]
    dilated[:-1, :] |= mask[1:, :]
    dilated[:, 1:] |= mask[:, :-1]
    dilated[:, :-1] |= mask[:, 1:]

    data[..., 3] = np.where(dilated, data[..., 3], 0).astype(np.uint8)
    return Image.fromarray(data, "RGBA").filter(ImageFilter.GaussianBlur(radius=0.22))


def remove_chroma_background(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    data = np.array(rgba)
    rgb = data[..., :3].astype(np.int16)
    green_key = (
        (rgb[..., 1] > 170)
        & (rgb[..., 1] - rgb[..., 0] > 70)
        & (rgb[..., 1] - rgb[..., 2] > 70)
    )
    data[..., 3] = np.where(green_key, 0, data[..., 3]).astype(np.uint8)
    visible = data[..., 3] > 0
    green_spill = visible & (rgb[..., 1] > rgb[..., 0] + 18) & (rgb[..., 1] > rgb[..., 2] + 18)
    neutral_green = np.maximum(rgb[..., 0], rgb[..., 2]) + 12
    data[..., 1] = np.where(green_spill, np.minimum(data[..., 1], neutral_green), data[..., 1]).astype(np.uint8)
    return Image.fromarray(data, "RGBA").filter(ImageFilter.GaussianBlur(radius=0.12))


def remove_stray_alpha_components(image: Image.Image, *, keep_large_effects: bool = True) -> Image.Image:
    rgba = image.convert("RGBA")
    data = np.array(rgba)
    alpha = data[..., 3] > 18
    height, width = alpha.shape
    seen = np.zeros((height, width), dtype=bool)
    components: list[list[tuple[int, int]]] = []

    for y in range(height):
        for x in range(width):
            if not alpha[y, x] or seen[y, x]:
                continue
            queue = deque([(x, y)])
            seen[y, x] = True
            pixels: list[tuple[int, int]] = []
            while queue:
                px, py = queue.popleft()
                pixels.append((px, py))
                for nx, ny in ((px + 1, py), (px - 1, py), (px, py + 1), (px, py - 1)):
                    if 0 <= nx < width and 0 <= ny < height and alpha[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        queue.append((nx, ny))
            if len(pixels) > 12:
                components.append(pixels)

    if not components:
        return rgba

    largest = max(components, key=len)
    largest_area = len(largest)
    largest_xs = [pixel[0] for pixel in largest]
    largest_ys = [pixel[1] for pixel in largest]
    keep_left = max(0, min(largest_xs) - 34)
    keep_right = min(width, max(largest_xs) + 34)
    keep_top = max(0, min(largest_ys) - 34)
    keep_bottom = min(height, max(largest_ys) + 34)

    keep = np.zeros((height, width), dtype=bool)
    for component in components:
        xs = [pixel[0] for pixel in component]
        ys = [pixel[1] for pixel in component]
        center_x = (min(xs) + max(xs)) / 2
        center_y = (min(ys) + max(ys)) / 2
        detached_piece_large_enough = len(component) >= max(520, largest_area * 0.03)
        near_main_body = (
            detached_piece_large_enough
            and keep_left <= center_x <= keep_right
            and keep_top <= center_y <= keep_bottom
        )
        large_readable_effect = keep_large_effects and len(component) >= largest_area * 0.12
        if component is largest or near_main_body or large_readable_effect:
            for px, py in component:
                keep[py, px] = True

    data[..., 3] = np.where(keep, data[..., 3], 0).astype(np.uint8)
    return Image.fromarray(data, "RGBA")


def improve_gameplay_readability(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    alpha = rgba.getchannel("A")
    rgb = rgba.convert("RGB")
    rgb = ImageEnhance.Brightness(rgb).enhance(1.04)
    rgb = ImageEnhance.Contrast(rgb).enhance(1.08)
    rgb = ImageEnhance.Color(rgb).enhance(1.04)
    rgb = ImageEnhance.Sharpness(rgb).enhance(1.08)
    tuned = rgb.convert("RGBA")
    tuned.putalpha(alpha)
    return tuned


def trim_to_visible(image: Image.Image) -> Image.Image:
    alpha = image.getchannel("A")
    bbox = alpha.point(lambda value: 255 if value > 18 else 0).getbbox()
    return image.crop(bbox) if bbox else image


def measure_bounds(image: Image.Image) -> dict[str, int]:
    alpha = image.getchannel("A")
    bbox = alpha.point(lambda value: 255 if value > 18 else 0).getbbox()
    if bbox is None:
        return {"x": 0, "y": 0, "w": 1, "h": 1}
    left, top, right, bottom = bbox
    return {"x": left, "y": top, "w": right - left, "h": bottom - top}


def extract_idle_frames() -> list[Image.Image]:
    source = Image.open(SOURCE_IDLE_IMAGE).convert("RGBA")
    frames = []
    frame_width = source.width // SOURCE_IDLE_FRAME_COUNT
    crop_boxes = [
        (230, 42, 680, 922),
        (frame_width + 170, 42, frame_width + 620, 922),
    ]
    for crop_box in crop_boxes:
        frame = source.crop(crop_box)
        frames.append(improve_gameplay_readability(remove_edge_background(frame)))
    return frames


def extract_generated_grid_rows() -> dict[str, list[Image.Image]]:
    source = Image.open(SOURCE_GENERATED_GRID_IMAGE).convert("RGBA")
    grid_columns = 8
    rows = {"idle": [], "run": [], "jump": [], "attack_pick_swing": []}
    row_bands = {
        "idle": (0, 245),
        "run": (245, 435),
        "jump": (430, 645),
        "attack_pick_swing": (635, source.height),
    }
    cell_w = source.width / grid_columns
    for row_name, (top, bottom) in row_bands.items():
        for column in range(grid_columns):
            left = max(0, round(column * cell_w))
            right = min(source.width, round((column + 1) * cell_w))
            frame = source.crop((left, top, right, bottom))
            frame = remove_chroma_background(frame)
            frame = remove_stray_alpha_components(frame)
            rows[row_name].append(improve_gameplay_readability(frame))
    return rows


def extract_premium_row_sheet_frames(
    source_path: Path,
    *,
    frame_count: int = 8,
    segment_by_content: bool = False,
    keep_large_effects: bool = True,
) -> list[Image.Image]:
    source = Image.open(source_path).convert("RGBA")
    if segment_by_content:
        cleaned = remove_chroma_background(source)
        alpha = np.array(cleaned.getchannel("A")) > 18
        column_has_content = alpha.any(axis=0)
        spans: list[tuple[int, int]] = []
        start = None
        for x, has_content in enumerate(column_has_content):
            if has_content and start is None:
                start = x
            elif not has_content and start is not None:
                spans.append((start, x))
                start = None
        if start is not None:
            spans.append((start, source.width))

        merged_spans: list[tuple[int, int]] = []
        for left, right in spans:
            if not merged_spans or left - merged_spans[-1][1] > 6:
                merged_spans.append((left, right))
            else:
                merged_spans[-1] = (merged_spans[-1][0], right)

        if len(merged_spans) == frame_count:
            frames = []
            for left, right in merged_spans:
                padded_left = max(0, left - 18)
                padded_right = min(source.width, right + 18)
                frame = source.crop((padded_left, 0, padded_right, source.height))
                frame = remove_chroma_background(frame)
                frame = remove_stray_alpha_components(frame, keep_large_effects=keep_large_effects)
                frames.append(improve_gameplay_readability(frame))
            return frames

    frames = []
    cell_w = source.width / frame_count
    for column in range(frame_count):
        left = max(0, round(column * cell_w))
        right = min(source.width, round((column + 1) * cell_w))
        frame = source.crop((left, 0, right, source.height))
        frame = remove_chroma_background(frame)
        frame = remove_stray_alpha_components(frame, keep_large_effects=keep_large_effects)
        frames.append(improve_gameplay_readability(frame))
    return frames


def extract_run_frames() -> list[Image.Image]:
    source = Image.open(SOURCE_RUN_IMAGE).convert("RGBA")
    frames = []
    centers = [140, 340, 540, 740, 940, 1130, 1305]
    crop_width = 180
    for center_x in centers:
        left = max(0, round(center_x - crop_width / 2))
        right = min(source.width, round(center_x + crop_width / 2))
        frame = source.crop((left, 335, right, 745))
        cleaned = remove_edge_background(frame)
        frames.append(improve_gameplay_readability(cleaned))
    return frames


def extract_jump_frames() -> list[Image.Image]:
    source = Image.open(SOURCE_JUMP_IMAGE).convert("RGBA")
    frames = []
    centers = [135, 340, 540, 735, 935, 1135, 1325]
    crop_width = 190
    for center_x in centers:
        left = max(0, round(center_x - crop_width / 2))
        right = min(source.width, round(center_x + crop_width / 2))
        frame = source.crop((left, 320, right, 760))
        cleaned = remove_edge_background(frame)
        frames.append(improve_gameplay_readability(cleaned))
    return frames


def extract_attack_frames() -> list[Image.Image]:
    source = Image.open(SOURCE_ATTACK_IMAGE).convert("RGBA")
    frames = []
    centers = [115, 340, 600, 875, 1130, 1365]
    crop_widths = [215, 260, 300, 300, 285, 250]
    for center_x, crop_width in zip(centers, crop_widths):
        left = max(0, round(center_x - crop_width / 2))
        right = min(source.width, round(center_x + crop_width / 2))
        frame = source.crop((left, 455, right, 735))
        cleaned = remove_edge_background(frame)
        frames.append(improve_gameplay_readability(cleaned))
    return frames


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
    target.paste(Image.new("RGBA", (cell_w, cell_h), (0, 0, 0, 0)), (target_x, target_y))
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

    base_target = Image.open(BASE_ATLAS_PNG).convert("RGBA")
    target = Image.new("RGBA", (base_target.width, base_target.height + cell_h), (0, 0, 0, 0))
    target.alpha_composite(base_target, (0, 0))
    regions = deepcopy(metadata["regions"])
    pose_sources = deepcopy(metadata["poseSources"])
    idle_row = next(row for row in metadata["rows"] if row["name"] == "idle")
    generated_rows = extract_generated_grid_rows()
    idle_frames = extract_premium_row_sheet_frames(SOURCE_PREMIUM_IDLE_IMAGE)
    run_frames = extract_premium_row_sheet_frames(
        SOURCE_PREMIUM_RUN_IMAGE,
        segment_by_content=True,
        keep_large_effects=False,
    )
    jump_frames = extract_premium_row_sheet_frames(SOURCE_PREMIUM_JUMP_IMAGE)
    attack_frames = extract_premium_row_sheet_frames(SOURCE_PREMIUM_ATTACK_IMAGE)
    alternate_attack_frames = generated_rows["attack_pick_swing"]

    for column, key in enumerate(idle_row["frames"]):
        source_index = min(column, len(idle_frames) - 1)
        regions[key] = paste_sprite_cell(
            target,
            idle_frames[source_index],
            row_index=idle_row["row"],
            column=column,
            cell_w=cell_w,
            cell_h=cell_h,
            ground_line_y=ground_line_y,
            max_source_height=max_source_height,
        )
        pose_sources[key] = f"{SOURCE_PREMIUM_IDLE_IMAGE.name}:frame_{source_index:02d}"

    rows = []
    for row in metadata["rows"]:
        if row["name"] in RUN_ROW_SOURCE_INDICES:
            source_indices = RUN_ROW_SOURCE_INDICES[row["name"]]
            source_frames = run_frames
            source_image = SOURCE_PREMIUM_RUN_IMAGE
        elif row["name"] in JUMP_ROW_SOURCE_INDICES:
            source_indices = JUMP_ROW_SOURCE_INDICES[row["name"]]
            source_frames = jump_frames
            source_image = SOURCE_PREMIUM_JUMP_IMAGE
        elif row["name"] in ATTACK_ROW_SOURCE_INDICES:
            source_indices = ATTACK_ROW_SOURCE_INDICES[row["name"]]
            source_frames = attack_frames
            source_image = SOURCE_PREMIUM_ATTACK_IMAGE
        else:
            rows.append(row)
            continue
        next_row = deepcopy(row)
        next_row["frameCount"] = len(source_indices)
        next_row["frames"] = [frame_key(row["name"], index) for index in range(len(source_indices))]
        for column, source_index in enumerate(source_indices):
            key = frame_key(row["name"], column)
            regions[key] = paste_sprite_cell(
                target,
                source_frames[source_index],
                row_index=next_row["row"],
                column=column,
                cell_w=cell_w,
                cell_h=cell_h,
                ground_line_y=ground_line_y,
                max_source_height=max_source_height,
            )
            pose_sources[key] = f"{source_image.name}:frame_{source_index:02d}"
        rows.append(next_row)

    attack_row = next(row for row in rows if row["name"] == "attack_pick_swing")
    alternate_attack_row = {
        **deepcopy(attack_row),
        "name": ATTACK_ALT_ROW_NAME,
        "row": len(rows),
        "frames": [frame_key(ATTACK_ALT_ROW_NAME, index) for index in range(8)],
        "frameCount": 8,
    }
    for column, frame in enumerate(alternate_attack_frames):
        key = frame_key(ATTACK_ALT_ROW_NAME, column)
        regions[key] = paste_sprite_cell(
            target,
            frame,
            row_index=alternate_attack_row["row"],
            column=column,
            cell_w=cell_w,
            cell_h=cell_h,
            ground_line_y=ground_line_y,
            max_source_height=max_source_height,
        )
        pose_sources[key] = f"{SOURCE_GENERATED_GRID_IMAGE.name}:attack_pick_swing_{column:02d}"
    rows.append(alternate_attack_row)

    metadata["image"] = TARGET_PNG.name
    metadata["source"] = "asha-premium-identity-first-sheets-2026-05-24"
    metadata["status"] = "production-candidate-asha-premium-identity"
    metadata["productionReference"] = TARGET_REFERENCE.name
    metadata["description"] = (
        "Asha New Idle runtime atlas variant. It keeps the proven Asha V5 hurt, interact, "
        "climb, and portrait rows, then swaps the idle, run-based movement, jump, fall, "
        "land, and primary attack rows to premium identity-first Asha sheets. It also "
        "packs a secondary attack row so Journey can alternate attack animations."
    )
    metadata["draw"]["height"] = TARGET_DRAW_HEIGHT
    metadata["draw"]["fixedFrame"] = {}
    metadata["draw"]["alternateAttackRows"] = ["attack_pick_swing", ATTACK_ALT_ROW_NAME]
    metadata["rows"] = rows
    metadata["regions"] = regions
    metadata["poseSources"] = pose_sources

    target.save(TARGET_PNG)
    trim_to_visible(idle_frames[0]).save(TARGET_REFERENCE)
    TARGET_JSON.write_text(f"{json.dumps(metadata, indent=2)}\n", encoding="utf-8")
    print(f"Wrote {TARGET_PNG.relative_to(ROOT)}")
    print(f"Wrote {TARGET_JSON.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
