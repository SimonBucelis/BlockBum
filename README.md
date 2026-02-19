# BlockBum

A mobile-friendly block puzzle game. Fill rows and columns to clear lines, collect gems, and use power-ups to beat levels.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) (or the port Vite prints).

## Build & deploy to GitHub Pages

```bash
npm run build
npm run deploy
```

The app is built with `base: "/BlockBum/"` so it works at `https://<your-username>.github.io/BlockBum/`. After pushing, enable GitHub Pages: repo **Settings → Pages → Source**: Deploy from branch `gh-pages`, folder `/ (root)`.

## Features

- **8×8 grid** — Place polyomino pieces by dragging them onto the board.
- **Line clearing** — Complete rows or columns to clear them and score.
- **Gems** — Collect enough gems each level to advance.
- **Obstacles** — Rocks, ice, and cages appear in later levels.
- **Power-ups** (earned on level complete):
  - **Bomb** — Tap a cell to explode a 3×3 area (like Line Zap: use then choose target).
  - **Line Zap** — Instantly clear any row or column (tap to choose).
  - **Color Bomb** — Clears all blocks of the most common color.
  - **Rock Breaker** — Destroys all rocks and collects their gems.
- **Touch-friendly** — Drag optimized for phone: block centered under finger, thumb ~60px below block.
- **Save** — Progress is saved locally so you can continue later.

## Tech

- React + TypeScript
- Vite
- Tailwind CSS

## License

MIT
