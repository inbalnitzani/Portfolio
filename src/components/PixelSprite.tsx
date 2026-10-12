import { useEffect, useState } from 'react'

// Placeholder pixel-me. Each string is a row; each char is a palette key ('.' = empty).
// Swap rows/colors to redraw her — every frame must be 14 wide.
const PALETTE: Record<string, string> = {
  k: '#2a0a1f', // ink outline
  h: '#3b1d14', // hair
  s: '#ffd7c2', // skin
  e: '#2a0a1f', // eyes
  m: '#ff8fc7', // blush
  r: '#e0457b', // mouth
  p: '#ff3ea5', // top
  w: '#ffffff', // heart on top
  b: '#c9b6ff', // skirt
  o: '#c6ff3d', // platform shoes
  g: '#fff36b', // sparkle clip
}

const BODY = [
  '....kkkkkk....',
  '...khhhhhhk...',
  '..khhhhhhhhkg.',
  '.khhhhhhhhhhk.',
  '.khhssssssshk.',
  '.khseesseeshk.',
  '.khmssssssmhk.',
  '.khhssrrsshhk.',
  '.khhhksssskhk.',
  '..kkppppppkk..',
  '.kppppwwppppk.',
  'kspppwwwwpppsk',
  'ksppppwwppppsk',
  '.kkppppppppkk.',
  '..kbbbbbbbbk..',
  '.kbbbbbbbbbbk.',
]

const LEGS = {
  idle: ['...kssk.kssk..', '...kook.kook..', '...kkkk.kkkk..'],
  run1: ['..kssk...kssk.', '.kook.....kook', '.kkkk.....kkkk'],
  run2: ['....kssssk....', '....koooook...', '....kkkkkkk...'],
}

// Blink frame swaps the eyes row
const BLINK_ROW = '.khsssssssshk.'

type Props = {
  size?: number
  running?: boolean
  className?: string
  title?: string
}

export function PixelSprite({ size = 6, running = false, className, title = 'Pixel Inbal' }: Props) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), running ? 140 : 450)
    return () => window.clearInterval(id)
  }, [running])

  const legs = running ? (tick % 2 ? LEGS.run1 : LEGS.run2) : LEGS.idle
  const blink = !running && tick % 9 === 0
  const rows = [...BODY.slice(0, 5), blink ? BLINK_ROW : BODY[5], ...BODY.slice(6), ...legs]
  const bob = !running && tick % 2 ? 1 : 0

  return (
    <svg
      role="img"
      aria-label={title}
      className={className}
      width={14 * size}
      height={(rows.length + 1) * size}
      viewBox={`0 0 14 ${rows.length + 1}`}
      shapeRendering="crispEdges"
    >
      <g transform={`translate(0 ${1 - bob})`}>
        {rows.map((row, y) =>
          [...row].map((c, x) =>
            c === '.' ? null : <rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={PALETTE[c]} />,
          ),
        )}
      </g>
    </svg>
  )
}
