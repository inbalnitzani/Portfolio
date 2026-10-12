// Demo stand-in for Nitzani-Music's supabaseClient — used only to record the portfolio video.
// In-memory query builder + a fictional catalog. No network, no real client data.

type Row = Record<string, any>

const ARTISTS = ['Noa Lev', 'The Orchard Lights', 'Dana Shir', 'Tal & Mika', 'Ofer Gal', 'Blue Harbor']
const AUTHORS = ['Y. Nitzani', 'R. Amir', 'S. Golan', 'M. Peretz']
const KEYWORDS = ['love', 'summer', 'road trip', 'sea', 'nostalgia', 'hope', 'night', 'city', 'family', 'dance', 'freedom', 'home']
const GENRES = ['Pop', 'Folk', 'Rock', 'Ballad', 'Electronic']
const TITLES = [
  'Golden Hour Drive', 'Salt & Sunlight', 'Weekend Neon', 'Paper Boats', 'Open Road Song', 'Midnight Orchard',
  'Lighthouse', 'Small Town Summer', 'Northern Wind', 'Coffee at Dawn', 'Run to the Sea', 'Glass Balloons',
  'Home Again', 'City of Lanterns', 'Wild Lemon Trees', 'Slow Dance Kitchen', 'Postcards', 'First Snow in Haifa',
  'Bicycle Bells', 'The Long Way', 'Silver Window', 'Harbor Lights', 'Sunday Market', 'Carry Me Home',
]
const named = (names: string[]) => names.map((name, i) => ({ id: `${i + 1}`, name }))
const tables: Record<string, Row[]> = {
  artists: named(ARTISTS),
  authors: named(AUTHORS),
  keywords: named(KEYWORDS),
  genres: named(GENRES),
}
const pick = <T,>(arr: T[], i: number, n: number) => Array.from({ length: n }, (_, k) => arr[(i * 3 + k * 5) % arr.length])
const uniq = <T,>(a: T[]) => [...new Set(a)]

tables.songs = TITLES.map((title, i) => {
  const artists = uniq(pick(tables.artists, i, 1))
  const authors = uniq(pick(tables.authors, i, 2))
  const keywords = uniq(pick(tables.keywords, i, 3))
  const genres = uniq(pick(tables.genres, i, 1))
  return {
    id: `song-${i + 1}`,
    title,
    lyrics: `${keywords.map((k) => k.name).join(', ')} — demo lyrics for the portfolio video`,
    year: 1998 + ((i * 7) % 26),
    link: 'https://www.youtube.com/',
    is_free: i % 5 === 0,
    score: 100 - i * 3,
    song_artists: artists.map((a) => ({ artist_id: a.id, artists: a })),
    song_authors: authors.map((a) => ({ author_id: a.id, authors: a })),
    song_keywords: keywords.map((k) => ({ keyword_id: k.id, keywords: k })),
    song_genres: genres.map((g) => ({ genre_id: g.id, genres: g })),
  }
})

const LICENSES = ['עלילתי', 'דוקומנטרי']
const MEDIA = ['חבילת בסיס', 'פסטיבלים', 'קולנוע', 'טלויזיה', 'אינטרנט', 'כל המדיות']
const TERRITORIES = ['ישראל', 'עולם', 'ישראל + עולם']
tables.price_table = LICENSES.flatMap((license_type, li) =>
  MEDIA.flatMap((media_type, mi) =>
    TERRITORIES.map((territory, ti) => {
      const base = 900 + li * 300 + mi * 450 + ti * 700
      return { license_type, media_type, territory, level_1: base, level_2: base * 1.6, level_3: base * 2.1, level_4: base * 2.5, vat_amount: Math.round(base * 0.4) }
    }),
  ),
)

const USER = {
  id: 'demo-user',
  email: 'demo@example.com',
  user_metadata: { full_name: 'Demo Producer', email: 'demo@example.com', company: 'Demo Films', phone: '' },
}
tables.profiles = [{ id: USER.id, updated_at: null, username: 'demo', full_name: 'Demo Producer', role: 'admin' }]
tables.calc_logs = Array.from({ length: 8 }, (_, i) => ({
  id: `log-${i}`,
  name: ['Demo Producer', 'Short Film Co.', 'Indie Docs'][i % 3],
  company: ['Demo Films', 'Short Film Co.', 'Indie Docs'][i % 3],
  composition_name: TITLES[i * 2],
  production_type: LICENSES[i % 2],
  media: MEDIA[i % MEDIA.length],
  territory: TERRITORIES[i % 3],
  usage_duration_seconds: 1 + (i % 4),
  total: 2400 + i * 610,
  calculated_at: new Date(Date.now() - i * 86400000).toISOString(),
}))

function get(row: Row, path: string) {
  return path.split('.').reduce((v, k) => (v == null ? v : v[k]), row as any)
}
const like = (v: unknown, pattern: string) => {
  const re = new RegExp('^' + pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*') + '$', 'i')
  return re.test(String(v ?? ''))
}

class Query implements PromiseLike<any> {
  private rows: Row[]
  private count = false
  private one = false
  private mutate = false
  constructor(table: string) {
    this.rows = [...(tables[table] ?? [])]
  }
  select(_cols?: string, opts?: { count?: string }) {
    if (opts?.count) this.count = true
    return this
  }
  eq(col: string, val: unknown) {
    this.rows = this.rows.filter((r) => get(r, col) === val)
    return this
  }
  in(col: string, vals: unknown[]) {
    this.rows = this.rows.filter((r) => vals.includes(get(r, col)))
    return this
  }
  ilike(col: string, pattern: string) {
    this.rows = this.rows.filter((r) => like(get(r, col), pattern))
    return this
  }
  or(expr: string) {
    const parts = expr.split(',').map((p) => p.split('.'))
    this.rows = this.rows.filter((r) => parts.some(([col, op, ...rest]) => op === 'ilike' && like(get(r, col), rest.join('.'))))
    return this
  }
  order(col: string, opts?: { ascending?: boolean }) {
    const dir = opts?.ascending === false ? -1 : 1
    this.rows.sort((a, b) => (get(a, col) > get(b, col) ? dir : get(a, col) < get(b, col) ? -dir : 0))
    return this
  }
  range(from: number, to: number) {
    this.total = this.rows.length
    this.rows = this.rows.slice(from, to + 1)
    return this
  }
  private total?: number
  limit(n: number) {
    this.rows = this.rows.slice(0, n)
    return this
  }
  filter() {
    return this
  }
  single() {
    this.one = true
    return this
  }
  maybeSingle() {
    return this.single()
  }
  insert() {
    this.mutate = true
    return this
  }
  update() {
    this.mutate = true
    return this
  }
  delete() {
    this.mutate = true
    return this
  }
  then<A, B>(ok?: (v: any) => A, fail?: (e: unknown) => B) {
    const res = this.mutate
      ? { data: null, error: null }
      : { data: this.one ? (this.rows[0] ?? null) : this.rows, error: null, count: this.count ? (this.total ?? this.rows.length) : null }
    return new Promise((r) => setTimeout(() => r(res), 120)).then(ok, fail)
  }
}

const session = { user: USER, access_token: 'demo' }
export const supabase = {
  from: (table: string) => new Query(table),
  auth: {
    getSession: async () => ({ data: { session }, error: null }),
    getUser: async () => ({ data: { user: USER }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    signOut: async () => ({ error: null }),
    signInWithPassword: async () => ({ data: { session }, error: null }),
    signUp: async () => ({ data: { session }, error: null }),
  },
  functions: {
    invoke: async () => {
      await new Promise((r) => setTimeout(r, 1400))
      const songs = tables.songs.slice(0, 5).map((s) => ({ title: s.title, artist: s.song_artists[0].artists.name, link: s.link }))
      return { data: { reply: 'Here are 5 hopeful, sunny songs about the open road that fit a travel brand:', songs }, error: null }
    },
  },
}
export default supabase
