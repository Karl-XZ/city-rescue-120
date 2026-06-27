import type { CompressionRating } from './state';

export const RHYTHM_ZONES = {
  goodStart: 0.3,
  perfectStart: 0.45,
  perfectEnd: 0.55,
  goodEnd: 0.7,
} as const;

const toPercent = (value: number) => `${value * 100}%`;

export const RHYTHM_ZONE_STYLES = {
  leftGood: {
    left: toPercent(RHYTHM_ZONES.goodStart),
    width: toPercent(RHYTHM_ZONES.perfectStart - RHYTHM_ZONES.goodStart),
  },
  perfect: {
    left: toPercent(RHYTHM_ZONES.perfectStart),
    width: toPercent(RHYTHM_ZONES.perfectEnd - RHYTHM_ZONES.perfectStart),
  },
  rightGood: {
    left: toPercent(RHYTHM_ZONES.perfectEnd),
    width: toPercent(RHYTHM_ZONES.goodEnd - RHYTHM_ZONES.perfectEnd),
  },
} as const;

export const RHYTHM_ZONE_LABEL_POSITIONS = {
  leftGood: toPercent((RHYTHM_ZONES.goodStart + RHYTHM_ZONES.perfectStart) / 2),
  perfect: toPercent((RHYTHM_ZONES.perfectStart + RHYTHM_ZONES.perfectEnd) / 2),
  rightGood: toPercent((RHYTHM_ZONES.perfectEnd + RHYTHM_ZONES.goodEnd) / 2),
} as const;

export function getCurrentRhythmPosition(): number {
  const rhythmPos = (window as Window & { __RHYTHM_POS__?: { current: number } }).__RHYTHM_POS__?.current ?? 0.5;
  return Math.min(1, Math.max(0, rhythmPos));
}

export function rateCompressionRhythm(rhythmPos = getCurrentRhythmPosition()): CompressionRating {
  if (rhythmPos >= RHYTHM_ZONES.perfectStart && rhythmPos <= RHYTHM_ZONES.perfectEnd) {
    return 'perfect';
  }
  if (rhythmPos >= RHYTHM_ZONES.goodStart && rhythmPos <= RHYTHM_ZONES.goodEnd) {
    return 'good';
  }
  return rhythmPos < RHYTHM_ZONES.goodStart ? 'fast' : 'slow';
}
