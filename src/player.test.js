import { describe, it, expect, beforeEach } from 'vitest';
import Player from './player.js';
import Platform from './platform.js';
import Coin, { COIN_BONUS } from './coin.js';
import Enemy from './enemy.js';

function fakeGame(entities) {
    return {
        viewport: { x: 0, y: 0, width: 400, height: 550 },
        gameScore: 0,
        over: false,
        gameOver() { this.over = true; },
        collectCoin(coin, bonus) { coin.dead = true; this.gameScore += bonus; },
        forEachPlatform(fn) { entities.filter((e) => e instanceof Platform).forEach(fn); },
        forEachCoin(fn) { entities.filter((e) => e instanceof Coin && !e.dead).forEach(fn); },
        forEachEnemy(fn) { entities.filter((e) => e instanceof Enemy).forEach(fn); },
    };
}

describe('Player', () => {
    let entities;
    let game;
    let player;

    beforeEach(() => {
        entities = [];
        game = fakeGame(entities);
        player = new Player(null, game);
        player.reset();
    });

    it('bounces off a platform it falls onto', () => {
        entities.push(new Platform({ x: 50, y: -100, width: 100, height: 10 }));
        player.pos = { x: 100, y: -110 };
        player.vel = { x: 0, y: 500 };

        player.onFrame(1 / 30);

        expect(player.pos.y).toBe(-100);
        expect(player.vel.y).toBe(0);
    });

    it('passes up through platforms from below', () => {
        entities.push(new Platform({ x: 50, y: -100, width: 100, height: 10 }));
        player.pos = { x: 100, y: -90 };
        player.vel = { x: 0, y: -1000 };

        player.onFrame(1 / 30);

        expect(player.pos.y).toBeLessThan(-100);
    });

    it('collects coins once', () => {
        const coin = new Coin({ x: 95, y: -250 });
        entities.push(coin);
        player.pos = { x: 100, y: -200 };
        player.vel = { x: 0, y: -1 };

        player.onFrame(0);
        player.onFrame(0);

        expect(game.gameScore).toBe(COIN_BONUS);
    });

    it('dies when touching an enemy', () => {
        const enemy = new Enemy({ start: { x: 100, y: -240 }, end: { x: 100, y: -240 } });
        enemy.onFrame(0);
        entities.push(enemy);
        player.pos = { x: 100, y: -200 };
        player.vel = { x: 0, y: -1 };

        player.onFrame(0);

        expect(game.over).toBe(true);
    });

    it('wraps around the screen edges', () => {
        player.pos = { x: -1, y: -500 };
        player.vel = { x: 0, y: -1 };

        player.onFrame(0);

        expect(player.pos.x).toBe(400);
    });
});
