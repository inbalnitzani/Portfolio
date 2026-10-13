# Real-app demo videos

The Side Quests videos are screen recordings of the real apps running on **demo data only**:

| App | How it runs on fake data | Start it |
| --- | --- | --- |
| Yair Nitzani Music | `music/vite.config.mjs` swaps `supabaseClient` for `music/supabase-mock.ts` (fictional catalog, demo admin user) | `cd ~/projects/Nitzani-Music && node_modules/.bin/vite --config ~/projects/portfolio/design/demos/music/vite.config.mjs --port 5190` |
| Trakaboo | built-in sample data when Supabase env is empty | `cd ~/projects/expense-tracker && env NEXT_PUBLIC_SUPABASE_URL= NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY= npm run dev -- --port 3100` |
| Job Search Log | `job-log/index.html` = the tracker artifact + an in-memory runtime with fictional companies. **Local only, git-ignored** — it contains the private tracker's code. | served by the portfolio dev server (`npm run dev -- --port 5180`) |

Then record (uses installed Google Chrome; frames via CDP screencast, encoded with MediaRecorder — no ffmpeg needed):

```bash
node design/demos/record.mjs            # all three, or: music | trakaboo | joblog
cp design/demos/out/*.mp4 design/demos/out/*.chapters.json public/videos/
```

Chapter captions come from `ui.mark()` calls in `record.mjs`; copy them into `SIDE_QUESTS` in `src/data/cv.ts`.
