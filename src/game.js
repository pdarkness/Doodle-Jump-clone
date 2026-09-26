import Player from './player.js';
import Platform from './platform.js';
import Coin from './coin.js';
import Enemy from './enemy.js';
import controls from './controls.js';
import { nextPlatformRect, WORLD_WIDTH, PLATFORM_HEIGHT } from './level.js';

const VIEWPORT_PADDING = 220;
// Keep platforms generated this far above the top of the screen.
const GENERATE_AHEAD = 600;
// How far enemies float sideways, and half the sprite width (see .enemy in style.css).
const ENEMY_SWING = 150;
const ENEMY_HALF_WIDTH = 36;
// Cap the frame delta so a backgrounded tab doesn't make the player tunnel through platforms.
const MAX_DELTA = 1 / 20;
// Ignore restart input for a moment so a held key doesn't skip the game-over screen.
const RESTART_DELAY_MS = 600;

/**
 * Main game class.
 * @param {HTMLElement} el DOM element containing the game.
 */
export default class Game {
    constructor(el) {
        this.el = el;
        this.player = new Player(el.querySelector('.player'), this);
        this.entities = [];
        this.platformsEl = el.querySelector('.platforms');
        this.entitiesEl = el.querySelector('.entities');
        this.coinsEl = el.querySelector('.coins');
        this.worldEl = el.querySelector('.world');
        this.scoreEl = el.querySelector('.score');
        this.overlayEl = el.querySelector('.overlay');
        this.finalScoreEl = el.querySelector('.final-score');
        this.isPlaying = false;
        this.level = 1;
        this.worldChunkSize = 1000;

        // Cache a bound onFrame since we need it each frame.
        this.onFrame = this.onFrame.bind(this);
    }

    freezeGame() {
        this.isPlaying = false;
    }

    unFreezeGame() {
        if (!this.isPlaying) {
            this.isPlaying = true;
            // Restart the onFrame loop
            this.lastFrame = performance.now() / 1000;
            requestAnimationFrame(this.onFrame);
        }
    }

    createWorld() {
        // Ground
        for (let i = 0; i < 10 - this.level; i++) {
            this.addPlatform(new Platform({
                x: 0,
                y: -i * 100,
                width: WORLD_WIDTH,
                height: PLATFORM_HEIGHT,
            }));
        }
        this.generatePlatforms();
    }

    /**
     * Adds platforms above the highest one until the area above the screen is filled.
     * Each new platform is placed relative to the previous one, so there is never
     * a gap too big to jump.
     */
    generatePlatforms() {
        const targetY = this.viewport.y - GENERATE_AHEAD;
        while (this.highestPlatform.rect.y > targetY) {
            this.addPlatform(new Platform(nextPlatformRect(this.highestPlatform.rect)));

            // One enemy and one coin per chunk of world.
            if (this.highestPlatform.rect.y < this.nextChunkY) {
                this.createChunkExtras(this.nextChunkY);
                this.nextChunkY -= this.worldChunkSize;
            }
        }
    }

    /**
     * Places an enemy and a coin somewhere in the chunk starting at `chunkBottomY`
     * and extending one chunk upwards.
     */
    createChunkExtras(chunkBottomY) {
        const randomY = () => chunkBottomY - Math.floor(Math.random() * this.worldChunkSize);

        // Keep the whole swing, sprite included, on screen.
        const minX = ENEMY_SWING + ENEMY_HALF_WIDTH;
        const enemyX = minX + Math.random() * (WORLD_WIDTH - ENEMY_HALF_WIDTH - minX);
        const enemyY = randomY();
        this.addEnemy(new Enemy({
            start: { x: enemyX, y: enemyY },
            end: { x: enemyX - ENEMY_SWING, y: enemyY },
        }));

        this.addCoin(new Coin({
            x: Math.floor(Math.random() * (WORLD_WIDTH - 20)),
            y: randomY(),
        }));
    }

    addPlatform(platform) {
        this.highestPlatform = platform;
        this.entities.push(platform);
        this.platformsEl.append(platform.el);
    }

    addCoin(coin) {
        this.entities.push(coin);
        this.coinsEl.append(coin.el);
    }

    addEnemy(enemy) {
        this.entities.push(enemy);
        this.entitiesEl.append(enemy.el);
    }

    collectCoin(coin, bonus) {
        if (coin.dead) {
            return;
        }
        coin.dead = true;
        coin.el.remove();
        this.gameScore += bonus;
    }

    get score() {
        return this.gameScore + Math.floor(this.player.maxScore);
    }

    gameOver() {
        if (!this.isPlaying) {
            return;
        }
        this.freezeGame();
        this.gameOverAt = performance.now();
        this.finalScoreEl.textContent = String(this.score);
        this.overlayEl.hidden = false;
    }

    /**
     * Called on any key press or tap; restarts after a game over.
     */
    onPress() {
        if (!this.isPlaying && performance.now() - this.gameOverAt > RESTART_DELAY_MS) {
            this.start();
        }
    }

    /**
     * Runs every frame. Calculates a delta and allows each game entity to update itself.
     */
    onFrame() {
        if (!this.isPlaying) {
            return;
        }

        const now = performance.now() / 1000;
        const delta = Math.min(now - this.lastFrame, MAX_DELTA);
        this.lastFrame = now;

        controls.onFrame(delta);
        this.player.onFrame(delta);

        // Anything that has scrolled off the bottom of the screen can never be reached again.
        const bottom = this.viewport.y + this.viewport.height + 100;
        for (let i = 0; i < this.entities.length; i++) {
            const e = this.entities[i];
            e.onFrame(delta);
            if (e.bottomY > bottom) {
                e.dead = true;
                e.el.remove();
            }
            if (e.dead) {
                this.entities.splice(i--, 1);
            }
        }

        this.updateViewport();
        this.generatePlatforms();
        this.scoreEl.textContent = String(this.score);

        // Request next frame.
        requestAnimationFrame(this.onFrame);
    }

    updateViewport() {
        const minY = this.viewport.y + VIEWPORT_PADDING;
        const maxY = this.viewport.y + this.viewport.height + VIEWPORT_PADDING;
        const playerY = this.player.pos.y;

        if (playerY < minY) {
            this.viewport.y = playerY - VIEWPORT_PADDING;
        } else if (playerY > maxY) {
            this.viewport.y = playerY - this.viewport.height + VIEWPORT_PADDING;
        }

        this.worldEl.style.transform = `translate3d(${-this.viewport.x}px, ${-this.viewport.y}px, 0)`;
        // Scroll the graph-paper background along with the world.
        this.el.style.backgroundPosition = `0 ${-this.viewport.y}px`;
    }

    /**
     * Starts the game.
     */
    start() {
        // Cleanup last game.
        this.entities.forEach((e) => e.el.remove());
        this.entities = [];
        this.gameScore = 0;
        this.nextChunkY = -this.worldChunkSize;
        this.overlayEl.hidden = true;

        // Set the stage.
        this.viewport = { x: 0, y: 0, width: WORLD_WIDTH, height: 550 };
        this.createWorld();
        this.player.reset();

        // Then start.
        this.unFreezeGame();
    }

    forEachOfType(type, handler) {
        for (const e of this.entities) {
            if (e instanceof type && !e.dead) {
                handler(e);
            }
        }
    }

    forEachCoin(handler) {
        this.forEachOfType(Coin, handler);
    }

    forEachPlatform(handler) {
        this.forEachOfType(Platform, handler);
    }

    forEachEnemy(handler) {
        this.forEachOfType(Enemy, handler);
    }
}
