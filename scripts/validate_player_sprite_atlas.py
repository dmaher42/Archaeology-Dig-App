import json
import sys
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_ATLAS_PATH = ROOT / "public" / "assets" / "expedition" / "player" / "asha-hooded-warrior-explorer-spritesheet.json"
EXPECTED_ROWS = [
    "idle",
    "walk",
    "run",
    "survey_walk",
    "jump",
    "fall",
    "land",
    "attack_pick_swing",
    "hurt",
    "interact",
    "climb",
    "push_pull",
]


def main() -> int:
    errors = []
    atlas_path = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else DEFAULT_ATLAS_PATH
    if not atlas_path.exists():
        print(f"{atlas_path}: atlas JSON not found", file=sys.stderr)
        return 1
    atlas = json.loads(atlas_path.read_text(encoding="utf-8"))
    image_path = atlas_path.with_name(atlas.get("image", ""))
    if not image_path.exists():
        errors.append(f"missing image {atlas.get('image')}")
        image = None
    else:
        image = Image.open(image_path).convert("RGBA")

    frame = atlas.get("frame", {})
    cell_w = int(frame.get("width", 0))
    cell_h = int(frame.get("height", 0))
    ground_line = int(frame.get("groundLineY", 0))
    if cell_w < 192 or cell_h < 192:
        errors.append(f"frame cells too small: {cell_w}x{cell_h}")
    if ground_line <= 0 or ground_line >= cell_h:
        errors.append(f"invalid groundLineY {ground_line}")

    rows = atlas.get("rows", [])
    row_names = [row.get("name") for row in rows]
    if row_names != EXPECTED_ROWS:
        errors.append(f"row contract changed: {row_names}")

    regions = atlas.get("regions", {})
    expected_region_count = sum(len(row.get("frames", [])) for row in rows)
    if len(regions) != expected_region_count:
        errors.append(f"expected {expected_region_count} regions, found {len(regions)}")

    for row in rows:
        frames = row.get("frames", [])
        if len(frames) != int(row.get("frameCount", 0)):
            errors.append(f"{row.get('name')} frameCount does not match frames list")
        if not frames:
            errors.append(f"{row.get('name')} row has no frames")
        for key in frames:
            region = regions.get(key)
            if not region:
                errors.append(f"missing region {key}")
                continue
            if region.get("w") != cell_w or region.get("h") != cell_h:
                errors.append(f"{key} region size changed")
            if region.get("groundLineY") != ground_line:
                errors.append(f"{key} groundLineY drifted")
            bounds = region.get("drawBounds")
            if not bounds:
                errors.append(f"{key} missing drawBounds")
                continue
            if bounds["x"] < 0 or bounds["y"] < 0 or bounds["x"] + bounds["w"] > cell_w or bounds["y"] + bounds["h"] > cell_h:
                errors.append(f"{key} drawBounds clips outside cell")
            if image is not None:
                crop = image.crop((region["x"], region["y"], region["x"] + region["w"], region["y"] + region["h"]))
                bbox = crop.getchannel("A").getbbox()
                if not bbox:
                    errors.append(f"{key} has no visible pixels")
                elif bbox[0] <= 0 or bbox[1] <= 0 or bbox[2] >= cell_w or bbox[3] >= cell_h:
                    errors.append(f"{key} visible pixels touch cell edge")

    reference = atlas.get("productionReference")
    if not reference or not atlas_path.with_name(reference).exists():
        errors.append("productionReference missing or not found")

    if errors:
        for error in errors:
            print(f"{atlas_path.relative_to(ROOT)}: {error}", file=sys.stderr)
        return 1
    print(f"Validated player atlas {atlas_path.relative_to(ROOT)}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
