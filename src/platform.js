import { createEl } from './dom.js';

export default class Platform {
    constructor(rect) {
        this.rect = rect;
        this.rect.right = rect.x + rect.width;
        this.el = createEl('platform', {
            left: rect.x + 'px',
            top: rect.y + 'px',
            width: rect.width + 'px',
            height: rect.height + 'px',
        });
    }

    get bottomY() {
        return this.rect.y;
    }

    onFrame() {}
}
