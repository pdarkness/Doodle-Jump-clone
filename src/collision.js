/**
 * Exact test for whether an axis-aligned ellipse overlaps an axis-aligned rectangle.
 * @param {{x: number, y: number, rx: number, ry: number}} ellipse Center and radii.
 * @param {{left: number, right: number, top: number, bottom: number}} rect
 */
export function ellipseIntersectsRect(ellipse, rect) {
    // Scaling space so the ellipse becomes a unit circle keeps the rectangle axis-aligned,
    // so it reduces to a circle-vs-rectangle test using the closest point on the rectangle.
    const closestX = Math.max(rect.left, Math.min(ellipse.x, rect.right));
    const closestY = Math.max(rect.top, Math.min(ellipse.y, rect.bottom));
    const dx = (closestX - ellipse.x) / ellipse.rx;
    const dy = (closestY - ellipse.y) / ellipse.ry;
    return dx * dx + dy * dy <= 1;
}
