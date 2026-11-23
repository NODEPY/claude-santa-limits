import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, SessionRateLimit } from 'claude-code'

import type { Limit } from '../types'

const PANE = 'santa-limits'
const TITLE = 'Limits 🎅'

const limits = atom({ plugin: 'santa-limits', key: 'limits' } as const, [] as Limit[])
const nowAtom = atom({ plugin: 'santa-limits', key: 'now' } as const, 0)

const toLimits = (list: SessionRateLimit[]): Limit[] =>
  list.map(({ kind, percentUsed, resetsAt }) => ({ kind, percentUsed, resetsAt }))

const find = (list: Limit[], kind: string) => list.find(l => l.kind === kind)

function untilText(resetsAt: string | undefined, now: number): string {
  if (!resetsAt || !now) return 'resets —'
  const ms = Date.parse(resetsAt) - now
  if (!Number.isFinite(ms)) return 'resets —'
  if (ms <= 0) return 'resetting now'
  const mins = Math.round(ms / 60000)
  const d = Math.floor(mins / 1440)
  const h = Math.floor((mins % 1440) / 60)
  const m = mins % 60
  if (d > 0) return `resets in ${d}d ${h}h`
  if (h > 0) return `resets in ${h}h ${m}m`
  return `resets in ${m}m`
}

const pctText = (l?: Limit) => (l ? `${Math.round(l.percentUsed)}%` : '—')

const barColor = (p: number) => (p >= 80 ? '#d93838' : p >= 50 ? '#ff7a2f' : '#2e9e5b')

function row(y: number, label: string, l: Limit | undefined, now: number): string {
  const p = Math.max(0, Math.min(100, l?.percentUsed ?? 0))
  const w = Math.round((212 * p) / 100)
  return `
    <text x="54" y="${y}" font-size="15" font-weight="700" fill="#4a2a12">${label}</text>
    <text x="266" y="${y}" font-size="15" font-weight="800" fill="${barColor(p)}" text-anchor="end">${pctText(l)}</text>
    <rect x="54" y="${y + 8}" width="212" height="14" rx="7" fill="#e9dcc4" stroke="#b89466" stroke-width="1"/>
    ${w > 0 ? `<rect x="54" y="${y + 8}" width="${w}" height="14" rx="7" fill="${barColor(p)}"/>
    <rect x="54" y="${y + 8}" width="${w}" height="14" rx="7" fill="url(#cane)"/>` : ''}
    <text x="54" y="${y + 38}" font-size="11" fill="#7a5a3a">${untilText(l?.resetsAt, now)}</text>`
}

function snow(): string {
  const flakes: [number, number, number][] = [
    [20, 2, 7], [60, 1.5, 9], [95, 2.5, 6], [140, 1.5, 11], [180, 2, 8],
    [225, 1.5, 10], [262, 2.5, 7], [300, 2, 9], [40, 1, 12], [245, 1, 13],
  ]
  return flakes
    .map(
      ([x, r, dur], i) =>
        `<circle cx="${x}" cy="-10" r="${r}" fill="#fff" opacity="0.85">
          <animate attributeName="cy" from="-10" to="400" dur="${dur}s" begin="${-i * 1.3}s" repeatCount="indefinite"/>
          <animate attributeName="cx" values="${x};${x + 8};${x}" dur="${dur / 2}s" repeatCount="indefinite"/>
        </circle>`,
    )
    .join('')
}

function drawing(list: Limit[], now: number): string {
  const five = find(list, 'five_hour')
  const week = find(list, 'seven_day')
  const noData = !five && !week
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 400" width="320" height="400" font-family="-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1b2a4e"/><stop offset="1" stop-color="#34508a"/>
    </linearGradient>
    <pattern id="cane" width="10" height="14" patternUnits="userSpaceOnUse" patternTransform="skewX(-30)">
      <rect width="4" height="14" fill="#ffffff" opacity="0.35"/>
    </pattern>
  </defs>
  <rect width="320" height="400" rx="18" fill="url(#sky)"/>
  ${snow()}
  <ellipse cx="160" cy="392" rx="170" ry="22" fill="#eef4ff"/>

  <!-- Claude body -->
  <g>
    <animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="2.4s" repeatCount="indefinite"/>
    <rect x="108" y="96" width="104" height="92" rx="10" fill="#d97757"/>
    <rect x="96" y="128" width="14" height="22" rx="4" fill="#d97757"/>
    <rect x="210" y="128" width="14" height="22" rx="4" fill="#d97757"/>
    <!-- eyes -->
    <rect x="134" y="122" width="10" height="16" rx="3" fill="#2b1a10">
      <animate attributeName="height" values="16;16;2;16;16" keyTimes="0;0.9;0.93;0.96;1" dur="4s" repeatCount="indefinite"/>
    </rect>
    <rect x="176" y="122" width="10" height="16" rx="3" fill="#2b1a10">
      <animate attributeName="height" values="16;16;2;16;16" keyTimes="0;0.9;0.93;0.96;1" dur="4s" repeatCount="indefinite"/>
    </rect>
    <ellipse cx="128" cy="150" rx="7" ry="4" fill="#f2a08a" opacity="0.8"/>
    <ellipse cx="192" cy="150" rx="7" ry="4" fill="#f2a08a" opacity="0.8"/>
    <path d="M150 152 Q160 160 170 152" stroke="#2b1a10" stroke-width="3" fill="none" stroke-linecap="round"/>
    <!-- Santa hat -->
    <path d="M110 100 C 120 40, 175 22, 230 58 L 214 72 C 190 56, 160 60, 210 100 Z" fill="#d42a2a"/>
    <circle cx="236" cy="60" r="12" fill="#fff"/>
    <rect x="100" y="88" width="120" height="20" rx="10" fill="#fff"/>
    <!-- arms holding the sign -->
    <rect x="70" y="170" width="16" height="44" rx="6" fill="#d97757"/>
    <rect x="234" y="170" width="16" height="44" rx="6" fill="#d97757"/>
  </g>

  <!-- sign -->
  <rect x="34" y="200" width="252" height="176" rx="12" fill="#8b5a2b"/>
  <rect x="42" y="208" width="236" height="160" rx="8" fill="#fbf3e2"/>
  <rect x="66" y="196" width="24" height="16" rx="5" fill="#d97757"/>
  <rect x="230" y="196" width="24" height="16" rx="5" fill="#d97757"/>
  <text x="160" y="232" font-size="16" font-weight="800" fill="#b3261e" text-anchor="middle">🎄 Claude Limits 🎄</text>
  ${
    noData
      ? `<text x="160" y="290" font-size="13" fill="#7a5a3a" text-anchor="middle">No limit data yet.</text>
         <text x="160" y="310" font-size="12" fill="#7a5a3a" text-anchor="middle">It shows up after the first reply.</text>`
      : row(258, '5-hour', five, now) + row(312, 'Weekly', week, now)
  }
</svg>`
}

async function refresh($: EngineInterface) {
  const usage = await $.session.usage()
  await update($, limits, () => toLimits(usage.rateLimits))
  const t = await $.clock.now()
  await update($, nowAtom, () => t)
}

function miniBar(x: number, label: string, l: Limit | undefined): string {
  const p = Math.max(0, Math.min(100, l?.percentUsed ?? 0))
  const w = Math.round((130 * p) / 100)
  return `
    <text x="${x}" y="19" font-size="12" font-weight="700" fill="#ffffff">${label}</text>
    <text x="${x + 130}" y="19" font-size="12" font-weight="800" fill="${barColor(p)}" text-anchor="end">${pctText(l)}</text>
    <rect x="${x}" y="26" width="130" height="8" rx="4" fill="#ffffff" fill-opacity="0.25"/>
    ${w > 0 ? `<rect x="${x}" y="26" width="${w}" height="8" rx="4" fill="${barColor(p)}"/>` : ''}`
}

function bandSnow(): string {
  const flakes: [number, number, number][] = [
    [15, 1.5, 4], [48, 1, 5], [80, 1.5, 3.5], [115, 1, 4.5], [150, 1.5, 5.5], [185, 1, 3.8],
    [220, 1.5, 4.8], [255, 1, 4.2], [290, 1.5, 5.2], [325, 1, 3.6], [358, 1.5, 4.4], [200, 1, 6],
  ]
  return flakes
    .map(
      ([x, r, dur], i) =>
        `<circle cx="${x}" cy="-4" r="${r}" fill="#fff" opacity="0.8">
          <animate attributeName="cy" from="-4" to="50" dur="${dur}s" begin="${-i * 0.7}s" repeatCount="indefinite"/>
          <animate attributeName="cx" values="${x};${x + 5};${x}" dur="${dur / 2}s" repeatCount="indefinite"/>
        </circle>`,
    )
    .join('')
}

function bandDrawing(list: Limit[]): string {
  const five = find(list, 'five_hour')
  const week = find(list, 'seven_day')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 44" width="380" height="44" font-family="-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif">
  <defs>
    <linearGradient id="bsky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1b2a4e"/><stop offset="1" stop-color="#34508a"/>
    </linearGradient>
    <clipPath id="bclip"><rect width="380" height="44" rx="10"/></clipPath>
  </defs>
  <rect x="0" y="0" width="380" height="44" rx="10" fill="url(#bsky)"/>
  <g clip-path="url(#bclip)">${bandSnow()}</g>
  <rect x="1" y="1" width="378" height="42" rx="10" fill="none" stroke="#ffffff" stroke-opacity="0.35" stroke-width="1.5"/>
  <g transform="translate(8 4)">
    <rect x="4" y="14" width="28" height="24" rx="4" fill="#d97757"/>
    <rect x="11" y="21" width="3" height="6" rx="1" fill="#2b1a10"/>
    <rect x="22" y="21" width="3" height="6" rx="1" fill="#2b1a10"/>
    <path d="M4 15 C 8 0, 24 -2, 38 6 L 34 10 C 28 6, 22 8, 32 15 Z" fill="#d42a2a"/>
    <circle cx="39" cy="7" r="4" fill="#fff"/>
    <rect x="1" y="12" width="34" height="6" rx="3" fill="#fff"/>
  </g>
  ${
    !five && !week
      ? `<text x="60" y="27" font-size="12" fill="#ffffff">🎄 Limits show up after the first reply</text>`
      : miniBar(60, '5-hour', five) + miniBar(220, 'Weekly', week)
  }
</svg>`
}

export const register: Register = on => {
  let tick: { cancel: () => void } | undefined

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'santa',
      description: 'Open the Santa Claude panel with your usage limits',
    })
    await refresh($)
    tick?.cancel()
    tick = $.clock.every(60_000, async () => {
      const t = await $.clock.now()
      await update($, nowAtom, () => t)
    })
    return next(e)
  })

  on('command.run', { command: 'santa' }, async $ => {
    await $.ui.open({ id: PANE, title: TITLE })
    await refresh($)
    return { text: 'Santa panel opened 🎅' }
  })

  on('session.measure', async ($, e, next) => {
    if (e.changed.includes('rateLimits')) {
      await update($, limits, () => toLimits(e.rateLimits))
      const t = await $.clock.now()
      await update($, nowAtom, () => t)
    }
    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const list = await read($, limits)
    const now = await read($, nowAtom)
    const five = find(list, 'five_hour')
    const week = find(list, 'seven_day')

    if (e.surface === 'terminal') {
      const { Box, Text } = $.ui.resolve(e)
      return (
        <Box flexDirection="column">
          <Text bold color="red">🎅 Claude Limits</Text>
          <Text>5-hour: {pctText(five)} · {untilText(five?.resetsAt, now)}</Text>
          <Text>Weekly: {pctText(week)} · {untilText(week?.resetsAt, now)}</Text>
        </Box>
      )
    }

    const { Box, Svg } = $.ui.resolve(e)
    const alt = `Claude in a Santa hat holding a sign. 5-hour: ${pctText(five)}, weekly: ${pctText(week)}`
    return (
      <Box flexDirection="column" alignItems="center">
        <Svg source={drawing(list, now)} alt={alt} width={320} height={400} isInteractive />
      </Box>
    )
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e)
    const list = await read($, limits)
    const now = await read($, nowAtom)
    const five = find(list, 'five_hour')
    const week = find(list, 'seven_day')

    if (e.surface === 'terminal') {
      const { Text } = $.ui.resolve(e)
      return (
        <Text>
          🎅 5-hour: {pctText(five)} · weekly: {pctText(week)}
        </Text>
      )
    }

    const { Box, Svg, Button } = $.ui.resolve(e)
    const alt = `Limits: 5-hour ${pctText(five)} (${untilText(five?.resetsAt, now)}), weekly ${pctText(week)} (${untilText(week?.resetsAt, now)})`
    return (
      <Box flexDirection="row" alignItems="center" gap={1}>
        <Svg source={bandDrawing(list)} alt={alt} width={380} height={44} isInteractive />
        <Button key="open-santa" label="🎅 Panel" onPress={() => $.ui.open({ id: PANE, title: TITLE })} />
      </Box>
    )
  })
}
