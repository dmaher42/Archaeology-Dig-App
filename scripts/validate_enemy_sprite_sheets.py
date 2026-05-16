from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]

PACKS = {
    "public/assets/expedition/enemies/small-enemy-sprites.json": [
        "scarabIdle", "scarabWalk1", "scarabWalk2", "scarabWalk3", "scarabWindup", "scarabAttack", "scarabHit", "scarabDefeated",
        "snakeIdle", "snakeWalk1", "snakeWalk2", "snakeWalk3", "snakeWindup", "snakeAttack", "snakeHit", "snakeDefeated",
        "batIdle", "batWalk1", "batWalk2", "batWalk3", "batWindup", "batAttack", "batHit", "batDefeated",
    ],
    "public/assets/expedition/enemies/desert-scarab-sprites.json": ["scarabIdle", "scarabWalk1", "scarabWalk2", "scarabWalk3", "scarabWindup", "scarabAttack", "scarabHit", "scarabDefeated"],
    "public/assets/expedition/enemies/sand-snake-sprites.json": ["snakeIdle", "snakeWalk1", "snakeWalk2", "snakeWalk3", "snakeWindup", "snakeAttack", "snakeHit", "snakeDefeated"],
    "public/assets/expedition/enemies/temple-bat-sprites.json": ["batIdle", "batWalk1", "batWalk2", "batWalk3", "batWindup", "batAttack", "batHit", "batDefeated"],
    "public/assets/expedition/enemies/scorpion-sprites.json": ["scorpionIdle", "scorpionWalk1", "scorpionWalk2", "scorpionWalk3", "scorpionWindup", "scorpionAttack", "scorpionHit", "scorpionDefeated"],
    "public/assets/expedition/enemies/sand-wisp-sprites.json": ["sandWispIdle", "sandWispWalk1", "sandWispWalk2", "sandWispWalk3", "sandWispWindup", "sandWispAttack", "sandWispHit", "sandWispDefeated"],
    "public/assets/expedition/enemies/looter-sprites.json": ["looterIdle", "looterWalk1", "looterWalk2", "looterWalk3", "looterWindup", "looterAttack", "looterHit", "looterDefeated"],
    "public/assets/expedition/enemies/looter-captain-sprites.json": ["looterCaptainIdle", "looterCaptainWalk1", "looterCaptainWalk2", "looterCaptainWalk3", "looterCaptainWindup", "looterCaptainAttack", "looterCaptainHit", "looterCaptainDefeated"],
    "public/assets/expedition/enemies/cursed-statue-sprites.json": ["cursedStatueIdle", "cursedStatueWalk1", "cursedStatueWalk2", "cursedStatueWalk3", "cursedStatueWindup", "cursedStatueAttack", "cursedStatueHit", "cursedStatueDefeated"],
    "public/assets/expedition/enemies/stone-guardian-enemy-sprites.json": ["stoneGuardianEnemyIdle", "stoneGuardianEnemyWalk1", "stoneGuardianEnemyWalk2", "stoneGuardianEnemyWalk3", "stoneGuardianEnemyWindup", "stoneGuardianEnemyAttack", "stoneGuardianEnemyHit", "stoneGuardianEnemyDefeated"],
    "public/assets/expedition/enemies/china/china-river-crab-sprites.json": ["riverCrabIdle", "riverCrabWalk1", "riverCrabWalk2", "riverCrabWalk3", "riverCrabWindup", "riverCrabAttack", "riverCrabHit", "riverCrabDefeated"],
    "public/assets/expedition/enemies/china/china-watchtower-sentry-sprites.json": ["watchtowerSentryIdle", "watchtowerSentryWalk1", "watchtowerSentryWalk2", "watchtowerSentryWalk3", "watchtowerSentryWindup", "watchtowerSentryAttack", "watchtowerSentryHit", "watchtowerSentryDefeated"],
    "public/assets/expedition/enemies/china/china-clay-guardian-enemy-sprites.json": ["clayGuardianIdle", "clayGuardianWalk1", "clayGuardianWalk2", "clayGuardianWalk3", "clayGuardianWindup", "clayGuardianAttack", "clayGuardianHit", "clayGuardianDefeated"],
}

FLYING_PREFIXES = ("bat", "sandWisp")


def alpha_bbox(image: Image.Image, region: dict) -> tuple[int, int, int, int] | None:
    crop = image.crop((region["x"], region["y"], region["x"] + region["w"], region["y"] + region["h"])).convert("RGBA")
    return crop.getchannel("A").getbbox()


def validate_pack(json_rel: str, required_keys: list[str]) -> list[str]:
    errors: list[str] = []
    json_path = ROOT / json_rel
    if not json_path.exists():
        return [f"{json_rel}: missing atlas json"]
    data = json.loads(json_path.read_text(encoding="utf-8"))
    regions = data.get("regions", {})
    missing = [key for key in required_keys if key not in regions]
    if missing:
        errors.append(f"{json_rel}: missing regions {', '.join(missing)}")
    image_path = json_path.with_name(data.get("image", ""))
    if not image_path.exists():
        errors.append(f"{json_rel}: missing image {data.get('image')}")
        return errors
    image = Image.open(image_path).convert("RGBA")
    if image.mode != "RGBA":
        errors.append(f"{json_rel}: image is not RGBA")
    bottom_by_prefix: dict[str, list[int]] = {}
    for key in required_keys:
        region = regions.get(key)
        if not region:
            continue
        bbox = alpha_bbox(image, region)
        if not bbox:
            errors.append(f"{json_rel}: {key} is empty")
            continue
        left, top, right, bottom = bbox
        bottom_padding = region["h"] - bottom
        edge_touch = left <= 1 or top <= 1 or right >= region["w"] - 1 or bottom >= region["h"] - 1
        if edge_touch:
            errors.append(f"{json_rel}: {key} touches crop edge")
        prefix = key[:-len(next(suffix for suffix in ["Idle", "Walk1", "Walk2", "Walk3", "Windup", "Attack", "Hit", "Defeated"] if key.endswith(suffix)))]
        bottom_by_prefix.setdefault(prefix, []).append(bottom_padding)
    for prefix, paddings in bottom_by_prefix.items():
        tolerance = 80 if prefix.startswith(FLYING_PREFIXES) else 18
        if max(paddings) - min(paddings) > tolerance:
            errors.append(f"{json_rel}: {prefix} baseline drift {min(paddings)}..{max(paddings)}px")
    return errors


def main() -> int:
    errors: list[str] = []
    for json_rel, keys in PACKS.items():
        errors.extend(validate_pack(json_rel, keys))
    if errors:
        for error in errors:
            print(error)
        return 1
    print(f"Validated {len(PACKS)} upgraded enemy sprite atlases.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
