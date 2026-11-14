import { describe, expect, it } from 'vitest'
import { postingTitleLines, splitMiddleDot } from './posting-title'

describe('postingTitleLines', () => {
  it('moves a parenthetical to its own line', () => {
    expect(postingTitleLines('백엔드 엔지니어 (Kotlin·Spring)')).toEqual(['백엔드 엔지니어', '(Kotlin·Spring)'])
  })

  it('keeps a plain title whole', () => {
    expect(postingTitleLines('프론트엔드 개발자')).toEqual(['프론트엔드 개발자'])
  })

  it('keeps the rest of the title after the first parenthetical on the second line', () => {
    expect(postingTitleLines('시니어 (Kotlin) 백엔드')).toEqual(['시니어', '(Kotlin) 백엔드'])
  })

  it('does not split a title that starts with a parenthesis', () => {
    expect(postingTitleLines('(주)모아페이 개발자')).toEqual(['(주)모아페이 개발자'])
  })
})

describe('splitMiddleDot', () => {
  it('puts the middle dot in a part of its own', () => {
    expect(splitMiddleDot('(Kotlin·Spring)')).toEqual(['(Kotlin', '·', 'Spring)'])
  })

  it('leaves a line without a dot whole', () => {
    expect(splitMiddleDot('(Kotlin)')).toEqual(['(Kotlin)'])
  })
})
