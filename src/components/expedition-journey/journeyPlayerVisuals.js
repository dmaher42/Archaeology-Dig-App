import {
  ATTACK_DURATION,
  ATTACK_RECOIL_DURATION,
  ATTACK_WINDUP_DURATION,
  PLAYER_CHINA_HERO_SPRITE_ATLAS_JSON,
  PLAYER_CHINA_HERO_SPRITE_VERSION,
  PLAYER_HERO_FALLBACK_SPRITE_ATLAS_JSON,
  PLAYER_HERO_FALLBACK_SPRITE_VERSION,
  PLAYER_HERO_PREVIOUS_SPRITE_ATLAS_JSON,
  PLAYER_HERO_PREVIOUS_SPRITE_VERSION,
  PLAYER_HERO_SPRITE_ATLAS_JSON,
  PLAYER_HERO_SPRITE_VERSION,
  PLAYER_LEGACY_SPRITE_SRC,
} from './journeyConstants.js';
import {
  PLAYER_ATTACK_FINISHER_ROW,
  PLAYER_DODGE_DURATION,
  PLAYER_DODGE_FRAME_SEQUENCE,
} from './journeyCombat.js';
import { clamp } from './journeyUtils.js';
import {
  PLAYER_ROME_HERO_SPRITE_ATLAS_JSON,
  PLAYER_ROME_HERO_SPRITE_VERSION,
} from './rome/romeConstants.js';

export const getAtlasImagePath = (atlasPath, imageName) => {
  if (!imageName) return null;
  if (imageName.startsWith('/') || imageName.startsWith('assets/') || imageName.startsWith('sprites/')) return imageName;
  const atlasDir = atlasPath.includes('/') ? atlasPath.slice(0, atlasPath.lastIndexOf('/') + 1) : '';
  return `${atlasDir}${imageName}`;
};

export const getHeroSpriteRow = (atlas, rowName) => atlas?.rows?.find(row => row.name === rowName) || null;

export const getHeroSpriteFrameRowName = (atlas, frameKey) => {
  if (!frameKey) return null;
  return atlas?.rows?.find(row => Array.isArray(row.frames) && row.frames.includes(frameKey))?.name || null;
};

export const getHeroSpriteRowScale = (atlas, rowName) => {
  const scale = Number(atlas?.draw?.rowScaleMultipliers?.[rowName]);
  return Number.isFinite(scale) && scale > 0 ? scale : 1;
};

export const getHeroSpriteFrameScale = (atlas, frameKey) => {
  const scale = Number(atlas?.draw?.frameScaleMultipliers?.[frameKey]);
  return Number.isFinite(scale) && scale > 0 ? scale : 1;
};

export const getHeroSpriteFrameDistance = (atlas, rowName) => {
  const atlasDistance = Number(atlas?.draw?.frameDistance?.[rowName]);
  if (Number.isFinite(atlasDistance) && atlasDistance > 0) return atlasDistance;
  if (rowName === 'run') return 15;
  if (rowName === 'survey_walk') return 34;
  return 22;
};

export const getHeroSpriteFixedFrame = (atlas, rowName, row) => {
  const fixedFrame = atlas?.draw?.fixedFrame?.[rowName];
  if (typeof fixedFrame === 'string' && row?.frames?.includes(fixedFrame)) return fixedFrame;
  const fixedFrameIndex = Number(fixedFrame);
  if (Number.isInteger(fixedFrameIndex) && fixedFrameIndex >= 0 && fixedFrameIndex < (row?.frames?.length || 0)) {
    return row.frames[fixedFrameIndex];
  }
  return null;
};

export const isPlayerAttackVisualPhase = (attackState) => (
  attackState === 'windup' || attackState === 'swing' || attackState === 'recoil'
);

export const PLAYER_CHARACTER_PRESETS = [
  {
    id: 'auto',
    label: 'Auto',
    description: 'Use the character chosen by the current expedition.',
  },
  {
    id: 'asha-reference-warrior',
    label: 'Asha Reference Warrior',
    description: 'New Asha based on the provided warrior reference, with full animation rows in one atlas.',
    characterId: 'asha-reference-warrior',
    atlasPath: PLAYER_HERO_SPRITE_ATLAS_JSON,
    version: PLAYER_HERO_SPRITE_VERSION,
    fallbackAtlasPath: 'assets/expedition/player/asha-final-production-spritesheet.json',
    fallbackAtlasVersion: 'asha-master-reference-motion-2026-05-23',
    fallbackCharacterId: 'asha-final-production',
    fallbackSrc: PLAYER_LEGACY_SPRITE_SRC,
  },
  {
    id: 'asha-production',
    label: 'Asha Final Production',
    description: 'Final playable Asha with warrior sword combat.',
    characterId: 'asha-final-production',
    atlasPath: 'assets/expedition/player/asha-final-production-spritesheet.json',
    version: 'asha-master-reference-motion-2026-05-23',
    fallbackAtlasPath: PLAYER_HERO_PREVIOUS_SPRITE_ATLAS_JSON,
    fallbackAtlasVersion: PLAYER_HERO_PREVIOUS_SPRITE_VERSION,
    fallbackCharacterId: 'asha-egypt-warrior-explorer',
    fallbackSrc: PLAYER_LEGACY_SPRITE_SRC,
  },
  {
    id: 'asha-v5-candidate',
    label: 'Asha V5',
    description: 'User-provided Asha V5 atlas for in-game review.',
    characterId: 'asha-v5-candidate',
    atlasPath: 'assets/expedition/player/asha-v5-spritesheet.json',
    version: 'asha-v5-candidate-2026-05-23',
    fallbackAtlasPath: 'assets/expedition/player/asha-final-production-spritesheet.json',
    fallbackAtlasVersion: 'asha-master-reference-motion-2026-05-23',
    fallbackCharacterId: 'asha-final-production',
    fallbackSrc: PLAYER_LEGACY_SPRITE_SRC,
  },
  {
    id: 'asha-new-idle',
    label: 'Asha New Idle',
    description: 'Asha V5 movement with the new user-provided idle pose.',
    characterId: 'asha-new-idle',
    atlasPath: 'assets/expedition/player/asha-new-idle-spritesheet.json',
    version: 'asha-new-idle-2026-05-24',
    fallbackAtlasPath: 'assets/expedition/player/asha-v5-spritesheet.json',
    fallbackAtlasVersion: 'asha-v5-candidate-2026-05-23',
    fallbackCharacterId: 'asha-v5-candidate',
    fallbackSrc: PLAYER_LEGACY_SPRITE_SRC,
  },
  {
    id: 'asha-hooded-production',
    label: 'Asha Hooded Previous',
    description: 'Previous hooded Egypt Asha atlas for comparison.',
    characterId: 'asha-egypt-warrior-explorer',
    atlasPath: PLAYER_HERO_PREVIOUS_SPRITE_ATLAS_JSON,
    version: PLAYER_HERO_PREVIOUS_SPRITE_VERSION,
    fallbackAtlasPath: PLAYER_HERO_FALLBACK_SPRITE_ATLAS_JSON,
    fallbackAtlasVersion: PLAYER_HERO_FALLBACK_SPRITE_VERSION,
    fallbackCharacterId: 'egypt-warrior-guide',
    fallbackSrc: PLAYER_LEGACY_SPRITE_SRC,
  },
  {
    id: 'asha-v2-candidate',
    label: 'Asha V2 Candidate',
    description: 'New semi-realistic Asha V2 atlas for in-game review.',
    characterId: 'asha-v2-production-candidate',
    atlasPath: 'assets/expedition/player/asha-v2-production-candidate-spritesheet.json',
    version: 'asha-v2-production-candidate-idle-8frame-2026-05-28',
    fallbackAtlasPath: 'assets/expedition/player/asha-final-production-spritesheet.json',
    fallbackAtlasVersion: 'asha-master-reference-motion-2026-05-23',
    fallbackCharacterId: 'asha-final-production',
    fallbackSrc: PLAYER_LEGACY_SPRITE_SRC,
  },
  {
    id: 'asha-v3-gemini-candidate',
    label: 'Asha V3 Gemini Candidate',
    description: 'Gemini-inspired Asha V3 atlas for visual comparison.',
    characterId: 'asha-v3-gemini-candidate',
    atlasPath: 'assets/expedition/player/asha-v3-production-candidate-spritesheet.json',
    version: 'asha-v3-gemini-candidate-2026-05-21',
    fallbackAtlasPath: PLAYER_HERO_SPRITE_ATLAS_JSON,
    fallbackAtlasVersion: PLAYER_HERO_SPRITE_VERSION,
    fallbackCharacterId: 'asha-egypt-warrior-explorer',
    fallbackSrc: PLAYER_LEGACY_SPRITE_SRC,
  },
  {
    id: 'egypt-warrior-guide',
    label: 'Egypt Guide Test',
    description: 'Older playable Egypt warrior-guide atlas.',
    characterId: 'egypt-warrior-guide',
    atlasPath: PLAYER_HERO_FALLBACK_SPRITE_ATLAS_JSON,
    version: PLAYER_HERO_FALLBACK_SPRITE_VERSION,
    fallbackSrc: PLAYER_LEGACY_SPRITE_SRC,
  },
  {
    id: 'china-archaeologist',
    label: 'China Archaeologist',
    description: 'Playable China archaeologist atlas for comparison.',
    characterId: 'china-female-archaeologist',
    atlasPath: PLAYER_CHINA_HERO_SPRITE_ATLAS_JSON,
    version: PLAYER_CHINA_HERO_SPRITE_VERSION,
    fallbackSrc: PLAYER_LEGACY_SPRITE_SRC,
  },
  {
    id: 'legacy-strip',
    label: 'Legacy Strip',
    description: 'Original fallback strip, useful as a scale check.',
    characterId: 'legacy-archaeologist-strip',
    atlasPath: null,
    version: 'legacy-archaeologist-walk-cycle',
    fallbackSrc: PLAYER_LEGACY_SPRITE_SRC,
  },
];

export const getPlayerCharacterPreset = (presetId) => (
  PLAYER_CHARACTER_PRESETS.find(preset => preset.id === presetId) || PLAYER_CHARACTER_PRESETS[0]
);

export const getPlayerHeroSpriteConfig = ({ targetCivilisation, backgroundPackId, characterPresetId = 'auto' }) => {
  const selectedPreset = getPlayerCharacterPreset(characterPresetId);
  if (selectedPreset.id !== 'auto') {
    return selectedPreset;
  }
  const civStr = String(targetCivilisation || '').toLowerCase();
  const isChinaJourney = backgroundPackId === 'china-river-valley' || civStr.includes('china');
  const isRomeJourney  = backgroundPackId === 'rome' || civStr.includes('rome');
  if (isRomeJourney) {
    return {
      id: 'auto',
      characterId: 'asha-rome',
      atlasPath: PLAYER_ROME_HERO_SPRITE_ATLAS_JSON,
      version: PLAYER_ROME_HERO_SPRITE_VERSION,
      fallbackAtlasPath: PLAYER_HERO_SPRITE_ATLAS_JSON,
      fallbackAtlasVersion: PLAYER_HERO_SPRITE_VERSION,
      fallbackCharacterId: 'asha-reference-warrior',
      fallbackSrc: PLAYER_LEGACY_SPRITE_SRC,
    };
  }
  if (isChinaJourney) {
    return {
      id: 'auto',
      characterId: 'china-female-archaeologist',
      atlasPath: PLAYER_CHINA_HERO_SPRITE_ATLAS_JSON,
      version: PLAYER_CHINA_HERO_SPRITE_VERSION,
      fallbackSrc: PLAYER_LEGACY_SPRITE_SRC,
    };
  }
  return {
    id: 'auto',
    characterId: 'asha-reference-warrior',
    atlasPath: PLAYER_HERO_SPRITE_ATLAS_JSON,
    version: PLAYER_HERO_SPRITE_VERSION,
    fallbackAtlasPath: 'assets/expedition/player/asha-final-production-spritesheet.json',
    fallbackAtlasVersion: 'asha-master-reference-motion-2026-05-23',
    fallbackCharacterId: 'asha-final-production',
    fallbackSrc: PLAYER_LEGACY_SPRITE_SRC,
  };
};

export const getHeroSpriteFrameKey = (current, atlas, now) => {
  const animationState = current.player.animationState || 'idle';
  const walkCycleDistance = current.player.walkCycleDistance || 0;
  const attackState = current.attackPhase
    || (current.attackWindupTimer > 0 ? 'windup'
      : current.attackTimer > 0 ? 'swing'
        : current.attackRecoilTimer > 0 ? 'recoil'
          : current.attackCooldown > 0 ? 'cooldown'
            : 'ready');

  if (animationState === 'hurt') {
    const row = getHeroSpriteRow(atlas, 'hurt');
    return row?.frames?.[Math.floor(now / 90) % Math.max(1, row.frameCount)] || 'hurt_00';
  }

  if (animationState === 'dodge') {
    const row = getHeroSpriteRow(atlas, 'dodge') || getHeroSpriteRow(atlas, 'run') || getHeroSpriteRow(atlas, 'idle');
    if (!row) return null;
    const frameCount = Math.max(1, row.frameCount || row.frames?.length || 1);
    const dodgeProgress = clamp((PLAYER_DODGE_DURATION - Math.max(0, current.dodgeTimer || 0)) / PLAYER_DODGE_DURATION, 0, 1);
    const frameIndex = row.name === 'dodge'
      ? Math.min(frameCount - 1, PLAYER_DODGE_FRAME_SEQUENCE[Math.min(PLAYER_DODGE_FRAME_SEQUENCE.length - 1, Math.floor(dodgeProgress * PLAYER_DODGE_FRAME_SEQUENCE.length))] ?? 0)
      : Math.min(frameCount - 1, Math.max(0, Math.floor((0.35 + dodgeProgress * 0.45) * frameCount)));
    return row.frames?.[frameIndex] || null;
  }

  if (animationState === 'attack' || isPlayerAttackVisualPhase(attackState)) {
    const configuredAttackRows = Array.isArray(atlas?.draw?.attackChainRows)
      ? atlas.draw.attackChainRows
      : Array.isArray(atlas?.draw?.alternateAttackRows)
        ? atlas.draw.alternateAttackRows
        : ['attack_pick_swing', 'attack_pick_swing_alt'];
    const attackRows = configuredAttackRows
      .map(rowName => [rowName, getHeroSpriteRow(atlas, rowName)])
      .filter(([, row]) => Boolean(row));
    const attackIndex = Math.max(0, (current.attackSequenceIndex || 1) - 1);
    const [attackRowName, row] = attackRows.length
      ? attackRows[attackIndex % attackRows.length]
      : ['attack_pick_swing', null];
    if (!row) return null;
    const frameCount = Math.max(1, row.frameCount || row.frames?.length || 1);
    const isFinisherAttack = attackRowName === PLAYER_ATTACK_FINISHER_ROW;
    if (attackState === 'windup') {
      const windupDuration = Math.max(0.001, current.attackWindupDuration || ATTACK_WINDUP_DURATION);
      const windupProgress = clamp((windupDuration - Math.max(0, current.attackWindupTimer || 0)) / windupDuration, 0, 1);
      const windupFrame = isFinisherAttack && frameCount > 1
        ? Math.min(1, Math.floor(windupProgress * 2))
        : 0;
      return row.frames?.[windupFrame] || `${attackRowName}_${String(windupFrame).padStart(2, '0')}`;
    }
    if (attackState === 'recoil') {
      if (isFinisherAttack && frameCount > 1) {
        const recoilDuration = Math.max(0.001, current.attackRecoilDuration || ATTACK_RECOIL_DURATION);
        const recoilProgress = clamp((recoilDuration - Math.max(0, current.attackRecoilTimer || 0)) / recoilDuration, 0, 1);
        const firstRecoilFrame = Math.max(0, frameCount - 2);
        const recoilFrame = Math.min(frameCount - 1, firstRecoilFrame + Math.floor(recoilProgress * 2));
        return row.frames?.[recoilFrame] || `${attackRowName}_${String(recoilFrame).padStart(2, '0')}`;
      }
      return row.frames?.[frameCount - 1] || `${attackRowName}_${String(frameCount - 1).padStart(2, '0')}`;
    }
    const swingDuration = Math.max(0.001, current.attackSwingDuration || ATTACK_DURATION);
    const progress = clamp((swingDuration - Math.max(0, current.attackTimer || 0)) / swingDuration, 0, 1);
    const firstSwingFrame = isFinisherAttack ? Math.min(2, frameCount - 1) : Math.min(1, frameCount - 1);
    const lastSwingFrame = isFinisherAttack ? Math.max(firstSwingFrame, frameCount - 3) : Math.max(firstSwingFrame, frameCount - 2);
    const swingFrameCount = Math.max(1, lastSwingFrame - firstSwingFrame + 1);
    const swingFrameIndex = firstSwingFrame + Math.min(swingFrameCount - 1, Math.floor(progress * swingFrameCount));
    return row.frames?.[swingFrameIndex] || null;
  }

  const rowName = animationState === 'survey-walk' ? 'survey_walk' : animationState;
  const row = getHeroSpriteRow(atlas, rowName) || getHeroSpriteRow(atlas, 'idle');
  if (!row) return null;
  const frameCount = Math.max(1, row.frameCount || row.frames?.length || 1);
  if (row.loop) {
    const fixedFrame = getHeroSpriteFixedFrame(atlas, rowName, row);
    if (fixedFrame) return fixedFrame;
    const frame = rowName === 'idle'
      ? Math.floor(now / 150) % frameCount
      : Math.floor(walkCycleDistance / getHeroSpriteFrameDistance(atlas, rowName)) % frameCount;
    return row.frames?.[frame] || null;
  }
  const frame = Math.min(frameCount - 1, current.player.animationFrame ?? 0);
  return row.frames?.[frame] || null;
};
