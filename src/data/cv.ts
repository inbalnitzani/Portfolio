// All site content lives here. Edit this file to update the CV — components only render it.

export const PROFILE = {
  name: 'Inbal Nitzani',
  handle: 'INBAL.EXE',
  classes: ['Full-Stack Engineer', 'Game Developer'],
  location: 'Tel Aviv, Israel',
  email: 'inbalnitzani@gmail.com',
  phone: '+972-54-4886331',
  cv: '/Inbal_Nitzani_CV.pdf',
  links: {
    linkedin: 'https://www.linkedin.com/in/inbal-nitzani-07851421b/',
    github: 'https://github.com/inbalnitzani',
    itch: 'https://inbalnitzani.itch.io/',
  },
  bio: 'I build distributed backends on AWS and Kubernetes, the React interfaces on top of them, and AI-powered developer tooling with the Claude Agent SDK. By night I make games and I’m finishing an M.Des in Game Design. Curious by nature: when I spot a gap, I build a tool for it.',
  traits: [
    'Sole-owner energy: backend to UI, end to end',
    'Ex-IDF Maglan, Head of Media Dept.',
    'Volunteer skipper assistant, Etgarim Sailing',
    'Lone Soldiers Center volunteer since 2017',
  ],
}

/** The "Meet the player" receipt — one line per item, right column is the price tag */
export const RECEIPT: [string, string][] = [
  ['B.Sc Computer Science', '2023'],
  ['M.Des Game Design, Shenkar', 'WIP'],
  ['IDF Maglan, Head of Media', '15–17'],
  ['Platform engineer', 'Whalo'],
  ['Sole frontend engineer', 'NanoLock'],
  ['Volunteer skipper asst.', 'Etgarim'],
  ['Curiosity', '∞'],
]

export const SAVE_POINTS = [
  {
    school: 'Shenkar College',
    degree: 'M.Des, Digital Game Design & Development',
    when: 'Oct 2025 – now',
    status: 'in-progress' as const,
  },
  {
    school: 'The Academic College of Tel Aviv-Yaffo',
    degree: 'B.Sc. Computer Science',
    when: '2020 – 2023',
    status: 'complete' as const,
  },
]

export type SkillGroup = { name: string; tint: 'hot' | 'lilac' | 'lime' | 'sky' | 'bubble'; items: string[] }

export const SKILL_TREE: SkillGroup[] = [
  { name: 'Languages', tint: 'hot', items: ['TypeScript', 'JavaScript', 'Java', 'C#', 'C++', 'C', 'SQL'] },
  {
    name: 'Cloud & Infra',
    tint: 'sky',
    items: ['AWS Athena', 'Neptune', 'DynamoDB', 'S3', 'SQS', 'Lambda', 'AppSync Events', 'Kubernetes', 'Docker', 'GitHub Actions'],
  },
  {
    name: 'Backend & Data',
    tint: 'lilac',
    items: ['Node.js', 'Express', 'REST', 'Redis', 'Gremlin', 'Hive Partitioning', 'Event-driven Workers', 'Supabase / Postgres'],
  },
  { name: 'Frontend', tint: 'bubble', items: ['React', 'Angular', 'Vite', 'Tailwind CSS', 'HTML5 / CSS3'] },
  { name: 'Game Dev', tint: 'lime', items: ['Unity', 'C#', 'WebGL builds', 'Game Design', 'Prototyping', 'Game Jams'] },
  {
    name: 'Tools & AI',
    tint: 'hot',
    items: ['Claude Agent SDK', 'Claude Skills', 'Cursor', 'Git', 'Apps Script', 'Airtable API', 'Slack API', 'Jira'],
  },
]

export type Quest = {
  company: string
  role: string
  when: string
  status: 'active' | 'complete'
  tagline: string
  stack: string[]
  loot: { title: string; body: string }[]
}

export const QUESTS: Quest[] = [
  {
    company: 'Whalo',
    role: 'Software Engineer',
    when: '2026 – now',
    status: 'active',
    tagline: 'Audience targeting & high-volume push messaging for mobile games',
    stack: ['TypeScript', 'Node.js', 'React', 'AWS', 'Kubernetes'],
    loot: [
      {
        title: 'End-to-end owner',
        body: 'Sole engineer on a self-serve audience targeting platform (Node.js, React, AWS Neptune) that replaced manual Airtable workflows. Nested AND/OR/NOT logic across hundreds of live segments, with version history and safe propagating updates.',
      },
      {
        title: 'Push at scale: up to 4M/day',
        body: 'Rebuilt targeting + delivery: a rule-tree compiler running boolean logic as correlated EXISTS subqueries in Athena, shipped with no cutover. Hardened with DynamoDB dedup and Redis jitter.',
      },
      {
        title: 'Platform foundations',
        body: 'Built shared libraries from scratch (DynamoDB data access layer, Neptune graph client) and co-defined the boilerplates and patterns every later backend service used.',
      },
      {
        title: '11 steps → 1 click',
        body: 'Google Sheets add-on + event-driven worker that batch-generates in-app purchase product IDs via the Google SDK and Apple API, replacing a manual App Store Connect flow.',
      },
      {
        title: 'Hackathon & AI tooling',
        body: 'AppSync Events WebSocket proof-of-capability that unblocked the Unity client team; an AWS cost calculator; and a webhook router that dispatches events to Claude Skills for triage and review.',
      },
    ],
  },
  {
    company: 'Freelance',
    role: 'Software Engineer',
    when: '2025 – 2026',
    status: 'complete',
    tagline: 'Web platform for a music-licensing client',
    stack: ['React', 'Tailwind', 'Supabase', 'PostgreSQL', 'Claude Skills'],
    loot: [
      {
        title: 'Catalog + licensing calculator',
        body: 'Solo full-stack build: search ~1,000 songs by title, writer or keyword, and get an instant price by production type, media, territory and term. Every quote is logged for follow-up.',
      },
      {
        title: 'Admin console & AI song search',
        body: 'Secure admin to manage songs and export lists to PDF / Excel / Word, plus a Claude Skill that turns a creative brief into a verified shortlist.',
      },
    ],
  },
  {
    company: 'NanoLock Security',
    role: 'Software Engineer',
    when: '2023 – 2025',
    status: 'complete',
    tagline: 'OT/IoT device security for critical infrastructure',
    stack: ['Angular', 'TypeScript', 'Microservices'],
    loot: [
      {
        title: 'Sole frontend engineer',
        body: 'Owned the client architecture of the Management of Things console across dozens of device types and PLC vendors, integrating a microservices backend.',
      },
      {
        title: 'Groups & audit tooling',
        body: 'Designed the Groups page, the highest-impact access-control feature, and real-time visualization for filtering and exporting large security audit logs.',
      },
    ],
  },
]

export type Game = {
  slug: string
  title: string
  pitch: string
  tags: string[]
  cover: string
  url: string
  /** itch.io upload id for the in-page WebGL embed */
  embedId?: string
  credit?: string
  featured?: boolean
}

export const GAMES: Game[] = [
  {
    slug: 'yoru',
    title: 'Yoru',
    pitch: 'A 2D puzzle-platformer about loss, perception and crossing worlds. Switch magical Babalawo masks to jump between the realms of Rere and Apaadi and find Sonubare.',
    tags: ['Puzzle-platformer', '2D', 'Global Game Jam'],
    cover: '/games/yoru.png',
    url: 'https://niv-kadria.itch.io/yoru',
    embedId: '16313544',
    credit: 'Team game',
    featured: true,
  },
  {
    slug: 'friday-night-rides',
    title: 'Friday Night Rides',
    pitch: 'Can you help Dale get to his date on time? A skateboarding prototype on the boardwalk.',
    tags: ['Prototype', 'Arcade', 'Skate'],
    cover: '/games/friday-night-rides.png',
    url: 'https://amirdill.itch.io/friday-night-rides',
    embedId: '18062040',
    credit: 'Team game',
    featured: true,
  },
  {
    slug: '60-knots',
    title: '60 Knots',
    pitch: 'A low-poly 3D boat game. Steer your tugboat through rocky canyons, right in your browser.',
    tags: ['3D', 'Low-poly', 'WebGL'],
    cover: '/games/60-knots.png',
    url: 'https://inbalnitzani.itch.io/60-knots',
    embedId: '16572552',
    featured: true,
  },
  {
    slug: 'space-invaders',
    title: 'Space Invaders',
    pitch: 'The classic, rebuilt in 3D.',
    tags: ['3D', 'Shooter'],
    cover: '/games/space-invaders.png',
    url: 'https://inbalnitzani.itch.io/space-invaders',
  },
  {
    slug: 'basketball',
    title: 'Basketball',
    pitch: 'Two players shooting balls on one court. The goal moves every 12 seconds.',
    tags: ['Sports', 'Local 2P'],
    cover: '/games/basketball.png',
    url: 'https://inbalnitzani.itch.io/basketball',
  },
  {
    slug: 'jumping-balls',
    title: 'Jumping Balls',
    pitch: 'Bouncy physics, quick runs.',
    tags: ['Physics', 'Casual'],
    cover: '/games/jumping-balls.png',
    url: 'https://inbalnitzani.itch.io/jumping-balls',
  },
]

export type SideQuest = {
  slug: 'trakaboo' | 'music' | 'router'
  title: string
  kicker: string
  body: string
  stack: string[]
  link?: { label: string; href: string }
}

export const SIDE_QUESTS: SideQuest[] = [
  {
    slug: 'music',
    title: 'Yair Nitzani Music',
    kicker: 'Client platform · solo build',
    body: 'A searchable song catalog with an instant licensing-price calculator, an admin console, and an AI Claude Skill that turns a creative brief into a shortlist of songs.',
    stack: ['React', 'Supabase', 'PostgreSQL', 'Tailwind', 'Claude'],
    link: { label: 'Source', href: 'https://github.com/inbalnitzani/Nitzani-Music' },
  },
  {
    slug: 'trakaboo',
    title: 'Trakaboo',
    kicker: 'Personal PWA · in progress',
    body: 'Peek at where your money went. An expense tracker that logs Apple Pay taps automatically, imports card statements, merges duplicates and shows the month as pink sticker charts.',
    stack: ['Next.js 16', 'React 19', 'Supabase', 'next-intl', 'Playwright'],
  },
  {
    slug: 'router',
    title: 'Claude Skills Router',
    kicker: 'Internal AI tooling',
    body: 'An event-driven webhook router that dispatches incoming events to Claude Skills, used for automated triage and review workflows.',
    stack: ['Node.js', 'Claude Agent SDK', 'Webhooks', 'Slack API'],
  },
]

export const LEVELS = [
  { id: 'start', short: 'START', title: 'Press', accent: 'start' },
  { id: 'profile', short: 'LVL 1', title: 'Meet the', accent: 'player' },
  { id: 'skills', short: 'LVL 2', title: 'Skill', accent: 'tree' },
  { id: 'quests', short: 'LVL 3', title: 'Quests', accent: 'tucked inside' },
  { id: 'games', short: 'LVL 4', title: 'Games', accent: 'I made' },
  { id: 'side', short: 'LVL 5', title: 'Side', accent: 'quests' },
  { id: 'boss', short: 'BOSS', title: 'Final', accent: 'boss' },
] as const

export type LevelId = (typeof LEVELS)[number]['id']
