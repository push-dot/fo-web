import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import VerifyPage from './verify-page'
import { VerifyExpired } from '../../features/auth'

describe('expired verification', () => {
  it('offers 인증 메일 다시 보내기 as a button, not another sign-up form', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <VerifyExpired email="kim@push.app" />
      </MemoryRouter>,
    )
    expect(html).toContain('인증 메일 다시 보내기')
    expect(html).toMatch(/<button[^>]*class="auth-btn pri"[^>]*>인증 메일 다시 보내기<\/button>/)
    expect(html).not.toMatch(/<a[^>]*>인증 메일 다시 보내기<\/a>/)
    expect(html).toContain('kim@push.app')
    expect(html).not.toContain('/signup?accountType=EMPLOYER&amp;email=')
  })
})

describe('verify page', () => {
  const at = (path: string) =>
    renderToStaticMarkup(
      <MemoryRouter initialEntries={[path]}>
        <VerifyPage />
      </MemoryRouter>,
    )

  it('asks the person with the link for the password and does not create the account on load', () => {
    const html = at('/auth/verify?token=abc')
    expect(html).toContain('비밀번호를 정해 주세요')
    expect(html).toContain('비밀번호 확인')
    expect(html.match(/type="password"/g)).toHaveLength(2)
    expect(html).toContain('기업 계정 만들기')
  })

  it('says the link is unusable when there is no token', () => {
    const html = at('/auth/verify')
    expect(html).toContain('링크를 열 수 없어요')
    expect(html).toContain('로그인하기')
    expect(html).toContain('처음부터 가입하기')
    expect(html).not.toContain('type="password"')
  })
})
