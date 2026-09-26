import { createEl } from './dom.js';

// Ellipse fitted to the face in enemy.webp at its on-screen size (see .enemy in
// style.css), relative to the enemy's position. It covers 93% of the face's
// pixels, and 93% of its area is face.
const HITBOX = { offsetX: -1, offsetY: -1, rx: 33, ry: 29.5 };

export default class FloatingEnemy {
    constructor(options) {
        this.el = createEl('enemy');
        this.pos = { x: options.start.x, y: options.start.y };
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

    /**
     * The hitbox ellipse in world coordinates, mirrored along with the sprite.
     */
    get hitbox() {
        const offsetX = this.facingLeft ? -HITBOX.offsetX : HITBOX.offsetX;
        return {
            x: this.pos.x + offsetX,
            y: this.pos.y + HITBOX.offsetY,
            rx: HITBOX.rx,
            ry: HITBOX.ry,
        };
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
