# INBAL.EXE — portfolio

Playable CV / portfolio for Inbal Nitzani. Vite + React 19 + TypeScript + Tailwind v4 + Motion + Lenis.

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # → dist/
```

## Editing content

All text lives in [`src/data/cv.ts`](src/data/cv.ts): profile, stats, skills, quests (jobs), games, side quests.

- **Character** — poses live in `public/character/{idle,wave,run,play}.png` (generated, background removed with `design/cutout.swift`). [`Character.tsx`](src/components/Character.tsx) maps levels to poses.
- **3D props** — `public/props/*.png`. **Fur cursor** — [`FurCursor.tsx`](src/components/FurCursor.tsx) (wind = SVG turbulence driven by mouse speed).
- **Design board** — `python3 design/build_board.py <pins_dir>` regenerates `design/portfolio-board.svg` to drag into Figma.
- **Game covers** — `public/games/*.png`. `embedId` is the itch.io upload id used for the in-page player.
- **CV PDF** — `public/Inbal_Nitzani_CV.pdf` (Boss level → "Download Save File").
- **Trailers** — code-animated scenes in [`src/trailers/trailers.tsx`](src/trailers/trailers.tsx), played inside the MS Paint window ([`PaintPlayer.tsx`](src/trailers/PaintPlayer.tsx)).
- **Colors / fonts** — tokens in [`src/index.css`](src/index.css).

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds with `BASE_PATH=/<repo>/` and publishes to GitHub Pages: https://inbalnitzani.github.io/Portfolio/

Public files must be referenced with `asset('/path')` (`src/lib/asset.ts`) so they work under that base path.
