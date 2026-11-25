import { CAREER_RANGES } from '../constants'

const BULLET = '· '

export const stripBullets = (text: string) =>
  text
    .split('\n')
    .map((line) => line.replace(/^\s*[·•]\s?/, '').trim())
    .filter(Boolean)

export const withBullets = (text: string) => stripBullets(text).map((line) => BULLET + line).join('\n')

export const nextBullet = (value: string, at: number) => ({
  value: `${value.slice(0, at)}\n${BULLET}${value.slice(at)}`,
  caret: at + 1 + BULLET.length,
})

export const careerRangeOf = (careerMin: number) =>
  [...CAREER_RANGES].reverse().find((range) => careerMin >= range.min) ?? CAREER_RANGES[0]
