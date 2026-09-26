import controls from './controls.js';
import { playJump } from './sound.js';
import { COIN_BONUS } from './coin.js';

export const PLAYER_SPEED = 350;
export const JUMP_VELOCITY = 1450;
export const GRAVITY = 4000;
export const PLAYER_HALF_WIDTH = 14;
// Peak height of a normal jump: v² / 2g.
export const MAX_JUMP_HEIGHT = (JUMP_VELOCITY * JUMP_VELOCITY) / (2 * GRAVITY);
const PLAYER_RADIUS = 30;
const WORLD_WIDTH = 400;

export default class Player {
    constructor(el, game) {
        this.game = game;
        this.el = el;
    }

    reset() {
        this.pos = { x: 100, y: 0 };
        this.vel = { x: 0, y: 0 };
        this.maxScore = 0;
    }

    onFrame(delta) {
        // Player input
        this.vel.x = controls.inputVec.x * PLAYER_SPEED;

        // Jumping
        if (this.vel.y === 0) {
            this.vel.y = -JUMP_VELOCITY;
            if (controls.keys.space) {
                this.vel.y -= 300;
            }
            if (controls.keys.down) {
                this.vel.y += 500;
            }
            playJump();
        }

        // Wrap around the screen edges.
        if (this.pos.x < 0) {
            this.pos.x = WORLD_WIDTH;
        }
        if (this.pos.x > WORLD_WIDTH) {
            this.pos.x = 0;
        }

        // Gravity
        this.vel.y += GRAVITY * delta;

        const oldY = this.pos.y;
        this.pos.x += delta * this.vel.x;
        this.pos.y += delta * this.vel.y;

        this.maxScore = Math.max(this.maxScore, -this.pos.y);

        // Collision detection
        this.checkPlatforms(oldY);
        this.checkCoins();
        this.checkEnemies();
        this.checkGameOver();

        // Update UI
        if (this.el) {
            this.el.style.transform = `translate3d(${this.pos.x}px, ${this.pos.y}px, 0)`;
            this.el.classList.toggle('left', this.vel.x < 0);
            this.el.classList.toggle('right', this.vel.x > 0);
            this.el.classList.toggle('jumping', this.vel.y < 0);
        }
    }

    checkGameOver() {
        const viewport = this.game.viewport;
        if (viewport.y !== 0 && (this.pos.y - viewport.y) > viewport.height) {
            this.game.gameOver();
        }
    }

    checkPlatforms(oldY) {
        this.game.forEachPlatform((p) => {
            // Are we crossing Y.
            if (p.rect.y >= oldY && p.rect.y < this.pos.y) {
                // Are inside X bounds.
                if (this.pos.x + PLAYER_HALF_WIDTH >= p.rect.x && this.pos.x - PLAYER_HALF_WIDTH <= p.rect.right) {
                    // COLLISION. Let's stop gravity.
                    this.pos.y = p.rect.y;
                    this.vel.y = 0;
                }
            }
        });
    }

    checkCoins() {
        this.game.forEachCoin((coin) => {
            if (this.touches(coin.center, coin.radius)) {
                this.game.collectCoin(coin, COIN_BONUS);
            }
        });
    }

    checkEnemies() {
        this.game.forEachEnemy((enemy) => {
            if (this.touches(enemy.pos, enemy.radius)) {
                this.game.gameOver();
            }
        });
    }

    /**
     * Circle-vs-circle test against the player's body.
     */
    touches(point, radius) {
        const distanceX = point.x - this.pos.x;
        const distanceY = point.y - (this.pos.y - 40);
        const minDistance = radius + PLAYER_RADIUS;
        return distanceX * distanceX + distanceY * distanceY < minDistance * minDistance;
    }
}
