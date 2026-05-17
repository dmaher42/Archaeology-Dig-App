from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ATLAS_PATH = ROOT / "public" / "assets" / "expedition" / "environment" / "desert-temple" / "egypt-sacred-traps-pack.json"
REQUIRED_KEYS = [
    "guardianSealIdle",
    "guardianSealActivated",
    "sacredPedestalIdle",
    "sacredPedestalActivated",
]
EXPECTED_REGION_SIZE = 256


def validate() -> list[str]:
    errors: list[str] = []
    if not ATLAS_PATH.exists():
        return [f"{ATLAS_PATH}: missing atlas json"]

    data = json.loads(ATLAS_PATH.read_text(encoding="utf-8"))
    image_name = data.get("image")
    image_path = ATLAS_PATH.with_name(image_name or "")
    if not image_name or not image_path.exists():
        return [f"{ATLAS_PATH}: missing image {image_name!r}"]

    image = Image.open(image_path).convert("RGBA")
    expected_size = data.get("size", {})
    if image.size != (expected_size.get("w"), expected_size.get("h")):
        errors.append(f"{image_path}: image size {image.size} does not match atlas size {expected_size}")

    regions = data.get("regions", {})
    missing = [key for key in REQUIRED_KEYS if key not in regions]
    if missing:
        errors.append(f"{ATLAS_PATH}: missing regions {', '.join(missing)}")

    for key in REQUIRED_KEYS:
        region = regions.get(key)
        if not region:
            continue
        for field in ("x", "y", "w", "h"):
            if not isinstance(region.get(field), int):
                errors.append(f"{ATLAS_PATH}: {key}.{field} must be an integer")
        x = region.get("x", 0)
        y = region.get("y", 0)
        w = region.get("w", 0)
        h = region.get("h", 0)
        if w != EXPECTED_REGION_SIZE or h != EXPECTED_REGION_SIZE:
            errors.append(f"{ATLAS_PATH}: {key} must be {EXPECTED_REGION_SIZE}x{EXPECTED_REGION_SIZE}")
        if x < 0 or y < 0 or x + w > image.width or y + h > image.height:
            errors.append(f"{ATLAS_PATH}: {key} is outside the image bounds")
            continue
        crop = image.crop((x, y, x + w, y + h))
        bbox = crop.getchannel("A").getbbox()
        if bbox is None:
            errors.append(f"{ATLAS_PATH}: {key} is fully transparent")
            continue
        left, top, right, bottom = bbox
        if left <= 0 or top <= 0 or right >= w or bottom >= h:
            errors.append(f"{ATLAS_PATH}: {key} touches the crop edge")

    return errors


def main() -> int:
    errors = validate()
    if errors:
        for error in errors:
            print(error)
        return 1
    print(f"Validated Egypt sacred trap asset pack: {len(REQUIRED_KEYS)} regions.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
