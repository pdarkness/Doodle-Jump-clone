const KEYS = {
    ' ': 'space',
    ArrowLeft: 'left',
    ArrowUp: 'up',
    ArrowRight: 'right',
    ArrowDown: 'down',
    a: 'left',
    d: 'right',
};

const FULL_ANGLE = 30;

/**
 * Keyboard, tilt and touch input. Exported as a singleton.
 */
class Controls {
    constructor() {
        this.keys = {};
        this.inputVec = { x: 0, y: 0 };
        this.tilt = 0;
        this.touchDir = 0;
        this.onPress = null;
    }

    /**
     * Starts listening for input. Kept out of the constructor so the module can
     * be imported without a DOM (e.g. in tests).
     * @param {HTMLElement} gameEl Element that receives touch input.
     */
    attach(gameEl) {
        this.gameEl = gameEl;
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
        window.addEventListener('deviceorientation', (e) => this.onOrientation(e));
        gameEl.addEventListener('pointerdown', (e) => this.onPointerDown(e));
        window.addEventListener('pointerup', () => { this.touchDir = 0; });
        window.addEventListener('pointercancel', () => { this.touchDir = 0; });
    }

    onOrientation(e) {
        if (e.gamma == null) {
            return;
        }
        let degree = e.gamma;
        const angle = screen.orientation ? screen.orientation.angle : (window.orientation || 0);
        if (angle) {
            // Landscape: steer with beta instead, flipped depending on rotation direction.
            const dir = (angle > 180 ? angle - 360 : angle) / 90;
            degree = e.beta * dir;
        }
        const speed = degree / FULL_ANGLE;
        this.tilt = Math.max(Math.min(speed, 1), -1);
    }

    onPointerDown(e) {
        // iOS 13+ only delivers tilt events after the user grants permission from a gesture.
        const DOE = window.DeviceOrientationEvent;
        if (DOE && typeof DOE.requestPermission === 'function' && !this.askedPermission) {
            this.askedPermission = true;
            DOE.requestPermission().catch(() => {});
        }

        if (this.onPress) {
            this.onPress();
        }

        // Touch fallback: hold the left or right half of the screen to steer.
        const rect = this.gameEl.getBoundingClientRect();
        this.touchDir = e.clientX < rect.left + rect.width / 2 ? -1 : 1;
    }

    onKeyDown(e) {
        const keyName = KEYS[e.key];
        if (keyName) {
            this.keys[keyName] = true;
            if (this.onPress) {
                this.onPress(keyName);
            }
            e.preventDefault();
        }
    }

    onKeyUp(e) {
        const keyName = KEYS[e.key];
        if (keyName) {
            this.keys[keyName] = false;
        }
    }

    onFrame() {
        if (this.keys.right) {
            this.inputVec.x = 1;
        } else if (this.keys.left) {
            this.inputVec.x = -1;
        } else if (this.touchDir) {
            this.inputVec.x = this.touchDir;
        } else {
            this.inputVec.x = this.tilt;
        }
    }
}

export default new Controls();
