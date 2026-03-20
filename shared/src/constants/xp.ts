export const XP_PER_SESSION = 10;
export const SHARE_BONUS_XP = 5;
export const MAX_SHARES_PER_DAY = 1;

export const LEVEL_THRESHOLDS = [
  { level: 1, xpRequired: 0, name: 'Beginner' },
  { level: 2, xpRequired: 10, name: 'Starter' },
  { level: 3, xpRequired: 50, name: 'Focused' },
  { level: 4, xpRequired: 100, name: 'Dedicated' },
  { level: 5, xpRequired: 200, name: 'Committed' },
  { level: 6, xpRequired: 350, name: 'Disciplined' },
  { level: 7, xpRequired: 550, name: 'Relentless' },
  { level: 8, xpRequired: 800, name: 'Unstoppable' },
  { level: 9, xpRequired: 1100, name: 'Master' },
  { level: 10, xpRequired: 1500, name: 'Legend' },
] as const;

export function getLevelForXp(xp: number): (typeof LEVEL_THRESHOLDS)[number] {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].xpRequired) {
      return LEVEL_THRESHOLDS[i];
    }
  }
  return LEVEL_THRESHOLDS[0];
}

export function getXpProgress(xp: number): { current: number; next: number; progress: number } {
  const currentLevel = getLevelForXp(xp);
  const nextLevel = LEVEL_THRESHOLDS.find((l) => l.level === currentLevel.level + 1);

  if (!nextLevel) {
    return { current: xp, next: xp, progress: 1 };
  }

  const xpIntoLevel = xp - currentLevel.xpRequired;
  const xpForNextLevel = nextLevel.xpRequired - currentLevel.xpRequired;

  return {
    current: xpIntoLevel,
    next: xpForNextLevel,
    progress: xpIntoLevel / xpForNextLevel,
  };
}
