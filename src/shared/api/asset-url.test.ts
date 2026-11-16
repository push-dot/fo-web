import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { assetUrl } from './client'

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return sourceFiles(path)
    return /\.tsx$/.test(name) && !/\.test\./.test(name) ? [path] : []
  })

describe('server image URLs', () => {
  it('load only from the API origin', () => {
    expect(assetUrl('https://tracker.example/p.png')).toBeUndefined()
    expect(assetUrl('//tracker.example/p.png')).toBeUndefined()
    expect(assetUrl('/api/v1/uploads/images/a.png')).toMatch(/\/api\/v1\/uploads\/images\/a\.png$/)
  })

  it('go through assetUrl wherever a page draws them', () => {
    const raw = sourceFiles(join(__dirname, '..', '..'))
      .filter((path) => /<img[^>]*\ssrc=\{[^}]*(avatarUrl|logoUrl|imageUrl)[^}]*\}/.test(readFileSync(path, 'utf8').replace(/assetUrl\([^)]*\)/g, '')))
    expect(raw).toEqual([])
  })
})
