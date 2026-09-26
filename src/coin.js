import { createEl } from './dom.js';

export const COIN_SIZE = 15;
export const COIN_BONUS = 5000;

export default class Coin {
    constructor(pos) {
        this.rect = { x: pos.x, y: pos.y, width: COIN_SIZE, height: COIN_SIZE };
        this.radius = COIN_SIZE / 2;
        this.center = { x: pos.x + this.radius, y: pos.y + this.radius };
        this.el = createEl('coin', {
            left: pos.x + 'px',
            top: pos.y + 'px',
        });
    }

    get bottomY() {
        return this.rect.y;
    }

    onFrame() {}
}
