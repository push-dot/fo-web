import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const root = (path: string) => fileURLToPath(new URL(`../../${path}`, import.meta.url))

const headersFor = (pattern: string) => {
  const file = root('public/_headers')
  if (!existsSync(file)) return new Map<string, string>()
  const lines = readFileSync(file, 'utf8').split('\n')
  const start = lines.indexOf(pattern)
  const block = start === -1 ? [] : lines.slice(start + 1)
  const end = block.findIndex((line) => !/^\s+\S/.test(line))
  return new Map(
    block.slice(0, end === -1 ? undefined : end).map((line) => {
      const [name, ...value] = line.trim().split(':')
      return [name!.toLowerCase(), value.join(':').trim()] as const
    }),
  )
}

const directives = (csp: string) => new Map(csp.split(';').map((d) => d.trim().split(/\s+/)).filter((d) => d[0]).map(([name, ...v]) => [name!, v]))

const inlineScriptHashes = () =>
  [...readFileSync(root('index.html'), 'utf8').matchAll(/<script>([\s\S]*?)<\/script>/g)].map(
    ([, body]) => `'sha256-${createHash('sha256').update(body!).digest('base64')}'`,
  )

describe('security headers on every page', () => {
  const headers = headersFor('/*')
  const csp = directives(headers.get('content-security-policy') ?? '')

  it('lets only this origin and the theme boot script run scripts', () => {
    const scripts = csp.get('script-src') ?? []
    expect(scripts).toContain("'self'")
    expect(scripts).not.toContain("'unsafe-inline'")
    expect(scripts).not.toContain("'unsafe-eval'")
    expect(inlineScriptHashes().length).toBeGreaterThan(0)
    for (const hash of inlineScriptHashes()) expect(scripts).toContain(hash)
  })

  it('lets the Toss Payments SDK load and talk to Toss, and no other third-party script', () => {
    const scripts = csp.get('script-src') ?? []
    expect(scripts).toContain('https://js.tosspayments.com')
    expect(scripts.filter((source) => source.startsWith('https://'))).toEqual(['https://js.tosspayments.com'])
    expect(csp.get('frame-src')).toEqual(['https://*.tosspayments.com', 'https://*.toss.im'])
    expect(csp.get('connect-src')).toEqual(expect.arrayContaining(['https://*.tosspayments.com', 'https://*.toss.im']))
    expect(csp.get('form-action')).toEqual(["'self'"])
  })

  it('allows plugin data only from our own PDF blobs and blocks base hijacking and framing', () => {
    expect(csp.get('object-src')).toEqual(['blob:'])
    expect(csp.get('base-uri')).toEqual(["'self'"])
    expect(csp.get('frame-ancestors')).toEqual(["'none'"])
    expect(headers.get('x-frame-options')).toBe('DENY')
  })

  it('stops MIME sniffing and full-URL referrers', () => {
    expect(headers.get('x-content-type-options')).toBe('nosniff')
    expect(headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin')
  })
})
