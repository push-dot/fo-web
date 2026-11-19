import type { JobCategory, Profile } from '@push/api-client'

export const career = (company: string, role: string, startedOn: string, endedOn: string | null, description: string) => ({
  company,
  role,
  startedOn,
  endedOn,
  description,
})

export const TAEYOON_CAREERS = [
  career('모아페이', '백엔드 엔지니어', '2022-03-01', null, '결제 승인 API 성능 개선, 정산 파이프라인 재설계'),
  career('누리클라우드', '서버 개발자', '2021-01-01', '2022-02-28', '멀티 테넌트 과금 시스템 개발'),
]

export const TAEYOON_INTRO =
  '결제 승인과 정산을 5년 동안 만들어 왔어요. 하루 2,000만 건을 처리하는 승인 API의 p99를 420ms에서 180ms로 줄였고, 정산 배치를 Kafka 기반 스트림으로 바꿨어요. 다음에는 더 큰 트래픽을 다루는 팀에서 일하고 싶어요.'

export const ME_INTRO = TAEYOON_INTRO.replace('5년 동안', '4년 동안')

export const TAEYOON_SKILLS = ['Kotlin', 'Spring Boot', 'JPA', 'Kafka', 'MySQL', 'Redis', 'AWS', 'Kubernetes']

export const person = (
  userId: string,
  displayName: string,
  headline: string,
  jobCategory: JobCategory,
  tenureYears: number,
  careerStatus: Profile['careerStatus'],
  patch: Partial<Profile> = {},
): Profile => ({
  userId,
  displayName,
  avatarUrl: null,
  headline,
  jobCategory,
  tenureYears,
  careerStatus,
  openToOffers: careerStatus === 'seeking',
  intro: headline,
  careers: [],
  skills: [],
  followerCount: 40,
  resumeSourceId: null,
  updatedAt: '2026-10-17T09:00:00.000Z',
  ...patch,
})

export const HUB_PROFILES: Profile[] = [
  person('u-taeyoon', '김태윤', '결제 시스템을 만드는 백엔드 개발자', 'dev', 5, 'seeking', {
    intro: TAEYOON_INTRO,
    careers: TAEYOON_CAREERS,
    skills: TAEYOON_SKILLS,
    followerCount: 128,
    followingCount: 42,
    postCount: 15,
  }),
  person('u-haeun', '이하은', 'React로 사용자 경험을 다듬어요. 디자인 시스템을 0부터 만들어 봤어요.', 'dev', 4, 'feedback', {
    intro: '커머스와 SaaS 제품에서 프론트엔드를 맡아 왔어요. 디자인 시스템을 만들고, 느린 화면을 빠르게 바꾸는 일을 좋아해요.',
    careers: [
      career('누리클라우드', '프론트엔드 개발자', '2023-03-01', null, '관리자 콘솔을 Next.js로 옮기고 디자인 시스템을 만들었어요.'),
      career('하루랩스', '웹 개발자', '2021-07-01', '2023-02-28', ''),
    ],
    skills: ['React', 'TypeScript', 'Next.js', 'Zustand', 'Storybook'],
    followerCount: 96,
    followingCount: 30,
    postCount: 9,
  }),
  person('u-jiwoo', '최지우', '데이터 파이프라인 · Spark · Airflow. 정산 데이터를 다뤄요.', 'data', 4, 'satisfied'),
  person('u-minjae', '정민재', '쿠버네티스 운영과 비용 줄이기에 관심이 많아요.', 'dev', 5, 'seeking'),
  person('u-sua', '한수아', '결제 경험을 설계하는 프로덕트 디자이너', 'design', 3, 'satisfied'),
  person('u-doyun', '박도윤', '주말엔 사이드 프로젝트, 평일엔 iOS 앱을 만들어요.', 'dev', 3, 'seeking'),
  person('u-yerin', '오예린', '그로스 실험 40개를 돌려 본 마케터', 'marketing', 4, 'feedback'),
  person('u-junho', '서준호', '핀테크 PM. 결제 전환율을 12% 올렸어요.', 'plan', 6, 'satisfied'),
  person('u-chaewon', '윤채원', 'ML 모델을 서빙하는 엔지니어', 'data', 5, 'seeking'),
]

export const ME_PROFILE: Profile = {
  userId: 'u1',
  displayName: '김서준',
  avatarUrl: null,
  headline: '결제 시스템을 만드는 백엔드 개발자',
  jobCategory: 'dev',
  tenureYears: 4,
  careerStatus: 'seeking',
  openToOffers: true,
  intro: ME_INTRO,
  careers: TAEYOON_CAREERS,
  skills: TAEYOON_SKILLS,
  followerCount: 12,
  followingCount: 18,
  postCount: 8,
  resumeSourceId: 'src-resume',
  updatedAt: '2026-10-18T09:00:00.000Z',
}

export const APP_PROFILES: Record<string, Profile> = {
  u2: {
    userId: 'u2',
    displayName: '이하은',
    avatarUrl: null,
    headline: 'React로 사용자 경험을 다듬어요',
    jobCategory: 'dev',
    tenureYears: 4,
    careerStatus: 'seeking',
    openToOffers: true,
    intro: '커머스와 SaaS 제품에서 프론트엔드를 맡아 왔어요. 디자인 시스템을 만들고, 느린 화면을 빠르게 바꾸는 일을 좋아해요.',
    careers: [
      career('누리클라우드', '프론트엔드 개발자', '2023-03-01', null, '관리자 콘솔을 Next.js로 옮기고 디자인 시스템을 만들었어요.'),
      career('하루랩스', '웹 개발자', '2021-07-01', '2023-02-28', ''),
    ],
    skills: ['React', 'TypeScript', 'Next.js', 'Zustand', 'Storybook'],
    followerCount: 128,
    followingCount: 42,
    postCount: 15,
    resumeSourceId: null,
    updatedAt: '2026-10-18T09:00:00.000Z',
  },
  // The rest of fo-mobile's hub list, so a tapped person opens as themself rather than the fallback.
  u3: person('u3', '박도윤', 'SwiftUI로 앱을 만드는 iOS 개발자', 'dev', 3, 'feedback'),
  u4: person('u4', '최지우', '데이터 파이프라인 · Spark · Airflow', 'dev', 5, 'seeking'),
  u5: person('u5', '정민재', '쿠버네티스 운영이 즐거운 DevOps', 'dev', 4, 'satisfied'),
  u6: person('u6', '한서연', '실험으로 증명하는 프로덕트 디자이너', 'design', 6, 'seeking'),
  u7: person('u7', '오지훈', '추천 랭킹을 고민하는 데이터 분석가', 'data', 2, 'feedback'),
  u8: person('u8', '윤채원', '0→1 서비스를 기획하는 PM', 'plan', 8, 'satisfied'),
  u9: person('u9', '강현우', '퍼포먼스 마케팅과 그로스 실험', 'marketing', 3, 'seeking'),
  u10: person('u10', '서지민', 'B2B SaaS 세일즈를 이끌어요', 'sales', 11, 'satisfied'),
  u11: person('u11', '임도현', 'Go로 트래픽을 견디는 서버를 만들어요', 'dev', 7, 'seeking'),
  u12: person('u12', '문예린', 'ML 모델을 서비스로 옮기는 엔지니어', 'data', 1, 'seeking'),
  me: {
    ...ME_PROFILE,
    tenureYears: 4,
    intro: '4년 동안 결제·정산 시스템을 설계하고 운영했어요. 트래픽이 몰리는 기간에도 장애 없는 결제를 만드는 데 집중해 왔어요.',
    careers: [
      career('모아페이', '백엔드 엔지니어', '2022-03-01', null, '결제 승인 API와 정산 배치를 맡고 있어요.'),
      career('하루랩스', '서버 개발자', '2021-01-01', '2022-02-28', ''),
    ],
    skills: ['Kotlin', 'Spring Boot', 'JPA', 'MySQL', 'Kafka'],
  },
}
