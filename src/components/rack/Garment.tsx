import { useId } from 'react'

export type GarmentKind = 'tee' | 'knit' | 'hoodie' | 'shirt' | 'bomber' | 'blazer' | 'coat' | 'trouser'

/** Mixes a hex colour toward black (amt < 0) or white (amt > 0). */
export function shade(hex: string, amt: number) {
  const n = parseInt(hex.replace('#', ''), 16)
  const t = amt < 0 ? 0 : 255
  const p = Math.abs(amt)
  const ch = (s: number) => Math.round(((n >> s) & 255) * (1 - p) + t * p)
  return `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`
}

/** Where the body starts and ends in the garment's viewBox — used to size the side-on edge. */
export const HEM: Record<GarmentKind, number> = {
  tee: 240,
  knit: 248,
  hoodie: 248,
  shirt: 252,
  bomber: 232,
  blazer: 246,
  coat: 284,
  trouser: 272,
}
export const VIEW = { top: -60, height: 350 }

const LONG =
  'M72 14 Q100 28 128 14 L156 22 Q174 30 176 56 L182 228 L160 230 L154 80 L154 244 Q100 250 46 244 L46 80 L40 230 L18 228 L24 56 Q26 30 44 22 Z'

const BODY: Record<GarmentKind, string> = {
  tee: 'M72 14 Q100 30 128 14 L160 24 L192 70 L166 86 L152 66 L152 236 Q100 242 48 236 L48 66 L34 86 L8 70 L40 24 Z',
  knit: LONG,
  hoodie: LONG,
  shirt:
    'M72 14 Q100 28 128 14 L156 22 Q174 30 176 56 L182 228 L160 230 L154 80 L154 236 Q154 252 136 250 Q100 244 64 250 Q46 252 46 236 L46 80 L40 230 L18 228 L24 56 Q26 30 44 22 Z',
  bomber:
    'M72 14 Q100 28 128 14 L158 22 Q178 30 180 56 L184 222 L160 224 L156 80 L154 214 L46 214 L44 80 L40 224 L16 222 L20 56 Q22 30 42 22 Z',
  blazer:
    'M74 14 L100 20 L126 14 L156 22 Q174 30 176 56 L182 230 L160 232 L154 80 L156 244 L44 244 L46 80 L40 232 L18 230 L24 56 Q26 30 44 22 Z',
  coat: 'M74 14 L100 20 L126 14 L158 22 Q176 30 178 56 L184 240 L162 242 L156 84 L162 282 L38 282 L44 84 L38 242 L16 240 L22 56 Q24 30 42 22 Z',
  trouser: 'M54 24 L146 24 L150 40 L164 270 L114 272 L100 98 L86 272 L36 270 L50 40 Z',
}

type Props = { kind: GarmentKind; color: string; accent: string; className?: string }

/**
 * A flat garment on its hanger, drawn front-on. The rack turns it in 3D, so this
 * only ever has to describe the front: body, seams, trims, a little light and shadow.
 */
export function Garment({ kind, color, accent, className }: Props) {
  const id = useId().replace(/:/g, '')
  const dark = shade(color, -0.22)
  const deep = shade(color, -0.4)
  const light = shade(color, 0.16)
  const line = { stroke: dark, strokeWidth: 1.4, fill: 'none', strokeLinecap: 'round' as const }
  const stitch = { ...line, strokeWidth: 0.9, strokeDasharray: '3 3', opacity: 0.8 }
  const body = BODY[kind]

  return (
    <svg viewBox={`0 ${VIEW.top} 200 ${VIEW.height}`} className={className} aria-hidden>
      <defs>
        <linearGradient id={`${id}l`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.2" />
          <stop offset="0.38" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.7" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.22" />
        </linearGradient>
        <linearGradient id={`${id}v`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.12" />
          <stop offset="0.25" stopColor="#000" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Hanger: hook over the rail, then wooden arms (or a clip bar for trousers). */}
      <path d="M100 -12 L100 -40 Q100 -56 88 -56 Q76 -56 76 -46" stroke="#8a8279" strokeWidth="3" fill="none" strokeLinecap="round" />
      {kind === 'trouser' ? (
        <path d="M100 -12 L100 18 M40 18 L160 18" stroke="#8a8279" strokeWidth="3" strokeLinecap="round" />
      ) : (
        <path d="M100 -14 Q92 -8 26 24 Q22 28 28 29 L172 29 Q178 28 174 24 Q108 -8 100 -14 Z" fill="#b48a5e" stroke="#8d6a45" strokeWidth="1" />
      )}

      {kind === 'hoodie' && <path d="M64 24 Q58 -12 100 -14 Q142 -12 136 24 Z" fill={dark} />}

      <path d={body} fill={color} />
      <path d={body} fill={`url(#${id}v)`} />
      {/* Soft fabric folds */}
      <g opacity="0.14" stroke={deep} strokeWidth="5" fill="none" strokeLinecap="round">
        <path d={kind === 'trouser' ? 'M70 60 Q66 160 62 262' : 'M78 70 Q72 150 80 236'} />
        <path d={kind === 'trouser' ? 'M132 60 Q138 160 140 262' : 'M126 90 Q132 170 124 236'} />
      </g>

      {kind === 'tee' && (
        <>
          <path d="M72 14 Q100 30 128 14" stroke={dark} strokeWidth="5" fill="none" />
          <path d="M50 228 Q100 234 150 228" {...stitch} />
          <path d="M14 76 L36 88 M186 76 L164 88" {...stitch} />
          <path d="M48 66 L48 236 M152 66 L152 236" {...line} opacity="0.35" />
        </>
      )}

      {(kind === 'knit' || kind === 'hoodie') && (
        <>
          <path d="M46 232 Q100 238 154 232 L154 244 Q100 250 46 244 Z" fill={dark} opacity="0.55" />
          <path d="M19 214 L41 216 M159 216 L181 214" stroke={dark} strokeWidth="10" opacity="0.45" />
          <path d="M154 80 L160 230 M46 80 L40 230" {...line} opacity="0.5" />
        </>
      )}
      {kind === 'knit' && (
        <>
          <path d="M72 14 Q100 30 128 14" stroke={dark} strokeWidth="7" fill="none" />
          <g stroke={dark} strokeWidth="0.8" opacity="0.28">
            {Array.from({ length: 13 }, (_, i) => (
              <path key={i} d={`M${54 + i * 7.6} 40 L${54 + i * 7.6} 230`} />
            ))}
          </g>
        </>
      )}
      {kind === 'hoodie' && (
        <>
          <path d="M72 14 Q100 52 128 14 Q118 24 100 26 Q82 24 72 14 Z" fill={deep} />
          <path d="M92 32 L89 82 M108 32 L111 82" stroke={light} strokeWidth="2" strokeLinecap="round" />
          <path d="M66 160 L134 160 L146 214 L54 214 Z" {...line} />
          <path d="M66 160 L54 214 M134 160 L146 214" {...stitch} />
          <rect x="96" y="208" width="8" height="3" fill={accent} />
        </>
      )}

      {kind === 'shirt' && (
        <>
          <path d="M100 40 L100 247" {...line} />
          <path d="M104 40 L104 247" {...stitch} />
          {[62, 94, 126, 158, 190, 222].map((y) => (
            <circle key={y} cx="102" cy={y} r="2" fill={light} stroke={dark} strokeWidth="0.6" />
          ))}
          <path d="M116 78 L140 78 L140 104 Q128 108 116 104 Z" {...line} />
          <path d="M72 14 L100 40 L84 48 L66 22 Z M128 14 L100 40 L116 48 L134 22 Z" fill={light} stroke={dark} strokeWidth="1" />
          <path d="M19 214 L41 216 M159 216 L181 214" {...line} />
          <path d="M154 80 L160 230 M46 80 L40 230" {...line} opacity="0.5" />
        </>
      )}

      {kind === 'bomber' && (
        <>
          <path d="M48 212 L152 212 L150 234 L50 234 Z" fill={dark} />
          <g stroke={deep} strokeWidth="0.8" opacity="0.5">
            {Array.from({ length: 16 }, (_, i) => (
              <path key={i} d={`M${54 + i * 6} 214 L${54 + i * 6} 232`} />
            ))}
          </g>
          <path d="M70 14 Q100 34 130 14" stroke={dark} strokeWidth="8" fill="none" />
          <path d="M18 210 L40 212 M160 212 L182 210" stroke={dark} strokeWidth="12" />
          <path d="M100 24 L100 234" stroke={accent} strokeWidth="3" />
          <path d="M100 24 L100 234" stroke="#c9c2b8" strokeWidth="1.2" strokeDasharray="1.5 1.5" />
          <path d="M26 70 L40 70 L40 88 L26 88 Z" {...stitch} />
          <path d="M60 150 L74 196 M140 150 L126 196" {...line} />
        </>
      )}

      {(kind === 'blazer' || kind === 'coat') && (
        <>
          <path d="M80 15 L100 21 L120 15 L104 112 L96 112 Z" fill="#ece5da" />
          <path d="M100 21 L100 112" stroke="#c8beb0" strokeWidth="1" />
          <path d="M74 14 L100 21 L98 118 L64 44 L76 32 Z" fill={dark} />
          <path d="M126 14 L100 21 L102 118 L136 44 L124 32 Z" fill={dark} />
          <path d="M98 118 L100 246" {...line} />
          <path d="M154 80 L160 230 M46 80 L40 230" {...line} opacity="0.5" />
        </>
      )}
      {kind === 'blazer' && (
        <>
          {[140, 172].map((y) => (
            <circle key={y} cx="106" cy={y} r="2.6" fill={deep} />
          ))}
          <path d="M56 186 L88 186 M112 186 L144 186" {...line} strokeWidth="2" />
          <path d="M118 90 L142 88" {...line} strokeWidth="2" />
          <path d="M22 224 L36 225" stroke={accent} strokeWidth="1.6" />
        </>
      )}
      {kind === 'coat' && (
        <>
          {[134, 164, 194].map((y) => (
            <g key={y} fill={deep}>
              <circle cx="84" cy={y} r="3" />
              <circle cx="116" cy={y} r="3" />
            </g>
          ))}
          <path d="M44 146 L156 146 L157 158 L43 158 Z" fill={dark} />
          <path d="M44 152 L156 152" stroke={accent} strokeWidth="0.9" strokeDasharray="3 3" />
          <path d="M60 210 L64 244 M140 210 L136 244" {...line} />
          <path d="M100 196 L100 282" {...line} />
        </>
      )}

      {kind === 'trouser' && (
        <>
          <path d="M51 40 L149 40" {...line} strokeWidth="2" />
          <path d="M100 40 L100 98" {...line} />
          <path d="M96 42 Q92 74 100 90" {...stitch} />
          <path d="M60 46 Q66 64 56 76 M140 46 Q134 64 144 76" {...line} />
          {[60, 84, 116, 140].map((x) => (
            <rect key={x} x={x - 2} y="22" width="4" height="18" rx="1" fill={dark} />
          ))}
          <rect x="136" y="44" width="8" height="3" fill={accent} />
          <path d="M44 260 L84 262 M116 262 L158 260" {...stitch} />
          <rect x="48" y="12" width="12" height="16" rx="2" fill="#8a8279" />
          <rect x="140" y="12" width="12" height="16" rx="2" fill="#8a8279" />
        </>
      )}

      <path d={body} fill={`url(#${id}l)`} />

    </svg>
  )
}

/**
 * The garment's edge — what you actually see of a piece hanging side-on. Sits at the
 * turning axis, perpendicular to the front, inside a preserve-3d parent.
 */
export function GarmentEdge({ kind, color }: { kind: GarmentKind; color: string }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute left-1/2 w-[7%] rounded-b-md"
      style={{
        top: `${((14 - VIEW.top) / VIEW.height) * 100}%`,
        height: `${((HEM[kind] - 14) / VIEW.height) * 100}%`,
        background: `linear-gradient(90deg, ${shade(color, -0.3)}, ${shade(color, -0.05)} 45%, ${shade(color, -0.22)})`,
        transform: 'translateX(-50%) rotateY(90deg)',
      }}
    />
  )
}
