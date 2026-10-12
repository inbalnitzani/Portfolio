// Runs the real Nitzani-Music app against the demo Supabase mock (fake catalog, demo admin user).
// Usage (from ~/projects/Nitzani-Music): node_modules/.bin/vite --config <this file> --port 5190
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { createRequire } from 'node:module'

const here = path.dirname(fileURLToPath(import.meta.url))
const appRoot = process.env.MUSIC_APP ?? path.resolve(process.env.HOME, 'projects/Nitzani-Music')
const req = createRequire(path.join(appRoot, 'package.json'))
const react = (await import(req.resolve('@vitejs/plugin-react'))).default

export default {
  root: appRoot,
  plugins: [react()],
  resolve: {
    alias: [{ find: /^(\.\.?\/)+supabaseClient(\.ts)?$/, replacement: path.join(here, 'supabase-mock.ts') }],
  },
  // use the mock's suggest-songs (fake catalog) instead of the app's placeholder mode
  define: { 'import.meta.env.VITE_SONG_FINDER_MOCK': JSON.stringify('false') },
  server: { fs: { allow: [appRoot, here] } },
}
