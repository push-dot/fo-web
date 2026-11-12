import type { ApplicationStage } from '@push/api-client'
import { describe, expect, it } from 'vitest'

import { applicationStageTone } from './stage-label'

const stages: ApplicationStage[] = [
  'DISCOVERED',
  'PREPARING',
  'READY',
  'APPLIED',
  'SCREENING',
  'INTERVIEW',
  'OFFER',
  'ACCEPTED',
  'REJECTED',
  'WITHDRAWN',
]

describe('applicationStageTone', () => {
  it('maps each application stage to a badge tone', () => {
    const tones = Object.fromEntries(stages.map((stage) => [stage, applicationStageTone(stage)]))
    expect(tones).toEqual({
      DISCOVERED: 'grey',
      PREPARING: 'grey',
      READY: 'grey',
      APPLIED: 'grey',
      SCREENING: 'ac',
      INTERVIEW: 'orange',
      OFFER: 'green',
      ACCEPTED: 'green',
      REJECTED: 'red',
      WITHDRAWN: 'red',
    })
  })
})
