import type { ApplicantAiReview, ApplicantInterviewKit } from '@push/api-client'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import ApplicantAi from './applicant-ai'
import { AI_PANEL } from '../constants'

const review: ApplicantAiReview = {
  id: 'r1',
  conversationId: 'conv-1',
  createdAt: '2026-11-26T01:00:00.000Z',
  summary: '',
  matches: [{ requirement: 'Java', status: 'MET', evidence: '4년' }],
  flags: [
    { title: 'Kafka 운영 범위', level: 'CHECK', reason: '혼자 운영했는지 모호해요', quote: 'Kafka 클러스터를 운영' },
    { title: '결제 API', level: 'SUPPORTED', reason: '수치가 있어요', quote: null },
  ],
}

const kit: ApplicantInterviewKit = {
  id: 'k1',
  conversationId: 'conv-2',
  createdAt: '2026-11-26T02:00:00.000Z',
  questions: [{ text: 'Kafka 장애는 어떻게 다뤘나요?', verify: '본인 운영', goodSignals: [], cautionSignals: [], fromFlag: null }],
}

const render = (props: Parameters<typeof ApplicantAi>[0]) =>
  renderToStaticMarkup(
    <MemoryRouter>
      <ApplicantAi {...props} />
    </MemoryRouter>,
  )

describe('ApplicantAi', () => {
  it('shows only what to check, the quote and the disclaimer, and links to the chat', () => {
    const html = render({ review, kit: null })
    expect(html).toContain('Kafka 운영 범위')
    expect(html).toContain('Kafka 클러스터를 운영')
    expect(html).not.toContain('결제 API')
    expect(html).toContain(AI_PANEL.disclaimer)
    expect(html).toContain('href="/employer/chat/conv-1"')
  })

  it('lists the interview questions with what each checks', () => {
    const html = render({ review: null, kit })
    expect(html).toContain(AI_PANEL.kitCount(1))
    expect(html).toContain('Kafka 장애는 어떻게 다뤘나요?')
    expect(html).toContain('본인 운영')
  })

  it('renders nothing before the agent has reviewed', () => {
    expect(render({ review: null, kit: null })).toBe('')
  })
})
