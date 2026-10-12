# INBAL.EXE — portfolio

Playable CV / portfolio for Inbal Nitzani. Vite + React 19 + TypeScript + Tailwind v4 + Motion + Lenis.

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # → dist/
```

## Editing content

All text lives in [`src/data/cv.ts`](src/data/cv.ts): profile, stats, skills, quests (jobs), games, side quests.

- **Pixel character** — redraw her in [`src/components/PixelSprite.tsx`](src/components/PixelSprite.tsx) (each string is a row of pixels, letters map to `PALETTE`).
- **Game covers** — `public/games/*.png`. `embedId` is the itch.io upload id used for the in-page player.
- **CV PDF** — `public/Inbal_Nitzani_CV.pdf` (Boss level → "Download Save File").
- **Trailers** — code-animated scenes in [`src/trailers/trailers.tsx`](src/trailers/trailers.tsx).
- **Colors / fonts** — tokens in [`src/index.css`](src/index.css).

## Deploy

Vercel: import the repo, framework preset **Vite**, no config needed.
