from __future__ import annotations

import math
import random
import wave
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public" / "assets" / "expedition" / "sfx" / "generated"
SAMPLE_RATE = 44_100
SEED = 710_2026


def envelope(t: float, duration: float, attack: float = 0.015, release_power: float = 2.0) -> float:
    if duration <= 0:
        return 0
    attack_level = min(1.0, t / max(attack, 0.001))
    release = max(0.0, 1.0 - (t / duration)) ** release_power
    return attack_level * release


def noise(rng: random.Random) -> float:
    return rng.uniform(-1.0, 1.0)


def low_noise(rng: random.Random, last: float, amount: float = 0.86) -> tuple[float, float]:
    value = (last * amount) + (noise(rng) * (1.0 - amount))
    return value, value


def tone(freq: float, t: float, wave_type: str = "sine") -> float:
    phase = 2.0 * math.pi * freq * t
    if wave_type == "triangle":
        return (2.0 / math.pi) * math.asin(math.sin(phase))
    if wave_type == "square":
        return 1.0 if math.sin(phase) >= 0 else -1.0
    if wave_type == "saw":
        return 2.0 * ((freq * t) % 1.0) - 1.0
    return math.sin(phase)


def render(duration: float, fn) -> list[float]:
    rng = random.Random(SEED + int(duration * 1000))
    total = int(SAMPLE_RATE * duration)
    samples: list[float] = []
    last_low = 0.0
    for i in range(total):
        t = i / SAMPLE_RATE
        low, last_low = low_noise(rng, last_low)
        value = fn(t, duration, rng, low)
        samples.append(max(-0.98, min(0.98, value)))
    return samples


def write_wav(path: Path, samples: list[float]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(SAMPLE_RATE)
        frames = bytearray()
        for sample in samples:
            frames.extend(int(sample * 32767).to_bytes(2, "little", signed=True))
        wav.writeframes(frames)


def land_soft(t: float, duration: float, rng: random.Random, low: float) -> float:
    env = envelope(t, duration, 0.006, 3.0)
    thump = tone(86 - (44 * t / duration), t) * envelope(t, 0.18, 0.004, 3.2) * 0.42
    sand = low * env * 0.24
    return thump + sand


def satchel_leather(t: float, duration: float, rng: random.Random, low: float) -> float:
    rub = low * envelope(t, duration, 0.025, 1.7) * 0.28
    fold = tone(142 + (18 * math.sin(t * 38)), t, "triangle") * envelope(t, 0.2, 0.018, 2.4) * 0.08
    return rub + fold


def satchel_buckle(t: float, duration: float, rng: random.Random, low: float) -> float:
    click = tone(2600, t, "triangle") * envelope(t, 0.045, 0.002, 3.8) * 0.34
    body = tone(420 - (130 * t / duration), t, "square") * envelope(t, 0.09, 0.002, 3.0) * 0.1
    return click + body + (noise(rng) * envelope(t, 0.05, 0.001, 4.0) * 0.08)


def metal_click(t: float, duration: float, rng: random.Random, low: float) -> float:
    ping = tone(3150, t, "triangle") * envelope(t, 0.09, 0.0015, 4.6) * 0.32
    ring = tone(1720, t) * envelope(t, duration, 0.003, 3.2) * 0.13
    tap = noise(rng) * envelope(t, 0.025, 0.001, 5.0) * 0.1
    return ping + ring + tap


def relic_shard(t: float, duration: float, rng: random.Random, low: float) -> float:
    shimmer = (
        tone(880, t)
        + tone(1320, t + 0.002)
        + tone(1760, t + 0.004)
    ) * envelope(t, duration, 0.012, 2.5) * 0.11
    chime = tone(620, t, "triangle") * envelope(t, 0.26, 0.004, 2.9) * 0.16
    return shimmer + chime


def enemy_hit(t: float, duration: float, rng: random.Random, low: float) -> float:
    slap = noise(rng) * envelope(t, 0.12, 0.002, 3.2) * 0.28
    body = tone(170 - (80 * t / duration), t, "triangle") * envelope(t, 0.16, 0.004, 2.8) * 0.2
    grit = low * envelope(t, duration, 0.004, 2.6) * 0.18
    return slap + body + grit


def player_hit(t: float, duration: float, rng: random.Random, low: float) -> float:
    impact = tone(104 - (52 * t / duration), t) * envelope(t, 0.2, 0.004, 2.7) * 0.34
    cloth = low * envelope(t, duration, 0.006, 2.2) * 0.2
    sharp = noise(rng) * envelope(t, 0.055, 0.0015, 3.8) * 0.12
    return impact + cloth + sharp


def boss_warning(t: float, duration: float, rng: random.Random, low: float) -> float:
    pulse = tone(92 - (24 * t / duration), t) * envelope(t, duration, 0.03, 1.8) * 0.36
    harmonic = tone(184, t, "triangle") * envelope(t, duration, 0.04, 2.2) * 0.1
    grit = low * envelope(t, duration, 0.02, 2.0) * 0.18
    return pulse + harmonic + grit


def stone_gate_open(t: float, duration: float, rng: random.Random, low: float) -> float:
    scrape = low * envelope(t, duration, 0.05, 1.4) * 0.34
    rumble = tone(76 - (20 * t / duration), t) * envelope(t, duration, 0.025, 1.8) * 0.25
    unlock = tone(520, t, "triangle") * envelope(max(0.0, t - 0.18), 0.25, 0.003, 3.0) * 0.12
    return scrape + rumble + unlock


def stone_gate_blocked(t: float, duration: float, rng: random.Random, low: float) -> float:
    knock = tone(118 - (40 * t / duration), t, "square") * envelope(t, 0.18, 0.003, 3.0) * 0.3
    dust = low * envelope(t, duration, 0.006, 2.3) * 0.25
    return knock + dust


def main() -> None:
    specs = {
        "land-soft.wav": (0.36, land_soft),
        "satchel-leather.wav": (0.34, satchel_leather),
        "satchel-buckle.wav": (0.22, satchel_buckle),
        "metal-click.wav": (0.28, metal_click),
        "relic-shard.wav": (0.56, relic_shard),
        "enemy-hit.wav": (0.26, enemy_hit),
        "player-hit.wav": (0.34, player_hit),
        "boss-warning.wav": (0.72, boss_warning),
        "stone-gate-open.wav": (0.9, stone_gate_open),
        "stone-gate-blocked.wav": (0.42, stone_gate_blocked),
    }
    for filename, (duration, fn) in specs.items():
      write_wav(OUT_DIR / filename, render(duration, fn))
    (OUT_DIR / "README.md").write_text(
        "# Generated Expedition SFX\n\n"
        "These short WAV effects are deterministic, code-generated assets for Lost Site Expedition.\n"
        "They are generated by `scripts/generate_expedition_sfx.py` and do not depend on third-party samples.\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
