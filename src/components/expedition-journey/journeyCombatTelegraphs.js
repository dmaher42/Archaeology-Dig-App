export const HEAVY_ATTACK_INTERVAL = {
  scarab: 3, scorpion: 3, snake: 3, bat: 3, 'sand-wisp': 3,
  guardian: 2, mummy: 2, bes: 2, statue: 2, looter: 3,
};

// Attack telegraph language (Sekiro-style colour code):
//   gold   = normal strike  — parry or dodge
//   orange = heavy strike    — parry or dodge, but hits harder
//   red    = unblockable     — MUST dodge (cannot be parried)
export const ATTACK_TELEGRAPH_CLASSES = {
  normal: { id: 'normal', color: '#facc15', glow: 'rgba(250, 204, 21, 0.55)', parryable: true },
  heavy: { id: 'heavy', color: '#fb7a1e', glow: 'rgba(251, 122, 30, 0.6)', parryable: true },
  unblockable: { id: 'unblockable', color: '#ef4444', glow: 'rgba(239, 68, 68, 0.66)', parryable: false },
};

// Classify an enemy's currently-selected attack for telegraph colour + parry rule.
// Unblockable = the shielded heavy charges (protectedDuringWindup); the red
// telegraph means the player must dodge rather than parry.
export const getEnemyAttackTelegraph = (enemy, heavyPatterns = {}) => {
  const heavy = heavyPatterns[enemy?.type];
  const isHeavyActive = Boolean(heavy && enemy?.attackPattern === heavy.id);
  if (isHeavyActive && heavy.protectedDuringWindup) return ATTACK_TELEGRAPH_CLASSES.unblockable;
  if (isHeavyActive) return ATTACK_TELEGRAPH_CLASSES.heavy;
  return ATTACK_TELEGRAPH_CLASSES.normal;
};
