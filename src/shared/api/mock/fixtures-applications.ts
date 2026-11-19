import type { Application, CalendarEvent } from '@push/api-client'
import { application } from './fixtures-notices'

export const APPLICATIONS: Application[] = [
  application('app-fit', 'p1', '모아페이', '백엔드 엔지니어 (Kotlin·Spring)', 'INTERVIEW', '2026-10-20T01:00:00.000Z', 8.4),
  application('app-doto', 'p3', '도토리증권', '서버 개발자 (Go)', 'SCREENING', '2026-10-16T01:00:00.000Z', 7.1),
  application('app-star', 'p8', '별빛게임즈', 'DevOps 엔지니어', 'APPLIED', '2026-10-09T01:00:00.000Z'),
  application('app-raon', 'p14', '라온헬스', '백엔드 개발자 (Java)', 'ACCEPTED', '2026-09-21T01:00:00.000Z', 7.8),
  application('app-plain', 'p9', '누리클라우드', '백엔드 개발자', 'REJECTED', '2026-09-02T01:00:00.000Z', 6.2),
]

export const event = (
  id: string,
  type: CalendarEvent['type'],
  title: string,
  startsAt: string,
  endsAt: string,
  extra: Partial<CalendarEvent> = {},
): CalendarEvent => ({
  id,
  revision: 1,
  applicationId: null,
  type,
  title,
  startsAt,
  endsAt,
  timeZone: 'Asia/Seoul',
  source: 'GOOGLE',
  externalId: null,
  notes: '',
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
  ...extra,
})

export const CALENDAR_EVENTS: CalendarEvent[] = [
  event('ev-1', 'DEADLINE', '파도AI 마감', '2026-10-03T00:00:00.000Z', '2026-10-03T01:00:00.000Z'),
  event('ev-2', 'COFFEE_CHAT', '이하은 커피챗', '2026-10-09T06:00:00.000Z', '2026-10-09T07:00:00.000Z'),
  event('ev-3', 'FOLLOW_UP', '도토리증권 서류 발표', '2026-10-16T00:00:00.000Z', '2026-10-16T01:00:00.000Z', { applicationId: 'app-doto' }),
  event('ev-4', 'DEADLINE', '파도AI 서류 마감', '2026-10-22T00:00:00.000Z', '2026-10-22T01:00:00.000Z'),
  event('ev-5', 'INTERVIEW', '모아페이 1차 면접', '2026-10-23T05:00:00.000Z', '2026-10-23T06:00:00.000Z', {
    applicationId: 'app-fit',
    notes: '화상',
  }),
  event('ev-6', 'FOLLOW_UP', '면접 준비 알림', '2026-10-23T01:00:00.000Z', '2026-10-23T01:30:00.000Z', { applicationId: 'app-fit' }),
  event('ev-7', 'COFFEE_CHAT', '이하은 커피챗', '2026-10-25T06:00:00.000Z', '2026-10-25T07:00:00.000Z'),
  event('ev-8', 'DEADLINE', '그린티켓 마감', '2026-10-30T00:00:00.000Z', '2026-10-30T01:00:00.000Z'),
]
