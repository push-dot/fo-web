import { describe, expect, it } from 'vitest'

import { splitDotWords, splitMiddleDot } from './mid-dot'

describe('splitMiddleDot', () => {
  it('puts the middle dot in a part of its own', () => {
    expect(splitMiddleDot('(Kotlin·Spring)')).toEqual(['(Kotlin', '·', 'Spring)'])
  })

  it('leaves a line without a dot whole', () => {
    expect(splitMiddleDot('(Kotlin)')).toEqual(['(Kotlin)'])
  })
})

describe('splitDotWords', () => {
  it('keeps the word around a dot together and the rest as it was', () => {
    expect(splitDotWords('결제 승인·취소 API를 설계해요')).toEqual(['결제 ', '승인·취소', ' API를 설계해요'])
  })

  it('leaves a line without a dot whole', () => {
    expect(splitDotWords('정산 배치의 성능')).toEqual(['정산 배치의 성능'])
  })
})
