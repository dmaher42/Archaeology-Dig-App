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


def bass_impact(t: float, duration: float, rng: random.Random, low: float) -> float:
    drop = tone(54 - (28 * t / duration), t) * envelope(t, duration, 0.006, 2.1) * 0.52
    air = low * envelope(t, duration, 0.008, 2.6) * 0.18
    return drop + air


def distant_rockfall(t: float, duration: float, rng: random.Random, low: float) -> float:
    thumps = 0.0
    for offset, gain, freq in [(0.04, 0.34, 72), (0.42, 0.24, 58), (0.93, 0.18, 66), (1.38, 0.12, 84)]:
        local = max(0.0, t - offset)
        thumps += tone(freq - (22 * min(local, 0.6)), local) * envelope(local, 0.55, 0.006, 2.9) * gain
    gravel = low * envelope(t, duration, 0.05, 1.7) * 0.26
    grit = noise(rng) * envelope(t, duration, 0.03, 2.4) * 0.05
    return thumps + gravel + grit


def temple_stone_groan(t: float, duration: float, rng: random.Random, low: float) -> float:
    bend = tone(92 + math.sin(t * 3.6) * 18, t, "triangle") * envelope(t, duration, 0.18, 1.25) * 0.18
    sub = tone(38 + math.sin(t * 2.1) * 5, t) * envelope(t, duration, 0.24, 1.1) * 0.34
    scrape = low * envelope(t, duration, 0.12, 1.35) * 0.24
    return bend + sub + scrape


def distant_ruin_collapse(t: float, duration: float, rng: random.Random, low: float) -> float:
    blast = bass_impact(t, duration, rng, low) * 0.72
    fall = distant_rockfall(max(0.0, t - 0.18), max(0.1, duration - 0.18), rng, low) * 0.86
    dust = low * envelope(t, duration, 0.28, 1.15) * 0.18
    return blast + fall + dust


def distant_monster_call(t: float, duration: float, rng: random.Random, low: float) -> float:
    growl_env = envelope(t, duration, 0.24, 1.7)
    throat = tone(78 + math.sin(t * 14) * 9, t, "saw") * growl_env * 0.13
    chest = tone(42 + math.sin(t * 7) * 4, t) * growl_env * 0.28
    breath = low * envelope(t, duration, 0.08, 1.9) * 0.24
    click = noise(rng) * envelope(max(0.0, t - 1.05), 0.16, 0.01, 3.2) * 0.06
    return throat + chest + breath + click


def major_cave_in(t: float, duration: float, rng: random.Random, low: float) -> float:
    first = distant_ruin_collapse(t, duration, rng, low) * 0.9
    second = distant_rockfall(max(0.0, t - 0.72), max(0.1, duration - 0.72), rng, low) * 0.72
    sub = tone(34 - (8 * min(t / duration, 1)), t) * envelope(t, duration, 0.03, 1.2) * 0.32
    return first + second + sub


def structure_ripping(t: float, duration: float, rng: random.Random, low: float) -> float:
    tear = low * envelope(t, duration, 0.08, 1.1) * 0.32
    stress = tone(150 + math.sin(t * 18) * 46, t, "saw") * envelope(t, duration, 0.16, 1.45) * 0.08
    cracks = 0.0
    for offset in (0.22, 0.74, 1.26):
        local = max(0.0, t - offset)
        cracks += noise(rng) * envelope(local, 0.12, 0.002, 4.0) * 0.12
    return tear + stress + cracks


def combat_danger_hit(t: float, duration: float, rng: random.Random, low: float) -> float:
    punch = tone(70 - (36 * t / duration), t) * envelope(t, 0.28, 0.003, 2.6) * 0.42
    shock = low * envelope(t, duration, 0.004, 2.4) * 0.18
    snap = noise(rng) * envelope(t, 0.045, 0.001, 4.2) * 0.1
    return punch + shock + snap


def asha_hurt_breath(t: float, duration: float, rng: random.Random, low: float) -> float:
    exhale = low * envelope(t, duration, 0.015, 2.0) * 0.12
    voiced = tone(210 - (86 * t / duration), t, "triangle") * envelope(t, 0.22, 0.012, 2.6) * 0.055
    air = noise(rng) * envelope(t, duration, 0.02, 2.8) * 0.035
    return exhale + voiced + air


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
        "bass-impact.wav": (0.9, bass_impact),
        "distant-rockfall.wav": (2.4, distant_rockfall),
        "temple-stone-groan.wav": (2.8, temple_stone_groan),
        "distant-ruin-collapse.wav": (3.1, distant_ruin_collapse),
        "distant-monster-call.wav": (2.2, distant_monster_call),
        "major-cave-in.wav": (3.4, major_cave_in),
        "structure-ripping.wav": (2.2, structure_ripping),
        "combat-danger-hit.wav": (0.42, combat_danger_hit),
        "asha-hurt-breath.wav": (0.36, asha_hurt_breath),
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
