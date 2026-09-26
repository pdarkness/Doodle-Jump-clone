import { MAX_JUMP_HEIGHT } from './player.js';

export const WORLD_WIDTH = 400;
export const PLATFORM_WIDTH = 80;
export const PLATFORM_HEIGHT = 10;

// Vertical space between consecutive platforms. The maximum stays well below
// the jump height, so there's time to steer sideways before landing.
export const MIN_GAP = 30;
export const MAX_GAP = Math.floor(MAX_JUMP_HEIGHT * 0.7);
// Gaps start small and widen towards MAX_GAP as the player climbs.
const START_MAX_GAP = 100;
const DIFFICULTY_HEIGHT = 10000;

/**
 * Returns the rect of the next platform above `prev`. Each platform is at most
 * MAX_GAP above the previous one, so a normal jump can always reach it.
 * @param {{y: number}} prev The current highest platform.
 * @param {function(): number} random Random number generator in [0, 1).
 */
export function nextPlatformRect(prev, random = Math.random) {
    const height = -prev.y;
    const difficulty = Math.min(height / DIFFICULTY_HEIGHT, 1);
    const maxGap = START_MAX_GAP + (MAX_GAP - START_MAX_GAP) * difficulty;
    const gap = MIN_GAP + random() * (maxGap - MIN_GAP);

    return {
        x: Math.floor(random() * (WORLD_WIDTH - PLATFORM_WIDTH)),
        y: prev.y - gap,
        width: PLATFORM_WIDTH,
        height: PLATFORM_HEIGHT,
    };
}
