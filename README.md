# fo-web

Push의 웹 앱입니다. 개인 사용자는 공고를 찾고 지원하며, 허브와 소셜을 이용합니다. 기업 사용자는 공고를 올리고 지원자를 관리하며, 기업 AI 채팅을 사용합니다. 모바일 앱의 WebView도 이 앱의 공고·프로필 상세를 엽니다.

개발 서버 포트는 5174입니다. 화면 문구는 한국어이고, 글꼴은 Noto Sans KR입니다.

## 주요 기능

- 개인: 홈·공고 목록·검색, 공고 상세·북마크·지원, 허브 프로필·팔로우, 소셜 게시물·댓글, 제안함, 알림, 마이(서류·이력서·프로필), 설정·차단 목록
- 기업: 사업자 확인, 공고 작성·수정, 지원자 목록·단계 변경, 담당자 초대, 요금제, 기업 AI 채팅, 회사 정보 수정
- 로그인: 개인은 Google, Apple, GitHub, 휴대폰 번호. 기업은 Google과 이메일. 계정 종류는 `PERSONAL`과 `EMPLOYER`입니다. 이메일 가입·인증·비밀번호 재설정 경로는 `/signup`, `/auth/verify`, `/auth/reset`입니다.
- 로그인 없이 열리는 경로: `/`, `/jobs`, `/search`, `/postings/:id`, 로그인·가입·인증 경로, 약관 경로(`/terms`, `/privacy`, `/privacy-consent`, `/marketing-consent`)
- WebView에서는 `/postings/:id`와 `/profiles/:id`만 제공합니다.

## 기술 스택

| 영역 | 선택 |
| --- | --- |
| 앱 | Vite 6, React 19.1, React Router 7, TanStack Query 5 |
| 언어 | TypeScript 5.8 |
| HTTP | `@push/api-client` (ky) |
| 디자인 | `@push/design-system`, Noto Sans KR |
| 공통 | `@push/shared` |
| 테스트 | Vitest, happy-dom |

i18n 라이브러리는 없고, 문구는 페이지의 한국어 상수입니다. 서버 상태는 TanStack Query이고, Zustand는 쓰지 않습니다.

## 폴더 구조

```
src/
  app/         라우터, 셸, 인증 가드, 목업 부트스트랩
  pages/       화면 (home, jobs, search, login, hub, social, my, offers, employer, …)
  features/    기능 단위 유스케이스
  entities/    posting, profile, application, company, conversation, …
  shared/      api, auth, ui, model, lib
index.html
vite.config.ts
package.json
```

코드는 Feature-Sliced Design 형태입니다. `src/app`, `src/pages`, `src/features`, `src/entities`, `src/shared`.

## 화면

브라우저에서는 `src/app/shell.tsx` 안에 아래 경로가 있습니다. `RequireAuth`가 붙은 경로는 로그인이 필요합니다.

| 경로 | 화면 |
| --- | --- |
| `/` | 홈. 공개 |
| `/jobs` | 채용공고 목록. 공개 |
| `/search` | 검색. 공개 |
| `/login`, `/signup` | 로그인, 가입 |
| `/auth/callback`, `/auth/verify`, `/auth/reset` | OAuth 콜백, 이메일 인증, 비밀번호 재설정 |
| `/postings/:id` | 공고 상세. 공개 |
| `/terms`, `/privacy`, `/privacy-consent`, `/marketing-consent` | 약관·처리방침. 공개 |
| `/profiles/:id` | 허브 프로필. 로그인 |
| `/hub`, `/social`, `/posts/:id` | 허브, 소셜, 게시물 |
| `/me` | 마이 |
| `/offers`, `/offers/:id` | 제안함 |
| `/notifications`, `/settings`, `/settings/blocked` | 알림, 설정, 차단 목록 |
| `/employer/verify` | 사업자 확인 |
| `/employer/postings`, `…/new`, `…/:id/edit` | 공고 관리 |
| `/employer/postings/:id/applicants`, `…/:applicationId` | 지원자 |
| `/employer/chat`, `…/new`, `…/:id` | 기업 AI 채팅 |
| `/employer/members`, `/employer/plans` | 담당자, 요금제 |
| `/invites/:token` | 초대 수락 |

WebView에서는 `/postings/:id`와 `/profiles/:id`만 있습니다.

## 개발 환경

이 저장소만으로는 설치하지 않습니다. 패키지 설치, 실행, 테스트는 [push-fe](https://github.com/push-dot/push-fe) 워크스페이스 루트에서 합니다. `pnpm-lock.yaml`은 push-fe 루트에만 있습니다.

```bash
git clone --recurse-submodules https://github.com/push-dot/push-fe.git
cd push-fe
pnpm install
pnpm --filter @push/fo-web dev
```

개발 서버는 `http://localhost:5174`이고 `--host`로 엽니다.

의존성을 바꾸면 이 저장소의 `package.json`과 push-fe의 `pnpm-lock.yaml`을 각각 커밋합니다. 잠금 파일을 바꾼 push-fe 브랜치나 커밋은 PR 본문에 한 줄로 적습니다.

    push-fe-ref: <branch-or-sha>

`workflow_dispatch` 입력 `push-fe-ref`가 이 줄을 덮어씁니다. 기본값은 `develop`입니다. 패키지 매니저는 pnpm 11.0.4입니다.

### 환경 변수

이 저장소에는 `.env.example`이 없습니다. 값은 적지 않습니다. 비우면 `src/shared/api/client.ts`의 기본 주소를 씁니다.

| 이름 | 읽는 곳 |
| --- | --- |
| `VITE_API_BASE_URL` | `src/shared/api/client.ts` |

`window.__PUSH__.apiBaseUrl`이 있으면 그 주소를 `VITE_API_BASE_URL`보다 먼저 씁니다.

목업은 목업 빌드에서만 켜집니다. 주소에 `mock` 쿼리를 붙이고, `as`는 `personal`, `employer`, `employer-pro`, `employer-ultra`, `employer-new` 중 하나입니다. 목업이면 `shared/api/mock.ts`가 fetch를 대체합니다.

## 스크립트

워크스페이스 루트에서 실행합니다.

```bash
pnpm --filter @push/fo-web dev       # vite --port 5174 --host
pnpm --filter @push/fo-web dev:test  # VITE_API_BASE_URL을 스테이징 API로 두고 개발 서버
pnpm --filter @push/fo-web build     # tsc -b && vite build
pnpm --filter @push/fo-web preview   # 포트 5174
pnpm --filter @push/fo-web test
pnpm --filter @push/fo-web typecheck
```

`@push/fo-web`에는 `lint` 스크립트가 없습니다.

## 테스트

```bash
pnpm --filter @push/fo-web test
pnpm --filter @push/fo-web typecheck
pnpm --filter @push/fo-web build
```

테스트는 Vitest입니다.

## CI/배포

`.github/workflows/ci.yml`은 PR과 `develop`·`main` push, `workflow_dispatch`에서 돌아갑니다. 워크플로는 [push-fe](https://github.com/push-dot/push-fe)를 받고(기본 `develop`), `apps/fo-mobile` 서브모듈을 초기화한 뒤, 검사 대상 커밋을 `apps/fo-web`에 둡니다. 이어서 push-fe 루트에서 `pnpm install --frozen-lockfile`, `pnpm exec turbo run typecheck lint test --filter=@push/fo-web...`, `pnpm --filter @push/fo-web build`를 실행하고 `apps/fo-web/dist/index.html`이 생겼는지 확인합니다.

의존성이 바뀌었는데 잠금 파일이 없으면 frozen install이 실패합니다. 그때는 위의 `push-fe-ref` 줄을 사용합니다.

### Cloudflare 배포

`.github/workflows/deploy.yml`은 `main`에 push되거나 `workflow_dispatch`로 실행될 때 Cloudflare Workers Static Assets로 올립니다. 체크아웃과 설치는 CI와 같습니다. 프로덕션 빌드는 `VITE_API_BASE_URL=https://push-be.youngjoon568.workers.dev/api/v1`로 하고, `VITE_PUSH_MOCK`은 넣지 않습니다. 이어서 앱 디렉터리에서 `npx wrangler@4.158.0 deploy`를 실행합니다.

Worker 이름은 `push-fo-web`이고, 공개 주소는 `workers.dev`입니다. 커스텀 도메인은 없습니다.

필요한 GitHub Actions 시크릿은 `CLOUDFLARE_API_TOKEN`과 `CLOUDFLARE_ACCOUNT_ID`입니다.

## 브랜치 규칙

기본 브랜치는 `develop`입니다. 작업 브랜치는 `develop`에서 만들고, PR은 `develop`으로 엽니다. `main`에는 릴리스 PR로만 반영합니다.

## 관련 저장소

- [push-be](https://github.com/push-dot/push-be) — API
- [push-fe](https://github.com/push-dot/push-fe) — 웹·모바일 모노레포
- [fo-web](https://github.com/push-dot/fo-web) — 이 저장소
- [fo-mobile](https://github.com/push-dot/fo-mobile) — 모바일 앱
- [push-workspace](https://github.com/push-dot/push-workspace) — 통합 워크스페이스와 제품 문서
- [push-langdig](https://github.com/push-dot/push-langdig) — 랜딩 페이지
