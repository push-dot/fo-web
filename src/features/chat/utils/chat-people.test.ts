import { describe, expect, it } from 'vitest'
import { applicantPostings, chatPeople, severalPostings } from './chat-people'

const posting = (id: string, extra: { status?: string; applicantCount?: number } = {}) => ({ id, title: `공고 ${id}`, ...extra })

const applicant = (applicationId: string, displayName: string) => ({ applicationId, applicant: { displayName } })

describe('chat people', () => {
  it('reads every posting that can have applicants, not only the first open one', () => {
    const postings = [
      posting('p1', { status: 'OPEN', applicantCount: 2 }),
      posting('p2', { status: 'OPEN', applicantCount: 0 }),
      posting('p3', { status: 'DRAFT', applicantCount: 1 }),
      posting('p4', { status: 'CLOSED', applicantCount: 3 }),
      posting('p5'),
    ]
    expect(applicantPostings(postings, undefined).map((item) => item.id)).toEqual(['p1', 'p4', 'p5'])
  })

  it('keeps the posting an applicant page handed over even when its count is not known to be above zero', () => {
    const postings = [posting('p1', { status: 'OPEN', applicantCount: 2 }), posting('p2', { status: 'OPEN', applicantCount: 0 })]
    expect(applicantPostings(postings, 'p2').map((item) => item.id)).toEqual(['p1', 'p2'])
  })

  it('labels each applicant with the posting they applied to', () => {
    const people = chatPeople([posting('p1'), posting('p2')], [[applicant('a1', '김태윤')], [applicant('a2', '이서진')]])
    expect(people).toEqual([
      { applicationId: 'a1', name: '김태윤', postingId: 'p1', postingTitle: '공고 p1' },
      { applicationId: 'a2', name: '이서진', postingId: 'p2', postingTitle: '공고 p2' },
    ])
    expect(severalPostings(people)).toBe(true)
    expect(severalPostings(people.slice(0, 1))).toBe(false)
  })

  it('lists nobody for a posting whose applicants have not loaded', () => {
    expect(chatPeople([posting('p1'), posting('p2')], [[applicant('a1', '김태윤')]])).toHaveLength(1)
  })
})
