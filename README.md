Doodle-Jump-clone
=================
My first HTML5 game =)

## Play

Requires Node.js 20.19+ (or 22.12+).

```sh
npm install
npm run dev
```

Then open http://localhost:5173. To try it on a phone on the same network, run `npm run dev -- --host`.

## Controls

- **Arrow keys / A, D**: move left and right
- **Space** (held): jump higher. **Down** (held): jump lower
- **Phone**: tilt the device, or hold the left or right half of the screen
- After a game over, press Space or tap to play again

## Scripts

| Command           | What it does                              |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Dev server with hot reload                |
| `npm test`        | Unit tests (Vitest)                       |
| `npm run build`   | Production build into `dist/`             |
| `npm run preview` | Serve the production build locally        |

The production build is fully static, so you can host `dist/` anywhere (GitHub Pages, Netlify, and so on).
