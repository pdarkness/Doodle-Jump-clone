/**
 * Creates a <div> with a class and inline styles. Returns null when there is
 * no DOM (unit tests), so entities stay usable as plain data.
 */
export function createEl(className, style = {}) {
    if (typeof document === 'undefined') {
        return null;
    }
    const el = document.createElement('div');
    el.className = className;
    Object.assign(el.style, style);
    return el;
}
