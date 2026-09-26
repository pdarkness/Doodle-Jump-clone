import { defineConfig } from 'vite';

// Content Security Policy for the production build. The game needs nothing but
// its own scripts, styles and images, so everything else is denied. Dev mode is
// left alone because Vite injects inline styles for hot reloading.
const CSP = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self' data:",
    "connect-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
].join('; ');

const cspPlugin = {
    name: 'inject-csp',
    apply: 'build',
    transformIndexHtml(html) {
        return html.replace(
            '<meta charset="utf-8">',
            `<meta charset="utf-8">\n    <meta http-equiv="Content-Security-Policy" content="${CSP}">`
        );
    },
};

export default defineConfig({
    // Relative asset paths so the build also works from a sub-folder (e.g. GitHub Pages).
    base: './',
    plugins: [cspPlugin],
    build: {
        // Inlined assets would be data: URIs; keep everything as files so the CSP stays strict.
        assetsInlineLimit: 0,
    },
});
