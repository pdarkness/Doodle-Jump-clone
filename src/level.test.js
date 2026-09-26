import { describe, it, expect } from 'vitest';
import { nextPlatformRect, MAX_GAP, MIN_GAP, WORLD_WIDTH } from './level.js';
import { JUMP_VELOCITY, GRAVITY, PLAYER_SPEED, PLAYER_HALF_WIDTH, MAX_JUMP_HEIGHT } from './player.js';

/**
 * Seeded PRNG (mulberry32) so failures are reproducible.
 */
function seededRandom(seed) {
    return () => {
        seed = (seed + 0x6D2B79F5) | 0;
        let t = seed;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * Seconds from take-off until the player comes back down to `gap` pixels above
 * the take-off height, or null if the jump never gets that high.
 */
function timeToLand(gap) {
    // gap = v*t - g/2*t²  →  take the later (descending) root.
    const disc = JUMP_VELOCITY * JUMP_VELOCITY - 2 * GRAVITY * gap;
    return disc < 0 ? null : (JUMP_VELOCITY + Math.sqrt(disc)) / GRAVITY;
}

/**
 * Horizontal distance the player has to cover to get from anywhere on `from`
 * to somewhere on `to`, taking screen wrap-around into account.
 */
function worstHorizontalDistance(from, to) {
    // Landing zone: the player lands if any part of them (±PLAYER_HALF_WIDTH) is over the platform.
    const left = to.x - PLAYER_HALF_WIDTH;
    const right = to.x + to.width + PLAYER_HALF_WIDTH;
    let worst = 0;
    for (let x = from.x; x <= from.x + from.width; x++) {
        // Distance to the landing zone directly, or to its copy one screen to the left/right.
        const distance = Math.min(...[-WORLD_WIDTH, 0, WORLD_WIDTH].map(
            (shift) => Math.max(left + shift - x, x - (right + shift), 0)
        ));
        worst = Math.max(worst, distance);
    }
    return worst;
}

describe('level generation', () => {
    it('keeps the maximum gap below the jump height', () => {
        expect(MAX_GAP).toBeLessThan(MAX_JUMP_HEIGHT);
    });

    it('always places the next platform within one jump', () => {
        const random = seededRandom(1234);
        let prev = { x: 0, y: -800, width: WORLD_WIDTH, height: 10 };

        // Well past the height where gaps reach their maximum.
        for (let i = 0; i < 5000; i++) {
            const next = nextPlatformRect(prev, random);
            const gap = prev.y - next.y;

            expect(gap).toBeGreaterThanOrEqual(MIN_GAP);
            expect(gap).toBeLessThanOrEqual(MAX_GAP);
            expect(next.x).toBeGreaterThanOrEqual(0);
            expect(next.x + next.width).toBeLessThanOrEqual(WORLD_WIDTH);

            const airTime = timeToLand(gap);
            expect(airTime).not.toBeNull();
            expect(PLAYER_SPEED * airTime).toBeGreaterThanOrEqual(worstHorizontalDistance(prev, next));

            prev = next;
        }
        expect(-prev.y).toBeGreaterThan(10000);
    });
});
