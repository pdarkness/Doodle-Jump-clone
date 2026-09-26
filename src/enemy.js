import { createEl } from './dom.js';

export default class FloatingEnemy {
    constructor(options) {
        this.el = createEl('enemy');
        this.pos = { x: options.start.x, y: options.start.y };
        this.radius = 12;
        this.start = options.start;
        this.end = options.end;
        this.duration = options.duration || 5;
        this.current = 0;
        // Position the sprite right away instead of at the world origin until the first frame.
        this.onFrame(0);
    }

    get bottomY() {
        return Math.max(this.start.y, this.end.y);
    }

    onFrame(delta) {
        this.current = (this.current + delta) % this.duration;
        const relPosition = Math.sin((Math.PI * 2) * (this.current / this.duration)) / 2 + 0.5;

        this.pos.x = this.start.x + (this.end.x - this.start.x) * relPosition;
        this.pos.y = this.start.y + (this.end.y - this.start.y) * relPosition;

        // The sprite faces right; mirror it while moving left.
        const velocityX = Math.cos((Math.PI * 2) * (this.current / this.duration)) * (this.end.x - this.start.x);
        this.facingLeft = velocityX < 0;

        if (this.el) {
            const flip = this.facingLeft ? ' scaleX(-1)' : '';
            this.el.style.transform = `translate3d(${this.pos.x}px, ${this.pos.y}px, 0)${flip}`;
        }
    }
}
