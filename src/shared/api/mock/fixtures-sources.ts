import type { Source, UserLink } from '@push/api-client'
import { application } from './fixtures-notices'
import { career } from './fixtures-profiles'

export const file = (id: string, fileName: string, mimeType: string, size: number, createdAt: string, extra: Partial<Source> = {}): Source => ({
  id,
  fileName,
  mimeType,
  size,
  sha256: id,
  status: 'READY',
  createdAt,
  ...extra,
})

export const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

export type SeedSource = Source & { company?: string; postingTitle?: string }

export const pushDoc = (id: string, title: string, size: number, company: string, postingTitle: string, createdAt: string): SeedSource => ({
  ...file(id, title, 'application/pdf', size, createdAt, { kind: 'AI_MADE' }),
  company,
  postingTitle,
})

export const SEED_SOURCES: SeedSource[] = [
  pushDoc('src-ai', '모아페이_맞춤_이력서_v2', 1_900_000, '모아페이', '백엔드 엔지니어 (Kotlin·Spring)', '2026-10-20T01:00:00.000Z'),
  pushDoc('src-ai-toss', '서버 개발자 이력서', 1_600_000, '토스페이먼츠', 'Server Developer', '2026-10-14T01:00:00.000Z'),
  pushDoc('src-ai-kakao', '결제 플랫폼 경력기술서', 1_200_000, '카카오페이', '결제 서버 개발자', '2026-09-30T01:00:00.000Z'),
  file('src-resume', '김서준_백엔드_이력서_2026.pdf', 'application/pdf', 2_400_000, '2026-10-12T01:00:00.000Z'),
  file('src-career', '경력기술서_모아페이.docx', DOCX, 640_000, '2026-09-28T01:00:00.000Z'),
  file('src-extra', '포트폴리오_결제시스템.pdf', 'application/pdf', 8_100_000, '2026-08-03T01:00:00.000Z'),
]

export const link = (id: string, kind: UserLink['kind'], title: string, url: string): UserLink => ({
  id,
  kind,
  url: `https://${url}`,
  title,
  status: null,
  fitCount: 0,
  aiRead: false,
  createdAt: '2026-10-10T00:00:00.000Z',
})

export const SEED_LINKS: UserLink[] = [
  link('l1', 'job', '모아페이 · 결제 플랫폼 시니어 엔지니어', 'careers.moapay.kr/jobs/1182'),
  link('l2', 'job', '누리클라우드 · 백엔드 개발자', 'nuricloud.career.greetinghr.com'),
  link('l3', 'job', '그린티켓 · 플랫폼 엔지니어', 'wanted.co.kr/wd/231877'),
  link('l4', 'github', 'seojun-kim', 'github.com/seojun-kim'),
  link('l5', 'github', 'settle-pipeline', 'github.com/seojun-kim/settle-pipeline'),
  link('l6', 'portfolio', '김서준 포트폴리오', 'seojun.notion.site'),
  link('l7', 'blog', '결제 승인 API p99 절반으로 줄이기', 'velog.io/@seojun/p99'),
]
